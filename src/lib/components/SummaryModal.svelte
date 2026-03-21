<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/categories';
	import { buildCsv, coreWeeks, totalWeeks, getCalendarWeeks, getElapsedBreakdown, getRiskAssessment, type Unit, toUnit, UNIT_LABELS, UNIT_SHORT } from '$lib/categories';
	import GanttChart from './GanttChart.svelte';

	let {
		categories,
		unit = 'weeks' as Unit,
		projectName = 'project',
		onclose
	}: {
		categories: Category[];
		unit?: Unit;
		projectName?: string;
		onclose: () => void;
	} = $props();

	const core     = $derived(coreWeeks(categories));
	const total    = $derived(totalWeeks(categories));
	const calWeeks = $derived(getCalendarWeeks(categories));
	const elapsed  = $derived(getElapsedBreakdown(categories));
	const pctCore  = $derived(total > 0 ? Math.round((core / total) * 100) : 0);
	const overhead = $derived(core > 0 && total > core ? Math.round(((total - core) / core) * 100) : 0);

	const uCore      = $derived(toUnit(core, unit));
	const uTotal     = $derived(toUnit(total, unit));
	const uNonCore   = $derived(toUnit(total - core, unit));
	const uCal       = $derived(calWeeks != null ? toUnit(calWeeks, unit) : null);
	const uShort  = $derived(UNIT_SHORT[unit]);
	const uLabel  = $derived(UNIT_LABELS[unit].toLowerCase());

	const parallelWeeks  = $derived(calWeeks != null && total > calWeeks ? Math.round((total - calWeeks) * 10) / 10 : 0);
	const uParallel      = $derived(toUnit(parallelWeeks, unit));
	const concurrentDesc = $derived(buildConcurrentDesc(elapsed));
	const risk           = $derived(getRiskAssessment(categories));

	function buildConcurrentDesc(el: typeof elapsed): string {
		const parts: string[] = [];
		if (el.some(e => e.id === 'around')) parts.push('admin runs throughout the project');
		const hasIter = el.some(e => e.id === 'between');
		const hasChng = el.some(e => e.id === 'beyond');
		if (hasIter && hasChng) parts.push('iteration and changes overlap with execution');
		else if (hasIter) parts.push('iteration overlaps with execution');
		else if (hasChng) parts.push('scope changes overlap with execution');
		if (el.some(e => e.id === 'to-get')) parts.push('acquisition happens pre-project');
		return parts.length > 0 ? parts.join('; ') : 'activities run concurrently';
	}

	const catRows = $derived(
		categories
			.filter((c) => c.items.length > 0)
			.map((c) => {
				const effortWeeks = c.items.reduce((s, i) => s + (i.weeks ?? 0), 0);
				const elapsedEntry = elapsed.find((e) => e.id === c.id);
				return {
					...c,
					effortWeeks,
					uEffort: toUnit(effortWeeks, unit),
					uElapsed: elapsedEntry ? toUnit(elapsedEntry.elapsedWeeks, unit) : null,
					pattern: elapsedEntry?.pattern ?? '',
					methodology: elapsedEntry?.methodology ?? '',
					pct: total > 0 ? Math.round((effortWeeks / total) * 100) : 0,
				};
			})
	);

	function downloadCsv() {
		const csv = buildCsv(categories);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		const date = new Date().toISOString().slice(0, 10);
		const safeName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '-') || 'project';
		a.download = `${safeName}-${date}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="backdrop"
	onclick={handleBackdrop}
	role="dialog"
	aria-modal="true"
	aria-label="Full project breakdown"
	tabindex="-1"
	transition:fade={{ duration: 180 }}
>
	<div class="modal" transition:fly={{ y: 12, duration: 200 }}>
		<header class="modal-header">
			<h2>Project breakdown</h2>
			<button class="close-btn" onclick={onclose} aria-label="Close breakdown">×</button>
		</header>

		<div class="modal-body">
			{#if risk}
				<div class="risk-banner risk--{risk.level}">
					<div class="risk-header">
						<span class="risk-badge">{risk.level === 'low' ? 'Accurate' : risk.level === 'medium' ? 'More Complete' : 'Much More Complete'}</span>
						<span class="risk-headline">{risk.headline}</span>
						<span class="risk-miss">Non-core work is <strong>~{risk.underestimationPct}%</strong> of total effort</span>
					</div>
					<p class="risk-explanation">{risk.explanation}</p>
					{#if risk.drivers.length > 0}
						<div class="risk-drivers">
							<span class="risk-drivers-label">Hidden work found:</span>
							{#each risk.drivers as d}
								<span class="risk-driver-pill">{d.subtitle} <span class="driver-pct">{d.pct}%</span></span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Stats strip -->
			{#if total > 0}
				<div class="stats-strip">
					<div class="stat">
						<span class="stat-value">{uTotal}{uShort}</span>
						<span class="stat-label">
							total effort
							<span class="stat-info" data-tip="The sum of person-time across every category — what you'd write on a timesheet if one person did all the work sequentially.">ⓘ</span>
						</span>
					</div>
					{#if uCal != null}
						<div class="stat stat--cal">
							<span class="stat-value">~{uCal}{uShort}</span>
							<span class="stat-label">
								calendar time
								<span class="stat-info" data-tip="Wall-clock duration from project start to finish. Less than total effort because several activities run concurrently on the calendar.">ⓘ</span>
							</span>
						</div>
					{/if}
					{#if pctCore > 0}
						<div class="stat">
							<span class="stat-value">{pctCore}%</span>
							<span class="stat-label">
								core execution
								<span class="stat-info" data-tip="The portion of total effort spent on the actual deliverable — the work you'd normally put in a statement of work. Everything else is overhead.">ⓘ</span>
							</span>
						</div>
					{/if}
					{#if overhead > 0}
						<div class="stat">
							<span class="stat-value">+{overhead}%</span>
							<span class="stat-label">
								overhead beyond core
								<span class="stat-info" data-tip="How much extra work surrounds the core deliverable, expressed as a % of core effort. +100% means the surrounding work doubles the total.">ⓘ</span>
							</span>
							<span class="stat-calc">{uNonCore}{uShort} non-core &div; {uCore}{uShort} core &times; 100</span>
						</div>
					{/if}
				</div>
			{/if}

			{#if parallelWeeks > 0}
				<div class="parallel-note">
					<strong>{uParallel}{uShort} of work runs in parallel</strong> —
					{concurrentDesc}.
					<em>Effort</em> is the sum of person-time across all activities;
					<em>calendar time</em> is the wall-clock duration from start to finish.
				</div>
			{/if}

			<!-- Timeline + methodology -->
			{#if total > 0}
				<section class="gantt-section">
					<h3 class="section-label">Timeline</h3>
					<GanttChart {categories} {unit} />
					{#if elapsed.length > 0}
						<details class="methodology">
							<summary>How we estimate calendar time</summary>
							<p class="method-intro">
								Calendar time differs from effort because tasks overlap, spread out, or continue
								in the background while other work is happening. Here's the rule used for each category:
							</p>
							<table class="method-table">
								<tbody>
									{#each elapsed as e}
										<tr>
											<td class="method-swatch"><span class="swatch" style="background: {e.color};" aria-hidden="true"></span></td>
											<td class="method-name">{e.name}</td>
											<td class="method-pattern">{e.pattern}</td>
											<td class="method-desc">{e.methodology}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</details>
					{/if}
				</section>
			{/if}

			<!-- Effort breakdown table -->
			{#if catRows.length > 0}
				<section class="breakdown-section">
					<h3 class="section-label">Effort breakdown</h3>
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th></th>
									<th>Category</th>
									<th class="num">Effort</th>
									<th class="num">Elapsed est.</th>
									<th class="pattern-col">Pattern</th>
									<th class="num">% of total</th>
								</tr>
							</thead>
							<tbody>
								{#each catRows as row}
									<tr>
										<td><span class="swatch" style="background: {row.color};" aria-hidden="true"></span></td>
										<td>
											<span class="cat-name">{row.name}</span>
											<span class="cat-sub">{row.subtitle}</span>
										</td>
										<td class="num">{row.uEffort}{uShort}</td>
										<td class="num elapsed-cell">
											{#if row.uElapsed != null}
												~{row.uElapsed}{uShort}
												{#if row.uElapsed > row.uEffort}
													<span class="spread-badge">spread</span>
												{/if}
											{:else}
												—
											{/if}
										</td>
										<td class="pattern-cell">{row.pattern}</td>
										<td class="num">{row.pct}%</td>
									</tr>
								{/each}
								<tr class="total-row">
									<td></td>
									<td><strong>Total</strong></td>
									<td class="num"><strong>{uTotal}{uShort}</strong></td>
									<td class="num">
										{#if uCal != null}<strong>~{uCal}{uShort}</strong>{:else}—{/if}
									</td>
									<td></td>
									<td class="num"><strong>100%</strong></td>
								</tr>
							</tbody>
						</table>
					</div>
					<p class="elapsed-note">
						Elapsed shows how long each activity spans on the calendar. Overlapping tasks run
						concurrently, so the project total is less than the sum of individual elapsed estimates.
					</p>
				</section>
			{/if}

			<!-- All items -->
			{#if categories.some((c) => c.items.length > 0)}
				<section class="items-section">
					<h3 class="section-label">All items</h3>
					<div class="item-list">
						{#each categories.filter((c) => c.items.length > 0) as cat}
							<div class="cat-group">
								<div class="cat-group-header" style="background: {cat.color}; color: {cat.textColor};">
									<span>{cat.name}</span>
									<span class="cat-group-weeks">
										{toUnit(cat.items.reduce((s, i) => s + (i.weeks ?? 0), 0), unit)}{uShort}
									</span>
								</div>
								<ul>
									{#each cat.items as item}
										<li>
											<span class="item-desc">{item.description || '(no description)'}</span>
											<span class="item-weeks">
												{item.weeks != null ? toUnit(item.weeks, unit) + uShort : 'no estimate'}
											</span>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<footer class="modal-footer">
			<button class="csv-btn" onclick={downloadCsv} disabled={total === 0}>
				⬇ Download CSV
			</button>
			<button class="close-text-btn" onclick={onclose}>Close</button>
		</footer>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: stretch;
		padding: 0;
	}

	.modal {
		background: var(--surface);
		border-radius: 0;
		box-shadow: none;
		width: 100%;
		max-width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.modal-header h2 {
		font-size: 1rem;
		font-weight: 700;
	}

	.close-btn {
		background: transparent;
		color: var(--text-muted);
		font-size: 1.4rem;
		line-height: 1;
		padding: 0.1rem 0.3rem;
		border-radius: 50%;
	}
	.close-btn:hover { background: var(--bg); color: var(--text); }

	.modal-body {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	/* Stats strip */
	.stats-strip {
		display: flex;
		flex-wrap: wrap;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.parallel-note {
		padding: 0.6rem 2rem;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.55;
		flex-shrink: 0;
	}
	.parallel-note strong {
		color: var(--text);
	}
	.parallel-note em {
		font-style: normal;
		font-weight: 600;
		color: var(--text);
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 1rem 2rem;
		border-right: 1px solid var(--border);
	}
	.stat:last-child { border-right: none; }

	.stat-value {
		font-size: 1.6rem;
		font-weight: 700;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}
	.stat--cal .stat-value { color: #0369a1; }

	:global([data-theme="dark"]) .stat--cal .stat-value { color: #38bdf8; }

	.stat-label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.stat-info {
		position: relative;
		cursor: default;
		font-size: 0.7rem;
		color: var(--text-muted);
		opacity: 0.6;
		line-height: 1;
		transition: opacity 0.15s;
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
		flex-shrink: 0;
	}
	.stat-info:hover { opacity: 1; }

	.stat-info::after {
		content: attr(data-tip);
		position: absolute;
		top: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		width: 220px;
		background: var(--text);
		color: var(--bg);
		font-size: 0.73rem;
		font-weight: 400;
		line-height: 1.45;
		padding: 0.45rem 0.65rem;
		border-radius: 6px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.15s;
		z-index: 10;
		white-space: normal;
		text-align: left;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}
	.stat-info:hover::after { opacity: 1; }

	.stat-calc {
		font-size: 0.68rem;
		color: var(--text-muted);
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	/* Risk banner */
	.risk-banner {
		padding: 1rem 2rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.risk-header {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	.risk-badge {
		display: inline-block;
		font-size: 0.65rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border-radius: 4px;
		padding: 0.2rem 0.5rem;
		flex-shrink: 0;
	}

	.risk-headline {
		font-size: 0.88rem;
		font-weight: 700;
		flex: 1;
		min-width: 0;
	}

	.risk-miss {
		font-size: 0.78rem;
		white-space: nowrap;
		color: var(--text-muted);
	}
	.risk-miss strong { color: var(--text); }

	.risk-explanation {
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.55;
		margin: 0 0 0.6rem;
	}

	.risk-drivers {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.risk-drivers-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.risk-driver-pill {
		font-size: 0.72rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		border: 1px solid currentColor;
		opacity: 0.75;
	}
	.driver-pct {
		opacity: 0.65;
	}

	/* level-specific colours */
	/* low = light blue */
	.risk--low {
		background: #eff6ff;
		color: #1e40af;
	}
	.risk--low .risk-badge { background: #bfdbfe; color: #1e3a8a; }
	.risk--low .risk-driver-pill { color: #1d4ed8; }

	/* medium = teal */
	.risk--medium {
		background: #f0fdfa;
		color: #0f766e;
	}
	.risk--medium .risk-badge { background: #99f6e4; color: #134e4a; }
	.risk--medium .risk-driver-pill { color: #0d9488; }

	/* high = green */
	.risk--high {
		background: #f0fdf4;
		color: #166534;
	}
	.risk--high .risk-badge { background: #bbf7d0; color: #14532d; }
	.risk--high .risk-driver-pill { color: #15803d; }

	/* Dark mode overrides */
	:global([data-theme="dark"]) .risk--low    { background: rgba(30,80,200,0.12); color: #93c5fd; }
	:global([data-theme="dark"]) .risk--low .risk-badge { background: rgba(30,80,200,0.28); color: #bfdbfe; }
	:global([data-theme="dark"]) .risk--low .risk-driver-pill { color: #93c5fd; }
	:global([data-theme="dark"]) .risk--medium { background: rgba(15,118,110,0.14); color: #5eead4; }
	:global([data-theme="dark"]) .risk--medium .risk-badge { background: rgba(15,118,110,0.30); color: #99f6e4; }
	:global([data-theme="dark"]) .risk--medium .risk-driver-pill { color: #5eead4; }
	:global([data-theme="dark"]) .risk--high { background: rgba(22,101,52,0.16); color: #86efac; }
	:global([data-theme="dark"]) .risk--high .risk-badge { background: rgba(22,101,52,0.32); color: #bbf7d0; }
	:global([data-theme="dark"]) .risk--high .risk-driver-pill { color: #86efac; }

	/* Sections */
	.gantt-section,
	.breakdown-section {
		padding: 1.75rem 2rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.items-section {
		padding: 1.75rem 2rem 2rem;
	}

	.section-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	/* Methodology disclosure */
	.methodology {
		margin-top: 1.25rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.methodology summary {
		padding: 0.6rem 0.9rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		color: var(--text-muted);
		background: var(--bg);
		list-style: none;
	}
	.methodology summary::-webkit-details-marker { display: none; }
	.methodology summary::before { content: '\25B8 '; }
	.methodology[open] summary::before { content: '\25BE '; }
	.methodology summary:hover { color: var(--text); }

	.method-intro {
		padding: 0.75rem 0.9rem 0.25rem;
		font-size: 0.83rem;
		color: var(--text-muted);
		line-height: 1.5;
		border-top: 1px solid var(--border);
	}

	.method-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}
	.method-table tbody tr { border-top: 1px solid var(--border); }
	.method-table td { padding: 0.45rem 0.6rem; vertical-align: top; }
	.method-swatch { width: 24px; }
	.method-name { font-weight: 600; white-space: nowrap; }
	.method-pattern { color: var(--text-muted); white-space: nowrap; font-size: 0.78rem; padding-right: 0.5rem; }
	.method-desc { color: var(--text-muted); }

	/* Breakdown table */
	.table-wrap { overflow-x: auto; }

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.86rem;
	}

	thead th {
		text-align: left;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		padding: 0.4rem 0.6rem;
		border-bottom: 2px solid var(--border);
	}
	thead th.num { text-align: right; }

	tbody tr {
		border-bottom: 1px solid var(--border);
		transition: background var(--transition);
	}
	tbody tr:hover { background: var(--bg); }

	tbody td {
		padding: 0.55rem 0.6rem;
		vertical-align: middle;
	}
	tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }

	.pattern-col { width: 28%; }
	.pattern-cell { font-size: 0.78rem; color: var(--text-muted); }

	.elapsed-cell { white-space: nowrap; }
	.spread-badge {
		display: inline-block;
		margin-left: 0.3rem;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b21a8;
		background: #f3e8ff;
		border-radius: 3px;
		padding: 0.05rem 0.3rem;
		vertical-align: middle;
	}

	.total-row td {
		padding: 0.6rem 0.6rem;
		border-top: 2px solid var(--border);
		font-size: 0.9rem;
	}
	.total-row td.num { text-align: right; font-variant-numeric: tabular-nums; }

	.elapsed-note {
		margin-top: 0.75rem;
		font-size: 0.78rem;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.swatch {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		vertical-align: middle;
	}

	.cat-name {
		display: block;
		font-weight: 500;
	}
	.cat-sub {
		display: block;
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	/* Items */
	.item-list { display: flex; flex-direction: column; gap: 0.75rem; }

	.cat-group-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0.75rem;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.cat-group-weeks { font-variant-numeric: tabular-nums; opacity: 0.75; }

	.cat-group ul {
		list-style: none;
		border: 1px solid var(--border);
		border-top: none;
		border-radius: 0 0 var(--radius-sm) var(--radius-sm);
		overflow: hidden;
	}

	.cat-group li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.4rem 0.75rem;
		font-size: 0.84rem;
		border-bottom: 1px solid var(--border);
	}
	.cat-group li:last-child { border-bottom: none; }

	.item-desc { flex: 1; min-width: 0; }
	.item-weeks {
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	/* Footer */
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 2rem;
		border-top: 1px solid var(--border);
		flex-shrink: 0;
		gap: 0.75rem;
	}

	.csv-btn {
		background: #ecfdf5;
		color: #065f46;
		border: 1.5px solid #6ee7b7;
		padding: 0.45rem 1rem;
		font-size: 0.85rem;
		font-weight: 600;
	}
	.csv-btn:hover:not(:disabled) { background: #d1fae5; }
	.csv-btn:disabled { opacity: 0.4; cursor: default; }

	.close-text-btn {
		background: transparent;
		color: var(--text-muted);
		padding: 0.45rem 0.75rem;
		font-size: 0.85rem;
	}
	.close-text-btn:hover { color: var(--text); background: var(--bg); }

	@media print {
		.modal-footer { display: none; }
		.backdrop { position: static; background: none; }
	}
</style>
