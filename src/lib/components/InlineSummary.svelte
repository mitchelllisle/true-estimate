<script lang="ts">
	import type { Category } from '$lib/categories';
	import { coreWeeks, hiddenWeeks, totalWeeks } from '$lib/categories';

	let {
		categories,
		onOpenModal
	}: {
		categories: Category[];
		onOpenModal: () => void;
	} = $props();

	const core    = $derived(coreWeeks(categories));
	const hidden  = $derived(hiddenWeeks(categories));
	const total   = $derived(totalWeeks(categories));

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
				<span class="stat-label">Estimated</span>
				<span class="stat-value core">{core}<span class="unit">w</span></span>
			</span>
			<span class="divider" aria-hidden="true">+</span>
			<span class="stat">
				<span class="stat-label">Hidden</span>
				<span class="stat-value">{hidden}<span class="unit">w</span></span>
			</span>
			<span class="divider" aria-hidden="true">=</span>
			<span class="stat">
				<span class="stat-label">Total</span>
				<span class="stat-value total">{total}<span class="unit">w</span></span>
			</span>
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
		<button class="breakdown-btn" onclick={onOpenModal} disabled={total === 0}>
			See breakdown →
		</button>
	</div>
</div>

<style>
	.bar-shell {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-top: 1px solid var(--border);
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.07);
		height: var(--bar-height);
	}

	.bar-inner {
		max-width: 900px;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
	}

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

	.stat-value.core { color: #b58900; }
	.stat-value.total { color: #1a1a1a; }

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
	.breakdown-btn {
		flex-shrink: 0;
		background: var(--text);
		color: #fff;
		font-size: 0.82rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-sm);
		white-space: nowrap;
	}

	.breakdown-btn:hover:not(:disabled) {
		background: #333;
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
