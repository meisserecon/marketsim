<script lang="ts">
  /**
   * A single-series monthly chart in hand-written SVG: a line with a light area wash, or bars.
   * One y-axis, hairline grid, crosshair with a tooltip on hover and on keyboard focus.
   */
  import { monthName, monthShort } from '$lib/format';

  interface Point {
    month: string;
    value: number;
  }

  interface Props {
    points: Point[];
    mode?: 'line' | 'bars';
    log?: boolean;
    /** Start the y-axis at zero (always on for bars). */
    zero?: boolean;
    height?: number;
    color?: string;
    label: string;
    formatValue: (v: number) => string;
    formatTick?: (v: number) => string;
    /** Extra tooltip line for the hovered point. */
    detail?: (index: number) => string | undefined;
  }

  let {
    points,
    mode = 'line',
    log = false,
    zero = false,
    height = 240,
    color = 'var(--series-1)',
    label,
    formatValue,
    formatTick,
    detail
  }: Props = $props();

  let width = $state(600);
  let hover = $state<number | undefined>(undefined);

  const M = { top: 10, right: 14, bottom: 24, left: 58 };
  const plotW = $derived(Math.max(10, width - M.left - M.right));
  const plotH = $derived(Math.max(10, height - M.top - M.bottom));
  const n = $derived(points.length);
  const useLog = $derived(log && mode === 'line' && points.some((p) => p.value > 0));

  function niceStep(span: number, target: number): number {
    const raw = span / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }

  const scale = $derived.by(() => {
    const values = points.map((p) => p.value).filter(Number.isFinite);
    if (!values.length) return { min: 0, max: 1, ticks: [0, 1], y: (_: number) => plotH };

    if (useLog) {
      const positive = values.filter((v) => v > 0);
      let lo = Math.min(...positive);
      let hi = Math.max(...positive);
      if (hi / lo < 1.2) {
        lo /= 1.15;
        hi *= 1.15;
      }
      const lmin = Math.log10(lo) - 0.03 * Math.log10(hi / lo);
      const lmax = Math.log10(hi) + 0.03 * Math.log10(hi / lo);
      let ticks: number[] = [];
      for (const mults of [[1, 2, 5], [1, 3], [1]]) {
        ticks = [];
        for (let e = Math.floor(lmin); e <= Math.ceil(lmax); e++) {
          for (const m of mults) {
            const t = m * Math.pow(10, e);
            if (Math.log10(t) >= lmin && Math.log10(t) <= lmax) ticks.push(t);
          }
        }
        if (ticks.length <= 7) break;
      }
      if (ticks.length > 7) ticks = ticks.filter((_, i) => i % Math.ceil(ticks.length / 6) === 0);
      if (ticks.length < 2) ticks = [lo, Math.sqrt(lo * hi), hi];
      const y = (v: number) => plotH - ((Math.log10(Math.max(v, lo / 10)) - lmin) / (lmax - lmin)) * plotH;
      return { min: lmin, max: lmax, ticks, y };
    }

    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (zero || mode === 'bars') lo = Math.min(0, lo);
    if (hi === lo) {
      hi = hi === 0 ? 1 : hi + Math.abs(hi) * 0.1;
      if (!(zero || mode === 'bars')) lo = lo - Math.abs(lo) * 0.1;
    }
    const step = niceStep(hi - lo, 4);
    const min = zero || mode === 'bars' ? Math.min(0, Math.floor(lo / step) * step) : Math.floor(lo / step) * step;
    const max = Math.ceil(hi / step) * step;
    const ticks: number[] = [];
    for (let t = min; t <= max + step * 1e-6; t += step) ticks.push(Number(t.toPrecision(12)));
    const y = (v: number) => plotH - ((v - min) / (max - min)) * plotH;
    return { min, max, ticks, y };
  });

  const slot = $derived(n > 0 ? plotW / n : plotW);
  const x = $derived.by(() => {
    if (mode === 'bars') return (i: number) => (i + 0.5) * slot;
    return (i: number) => (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  });

  const linePath = $derived.by(() => {
    if (mode !== 'line' || n < 2) return '';
    let d = '';
    let pen = false;
    points.forEach((p, i) => {
      if (!Number.isFinite(p.value) || (useLog && p.value <= 0)) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${scale.y(p.value).toFixed(1)}`;
      pen = true;
    });
    return d;
  });
  const areaPath = $derived(
    linePath && !linePath.slice(1).includes('M') ? `${linePath}L${x(n - 1).toFixed(1)},${plotH}L${x(0).toFixed(1)},${plotH}Z` : ''
  );

  const bars = $derived.by(() => {
    if (mode !== 'bars') return [];
    const w = slot >= 5 ? Math.min(24, slot - 2) : Math.max(1, slot * 0.8);
    const base = scale.y(0);
    const out: { d: string }[] = [];
    points.forEach((p, i) => {
      if (!(p.value > 0)) return;
      const top = scale.y(p.value);
      const left = x(i) - w / 2;
      const r = Math.min(4, w / 2, (base - top) / 2);
      out.push({
        d: `M${left.toFixed(1)},${base.toFixed(1)}V${(top + r).toFixed(1)}Q${left.toFixed(1)},${top.toFixed(1)} ${(left + r).toFixed(1)},${top.toFixed(1)}H${(left + w - r).toFixed(1)}Q${(left + w).toFixed(1)},${top.toFixed(1)} ${(left + w).toFixed(1)},${(top + r).toFixed(1)}V${base.toFixed(1)}Z`
      });
    });
    return out;
  });

  const xTicks = $derived.by(() => {
    if (n === 0) return [];
    const maxLabels = Math.max(2, Math.floor(plotW / 64));
    const januaries: number[] = [];
    points.forEach((p, i) => {
      if (p.month.endsWith('-01')) januaries.push(i);
    });
    if (januaries.length >= 3) {
      const years = januaries.length;
      const step = [1, 2, 5, 10, 20, 25, 50].find((s) => years / s <= maxLabels) ?? 50;
      return januaries.filter((i) => Number(points[i].month.slice(0, 4)) % step === 0).map((i) => ({ i, text: points[i].month.slice(0, 4) }));
    }
    const step = Math.max(1, Math.ceil(n / Math.min(maxLabels, 6)));
    const out: { i: number; text: string }[] = [];
    for (let i = 0; i < n; i += step) out.push({ i, text: monthShort(points[i].month) });
    return out;
  });

  const tick = $derived(formatTick ?? formatValue);

  function onMove(e: PointerEvent) {
    if (n === 0) return;
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left - M.left;
    const i = mode === 'bars' ? Math.floor(px / slot) : Math.round((px / plotW) * (n - 1));
    hover = Math.min(n - 1, Math.max(0, i));
  }

  function onKey(e: KeyboardEvent) {
    if (n === 0) return;
    const step = e.shiftKey ? 12 : 1;
    if (e.key === 'ArrowLeft') hover = Math.max(0, (hover ?? n - 1) - step);
    else if (e.key === 'ArrowRight') hover = Math.min(n - 1, (hover ?? n - 1) + step);
    else if (e.key === 'Escape') hover = undefined;
    else return;
    e.preventDefault();
  }

  const hovered = $derived(hover !== undefined && hover < n ? points[hover] : undefined);
  const hoverX = $derived(hover !== undefined ? x(Math.min(hover, n - 1)) : 0);
  const tipRight = $derived(hoverX > plotW * 0.6);
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
    onfocus={() => (hover ??= n - 1)}
    onblur={() => (hover = undefined)}
    onkeydown={onKey}
  >
    <g transform="translate({M.left},{M.top})">
      {#each scale.ticks as t (t)}
        <line class="grid" x1="0" x2={plotW} y1={scale.y(t)} y2={scale.y(t)} />
        <text class="tick" x="-8" y={scale.y(t)} dy="0.32em" text-anchor="end">{tick(t)}</text>
      {/each}
      <line class="axis" x1="0" x2={plotW} y1={plotH} y2={plotH} />
      {#each xTicks as t (t.i)}
        <text class="tick" x={x(t.i)} y={plotH + 16} text-anchor={x(t.i) > plotW - 24 ? 'end' : x(t.i) < 12 ? 'start' : 'middle'}>{t.text}</text>
      {/each}

      {#if mode === 'line'}
        {#if areaPath}<path d={areaPath} fill={color} opacity="0.1" />{/if}
        {#if linePath}
          <path d={linePath} fill="none" stroke={color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        {/if}
        {#if n >= 1 && hover === undefined}
          <circle class="dot" cx={x(n - 1)} cy={scale.y(points[n - 1].value)} r="4" fill={color} />
        {/if}
      {:else}
        {#each bars as b, i (i)}
          <path d={b.d} fill={color} />
        {/each}
      {/if}

      {#if hovered}
        <line class="crosshair" x1={hoverX} x2={hoverX} y1="0" y2={plotH} />
        {#if mode === 'line'}
          <circle class="dot" cx={hoverX} cy={scale.y(hovered.value)} r="4.5" fill={color} />
        {/if}
      {/if}
    </g>
  </svg>

  {#if hovered}
    <div class="tip" class:right={tipRight} style:left="{M.left + hoverX}px" style:top="{M.top + 4}px">
      <strong>{formatValue(hovered.value)}</strong>
      <span><i class="key" style:background={color}></i>{monthName(hovered.month)}</span>
      {#if detail && hover !== undefined && detail(hover)}<span>{detail(hover)}</span>{/if}
    </div>
  {/if}
  {#if n === 0}
    <p class="empty muted">No data yet</p>
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
    stroke-width: 2;
  }
  .tip {
    position: absolute;
    transform: translateX(10px);
    display: grid;
    gap: 1px;
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
    font-size: 0.93rem;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }
  .key {
    display: inline-block;
    width: 10px;
    height: 2px;
    border-radius: 1px;
    margin-right: 5px;
    vertical-align: middle;
  }
  .empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 0.87rem;
  }
</style>
