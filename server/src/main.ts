import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.js";
import { migrate, openEmbedded, openPostgres } from "./db.js";
import { loadMarket } from "./market.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const market = loadMarket();

const url = process.env.DATABASE_URL;
if (!url) console.warn("DATABASE_URL is not set: using an embedded database" + (process.env.PGLITE_DIR ? ` in ${process.env.PGLITE_DIR}` : " in memory, games are lost on restart"));
const db = url ? await openPostgres(url) : await openEmbedded(process.env.PGLITE_DIR);
await migrate(db);

const app = await buildApp(db, market, {
  staticDir: process.env.STATIC_DIR ?? path.resolve(here, "..", "..", "web", "build"),
  logger: process.env.LOG === "1",
  createPassword: process.env.CREATE_PASSWORD || undefined,
});
if (!process.env.CREATE_PASSWORD) console.warn("CREATE_PASSWORD is not set: anyone who finds /create can start a game");
const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
console.log(`marketsim server on :${port}, ${market.ids().length} assets, ${market.startMonth} to ${market.finalMonth}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.close();
    await db.close();
    process.exit(0);
  });
}
