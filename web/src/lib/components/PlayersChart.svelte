<script lang="ts">
  /**
   * One line per player: portfolio value at each month end. The y-axis starts at zero and the
   * x-axis covers the whole game, like the chart in the portfolio panel.
   */
  import { monthName, usd, usdCompact } from '$lib/format';

  interface Series {
    id: string;
    name: string;
    color: string;
    points: { month: string; value: number }[];
    /** Drawn dashed: a reference line such as the market, not a player. */
    dashed?: boolean;
  }

  interface Props {
    series: Series[];
    span: { from: string; to: string };
    /** Drawn thicker and on top. */
    highlightId?: string;
    height?: number;
    /** Default: US dollars. */
    formatValue?: (v: number) => string;
    formatTick?: (v: number) => string;
    label?: string;
  }
  let { series, span, highlightId, height = 220, formatValue = (v) => usd(v), formatTick = usdCompact, label = 'Portfolio value of each player over time' }: Props = $props();

  let width = $state(600);
  let hover = $state<number | undefined>(undefined);

  const M = { top: 10, right: 14, bottom: 24, left: 58 };
  const plotW = $derived(Math.max(10, width - M.left - M.right));
  const plotH = $derived(Math.max(10, height - M.top - M.bottom));

  const monthIndex = (m: string) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5, 7)) - 1;
  const monthOf = (i: number) => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;
  const from = $derived(monthIndex(span.from));
  const to = $derived(Math.max(monthIndex(span.to), from + 1));
  const last = $derived(Math.max(from, ...series.flatMap((s) => s.points.map((p) => monthIndex(p.month)))));
  const x = $derived((m: number) => ((m - from) / (to - from)) * plotW);

  function niceStep(span: number, target: number): number {
    const raw = span / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }

  const scale = $derived.by(() => {
    const hi = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.value)).filter(Number.isFinite));
    const step = niceStep(hi, 4);
    const max = Math.ceil(hi / step) * step;
    const ticks: number[] = [];
    for (let t = 0; t <= max + step * 1e-6; t += step) ticks.push(Number(t.toPrecision(12)));
    return { ticks, y: (v: number) => plotH - (v / max) * plotH };
  });

  const xTicks = $derived.by(() => {
    const maxLabels = Math.max(2, Math.floor(plotW / 64));
    const years = (to - from) / 12;
    const step = [1, 2, 5, 10, 20, 25, 50].find((s) => years / s <= maxLabels) ?? 50;
    const out: { px: number; text: string }[] = [];
    for (let y = Math.ceil(from / 12); y * 12 <= to; y++) if (y % step === 0) out.push({ px: x(y * 12), text: String(y) });
    return out;
  });

  const lines = $derived(
    series
      .map((s) => ({
        ...s,
        d: s.points.map((p, i) => `${i ? 'L' : 'M'}${x(monthIndex(p.month)).toFixed(1)},${scale.y(p.value).toFixed(1)}`).join(''),
        end: s.points.at(-1)
      }))
      // the highlighted line is drawn last, so it lies on top
      .sort((a, b) => Number(a.id === highlightId) - Number(b.id === highlightId))
  );

  function onMove(e: PointerEvent) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const m = from + Math.round(((e.clientX - rect.left - M.left) / plotW) * (to - from));
    hover = Math.min(last, Math.max(from, m));
  }

  function onKey(e: KeyboardEvent) {
    const step = e.shiftKey ? 12 : 1;
    if (e.key === 'ArrowLeft') hover = Math.max(from, (hover ?? last) - step);
    else if (e.key === 'ArrowRight') hover = Math.min(last, (hover ?? last) + step);
    else if (e.key === 'Escape') hover = undefined;
    else return;
    e.preventDefault();
  }

  const TIP_ROWS = 8;
  const hovered = $derived.by(() => {
    if (hover === undefined) return undefined;
    const month = monthOf(hover);
    const rows = series
      .map((s) => ({ id: s.id, name: s.name, color: s.color, value: s.points.find((p) => p.month === month)?.value }))
      .filter((r): r is typeof r & { value: number } => r.value !== undefined)
      .sort((a, b) => b.value - a.value);
    return { month, px: x(hover), rows };
  });
</script>

<div class="chart" bind:clientWidth={width} style:height="{height}px">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
  <svg
    {width}
    {height}
    role="img"
    aria-label={label}
    tabindex="0"
    onpointermove={onMove}
    onpointerleave={() => (hover = undefined)}
    onfocus={() => (hover ??= last)}
    onblur={() => (hover = undefined)}
    onkeydown={onKey}
  >
    <g transform="translate({M.left},{M.top})">
      {#each scale.ticks as t (t)}
        <line class="grid" x1="0" x2={plotW} y1={scale.y(t)} y2={scale.y(t)} />
        <text class="tick" x="-8" y={scale.y(t)} dy="0.32em" text-anchor="end">{formatTick(t)}</text>
      {/each}
      <line class="axis" x1="0" x2={plotW} y1={plotH} y2={plotH} />
      {#each xTicks as t (t.text)}
        <text class="tick" x={t.px} y={plotH + 16} text-anchor={t.px > plotW - 24 ? 'end' : t.px < 12 ? 'start' : 'middle'}>{t.text}</text>
      {/each}

      {#each lines as l (l.id)}
        {#if l.points.length > 1}
          <path d={l.d} fill="none" stroke={l.color} stroke-width={l.id === highlightId ? 3 : 1.75} stroke-dasharray={l.dashed ? '5 4' : undefined} stroke-linejoin="round" stroke-linecap="round" />
        {/if}
        {#if l.end && !hovered}
          <circle class="dot" cx={x(monthIndex(l.end.month))} cy={scale.y(l.end.value)} r={l.id === highlightId ? 4.5 : 3.5} fill={l.color} />
        {/if}
      {/each}

      {#if hovered}
        <line class="crosshair" x1={hovered.px} x2={hovered.px} y1="0" y2={plotH} />
        {#each hovered.rows as r (r.id)}
          <circle class="dot" cx={hovered.px} cy={scale.y(r.value)} r="4" fill={r.color} />
        {/each}
      {/if}
    </g>
  </svg>

  {#if hovered && hovered.rows.length}
    <div class="tip" class:right={hovered.px > plotW * 0.6} style:left="{M.left + hovered.px}px" style:top="{M.top + 4}px">
      <strong>{monthName(hovered.month)}</strong>
      {#each hovered.rows.slice(0, TIP_ROWS) as r (r.id)}
        <span class="row"><i class="key" style:background={r.color}></i><span class="who">{r.name}</span><b>{formatValue(r.value)}</b></span>
      {/each}
      {#if hovered.rows.length > TIP_ROWS}<span class="muted">and {hovered.rows.length - TIP_ROWS} more</span>{/if}
    </div>
  {/if}
</div>

<style>
  .chart {
    position: relative;
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  svg {
    position: absolute;
    inset: 0 auto auto 0;
    display: block;
    touch-action: pan-y;
    border-radius: 6px;
  }
  .grid {
    stroke: var(--hairline);
    stroke-width: 1;
  }
  .axis {
    stroke: var(--axis);
    stroke-width: 1;
  }
  .tick {
    fill: var(--muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  .crosshair {
    stroke: var(--ink-2);
    stroke-width: 1;
  }
  .dot {
    stroke: var(--surface);
    stroke-width: 1.5;
  }
  .tip {
    position: absolute;
    transform: translateX(10px);
    display: grid;
    gap: 2px;
    padding: 6px 9px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: var(--shadow);
    font-size: 0.8rem;
    color: var(--ink-2);
    pointer-events: none;
    white-space: nowrap;
    z-index: 2;
  }
  .tip.right {
    transform: translateX(calc(-100% - 10px));
  }
  .tip strong {
    color: var(--ink);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .who {
    flex: 1;
    max-width: 14em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row b {
    color: var(--ink);
    font-variant-numeric: tabular-nums;
    margin-left: 10px;
  }
  .key {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
</style>
