<script lang="ts">
	import type { Item } from '$lib/categories';
	import { type Unit, toUnit, fromUnit, UNIT_SHORT, UNIT_STEPS, UNIT_LABELS } from '$lib/categories';

	let {
		item,
		unit = 'weeks' as Unit,
		notesExpanded = null as { open: boolean; tick: number } | null,
		onupdate,
		onremove
	}: {
		item: Item;
		unit?: Unit;
		notesExpanded?: { open: boolean; tick: number } | null;
		onupdate: (id: string, patch: Partial<Item>) => void;
		onremove: (id: string) => void;
	} = $props();

	let notesOpenToggled = $state<boolean | null>(null);

	// When global expand/collapse fires (tick changes), reset local override so the global wins
	$effect(() => {
		if (notesExpanded !== null) {
			notesExpanded.tick; // reactive dependency
			notesOpenToggled = null;
		}
	});

	const notesOpen = $derived(notesOpenToggled ?? notesExpanded?.open ?? false);
	function toggleNotes() { notesOpenToggled = !notesOpen; }
</script>

<div class="item-card" role="group" aria-label="work item">
	<div class="card-body">
		<div class="title-row">
			<input
				type="text"
				class="title-input"
				placeholder="Title"
				value={item.description}
				oninput={(e) => onupdate(item.id, { description: (e.target as HTMLInputElement).value })}
				aria-label="Item title"
			/>
			<label class="effort-inline">
				<span class="effort-label">Effort</span>
				<input
					type="number"
					class="weeks"
					min="0"
					step={UNIT_STEPS[unit]}
					placeholder="—"
					value={item.weeks != null ? toUnit(item.weeks, unit) : ''}
					oninput={(e) => {
						const raw = (e.target as HTMLInputElement).value;
						onupdate(item.id, { weeks: raw === '' ? null : fromUnit(Number(raw), unit) });
					}}
					aria-label="{UNIT_LABELS[unit]} estimate (optional)"
				/>
				<span class="effort-unit">{UNIT_LABELS[unit]}</span>
			</label>
			<button
				class="remove"
				onclick={() => onremove(item.id)}
				aria-label="Remove item"
				title="Remove"
			>
				×
			</button>
		</div>
		<button
			class="desc-toggle"
			type="button"
			onclick={toggleNotes}
			aria-expanded={notesOpen}
		>
			<svg class="chevron" class:open={notesOpen} width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
				<path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
			Description
		</button>
		{#if notesOpen}
		<textarea
			class="notes-input"
			placeholder="Description (optional)"
			rows="2"
			value={item.notes ?? ''}
			oninput={(e) => onupdate(item.id, { notes: (e.target as HTMLTextAreaElement).value })}
			aria-label="Item description"
		></textarea>
		{/if}
	</div>
</div>

<style>
	.item-card {
		border: 1px solid var(--border);
		background: var(--surface);
		overflow: hidden;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.title-row {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--border);
	}

	.title-input {
		flex: 1;
		min-width: 0;
		border: none;
		border-radius: 0;
		padding: 0.45rem 0.6rem;
		font-size: inherit;
		font-family: inherit;
		font-weight: 500;
		background: transparent;
		color: var(--text);
		box-sizing: border-box;
		outline: none;
	}

	.title-input:focus {
		background: var(--surface-hover, rgba(0,0,0,0.02));
	}

	.title-input::placeholder {
		color: var(--text-muted);
		font-weight: 400;
	}

	.effort-inline {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0 0.5rem;
		border-left: 1px solid var(--border);
		flex-shrink: 0;
	}

	.effort-label {
		font-size: 0.72rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.effort-unit {
		font-size: 0.72rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.desc-toggle {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-top: 1px solid var(--border);
		padding: 0.28rem 0.6rem;
		font-size: 0.72rem;
		color: var(--text-muted);
		cursor: pointer;
		transition: color var(--transition), background var(--transition);
	}

	.desc-toggle:hover {
		color: var(--text);
		background: var(--surface-hover, rgba(0,0,0,0.02));
	}

	.chevron {
		transition: transform 0.15s ease;
		flex-shrink: 0;
	}

	.chevron.open {
		transform: none;
	}

	.chevron:not(.open) {
		transform: rotate(-90deg);
	}

	.notes-input {
		width: 100%;
		border: none;
		resize: vertical;
		padding: 0.4rem 0.6rem;
		font-size: 0.8rem;
		font-family: inherit;
		color: var(--text);
		background: transparent;
		line-height: 1.45;
		box-sizing: border-box;
		outline: none;
		min-height: 3.5rem;
	}

	.notes-input:focus {
		background: var(--surface-hover, rgba(0,0,0,0.02));
	}

	.notes-input::placeholder {
		color: var(--text-muted);
	}

	.weeks {
		width: 3.5rem;
		font-size: 0.8rem;
		font-family: inherit;
		text-align: right;
		border: 1px solid transparent;
		border-radius: var(--radius-sm, 4px);
		padding: 0.2rem 0.3rem;
		background: transparent;
		color: var(--text);
	}

	.weeks:focus {
		border-color: var(--border);
		outline: 2px solid var(--focus-ring, #4f8ef7);
		outline-offset: 1px;
	}

	.remove {
		flex-shrink: 0;
		width: 1.6rem;
		height: 1.6rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		line-height: 1;
		background: transparent;
		color: var(--text-muted);
		border-radius: 50%;
		padding: 0;
		margin: 0 0.1rem;
		transition: background var(--transition), color var(--transition);
	}

	.remove:hover {
		background: #fee2e2;
		color: var(--danger);
	}
</style>
