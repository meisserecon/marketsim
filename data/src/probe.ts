/**
 * Checks what Yahoo Finance has for a list of tickers: first month with data, currency, dividend
 * count. Used to decide the stock universe. Usage: tsx src/probe.ts IBM KO SONY ...
 */
const tickers = process.argv.slice(2);
if (!tickers.length) {
  console.error("usage: tsx src/probe.ts TICKER...");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

for (const t of tickers) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t)}?period1=0&period2=9999999999&interval=1mo&events=div,splits`;
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    const json: any = await res.json();
    const r = json?.chart?.result?.[0];
    if (!r) {
      console.log(`${t.padEnd(8)} NOT FOUND ${json?.chart?.error?.description ?? ""}`);
      continue;
    }
    const ts: number[] = r.timestamp ?? [];
    const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
    const firstIdx = closes.findIndex((c) => c != null);
    const first = firstIdx >= 0 ? new Date(ts[firstIdx] * 1000).toISOString().slice(0, 7) : "-";
    const last = ts.length ? new Date(ts[ts.length - 1] * 1000).toISOString().slice(0, 7) : "-";
    const divs = Object.keys(r.events?.dividends ?? {}).length;
    const splits = Object.keys(r.events?.splits ?? {}).length;
    const name = (r.meta?.longName ?? r.meta?.shortName ?? "").slice(0, 32);
    console.log(
      `${t.padEnd(8)} ${first} .. ${last}  ${String(r.meta?.currency).padEnd(4)} ${String(r.meta?.exchangeName).padEnd(4)} divs ${String(divs).padStart(3)} splits ${String(splits).padStart(2)}  ${name}`,
    );
  } catch (e) {
    console.log(`${t.padEnd(8)} ERROR ${(e as Error).message}`);
  }
  await sleep(250);
}
