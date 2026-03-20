<script lang="ts">
	import { slide } from 'svelte/transition';
	import { initialCategories, sampleCategories } from '$lib/categories';
	import type { Item } from '$lib/categories';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import SummaryModal from '$lib/components/SummaryModal.svelte';

	let categories = $state(initialCategories());
	let modalOpen = $state(false);

	let openBefore = $state(true);
	let openCore   = $state(true);
	let openAfter  = $state(true);

	function addItem(categoryId: string) {
		categories = categories.map((c) =>
			c.id === categoryId
				? {
						...c,
						items: [
							...c.items,
							{ id: crypto.randomUUID(), description: '', weeks: null }
						]
					}
				: c
		);
	}

	function updateItem(categoryId: string, itemId: string, patch: Partial<Item>) {
		categories = categories.map((c) =>
			c.id === categoryId
				? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
				: c
		);
	}

	function removeItem(categoryId: string, itemId: string) {
		categories = categories.map((c) =>
			c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
		);
	}

	// Before: admin + acquisition + preparation
	const beforeCats = $derived(categories.filter((c) => c.outsideProject || c.id === 'before'));
	// Core: the work itself + iteration + changes + surprises
	const coreCats   = $derived(categories.filter((c) => !c.outsideProject && c.id !== 'before' && c.id !== 'after'));
	// After: maintenance & ops
	const afterCats  = $derived(categories.filter((c) => c.id === 'after'));

	function loadSample() {
		categories = sampleCategories();
	}
</script>

<div class="page">
	<div class="app-header">
		<div class="logo">
			<svg class="logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
				<rect x="2" y="5" width="16" height="5" rx="2.5" fill="#ffd966"/>
				<rect x="2" y="12" width="24" height="5" rx="2.5" fill="#f4a460"/>
				<rect x="2" y="19" width="11" height="5" rx="2.5" fill="#a8d8a8"/>
			</svg>
			<span class="logo-text">TrueEstimate</span>
		</div>
		<button class="btn-sample" onclick={loadSample}>Load Sample Project</button>
	</div>

	<header class="hero">
		<h1>The work is never just&nbsp;"the&nbsp;work"</h1>
		<p class="hero-sub">
			Add tasks under each phase with optional week estimates — then see the full picture of what it actually takes to ship something.
		</p>
	</header>

	<main class="content">

		<!-- ── Before the work ─────────────────────────────────── -->
		<section class="scope scope--before">
			<button
				class="scope-toggle"
				onclick={() => (openBefore = !openBefore)}
				aria-expanded={openBefore}
			>
				<div class="scope-toggle-text">
					<span class="scope-title">Before the work</span>
					<span class="scope-hint">Setup, acquisition &amp; preparation</span>
				</div>
				<span class="chevron" class:is-open={openBefore} aria-hidden="true">›</span>
			</button>
			{#if openBefore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each beforeCats as category (category.id)}
						<CategoryCard
							{category}
							onadditem={addItem}
							onupdateitem={updateItem}
							onremoveitem={removeItem}
						/>
					{/each}
				</div>
			{/if}
		</section>

		<!-- ── The actual work ─────────────────────────────────── -->
		<section class="scope scope--core">
			<button
				class="scope-toggle"
				onclick={() => (openCore = !openCore)}
				aria-expanded={openCore}
			>
				<div class="scope-toggle-text">
					<span class="scope-title">The actual work</span>
					<span class="scope-hint">What you estimate — and everything around it</span>
				</div>
				<span class="chevron" class:is-open={openCore} aria-hidden="true">›</span>
			</button>
			{#if openCore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each coreCats as category (category.id)}
						<CategoryCard
							{category}
							onadditem={addItem}
							onupdateitem={updateItem}
							onremoveitem={removeItem}
						/>
					{/each}
				</div>
			{/if}
		</section>

		<!-- ── After the work ──────────────────────────────────── -->
		<section class="scope scope--after">
			<button
				class="scope-toggle"
				onclick={() => (openAfter = !openAfter)}
				aria-expanded={openAfter}
			>
				<div class="scope-toggle-text">
					<span class="scope-title">After the work</span>
					<span class="scope-hint">Maintenance, ops &amp; support</span>
				</div>
				<span class="chevron" class:is-open={openAfter} aria-hidden="true">›</span>
			</button>
			{#if openAfter}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each afterCats as category (category.id)}
						<CategoryCard
							{category}
							onadditem={addItem}
							onupdateitem={updateItem}
							onremoveitem={removeItem}
						/>
					{/each}
				</div>
			{/if}
		</section>

	</main>

	<footer class="footer">
		<p class="attribution">
			Based on <a
				href="https://davestewart.co.uk/blog/work/project-estimation/"
				target="_blank"
				rel="noopener noreferrer"
			>"The work is never just 'the work'"</a
			> by <a
				href="https://davestewart.co.uk/"
				target="_blank"
				rel="noopener noreferrer"
			>Dave Stewart</a
			> — used with thanks.
		</p>
		<p class="privacy">
			🔒 Nothing you enter here is stored, sent, or collected. All data exists only in your
			browser's memory and disappears when you close or refresh the page.
		</p>
	</footer>
</div>

<InlineSummary {categories} onOpenModal={() => (modalOpen = true)} />

{#if modalOpen}
	<SummaryModal {categories} onclose={() => (modalOpen = false)} />
{/if}

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 2rem;
	}

	/* ── App header ─────────────────────────────────── */
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0 1.5rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		text-decoration: none;
	}

	.logo-icon {
		flex-shrink: 0;
	}

	.logo-text {
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.btn-sample {
		font-size: 0.8rem;
		font-weight: 600;
		padding: 0.45rem 1rem;
		border-radius: 8px;
		border: 1.5px solid var(--border);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background 0.15s;
	}

	.btn-sample:hover {
		border-color: #c8a830;
		color: #7a6010;
		background: rgba(255, 217, 102, 0.08);
	}

	/* ── Hero ────────────────────────────────────────── */
	.hero {
		text-align: center;
		margin-bottom: 2.5rem;
		margin-top: 1.75rem;
	}

	.hero h1 { margin-bottom: 0.75rem; }

	.hero-sub {
		font-size: 1rem;
		color: var(--text-muted);
		max-width: 580px;
		margin: 0 auto;
	}

	/* ── Page flow ───────────────────────────────────── */
	.content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* ── Scope sections ──────────────────────────────── */
	.scope {
		border-radius: 12px;
		overflow: hidden;
	}

	.scope--before {
		border: 2px dashed #d4956a;
		background: rgba(244, 164, 96, 0.04);
	}

	.scope--core {
		border: 2px dashed #c8a830;
		background: rgba(255, 217, 102, 0.05);
	}

	.scope--after {
		border: 2px dashed #6a9ec0;
		background: rgba(125, 171, 208, 0.05);
	}

	/* ── Toggle header ───────────────────────────────── */
	.scope-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.25rem;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		border-radius: 0;
	}

	.scope-toggle:hover {
		background: rgba(0, 0, 0, 0.03);
	}

	.scope-toggle-text {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
		flex: 1;
		min-width: 0;
	}

	.scope-title {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.scope-hint {
		font-size: 0.7rem;
		color: #9ca3af;
	}

	.chevron {
		font-size: 1.1rem;
		color: var(--text-muted);
		line-height: 1;
		transition: transform 0.2s ease;
		transform: rotate(0deg);
		flex-shrink: 0;
	}

	.chevron.is-open {
		transform: rotate(90deg);
	}

	/* ── Card stacks ─────────────────────────────────── */
	.card-stack {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0 1.25rem 1.25rem;
	}

	/* ── Footer ──────────────────────────────────────── */
	.footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: center;
	}

	.attribution {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.privacy {
		font-size: 0.75rem;
		color: #9ca3af;
	}
</style>
