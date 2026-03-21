<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/categories';
	import { buildCsv, coreWeeks, totalWeeks, type Unit, toUnit, UNIT_LABELS, UNIT_SHORT } from '$lib/categories';
	import GanttChart from './GanttChart.svelte';

	let {
		categories,
		unit = 'weeks' as Unit,
		onclose
	}: {
		categories: Category[];
		unit?: Unit;
		onclose: () => void;
	} = $props();

	const core     = $derived(coreWeeks(categories));
	const total    = $derived(totalWeeks(categories));
	const pctCore  = $derived(total > 0 ? Math.round((core / total) * 100) : 0);

	const projLow  = $derived(Math.round(core * 3.5 * 10) / 10);
	const projHigh = $derived(Math.round(core * 5 * 10) / 10);

	const uCore     = $derived(toUnit(core, unit));
	const uTotal    = $derived(toUnit(total, unit));
	const uProjLow  = $derived(toUnit(projLow, unit));
	const uProjHigh = $derived(toUnit(projHigh, unit));
	const uShort    = $derived(UNIT_SHORT[unit]);
	const uLabel    = $derived(UNIT_LABELS[unit].toLowerCase());

	function downloadCsv() {
		const csv = buildCsv(categories);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'project-estimation.csv';
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
			<!-- ── Gantt – most prominent ──────────────────── -->
			{#if total > 0}
				<section class="gantt-section">
					<h3 class="section-label">Project timeline</h3>
					<GanttChart {categories} {unit} />
				</section>
			{/if}

			<!-- ── Insight callout + category table ─────────── -->
			<section class="details-section">
				<div class="details-left">
					{#if core > 0}
						<div class="callout">
							<div class="callout-icon" aria-hidden="true">💡</div>
							<div class="callout-text">
								<strong>You estimated {uCore} {uLabel} for “the work”</strong>
								— that’s only <strong>{pctCore}%</strong> of everything entered so far.
								{#if total > core}
									<br />Based on the rest of the work listed, the realistic total is
									<strong>{uTotal} {uLabel}</strong>. If only the core work had been estimated,
									the project would likely run
									<strong>{uProjLow}–{uProjHigh} {uLabel}</strong> in practice
									(3.5–5× the original estimate).
								{:else}
									<br />Try adding items to the other categories to see how quickly the total grows.
								{/if}
							</div>
						</div>
					{/if}
				</div>
				<div class="details-right">
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th></th>
									<th>Category</th>
									<th>Items</th>
									<th class="num">{UNIT_LABELS[unit]}</th>
									<th class="num">% of total</th>
								</tr>
							</thead>
							<tbody>
								{#each categories as cat}
									{@const catWeeks = cat.items.reduce((s, i) => s + (i.weeks ?? 0), 0)}
									{@const catPct = total > 0 ? Math.round((catWeeks / total) * 100) : 0}
									<tr class:core-row={cat.isCore} class:zero={catWeeks === 0}>
										<td><span class="swatch" style="background: {cat.color};" aria-hidden="true"></span></td>
										<td>
											<span class="cat-name">{cat.name}</span>
											<span class="cat-sub">{cat.subtitle}</span>
										</td>
										<td class="item-count">{cat.items.length}</td>
										<td class="num">{catWeeks > 0 ? toUnit(catWeeks, unit) + uShort : '—'}</td>
										<td class="num">{catWeeks > 0 ? catPct + '%' : '—'}</td>
									</tr>
								{/each}
								<tr class="total-row">
									<td></td>
									<td><strong>Total</strong></td>
									<td></td>
									<td class="num"><strong>{uTotal}{uShort}</strong></td>
									<td class="num"><strong>100%</strong></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<!-- ── All items ────────────────────────────────────── -->
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

	/* ── Modal sections ───────────────────────────── */
	.gantt-section {
		padding: 1.75rem 2rem 1.5rem;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.details-section {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		border-bottom: 1px solid var(--border);
	}

	.details-left {
		padding: 1.5rem;
		border-right: 1px solid var(--border);
	}

	.details-right {
		padding: 1.5rem;
		overflow-x: auto;
	}

	.items-section {
		padding: 1.5rem 2rem 2rem;
	}

	.section-label {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	/* Table */
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
	tbody tr.zero { opacity: 0.45; }

	tbody td {
		padding: 0.55rem 0.6rem;
		vertical-align: middle;
	}
	tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }

	.core-row { background: #fffbeb; font-weight: 600; }
	.core-row:hover { background: #fef9c3; }

	.total-row td {
		padding: 0.6rem 0.6rem;
		border-top: 2px solid var(--border);
		font-size: 0.9rem;
	}
	.total-row td.num { text-align: right; font-variant-numeric: tabular-nums; }

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
	.item-count { color: var(--text-muted); font-size: 0.82rem; }

	/* Callout */
	.callout {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		background: #fffbeb;
		border: 1.5px solid #fde68a;
		border-radius: var(--radius-sm);
		padding: 0.85rem 1rem;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	.callout-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.05rem; }

	/* Timeline section (replaced by .gantt-section) */


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
