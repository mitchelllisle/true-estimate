<script lang="ts">
	import type { Category, Item } from '$lib/categories';
	import { type Unit, toUnit, UNIT_SHORT, UNIT_MULTIPLIERS } from '$lib/categories';

	let {
		categories,
		unit = 'weeks' as Unit
	}: {
		categories: Category[];
		unit?: Unit;
	} = $props();

	type Bar = {
		id: string;
		name: string;
		subtitle: string;
		color: string;
		textColor: string;
		effortWeeks: number;
		startPct: number;
		widthPct: number;
		note: string;
		isPreProject: boolean;
		isFullSpan: boolean;
		isSpread: boolean;
		items: Item[];
	};

	type ChartData = {
		bars: Bar[];
		ticks: { label: string; pct: number; isZero: boolean }[];
		projStartPct: number;
		totalCalWeeks: number;
		totalCalDisplay: number;
		unitShort: string;
	};

	type ViewMode = 'pessimistic' | 'realistic' | 'optimistic';
	let viewMode = $state<ViewMode>('realistic');

	const chart = $derived(buildUnifiedChart(categories, unit, viewMode));

	let expandedBars = $state(new Set<string>());

	// When chart updates, expand all bars that have items
	$effect(() => {
		if (!chart) return;
		expandedBars = new Set(chart.bars.filter(b => b.items.length > 0).map(b => b.id));
	});

	function toggleBar(id: string) {
		const next = new Set(expandedBars);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedBars = next;
	}

	function expandAll() {
		if (!chart) return;
		expandedBars = new Set(chart.bars.filter(b => b.items.length > 0).map(b => b.id));
	}

	function collapseAll() {
		expandedBars = new Set();
	}

	const allExpanded = $derived(
		!!chart && chart.bars.filter(b => b.items.length > 0).every(b => expandedBars.has(b.id))
	);

	/**
	 * Unified chart builder. Bar positions always use the parallel (optimistic) model
	 * so phases never jump when switching modes — only the tick scale changes to reflect
	 * the mode's expected total duration.
	 */
	function buildUnifiedChart(cats: Category[], unit: Unit, mode: ViewMode): ChartData | null {
		const eff = (id: string) =>
			cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0;

		const acq  = eff('to-get');
		const prep = eff('before');
		const core = eff('the-work');
		const admn = eff('around');
		const iter = eff('between');
		const chng = eff('beyond');
		const prbs = eff('outside');
		const aftr = eff('after');

		const seqTotal = acq + prep + core + admn + iter + chng + prbs + aftr;
		if (seqTotal < 0.5) return null;

		// ── Parallel (optimistic) absolute positions ───────────────────────
		const prep_s = 0;
		const prep_e = prep;
		const core_s = prep_e;
		const core_e = core_s + core;
		const aftr_s = core_e;
		const aftr_e = aftr_s + (aftr > 0 ? aftr * 2 : 0);
		const acq_s  = acq > 0 ? -(acq * 1.5) : 0;
		const acq_e  = 0;
		const projectEnd     = Math.max(aftr_e, core_e);
		const posCoreMid     = core_s + core * 0.4;
		const posCoreLateMid = core_s + core * 0.55;
		const iter_s = iter > 0 ? posCoreMid      : core_e;
		const iter_e = iter > 0 ? iter_s + iter + 1.5 : iter_s;
		const chng_s = chng > 0 ? posCoreLateMid  : core_e;
		const chng_e = chng > 0 ? chng_s + chng + 2   : chng_s;
		const prbs_s = prep > 0 ? prep_e * 0.3    : core_s;
		const prbs_e = prbs > 0 ? Math.max(projectEnd * 0.88, core_e + 0.5) : prbs_s;
		const admn_e = admn > 0 ? Math.max(projectEnd, iter_e, chng_e, prbs_e) : 0;
		const tMin   = acq > 0 ? acq_s : 0;
		const tMax   = Math.max(admn_e, iter_e, chng_e, prbs_e, core_e, aftr_e);
		const parDur = tMax - tMin;
		if (parDur < 0.1) return null;

		const off       = -tMin;
		const toFrac    = (w: number)            => (w + off) / parDur;
		const toWidFrac = (s: number, e: number) => Math.max((e - s) / parDur, 0.008);

		// ── Build bars (positions fixed across all modes) ──────────────────
		type BM = { s: number; e: number; note: string; isPreProject: boolean; isFullSpan: boolean; isSpread: boolean };
		const META: Record<string, BM> = {
			'to-get':   { s: acq_s,  e: acq_e,  note: 'Pre-project',          isPreProject: true,  isFullSpan: false, isSpread: false },
			'before':   { s: prep_s, e: prep_e,  note: '',                      isPreProject: false, isFullSpan: false, isSpread: false },
			'around':   { s: 0,      e: admn_e,  note: 'Spans full project',    isPreProject: false, isFullSpan: true,  isSpread: true  },
			'the-work': { s: core_s, e: core_e,  note: '',                      isPreProject: false, isFullSpan: false, isSpread: false },
			'between':  { s: iter_s, e: iter_e,  note: 'Overlaps with core',    isPreProject: false, isFullSpan: false, isSpread: true  },
			'beyond':   { s: chng_s, e: chng_e,  note: 'Overlaps with core',    isPreProject: false, isFullSpan: false, isSpread: true  },
			'outside':  { s: prbs_s, e: prbs_e,  note: 'Spread across project', isPreProject: false, isFullSpan: false, isSpread: true  },
			'after':    { s: aftr_s, e: aftr_e,  note: 'Elapsed ≈ 2× effort',   isPreProject: false, isFullSpan: false, isSpread: true  },
		};
		const ORDER = ['to-get', 'before', 'around', 'the-work', 'between', 'beyond', 'outside', 'after'] as const;
		const bars: Bar[] = [];
		for (const id of ORDER) {
			if (eff(id) === 0) continue;
			const cat = cats.find((c) => c.id === id)!;
			const m = META[id];
			bars.push({
				id,
				name:         cat.name,
				subtitle:     cat.subtitle,
				color:        cat.color,
				textColor:    cat.textColor,
				effortWeeks:  eff(id),
				startPct:     toFrac(m.s) * 100,
				widthPct:     toWidFrac(m.s, m.e) * 100,
				note:         m.note,
				isPreProject: m.isPreProject,
				isFullSpan:   m.isFullSpan,
				isSpread:     m.isSpread,
				items:        cat.items,
			});
		}

		// ── Display duration changes by mode; bar positions stay fixed ─────
		// Pessimistic = sequential sum, realistic = midpoint, optimistic = parallel tMax
		const displayEndWeeks =
			mode === 'pessimistic' ? seqTotal :
			mode === 'realistic'   ? (seqTotal + tMax) / 2 :
			tMax; // optimistic

		// Scale factor: 1 parallel week → scaleFactor display weeks
		const scaleFactor = displayEndWeeks / tMax;

		// ── Ticks (project-relative, anchored at t=0 = project start) ─────
		const mult  = UNIT_MULTIPLIERS[unit];
		const short = UNIT_SHORT[unit];
		const displayEndDisp = displayEndWeeks * mult;
		const rawStep = displayEndDisp <= 6 ? 1 : displayEndDisp <= 14 ? 2 : displayEndDisp <= 30 ? 5 : displayEndDisp <= 60 ? 10 : 20;
		const stepDispWeeks = rawStep / mult;
		const ticks: { label: string; pct: number; isZero: boolean }[] = [];
		for (let dw = 0; dw <= displayEndWeeks + stepDispWeeks * 0.01; dw += stepDispWeeks) {
			// Convert display week → parallel week for chart positioning
			const parWk = dw / scaleFactor;
			const p = toFrac(parWk) * 100;
			if (p > 101) break;
			const displayVal = Math.round(dw * mult * 10) / 10;
			ticks.push({ label: dw < 0.001 ? 'Start' : `${displayVal}${short}`, pct: p, isZero: dw < 0.001 });
		}

		return {
			bars,
			ticks,
			projStartPct:    toFrac(0) * 100,
			totalCalWeeks:   Math.round(tMax * 10) / 10,
			totalCalDisplay: Math.round(displayEndWeeks * mult * 10) / 10,
			unitShort:       short,
		};
	}
</script>

{#if chart}
	<div class="gantt-header">
		<div class="gantt-header-left">
			<div class="mode-toggle" role="group" aria-label="Estimate view">
				<button class="mode-btn" class:mode-btn--active={viewMode === 'pessimistic'} onclick={() => viewMode = 'pessimistic'}>Pessimistic</button>
				<button class="mode-btn" class:mode-btn--active={viewMode === 'realistic'} onclick={() => viewMode = 'realistic'}>Realistic</button>
				<button class="mode-btn" class:mode-btn--active={viewMode === 'optimistic'} onclick={() => viewMode = 'optimistic'}>Optimistic</button>
			</div>
			<span class="gantt-cal"
				class:gantt-cal--pessimistic={viewMode === 'pessimistic'}
				class:gantt-cal--realistic={viewMode === 'realistic'}
				class:gantt-cal--optimistic={viewMode === 'optimistic'}>
				{#if viewMode === 'pessimistic'}
					{chart.totalCalDisplay}{chart.unitShort}
					<span class="gantt-cal-sub">if all phases run sequentially</span>
				{:else if viewMode === 'realistic'}
					~{chart.totalCalDisplay}{chart.unitShort}
					<span class="gantt-cal-sub">expected midpoint</span>
				{:else}
					~{chart.totalCalDisplay}{chart.unitShort}
					<span class="gantt-cal-sub">if parallel phases land as modelled</span>
				{/if}
			</span>
		</div>
		<div class="gantt-header-right">
			{#if chart.bars.some(b => b.items.length > 0)}
				<button class="expand-toggle" onclick={allExpanded ? collapseAll : expandAll}>
					{allExpanded ? 'Collapse all' : 'Expand all'}
				</button>
			{/if}
			<span class="gantt-legend">
				<span class="legend-swatch legend-swatch--solid"></span> Effort (concentrated)
				&nbsp;&nbsp;
				<span class="legend-swatch legend-swatch--hatched"></span> Spread across timeline
			</span>
		</div>
	</div>

	<div class="gantt-wrap">
		<div class="gantt">

			<!-- Ruler -->
			<div class="g-row g-row--ruler">
				<div class="g-lbl">
					{#if chart.projStartPct > 1}
						<span class="preproj-lbl">pre-project</span>
					{/if}
				</div>
				<div class="g-track g-track--ruler">
					{#each chart.ticks as tick}
						<div class="tick" class:tick--start={tick.isZero} style="left: {tick.pct}%">
							<div class="tick-label">{tick.label}</div>
							<div class="tick-nub"></div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Data rows -->
			{#each chart.bars as bar}
				<div class="g-row">
					<div class="g-lbl">
						{#if bar.items.length > 0}
							<button
								class="lbl-toggle"
								onclick={() => toggleBar(bar.id)}
								aria-expanded={expandedBars.has(bar.id)}
							>
								<span class="chevron" class:chevron--open={expandedBars.has(bar.id)}>&#9654;</span>
								<span class="lbl-sub">{bar.subtitle}</span>
							</button>
						{:else}
							<span class="lbl-sub">{bar.subtitle}</span>
						{/if}
						{#if bar.note}<span class="lbl-note">{bar.note}</span>{/if}
					</div>
					<div class="g-track">
						<!-- Pre-project background shade -->
						{#if chart.projStartPct > 0.5}
							<div class="preproj-shade" style="width: {chart.projStartPct}%"></div>
						{/if}
						<!-- Project-start line -->
						<div class="proj-line" style="left: {chart.projStartPct}%"></div>
						<!-- The bar -->
						<div
							class="bar"
							class:bar--preproject={bar.isPreProject}
							class:bar--fullspan={bar.isFullSpan}						class:bar--spread={bar.isSpread}							style="left: {bar.startPct}%; width: {bar.widthPct}%; background: {bar.color}; color: {bar.textColor};"
							title="{bar.name} — {bar.effortWeeks}w effort"
						>
							<span class="bar-text">{toUnit(bar.effortWeeks, unit)}{UNIT_SHORT[unit]}</span>
						</div>
					</div>
				</div>
				{#if expandedBars.has(bar.id) && bar.items.length > 0}
					{#each bar.items as item, i}
						{@const isLast = i === bar.items.length - 1}
						<div class="g-row g-row--item">
							<div class="g-lbl"></div>
							<div class="g-track g-track--item">
								<div
									class="item-tree"
									class:item-tree--last={isLast}
									style="left: {bar.startPct}%; border-color: {bar.color};"
								></div>
								<div
					class="item-content"
					class:item-content--spread={bar.isSpread || bar.isFullSpan}
					style="margin-left: calc({bar.startPct}% + 14px); --item-bg: {bar.color};"
				>
									<span class="item-desc">{item.description}</span>
									{#if item.weeks != null}
										<span class="item-effort">{toUnit(item.weeks, unit)}{UNIT_SHORT[unit]}</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				{/if}
			{/each}

		</div>
	</div>
{:else}
	<p class="gantt-empty">Add week estimates to see the project timeline.</p>
{/if}

<style>
	.gantt-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 0.65rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.gantt-header-left {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.mode-toggle {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.mode-btn {
		background: none;
		border: none;
		border-right: 1px solid var(--border);
		padding: 0.45rem 0.85rem;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
		white-space: nowrap;
	}
	.mode-btn:last-child { border-right: none; }
	.mode-btn:hover:not(.mode-btn--active) { background: var(--bg-alt, rgba(0,0,0,0.04)); color: var(--text); }

	.mode-btn--active {
		background: var(--text);
		color: var(--bg);
	}

	.gantt-header-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.expand-toggle {
		font-size: 0.66rem;
		color: var(--text-muted);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.expand-toggle:hover {
		color: var(--text);
	}

	.gantt-cal {
		font-size: 0.9rem;
		font-weight: 700;
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.gantt-cal--pessimistic { color: var(--text); }
	.gantt-cal--realistic   { color: #0d7a4e; }
	.gantt-cal--optimistic  { color: #0369a1; }

	:global([data-theme="dark"]) .gantt-cal--realistic  { color: #34d399; }
	:global([data-theme="dark"]) .gantt-cal--optimistic { color: #38bdf8; }

	.gantt-cal-sub {
		font-size: 0.65rem;
		font-weight: 400;
		opacity: 0.6;
	}

	.gantt-legend {
		font-size: 0.66rem;
		color: var(--text-muted);
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.legend-swatch {
		display: inline-block;
		width: 18px;
		height: 10px;
		border-radius: 2px;
		background: #aaa;
		vertical-align: middle;
		flex-shrink: 0;
	}

	.legend-swatch--hatched {
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 3px,
			rgba(255, 255, 255, 0.45) 3px,
			rgba(255, 255, 255, 0.45) 4px
		);
	}

	.gantt-wrap {
		overflow-x: auto;
	}

	.gantt {
		min-width: 420px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	/* ── Row layout ──────────────────────────────────── */
	.g-row {
		display: flex;
		align-items: stretch;
	}

	/* Label column */
	.g-lbl {
		width: 108px;
		flex-shrink: 0;
		padding-right: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
		text-align: right;
		gap: 1px;
	}

	.lbl-sub {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.lbl-note {
		font-size: 0.58rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.preproj-lbl {
		font-size: 0.58rem;
		color: var(--text-muted);
		font-style: italic;
	}

	/* Track column */
	.g-track {
		flex: 1;
		position: relative;
		min-height: 30px;
	}

	/* ── Ruler ───────────────────────────────────────── */
	.g-row--ruler {
		margin-bottom: 6px;
	}

	.g-track--ruler {
		min-height: 32px;
		border-bottom: 1px solid var(--border);
	}

	.tick {
		position: absolute;
		top: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		transform: translateX(-50%);
		gap: 2px;
	}

	.tick-label {
		font-size: 0.6rem;
		color: var(--text-muted);
		white-space: nowrap;
		padding-top: 2px;
	}

	.tick-nub {
		width: 1px;
		height: 6px;
		background: var(--border);
	}

	.tick--start .tick-nub {
		height: 10px;
		background: rgba(0, 0, 0, 0.3);
	}

	.tick--start .tick-label {
		font-weight: 700;
		color: var(--text);
	}

	/* ── Pre-project visual elements ─────────────────── */
	.preproj-shade {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.03);
		border-right: 1px dashed rgba(0, 0, 0, 0.1);
		pointer-events: none;
	}

	.proj-line {
		position: absolute;
		top: -3px;
		bottom: -3px;
		width: 1px;
		background: rgba(0, 0, 0, 0.15);
		pointer-events: none;
	}

	/* ── Bars ────────────────────────────────────────── */
	.bar {
		position: absolute;
		top: 4px;
		height: 22px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		overflow: hidden;
		cursor: default;
		transition: filter 0.12s;
	}

	.bar:hover {
		filter: brightness(0.88);
	}

	/* Pre-project bars get a dashed outline to distinguish them */
	.bar--preproject {
		opacity: 0.75;
		outline: 1.5px dashed rgba(0, 0, 0, 0.2);
		outline-offset: -1px;
	}

	/* Full-span bars (admin overhead) are thinner to show they're ambient */
	.bar--fullspan {
		top: 9px;
		height: 12px;
		border-radius: 3px;
		opacity: 0.6;
	}

	/* Spread bars: diagonal hatching to show effort ≠ elapsed calendar time */
	.bar--spread::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 4px,
			rgba(255, 255, 255, 0.3) 4px,
			rgba(255, 255, 255, 0.3) 5px
		);
		pointer-events: none;
	}

	.bar-text {
		padding: 0 6px;
		font-size: 0.66rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		pointer-events: none;
	}

	/* ── Empty state ─────────────────────────────────── */
	.gantt-empty {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-align: center;
		padding: 0.75rem 0;
	}

	/* ── Toggle labels ───────────────────────────────── */
	.lbl-toggle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 3px;
		font: inherit;
		color: inherit;
		width: 100%;
		text-align: right;
	}

	.lbl-toggle:hover .lbl-sub {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.chevron {
		display: inline-block;
		font-size: 0.45rem;
		color: var(--text-muted);
		transition: transform 0.15s ease;
		line-height: 1;
		margin-bottom: 1px;
	}

	.chevron--open {
		transform: rotate(90deg);
	}

	/* ── Item rows ───────────────────────────────────── */
	.g-row--item {
		align-items: stretch;
	}

	.g-track--item {
		position: relative;
		min-height: 24px;
		display: flex;
		align-items: center;
		padding: 2px 4px;
	}

	/* Vertical + horizontal tree connector */
	.item-tree {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 0;
		border-left: 1px solid;
		opacity: 0.45;
	}

	.item-tree--last {
		bottom: 50%;
	}

	.item-tree::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		width: 10px;
		height: 0;
		border-top: 1px solid;
		border-color: inherit;
	}

	.item-content {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 1px 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.71rem;
	}

	.item-content--spread {
		border-radius: 3px;
		padding: 1px 5px;
		background:
			repeating-linear-gradient(
				-45deg,
				transparent,
				transparent 5px,
				rgba(0, 0, 0, 0.12) 5px,
				rgba(0, 0, 0, 0.12) 6px
			),
			color-mix(in srgb, var(--item-bg) 38%, transparent);
	}

	:global([data-theme="dark"]) .item-content--spread {
		background:
			repeating-linear-gradient(
				-45deg,
				transparent,
				transparent 5px,
				rgba(0, 0, 0, 0.25) 5px,
				rgba(0, 0, 0, 0.25) 6px
			),
			color-mix(in srgb, var(--item-bg) 45%, transparent);
	}

	.item-desc {
		flex: 1;
		color: var(--text);
		line-height: 1.3;
	}

	.item-effort {
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--text-muted);
		white-space: nowrap;
		min-width: 28px;
		text-align: right;
	}
</style>
