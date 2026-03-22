<script lang="ts">
	import { untrack } from 'svelte';
	import type { Category, Item } from '$lib/categories';
	import { type Unit, toUnit, UNIT_SHORT, UNIT_MULTIPLIERS, totalWeeks } from '$lib/categories';

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
		realisticDisplay: number;
		unitShort: string;
	};

	type ViewMode = 'pessimistic' | 'realistic' | 'optimistic';
	let viewMode = $state<ViewMode>('realistic');

	const parallelChart  = $derived(buildChart(categories, unit));
	const realisticChart = $derived(buildRealisticChart(categories, unit));
	const chart          = $derived(
		viewMode === 'pessimistic' ? buildSequentialChart(categories, unit) :
		viewMode === 'realistic'   ? realisticChart :
		parallelChart
	);

	let expandedBars = $state(new Set<string>());

	// When chart updates, expand any newly-added bars by default
	$effect(() => {
		if (!chart) return;

		// Bar ids that currently exist and have items
		const allIds = new Set(
			chart.bars
				.filter((b) => b.items.length > 0)
				.map((b) => b.id)
		);

		// Read expandedBars without tracking it to avoid a reactive cycle
		const current = untrack(() => expandedBars);

		// Start with previously expanded bars that still exist
		const next = new Set<string>();
		for (const id of current) {
			if (allIds.has(id)) {
				next.add(id);
			}
		}

		// Auto-expand any newly-added bars
		for (const id of allIds) {
			if (!next.has(id)) {
				next.add(id);
			}
		}

		expandedBars = next;
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

	function buildChart(cats: Category[], unit: Unit): ChartData | null {
		const eff = (id: string) =>
			cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0;

		const acq  = eff('to-get');   // Acquisition (pre-project)
		const prep = eff('before');   // Preparation
		const core = eff('the-work'); // Core execution
		const admn = eff('around');   // Admin / overhead
		const iter = eff('between');  // Iteration
		const chng = eff('beyond');   // Changes / scope
		const prbs = eff('outside');  // Surprises / contingency
		const aftr = eff('after');    // Maintenance & ops

		if (acq + prep + core + admn + iter + chng + prbs + aftr < 0.5) return null;

		// ── Sequential backbone (t = 0 is project kickoff) ────────────────
		const prep_s = 0;
		const prep_e = prep;
		const core_s = prep_e;
		const core_e = core_s + core;
		// After: maintenance is spread thin — elapsed ≈ 2× effort
		const aftr_s = core_e;
		const aftr_e = aftr_s + (aftr > 0 ? aftr * 2 : 0);

		// ── Pre-project acquisition (ends at t = 0, spread 1.5× effort) ───
		const acq_s = acq > 0 ? -(acq * 1.5) : 0;
		const acq_e = 0;

		const projectEnd = Math.max(aftr_e, core_e);
		const admn_s = 0;

		// ── Iteration: starts 40% into core, extends 1.5w past effort ─────
		// People are still iterating while finishing up, and for a short
		// tail after delivery as the codebase stabilises.
		const posCoreMid = core_s + core * 0.4;
		const iter_s = iter > 0 ? posCoreMid : core_e;
		const iter_e = iter > 0 ? iter_s + iter + 1.5 : iter_s;

		// ── Changes / scope creep: starts 55% into core ───────────────────
		// Stakeholder feedback typically arrives once there's something to show.
		const posCoreLateMid = core_s + core * 0.55;
		const chng_s = chng > 0 ? posCoreLateMid : core_e;
		const chng_e = chng > 0 ? chng_s + chng + 2 : chng_s;

		// ── Surprises: spread across most of the project ──────────────────
		const prbs_s = prep > 0 ? prep_e * 0.3 : core_s;
		const prbs_e = prbs > 0 ? Math.max(projectEnd * 0.88, core_e + 0.5) : prbs_s;

		// ── Admin: spans full project life (computed last so it reaches tMax) ─
		// Admin runs throughout — including any iteration/change tails that extend
		// past the core execution end date.
		const admn_e = admn > 0 ? Math.max(projectEnd, iter_e, chng_e, prbs_e) : 0;

		// ── Timeline bounds ────────────────────────────────────────────────
		const tMin = acq > 0 ? acq_s : 0;
		const tMax = Math.max(admn_e, iter_e, chng_e, prbs_e, core_e, aftr_e);
		const dur  = tMax - tMin;
		if (dur < 0.1) return null;

		const off      = -tMin; // shift so tMin → 0%
		const pct      = (w: number) => ((w + off) / dur) * 100;
		const widthPct = (s: number, e: number) => Math.max(((e - s) / dur) * 100, 0.8);

		// ── Build bar rows ─────────────────────────────────────────────────
		const bars: Bar[] = [];

		const push = (
			id: string,
			s: number,
			e: number,
			note: string,
			isPreProject = false,
			isFullSpan   = false,
			isSpread     = false
		) => {
			if (eff(id) === 0) return;
			if (e <= s && !isFullSpan) return;
			const cat = cats.find((c) => c.id === id)!;
			bars.push({
				id,
				name:        cat.name,
				subtitle:    cat.subtitle,
				color:       cat.color,
				textColor:   cat.textColor,
				effortWeeks: eff(id),
				startPct:    pct(s),
				widthPct:    widthPct(s, e),
				note,
				isPreProject,
				isFullSpan,
				isSpread,
				items: cat.items,
			});
		};

		// Order matches the logical project flow
		//                                                      pre    fullspan  spread
		push('to-get',   acq_s,  acq_e,  'Pre-project',        true,  false,    false);
		push('before',   prep_s, prep_e, '',                    false, false,    false);
		push('around',   admn_s, admn_e, 'Spans full project',  false, true,     true);
		push('the-work', core_s, core_e, '',                    false, false,    false);
		push('between',  iter_s, iter_e, 'Overlaps with core',  false, false,    true);
		push('beyond',   chng_s, chng_e, 'Overlaps with core',  false, false,    true);
		push('outside',  prbs_s, prbs_e, 'Spread across project',false,false,    true);
		push('after',    aftr_s, aftr_e, 'Elapsed ≈ 2× effort', false, false,    true);

		// ── Ruler ticks (project-relative, w=0 is kickoff) ────────────────
		// tMax is in weeks; convert to display unit for labelling
		const mult = UNIT_MULTIPLIERS[unit];
		const short = UNIT_SHORT[unit];
		const tMaxDisplay = tMax * mult;
		// Pick a step in display-unit terms that gives ~6-10 ticks
		const rawStep = tMaxDisplay <= 6 ? 1
			: tMaxDisplay <= 14 ? 2
			: tMaxDisplay <= 30 ? 5
			: tMaxDisplay <= 60 ? 10
			: 20;
		// Convert the step back to weeks for timeline positioning
		const stepWeeks = rawStep / mult;
		const ticks: { label: string; pct: number; isZero: boolean }[] = [];
		for (let wk = 0; wk <= tMax + stepWeeks * 0.01; wk += stepWeeks) {
			const p = pct(wk);
			if (p > 101) break;
			const displayVal = Math.round(wk * mult * 10) / 10;
			ticks.push({
				label: wk < 0.001 ? 'Start' : `${displayVal}${short}`,
				pct: p,
				isZero: wk < 0.001,
			});
		}

		const totalEffortWeeks = totalWeeks(cats);
		const realisticWeeks = Math.round(((totalEffortWeeks + tMax) / 2) * 10) / 10;

		return {
			bars,
			ticks,
			projStartPct:    pct(0),
			totalCalWeeks:   Math.round(tMax * 10) / 10,
			totalCalDisplay: Math.round(tMax * mult * 10) / 10,
			realisticDisplay: Math.round(realisticWeeks * mult * 10) / 10,
			unitShort: short,
		};
	}

	/** Pessimistic view: every category laid out end-to-end with no overlap. */
	function buildSequentialChart(cats: Category[], unit: Unit): ChartData | null {
		const ORDER = ['to-get', 'before', 'the-work', 'between', 'beyond', 'outside', 'around', 'after'];
		const eff = (id: string) =>
			cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0;

		const total = ORDER.reduce((s, id) => s + eff(id), 0);
		if (total < 0.5) return null;

		const mult  = UNIT_MULTIPLIERS[unit];
		const short = UNIT_SHORT[unit];

		const bars: Bar[] = [];
		let cursor = 0;

		for (const id of ORDER) {
			const effort = eff(id);
			if (effort === 0) continue;
			const cat = cats.find((c) => c.id === id)!;
			bars.push({
				id,
				name:        cat.name,
				subtitle:    cat.subtitle,
				color:       cat.color,
				textColor:   cat.textColor,
				effortWeeks: effort,
				startPct:    (cursor / total) * 100,
				widthPct:    Math.max((effort / total) * 100, 0.8),
				note:        '',
				isPreProject: false,
				isFullSpan:   false,
				isSpread:     false,
				items: cat.items,
			});
			cursor += effort;
		}

		const totalDisplay = total * mult;
		const rawStep = totalDisplay <= 6 ? 1 : totalDisplay <= 14 ? 2 : totalDisplay <= 30 ? 5 : totalDisplay <= 60 ? 10 : 20;
		const stepWeeks = rawStep / mult;
		const ticks: { label: string; pct: number; isZero: boolean }[] = [];
		for (let wk = 0; wk <= total + stepWeeks * 0.01; wk += stepWeeks) {
			const p = (wk / total) * 100;
			if (p > 101) break;
			const displayVal = Math.round(wk * mult * 10) / 10;
			ticks.push({ label: wk < 0.001 ? 'Start' : `${displayVal}${short}`, pct: p, isZero: wk < 0.001 });
		}

		return {
			bars,
			ticks,
			projStartPct:     0,
			totalCalWeeks:    total,
			totalCalDisplay:  Math.round(totalDisplay * 10) / 10,
			realisticDisplay: 0, // unused in pessimistic mode
			unitShort: short,
		};
	}

	/**
	 * Realistic view: bar positions are blended 50% between sequential (pessimistic)
	 * and parallel (optimistic) in normalised fraction space.
	 */
	function buildRealisticChart(cats: Category[], unit: Unit): ChartData | null {
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

		// ── Sequential positions (cursor-based, 0-based) ───────────────────
		const ORDER = ['to-get', 'before', 'the-work', 'between', 'beyond', 'outside', 'around', 'after'] as const;
		let cursor = 0;
		const seqS: Record<string, number> = {};
		const seqE: Record<string, number> = {};
		for (const id of ORDER) {
			seqS[id] = cursor;
			seqE[id] = cursor + eff(id);
			cursor  += eff(id);
		}

		// ── Parallel absolute positions (same math as buildChart) ──────────
		const core_s = prep;
		const core_e = prep + core;
		const aftr_s = core_e;
		const aftr_e = aftr_s + (aftr > 0 ? aftr * 2 : 0);
		const acq_s  = acq > 0 ? -(acq * 1.5) : 0;
		const projectEnd = Math.max(aftr_e, core_e);
		const iter_s = iter > 0 ? (core_s + core * 0.4)  : core_e;
		const iter_e = iter > 0 ? iter_s + iter + 1.5    : iter_s;
		const chng_s = chng > 0 ? (core_s + core * 0.55) : core_e;
		const chng_e = chng > 0 ? chng_s + chng + 2      : chng_s;
		const prbs_s = prep > 0 ? prep * 0.3             : core_s;
		const prbs_e = prbs > 0 ? Math.max(projectEnd * 0.88, core_e + 0.5) : prbs_s;
		const admn_e = admn > 0 ? Math.max(projectEnd, iter_e, chng_e, prbs_e) : 0;
		const tMin   = acq > 0 ? acq_s : 0;
		const tMax   = Math.max(admn_e, iter_e, chng_e, prbs_e, core_e, aftr_e);
		const parDur = tMax - tMin;
		if (parDur < 0.1) return null;

		// Shift parallel positions to 0-based
		const parS: Record<string, number> = {
			'to-get':   acq_s  - tMin,
			'before':   0      - tMin,
			'the-work': core_s - tMin,
			'between':  iter_s - tMin,
			'beyond':   chng_s - tMin,
			'outside':  prbs_s - tMin,
			'around':   0      - tMin,
			'after':    aftr_s - tMin,
		};
		const parE: Record<string, number> = {
			'to-get':   0      - tMin,
			'before':   prep   - tMin,
			'the-work': core_e - tMin,
			'between':  iter_e - tMin,
			'beyond':   chng_e - tMin,
			'outside':  prbs_e - tMin,
			'around':   admn_e - tMin,
			'after':    aftr_e - tMin,
		};

		// ── 50% blend in normalised [0..1] fraction space ─────────────────
		const rTotal = (seqTotal + tMax) / 2; // == realisticWeeks

		type BM = { note: string; isPreProject: boolean; isFullSpan: boolean; isSpread: boolean };
		const META: Record<string, BM> = {
			'to-get':   { note: 'Pre-project',           isPreProject: true,  isFullSpan: false, isSpread: false },
			'before':   { note: '',                       isPreProject: false, isFullSpan: false, isSpread: false },
			'around':   { note: 'Spans full project',     isPreProject: false, isFullSpan: true,  isSpread: true  },
			'the-work': { note: '',                       isPreProject: false, isFullSpan: false, isSpread: false },
			'between':  { note: 'Overlaps with core',     isPreProject: false, isFullSpan: false, isSpread: true  },
			'beyond':   { note: 'Overlaps with core',     isPreProject: false, isFullSpan: false, isSpread: true  },
			'outside':  { note: 'Spread across project',  isPreProject: false, isFullSpan: false, isSpread: true  },
			'after':    { note: 'Elapsed ≈ 2× effort',    isPreProject: false, isFullSpan: false, isSpread: true  },
		};

		const bars: Bar[] = [];
		for (const id of ORDER) {
			if (eff(id) === 0) continue;
			const cat = cats.find((c) => c.id === id)!;
			const rs = 0.5 * (seqS[id] / seqTotal) + 0.5 * (parS[id] / parDur);
			const re = 0.5 * (seqE[id] / seqTotal) + 0.5 * (parE[id] / parDur);
			bars.push({
				id,
				name:        cat.name,
				subtitle:    cat.subtitle,
				color:       cat.color,
				textColor:   cat.textColor,
				effortWeeks: eff(id),
				startPct:    rs * 100,
				widthPct:    Math.max((re - rs) * 100, 0.8),
				items:       cat.items,
				...META[id],
			});
		}

		// ── Project-start line ─────────────────────────────────────────────
		const seqProjFrac = acq / seqTotal;
		const parProjFrac = (0 - tMin) / parDur;
		const projStartFrac = 0.5 * seqProjFrac + 0.5 * parProjFrac;
		const projStartPct  = projStartFrac * 100;

		// ── Ticks (weeks relative to project start, scaled to rTotal) ──────
		const mult  = UNIT_MULTIPLIERS[unit];
		const short = UNIT_SHORT[unit];
		const rProjStart  = projStartFrac * rTotal; // abs weeks from chart-start to t=0
		const rTotalDisp  = rTotal * mult;
		const rawStep     = rTotalDisp <= 6 ? 1 : rTotalDisp <= 14 ? 2 : rTotalDisp <= 30 ? 5 : rTotalDisp <= 60 ? 10 : 20;
		const stepWeeks   = rawStep / mult;
		const ticks: { label: string; pct: number; isZero: boolean }[] = [];
		for (let wk = -rProjStart; wk <= rTotal - rProjStart + stepWeeks * 0.01; wk += stepWeeks) {
			const f = (rProjStart + wk) / rTotal;
			if (f < -0.01 || f > 1.01) break;
			const displayVal = Math.round(wk * mult * 10) / 10;
			ticks.push({ label: Math.abs(wk) < 0.001 ? 'Start' : `${displayVal}${short}`, pct: f * 100, isZero: Math.abs(wk) < 0.001 });
		}

		return {
			bars,
			ticks,
			projStartPct,
			totalCalWeeks:    tMax,
			totalCalDisplay:  Math.round(tMax * mult * 10) / 10,
			realisticDisplay: Math.round(rTotalDisp * 10) / 10,
			unitShort: short,
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
				{:else if viewMode === 'realistic' && parallelChart}
					~{parallelChart.realisticDisplay}{parallelChart.unitShort}
					<span class="gantt-cal-sub">expected midpoint</span>
				{:else if parallelChart}
					~{parallelChart.totalCalDisplay}{parallelChart.unitShort}
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
