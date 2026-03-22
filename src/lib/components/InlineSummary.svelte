<script lang="ts">
	import type { Category } from '$lib/categories';
	import { coreWeeks, hiddenWeeks, totalWeeks, getCalendarWeeks, getRealisticWeeks, type Unit, toUnit, UNIT_SHORT, UNITS, buildCsv } from '$lib/categories';

	let {
		categories,
		unit = 'weeks' as Unit,
		showBreakdown = false,
		projectName = 'project',
		onOpenModal,
		onUpload
	}: {
		categories: Category[];
		unit?: Unit;
		showBreakdown?: boolean;
		projectName?: string;
		onOpenModal: () => void;
		onUpload: () => void;
	} = $props();

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

	const core           = $derived(coreWeeks(categories));
	const hidden         = $derived(hiddenWeeks(categories));
	const total          = $derived(totalWeeks(categories));
	const calWeeks       = $derived(getCalendarWeeks(categories));
	const realisticWeeks = $derived(getRealisticWeeks(categories));
	const uTotal         = $derived(toUnit(total, unit));
	const uRealistic     = $derived(realisticWeeks != null ? toUnit(realisticWeeks, unit) : null);
	const uCal           = $derived(calWeeks != null ? toUnit(calWeeks, unit) : null);
	const uShort         = $derived(UNIT_SHORT[unit]);

	// Keep for proportional bar
	const uCore   = $derived(toUnit(core, unit));
	const uHidden = $derived(toUnit(hidden, unit));

	// Hover tooltips — show value in every unit
	const fmt = (weeks: number) => UNITS.map(u => `${toUnit(weeks, u)} ${UNIT_SHORT[u]}`).join(' · ');
	const tipPessimistic = $derived(fmt(total));
	const tipRealistic   = $derived(realisticWeeks != null ? fmt(realisticWeeks) : '');
	const tipOptimistic  = $derived(calWeeks       != null ? fmt(calWeeks)       : '');

	// Proportional bar segments — one per category (non-zero only)
	const segments = $derived(
		total > 0
			? categories
					.map((c) => ({
						color: c.color,
						name: c.name,
						pct: (c.items.reduce((s, i) => s + (i.weeks ?? 0), 0) / total) * 100
					}))
					.filter((s) => s.pct > 0)
			: []
	);
</script>

<div class="bar-shell" role="complementary" aria-label="Estimation summary">
	<div class="bar-inner">
		<!-- Stats -->
		<div class="stats">
			<span class="stat">
				<span class="stat-label">Pessimistic</span>
				<span class="stat-value pessimistic">{uTotal}<span class="unit">{uShort}</span></span>
				<span class="tip">{tipPessimistic}</span>
			</span>
			{#if uRealistic != null}
				<span class="divider" aria-hidden="true">→</span>
				<span class="stat">
					<span class="stat-label">Realistic</span>
					<span class="stat-value realistic">~{uRealistic}<span class="unit">{uShort}</span></span>
					<span class="tip">{tipRealistic}</span>
				</span>
				<span class="divider" aria-hidden="true">→</span>
				<span class="stat">
					<span class="stat-label">Optimistic</span>
					<span class="stat-value optimistic">~{uCal}<span class="unit">{uShort}</span></span>
					<span class="tip">{tipOptimistic}</span>
				</span>
			{/if}
		</div>

		<!-- Proportional color bar -->
		<div class="color-bar-wrap" aria-hidden="true">
			{#if segments.length > 0}
				<div class="color-bar">
					{#each segments as seg}
						<div
							class="seg"
							style="width: {seg.pct}%; background: {seg.color};"
							title="{seg.name} — {Math.round(seg.pct)}%"
						></div>
					{/each}
				</div>
			{:else}
				<div class="color-bar empty">
					<span class="empty-hint">Add items with week estimates to see the breakdown</span>
				</div>
			{/if}
		</div>

		<!-- CTA -->
		<div class="actions">
			<button class="icon-btn upload-btn" onclick={onUpload} title="Upload CSV" aria-label="Upload CSV">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
				Upload
			</button>
			<button class="icon-btn download-btn" onclick={downloadCsv} disabled={total === 0} title="Download CSV" aria-label="Download CSV">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				Download
			</button>
			<button class="breakdown-btn" onclick={onOpenModal} disabled={!showBreakdown && total === 0}>
				{#if showBreakdown}← Back to Builder{:else}See breakdown →{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.bar-shell {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--bar-bg);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-top: 1px solid var(--border);
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.07);
		height: var(--bar-height);
	}

	.bar-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1.25rem;
		height: 100%;
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	/* Stats */
	.stats {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-shrink: 0;
	}

	.stat {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
		cursor: default;
	}

	.tip {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		width: 200px;
		background: var(--text);
		color: var(--bg);
		font-size: 0.73rem;
		font-weight: 400;
		line-height: 1.45;
		padding: 0.45rem 0.65rem;
		border-radius: 6px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.12s;
		z-index: 200;
		white-space: normal;
		text-align: left;
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
	}
	.stat:hover .tip { opacity: 1; }

	.stat-label {
		font-size: 0.62rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 0.2rem;
	}

	.stat-value {
		font-size: 1.3rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}

	.stat-value.pessimistic { color: var(--text); }
	.stat-value.realistic   { color: #0d7a4e; }
	.stat-value.optimistic  { color: #0369a1; }

	:global([data-theme="dark"]) .stat-value.realistic  { color: #34d399; }
	:global([data-theme="dark"]) .stat-value.optimistic { color: #38bdf8; }

	.unit {
		font-size: 0.65rem;
		opacity: 0.6;
		margin-left: 0.1rem;
	}

	.divider {
		color: var(--border);
		font-size: 1.1rem;
		font-weight: 300;
	}

	/* Color bar */
	.color-bar-wrap {
		flex: 1;
		min-width: 0;
	}

	.color-bar {
		height: 20px;
		border-radius: 999px;
		display: flex;
		overflow: hidden;
		background: var(--border);
	}

	.color-bar.empty {
		background: var(--border);
		align-items: center;
		padding: 0 0.75rem;
	}

	.empty-hint {
		font-size: 0.72rem;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.seg {
		height: 100%;
		transition: width 300ms ease;
	}

	/* CTA */
	.actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		border: 1.5px solid transparent;
		border-radius: var(--radius-sm);
		padding: 0.4rem 0.65rem;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s, opacity 0.15s;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.upload-btn {
		background: #eff6ff;
		color: #1d4ed8;
		border-color: #bfdbfe;
	}
	.upload-btn:hover { background: #dbeafe; }

	.download-btn {
		background: #f0fdf4;
		color: #15803d;
		border-color: #bbf7d0;
	}
	.download-btn:hover:not(:disabled) { background: #dcfce7; }
	.download-btn:disabled { opacity: 0.35; cursor: default; }

	:global([data-theme="dark"]) .upload-btn {
		background: rgba(29,78,216,0.18);
		color: #93c5fd;
		border-color: rgba(29,78,216,0.35);
	}
	:global([data-theme="dark"]) .upload-btn:hover { background: rgba(29,78,216,0.28); }

	:global([data-theme="dark"]) .download-btn {
		background: rgba(21,128,61,0.18);
		color: #86efac;
		border-color: rgba(21,128,61,0.35);
	}
	:global([data-theme="dark"]) .download-btn:hover:not(:disabled) { background: rgba(21,128,61,0.28); }

	.breakdown-btn {
		flex-shrink: 0;
		background: var(--text);
		color: var(--bg);
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}

	.breakdown-btn:hover:not(:disabled) {
		background: var(--text-muted);
		color: var(--bg);
	}

	.breakdown-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (max-width: 520px) {
		.stats { gap: 0.4rem; }
		.stat-value { font-size: 1.05rem; }
		.breakdown-btn { font-size: 0.75rem; padding: 0.45rem 0.75rem; }
	}
</style>
