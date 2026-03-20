<script lang="ts">
	import { tick } from 'svelte';
	import type { Item } from '$lib/categories';

	let {
		item,
		onupdate,
		onremove
	}: {
		item: Item;
		onupdate: (id: string, patch: Partial<Item>) => void;
		onremove: (id: string) => void;
	} = $props();

	let focused = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();

	async function activateInput() {
		focused = true;
		await tick();
		inputEl?.focus();
		inputEl?.select();
	}

	function parseDesc(text: string): { content: string; isCode: boolean }[] {
		return text.split(/`([^`]+)`/).map((part, i) => ({ content: part, isCode: i % 2 === 1 }));
	}

	const showPreview = $derived(!focused && item.description.length > 0);
</script>

<div class="row" role="group" aria-label="work item">
	{#if showPreview}
		<button
			class="desc desc-preview"
			onclick={activateInput}
		>{#each parseDesc(item.description) as seg}{#if seg.isCode}<code>{seg.content}</code>{:else}{seg.content}{/if}{/each}</button>
	{:else}
		<input
			bind:this={inputEl}
			type="text"
			class="desc"
			placeholder="Describe the work…"
			value={item.description}
			oninput={(e) => onupdate(item.id, { description: (e.target as HTMLInputElement).value })}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			aria-label="Item description"
		/>
	{/if}
	<label class="weeks-label">
		<span class="sr-only">Weeks estimate</span>
		<input
			type="number"
			class="weeks"
			min="0"
			step="0.5"
			placeholder="wks"
			value={item.weeks ?? ''}
			oninput={(e) => {
				const raw = (e.target as HTMLInputElement).value;
				onupdate(item.id, { weeks: raw === '' ? null : Number(raw) });
			}}
			aria-label="Weeks estimate (optional)"
		/>
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

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0;
	}

	.desc {
		flex: 1;
		min-width: 0;
	}

	.desc-preview {
		cursor: text;
		min-height: 1.75rem;
		padding: 0.25rem 0.4rem;
		font-size: inherit;
		line-height: 1.5;
		color: var(--text);
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		background: transparent;
		text-align: left;
		margin: 0;
		word-break: break-word;
	}

	.desc-preview:hover {
		border-color: var(--border);
	}

	.desc-preview code {
		font-family: ui-monospace, 'Cascadia Code', 'Fira Mono', monospace;
		font-size: 0.85em;
		background: rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 3px;
		padding: 0.05em 0.3em;
	}

	.weeks-label {
		display: contents;
	}

	.remove {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		line-height: 1;
		background: transparent;
		color: var(--text-muted);
		border-radius: 50%;
		padding: 0;
		transition: background var(--transition), color var(--transition);
	}

	.remove:hover {
		background: #fee2e2;
		color: var(--danger);
	}
</style>
