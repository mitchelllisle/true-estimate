<script lang="ts">
	import type { Category } from '$lib/categories';
	import { type Unit, toUnit, UNIT_SHORT } from '$lib/categories';

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
	};

	type ChartData = {
		bars: Bar[];
		ticks: { label: string; pct: number; isZero: boolean }[];
		projStartPct: number;
		totalCalWeeks: number;
	};

	const chart = $derived(buildChart(categories));

	function buildChart(cats: Category[]): ChartData | null {
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
		const step = tMax <= 6 ? 1 : tMax <= 14 ? 2 : 4;
		const ticks: { label: string; pct: number; isZero: boolean }[] = [];
		for (let wk = 0; wk <= Math.ceil(tMax); wk += step) {
			const p = pct(wk);
			if (p > 101) break;
			ticks.push({ label: wk === 0 ? 'Start' : `Wk ${wk}`, pct: p, isZero: wk === 0 });
		}

		return {
			bars,
			ticks,
			projStartPct:  pct(0),
			totalCalWeeks: Math.round(tMax * 10) / 10,
		};
	}
</script>

{#if chart}
	<div class="gantt-header">
		<span class="gantt-cal">~{chart.totalCalWeeks} calendar weeks</span>
		<span class="gantt-legend">
			<span class="legend-swatch legend-swatch--solid"></span> Effort (concentrated)
			&nbsp;&nbsp;
			<span class="legend-swatch legend-swatch--hatched"></span> Spread across timeline
		</span>
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
						<span class="lbl-sub">{bar.subtitle}</span>
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
			{/each}

		</div>
	</div>
{:else}
	<p class="gantt-empty">Add week estimates to see the project timeline.</p>
{/if}

<style>
	.gantt-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.65rem;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.gantt-cal {
		font-size: 0.9rem;
		font-weight: 700;
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
</style>
