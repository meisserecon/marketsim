/**
 * A thin database interface with two backends: node-postgres for production (Railway) and
 * PGlite, an embedded Postgres, for tests and for local development without a database.
 * Both run the same schema and the same SQL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface Queryable {
  query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface Db extends Queryable {
  /** Runs `fn` in a transaction; rolls back if it throws. */
  tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T>;
  /** Runs several statements without parameters. */
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

export async function openPostgres(connectionString: string): Promise<Db> {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString, ssl: process.env.PGSSL === "1" ? { rejectUnauthorized: false } : undefined });
  return {
    query: (text, params) => pool.query(text, params as any[]) as any,
    async tx(fn) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await fn({ query: (text, params) => client.query(text, params as any[]) as any });
        await client.query("commit");
        return result;
      } catch (e) {
        await client.query("rollback").catch(() => {});
        throw e;
      } finally {
        client.release();
      }
    },
    async exec(sql) { await pool.query(sql); },
    close: () => pool.end(),
  };
}

/** Embedded Postgres. Without a directory the data lives in memory and is gone on exit. */
export async function openEmbedded(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(dataDir);
  return {
    query: (text, params) => db.query(text, params as any[]) as any,
    tx: (fn) => db.transaction((tx) => fn({ query: (text, params) => tx.query(text, params as any[]) as any })) as any,
    async exec(sql) { await db.exec(sql); },
    close: () => db.close(),
  };
}

const SCHEMA_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "schema.sql");

/** Creates the tables on an empty database. */
export async function migrate(db: Db): Promise<void> {
  const { rows } = await db.query<{ t: string | null }>("select to_regclass('public.games')::text as t");
  if (!rows[0].t) await db.exec(fs.readFileSync(SCHEMA_FILE, "utf8"));
  // Columns added after the first release; harmless on a fresh schema.
  await db.exec("alter table holdings add column if not exists cost numeric(20, 6) not null default 0");
  await db.exec("alter table games add column if not exists solo boolean not null default false");
}
