<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Category, Item } from '$lib/categories';
	import { type Unit, toUnit, UNIT_SHORT } from '$lib/categories';
	import ItemRow from './ItemRow.svelte';
	import ExamplesModal from './ExamplesModal.svelte';

	let {
		category,
		unit = 'weeks' as Unit,
		notesExpanded = null as { open: boolean; tick: number } | null,
		onadditem,
		onupdateitem,
		onremoveitem
	}: {
		category: Category;
		unit?: Unit;
		notesExpanded?: { open: boolean; tick: number } | null;
		onadditem: (categoryId: string, description?: string, notes?: string) => void;
		onupdateitem: (categoryId: string, itemId: string, patch: Partial<Item>) => void;
		onremoveitem: (categoryId: string, itemId: string) => void;
	} = $props();

	const weekTotal = $derived(
		category.items.reduce((sum, i) => sum + (i.weeks ?? 0), 0)
	);

	let examplesOpen = $state(false);

	function parseDescription(text: string): { content: string; isCode: boolean }[] {
		return text.split(/`([^`]+)`/).map((part, i) => ({ content: part, isCode: i % 2 === 1 }));
	}
</script>

{#if examplesOpen}
	<ExamplesModal
		{category}
		onclose={() => (examplesOpen = false)}
		onaddexample={(desc, notes) => onadditem(category.id, desc, notes)}
	/>
{/if}

<article
	class="card"
	class:is-core={category.isCore}
	style="--cat-color: {category.color}; --cat-text: {category.textColor};"
>
	<!-- Left: coloured label panel -->
	<div class="card-label">
		<span class="subtitle">{category.subtitle}</span>
		<h2 class="name">{category.name}</h2>
		<p class="description">{#each parseDescription(category.description) as seg}{#if seg.isCode}<code>{seg.content}</code>{:else}{seg.content}{/if}{/each}</p>
		<button class="examples-btn" onclick={() => (examplesOpen = true)}>
			Need some examples?
		</button>
		{#if weekTotal > 0}
			<div class="week-badge" transition:fly={{ x: 6, duration: 200 }}>
				{toUnit(weekTotal, unit)}<span class="week-unit">{UNIT_SHORT[unit]}</span>
			</div>
		{/if}
	</div>

	<!-- Right: items panel -->
	<div class="card-body">
		<div class="items">
			{#each category.items as item (item.id)}
				<div transition:fly={{ y: -5, duration: 180 }}>
					<ItemRow
						{item}
						{unit}
						{notesExpanded}
						onupdate={(id, patch) => onupdateitem(category.id, id, patch)}
						onremove={(id) => onremoveitem(category.id, id)}
					/>
				</div>
			{/each}
		</div>
		<button class="add-btn" onclick={() => onadditem(category.id)}>
			+ Add item
		</button>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: row;
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		overflow: hidden;
		background: var(--surface);
	}

	.card.is-core {
		box-shadow: 0 0 0 3px var(--cat-color), var(--shadow-lg);
	}

	/* ── Label panel ─────────────────────────────── */
	.card-label {
		width: 260px;
		flex-shrink: 0;
		background: var(--cat-color);
		color: var(--cat-text);
		padding: 0.9rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.subtitle {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		opacity: 0.65;
	}

	.name {
		font-size: 0.92rem;
		font-weight: 700;
		line-height: 1.3;
	}

	.description {
		font-size: 0.74rem;
		opacity: 0.7;
		line-height: 1.4;
		margin-top: 0.1rem;
	}

	.description code {
		font-family: ui-monospace, 'Cascadia Code', 'Fira Mono', monospace;
		font-size: 0.7rem;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 3px;
		padding: 0.05em 0.3em;
	}

	.examples-btn {
		margin-top: auto;
		align-self: flex-start;
		background: rgba(0, 0, 0, 0.1);
		color: var(--cat-text);
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		opacity: 0.8;
		transition: opacity 0.15s, background 0.15s;
	}

	.examples-btn:hover {
		opacity: 1;
		background: rgba(0, 0, 0, 0.2);
	}

	.week-badge {
		margin-top: 0.25rem;
		width: fit-content;
		background: rgba(0, 0, 0, 0.12);
		border-radius: 999px;
		padding: 0.18rem 0.6rem;
		font-size: 0.85rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.week-unit {
		font-size: 0.62rem;
		opacity: 0.75;
		margin-left: 0.06rem;
	}

	/* ── Body panel ──────────────────────────────── */
	.card-body {
		flex: 1;
		min-width: 0;
		padding: 0.55rem 1rem 0.7rem;
		display: flex;
		flex-direction: column;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.add-btn {
		align-self: flex-start;
		margin-top: 0.4rem;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.78rem;
		padding: 0.25rem 0.55rem;
		border-radius: var(--radius-sm);
		border: 1.5px dashed var(--border);
		transition: border-color var(--transition), color var(--transition), background var(--transition);
	}

	.add-btn:hover {
		border-color: var(--cat-color);
		color: var(--text);
		background: color-mix(in srgb, var(--cat-color) 12%, transparent);
	}

	/* ── Mobile ──────────────────────────────────── */
	@media (max-width: 600px) {
		.card { flex-direction: column; }
		.card-label { width: 100%; }
	}
</style>
