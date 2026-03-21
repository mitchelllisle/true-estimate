<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Category } from '$lib/categories';
	import { CATEGORY_EXAMPLES } from '$lib/categories';

	let {
		category,
		onclose,
		onaddexample
	}: {
		category: Category;
		onclose: () => void;
		onaddexample: (description: string, notes: string) => void;
	} = $props();

	// Tracks which examples have been added: "tab:label"
	let added = $state(new Set<string>());

	function addExample(ex: { label: string; note: string }) {
		onaddexample(ex.label, ex.note);
		added = new Set([...added, `${activeTab}:${ex.label}`]);
	}

	function isAdded(ex: { label: string; note: string }) {
		return added.has(`${activeTab}:${ex.label}`);
	}

	const examples = $derived(CATEGORY_EXAMPLES[category.id]);

	type Team = 'frontend' | 'backend' | 'data';
	const TEAMS: { id: Team; label: string }[] = [
		{ id: 'frontend', label: 'Frontend' },
		{ id: 'backend',  label: 'Backend'  },
		{ id: 'data',     label: 'Data'     },
	];

	let activeTab = $state<Team>('frontend');

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="backdrop"
	onclick={handleBackdrop}
	role="dialog"
	aria-modal="true"
	aria-label="Examples for {category.name}"
	tabindex="-1"
	transition:fade={{ duration: 150 }}
>
	<div class="modal" transition:fly={{ y: 12, duration: 200 }}>
		<header class="modal-header" style="--cat-color: {category.color}; --cat-text: {category.textColor};">
			<div class="header-text">
				<span class="subtitle">{category.subtitle}</span>
				<h2>{category.name}</h2>
				<p class="hint">Things people often forget to include — add what fits your project.</p>
			</div>
			<button class="close-btn" onclick={onclose} aria-label="Close examples">×</button>
		</header>

		{#if examples}
			<div class="tabs" role="tablist" aria-label="Team type">
				{#each TEAMS as t}
					<button
						class="tab"
						class:active={activeTab === t.id}
						role="tab"
						aria-selected={activeTab === t.id}
						onclick={() => (activeTab = t.id)}
					>
						{t.label}
					</button>
				{/each}
			</div>

			<div class="modal-body" role="tabpanel">
				<ul class="examples-list">
					{#each examples[activeTab] as ex}
						<li class:is-added={isAdded(ex)}>
							<div class="ex-content">
								<span class="ex-label">{ex.label}</span>
								<p class="ex-note">{ex.note}</p>
							</div>
							<button
								class="add-ex-btn"
								class:added={isAdded(ex)}
								onclick={() => addExample(ex)}
								disabled={isAdded(ex)}
								aria-label="{isAdded(ex) ? 'Added' : 'Add'}: {ex.label}"
							>
								{isAdded(ex) ? '✓' : '+'}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="modal-body">
				<p class="no-examples">No examples available for this category yet.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 300;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal {
		background: var(--surface);
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 480px;
		overflow: hidden;
	}

	.modal-header {
		background: var(--cat-color);
		color: var(--cat-text);
		padding: 1rem 1.25rem;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.header-text { flex: 1; }

	.subtitle {
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		opacity: 0.65;
		display: block;
		margin-bottom: 0.15rem;
	}

	.modal-header h2 {
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.3;
		margin: 0 0 0.25rem;
	}

	.hint {
		font-size: 0.72rem;
		opacity: 0.75;
		line-height: 1.4;
		margin: 0;
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.12);
		color: inherit;
		font-size: 1.2rem;
		line-height: 1;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 0.15s;
	}

	.close-btn:hover { background: rgba(0, 0, 0, 0.22); }

	.tabs {
		display: flex;
		padding: 0.6rem 1.25rem;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}

	.tab {
		font-size: 0.76rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		color: var(--text-muted);
		background: transparent;
		border-radius: 999px;
		transition: color 0.15s, background 0.15s;
	}

	.tab.active {
		color: var(--text);
		background: var(--surface);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.tab:hover:not(.active) {
		color: var(--text);
		background: color-mix(in srgb, var(--border) 60%, transparent);
	}

	.modal-body {
		padding: 1rem 1.25rem 1.25rem;
	}

	.examples-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.examples-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		color: var(--text);
		padding: 0.55rem 0.4rem 0.55rem 0.7rem;
		border-radius: var(--radius-sm);
		background: var(--bg);
		border: 1px solid var(--border);
		transition: opacity 0.2s;
	}

	.examples-list li.is-added {
		opacity: 0.45;
	}

	.ex-content {
		flex: 1;
		min-width: 0;
	}

	.ex-label {
		display: block;
		font-size: 0.82rem;
		font-weight: 600;
		line-height: 1.4;
	}

	.ex-note {
		margin: 0.2rem 0 0;
		font-size: 0.74rem;
		color: var(--text-muted);
		line-height: 1.55;
	}

	.add-ex-btn {
		flex-shrink: 0;
		margin-top: 0.05rem;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 50%;
		font-size: 0.9rem;
		font-weight: 700;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--text-muted);
		border: 1.5px solid var(--border);
		transition: color 0.15s, background 0.15s, border-color 0.15s;
	}

	.add-ex-btn:hover:not(:disabled) {
		color: var(--text);
		background: var(--surface);
		border-color: var(--text-muted);
	}

	.add-ex-btn.added {
		color: #16a34a;
		border-color: #16a34a;
		background: #f0fdf4;
		cursor: default;
	}

	:global([data-theme="dark"]) .add-ex-btn.added {
		color: #4ade80;
		border-color: #4ade80;
		background: rgba(22, 163, 74, 0.15);
	}

	.no-examples {
		font-size: 0.82rem;
		color: var(--text-muted);
		text-align: center;
		padding: 1rem 0;
	}
</style>
