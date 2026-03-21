<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { initialCategories, sampleCategories, type Unit, UNITS, UNIT_LABELS, UNIT_SHORT, toUnit } from '$lib/categories';
	import type { Item } from '$lib/categories';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import SummaryModal from '$lib/components/SummaryModal.svelte';
	import ImportModal from '$lib/components/ImportModal.svelte';

	let categories = $state(initialCategories());
	let modalOpen   = $state(false);
	let importOpen  = $state(false);

	let openBefore = $state(true);
	let openCore   = $state(true);
	let openAfter  = $state(true);
	let unit       = $state<Unit>('weeks');

	let darkMode = $state(false);
	onMount(() => {
		const saved = localStorage.getItem('theme');
		darkMode = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
	});
	$effect(() => {
		document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	});

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

	// Before: acquisition + preparation (not "around the work")
	const beforeCats = $derived(categories.filter((c) => (c.outsideProject && c.id !== 'around') || c.id === 'before'));
	// Core: the work itself + around the work + iteration + changes + surprises
	const coreCats   = $derived(categories.filter((c) => c.id === 'around' || (!c.outsideProject && c.id !== 'before' && c.id !== 'after')));
	// After: maintenance & ops
	const afterCats  = $derived(categories.filter((c) => c.id === 'after'));

	function scopeTotal(cats: typeof categories): number {
		const weeks = cats.flatMap((c) => c.items).reduce((sum, i) => sum + (i.weeks ?? 0), 0);
		return toUnit(weeks, unit);
	}

	const beforeTotal = $derived(scopeTotal(beforeCats));
	const coreTotal   = $derived(scopeTotal(coreCats));
	const afterTotal  = $derived(scopeTotal(afterCats));

	function loadSample() {
		categories = sampleCategories();
	}

	function handleImport(imported: typeof categories) {
		categories = imported;
		importOpen = false;
	}
</script>

<div class="site-header">
	<div class="site-header-inner">
		<div class="logo">
			<span class="logo-pulse" aria-hidden="true">T</span>
			<span class="logo-text">TrueEstimate</span>
		</div>
		<button
			class="theme-toggle"
			onclick={() => (darkMode = !darkMode)}
			aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if darkMode}
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="5"/>
					<line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
					<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
				</svg>
			{:else}
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
				</svg>
			{/if}
		</button>
	</div>
</div>

<div class="page">
	<header class="hero">
		<p class="hero-intro">
			<em class="hero-quote">"The work is never just 'the work'"</em> — for each task, enter how many
			<select class="unit-select" bind:value={unit} aria-label="Estimate unit">
				{#each UNITS as u}
					<option value={u}>{UNIT_LABELS[u]}</option>
				{/each}
			</select>
			of <strong>effort</strong> it takes — not how long it'll sit on the calendar.
			The breakdown will show how it all lands in real time.
			Not sure where to start? <button class="pill-btn" onclick={loadSample}>Load a sample project</button>
			or <button class="pill-btn" onclick={() => (importOpen = true)}>Upload a CSV</button>.
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
				{#if beforeTotal > 0}<span class="scope-tally">{beforeTotal} {UNIT_SHORT[unit]}</span>{/if}
				<span class="chevron" class:is-open={openBefore} aria-hidden="true">›</span>
			</button>
			{#if openBefore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each beforeCats as category (category.id)}
						<CategoryCard
							{category}							{unit}							onadditem={addItem}
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
				{#if coreTotal > 0}<span class="scope-tally">{coreTotal} {UNIT_SHORT[unit]}</span>{/if}
				<span class="chevron" class:is-open={openCore} aria-hidden="true">›</span>
			</button>
			{#if openCore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each coreCats as category (category.id)}
						<CategoryCard
							{category}							{unit}							onadditem={addItem}
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
				{#if afterTotal > 0}<span class="scope-tally">{afterTotal} {UNIT_SHORT[unit]}</span>{/if}
				<span class="chevron" class:is-open={openAfter} aria-hidden="true">›</span>
			</button>
			{#if openAfter}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each afterCats as category (category.id)}
						<CategoryCard
							{category}
							{unit}
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
			Built by <a href="https://github.com/mitchelllisle" target="_blank" rel="noopener noreferrer">Mitchell Lisle</a>
			based on <a href="https://davestewart.co.uk/blog/work/project-estimation/" target="_blank" rel="noopener noreferrer">"The work is never just 'the work'"</a>
			by <a href="https://davestewart.co.uk/" target="_blank" rel="noopener noreferrer">Dave Stewart</a>.
		</p>
		<p class="privacy">
			🔒 Nothing you enter here is stored, sent, or collected. All data exists only in your
			browser's memory and disappears when you close or refresh the page.
		</p>
	</footer>
</div>

<InlineSummary {categories} {unit} onOpenModal={() => (modalOpen = true)} />

{#if modalOpen}
	<SummaryModal {categories} {unit} onclose={() => (modalOpen = false)} />
{/if}

{#if importOpen}
	<ImportModal
		baseCategories={categories}
		onimport={handleImport}
		onclose={() => (importOpen = false)}
	/>
{/if}

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem 2rem;
	}

	/* ── Site header (full-width, outside .page) ────── */
	.site-header {
		background: var(--surface);
		color: var(--text);
		border-bottom: 1px solid var(--border);
	}

	.site-header-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.85rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.logo-pulse {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		flex-shrink: 0;
		font-size: 0.7rem;
		font-weight: 800;
		color: var(--bg);
		z-index: 0;
	}

	.logo-pulse::before,
	.logo-pulse::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: var(--text);
		z-index: -1;
	}

	.logo-pulse::after {
		animation: pulse-ring 3.8s ease-out infinite;
		opacity: 0;
	}

	@keyframes pulse-ring {
		0%   { transform: scale(1);   opacity: 0.25; }
		47%  { transform: scale(1.9); opacity: 0; }
		100% { transform: scale(1.9); opacity: 0; }
	}

	.logo-text {
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: inherit;
	}

	/* ── Hero ────────────────────────────────────────── */
	.hero {
		margin-top: 0.25rem;
		margin-bottom: 2rem;
	}

	.hero-intro {
		font-size: 0.95rem;
		color: var(--text-muted);
		line-height: 1.8;
	}

	.hero-quote {
		font-style: normal;
		font-weight: 700;
		color: var(--text);
	}

	.pill-btn {
		display: inline-flex;
		align-items: center;
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 999px;
		padding: 0.2rem 0.75rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
		vertical-align: middle;
		line-height: 1.4;
	}

	.pill-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		border-color: var(--text-muted);
	}

	.unit-select {
		display: inline-block;
		appearance: none;
		-webkit-appearance: none;
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 999px;
		padding: 0.2rem 1.6rem 0.2rem 0.75rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
		vertical-align: middle;
		line-height: 1.4;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.6rem center;
		transition: border-color 0.15s;
	}

	.unit-select:hover {
		border-color: var(--text-muted);
	}

	.unit-select:focus {
		outline: 2px solid var(--text);
		outline-offset: 2px;
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
		background: var(--hover-tint);
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
		color: var(--text-muted);
	}

	.scope-tally {
		margin-left: auto;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--tally-bg);
		border-radius: 999px;
		padding: 0.15rem 0.55rem;
		white-space: nowrap;
		flex-shrink: 0;
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
		color: var(--text-muted);
	}

	.theme-toggle {
		background: transparent;
		color: var(--text-muted);
		border: 1.5px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.45rem;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}
	.theme-toggle:hover {
		color: var(--text);
		background: var(--hover-tint);
		border-color: var(--text-muted);
	}
</style>
