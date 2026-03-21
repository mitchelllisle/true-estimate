<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { initialCategories, sampleCategories, generateProjectName, type SampleProject, type Unit, UNITS, UNIT_LABELS, UNIT_SHORT, toUnit } from '$lib/categories';
	import type { Item } from '$lib/categories';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import SummaryModal from '$lib/components/SummaryModal.svelte';
	import ImportModal from '$lib/components/ImportModal.svelte';

	let categories   = $state(initialCategories());
	let projectName  = $state(generateProjectName());
	let showBreakdown = $state(false);
	let importOpen   = $state(false);
	let sampleOpen   = $state(false);

	let openBefore = $state(true);
	let openCore   = $state(true);
	let openAfter  = $state(true);
	let unit       = $state<Unit>('weeks');

	let globalNotes = $state<{ open: boolean; tick: number } | null>(null);
	const allNotesOpen = $derived(globalNotes?.open ?? false);
	function setGlobalNotes(open: boolean) {
		globalNotes = { open, tick: (globalNotes?.tick ?? 0) + 1 };
	}

	let darkMode = $state(false);
	onMount(() => {
		const saved = localStorage.getItem('theme');
		darkMode = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
	});
	$effect(() => {
		document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	});

	function addItem(categoryId: string, description = '', notes = '') {
		categories = categories.map((c) =>
			c.id === categoryId
				? {
						...c,
						items: [
							...c.items,
							{ id: crypto.randomUUID(), description, notes, weeks: null }
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

	const coreExecWeeks     = $derived(coreCats.filter(c => c.isCore).flatMap(c => c.items).reduce((s, i) => s + (i.weeks ?? 0), 0));
	const coreSurroundWeeks = $derived(coreCats.filter(c => !c.isCore).flatMap(c => c.items).reduce((s, i) => s + (i.weeks ?? 0), 0));
	const uCoreExec     = $derived(toUnit(coreExecWeeks, unit));
	const uCoreSurround = $derived(toUnit(coreSurroundWeeks, unit));

	function loadSample(type: SampleProject) {
		categories = sampleCategories(type);
		sampleOpen = false;
	}

	function handleImport(imported: typeof categories, filename: string) {
		categories = imported;
		const stem = filename.replace(/\.csv$/i, '');
		const namePart = stem.split('-')[0].trim();
		if (namePart) projectName = namePart;
		importOpen = false;
	}

	function handleWindowClick(e: MouseEvent) {
		if (sampleOpen && !(e.target as Element).closest('.sample-dropdown')) {
			sampleOpen = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="site-header">
	<div class="site-header-inner">
		<button
			class="logo"
			onclick={() => (showBreakdown = false)}
			aria-label="Go to builder"
		>
			<span class="logo-pulse" aria-hidden="true">T</span>
			<span class="logo-text">TrueEstimate</span>
		</button>
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

{#if !showBreakdown}
<div class="page">
	<header class="hero">
		<div class="hero-intro">
			<em class="hero-quote">"The work is never just 'the work'"</em> — for each task, enter how many
			<select class="unit-select" bind:value={unit} aria-label="Estimate unit">
				{#each UNITS as u}
					<option value={u}>{UNIT_LABELS[u]}</option>
				{/each}
			</select>
			of <strong>effort</strong> it takes — not how long it'll sit on the calendar.
			Estimates are split into <span class="tip" data-tip="The stuff you typically think of when asked for an estimate.">Core</span> and <span class="tip" data-tip="The stuff you tend to leave out — work that has real-world impacts on delivery timelines and effort required.">Non-Core</span> work.
			The breakdown will show how it all lands in real time.
			Not sure where to start?
			<span class="sample-dropdown">
				<button class="pill-btn" onclick={() => (sampleOpen = !sampleOpen)} aria-haspopup="true" aria-expanded={sampleOpen}>
					Load a sample project <span class="chevron" aria-hidden="true">▾</span>
				</button>
				{#if sampleOpen}
					<ul class="sample-menu" role="menu">
						<li role="none"><button role="menuitem" onclick={() => loadSample('backend')}>Backend Project</button></li>
						<li role="none"><button role="menuitem" onclick={() => loadSample('frontend')}>Front End Project</button></li>
						<li role="none"><button role="menuitem" onclick={() => loadSample('data')}>Data &amp; Analytics Project</button></li>
					</ul>
				{/if}
			</span>
			or <button class="pill-btn" onclick={() => (importOpen = true)}>Upload a CSV</button>.
		</div>
		<p class="privacy privacy--hero">🔒 Nothing you enter here is stored, sent, or collected. All data exists only in your browser's memory and disappears when you close or refresh the page.</p>
		<div class="project-name-row">
			<label class="project-name-label" for="project-name">Project</label>
			<input
				id="project-name"
				class="project-name-input"
				type="text"
				bind:value={projectName}
				placeholder="Project name"
				aria-label="Project name"
			/>
			<button
				class="project-name-roll"
				onclick={() => (projectName = generateProjectName())}
				title="Generate a new name"
				aria-label="Generate new project name"
			>⚄</button>
		</div>
	</header>

	<main class="content">
		<div class="view-controls">
			<span class="view-controls-label">Descriptions</span>
			<button class="view-ctrl-btn" onclick={() => setGlobalNotes(true)} disabled={allNotesOpen}>Expand all</button>
			<span class="view-ctrl-sep">·</span>
			<button class="view-ctrl-btn" onclick={() => setGlobalNotes(false)} disabled={!allNotesOpen}>Collapse all</button>
		</div>

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
				{#if beforeTotal > 0}
					<span class="scope-pills">
						<span class="scope-pill pill--non-core">{beforeTotal}{UNIT_SHORT[unit]} <abbr title="The stuff you tend to leave out — work that has real-world impacts on delivery timelines and effort required.">Non-Core</abbr></span>
					</span>
				{/if}
				<span class="chevron" class:is-open={openBefore} aria-hidden="true">›</span>
			</button>
			{#if openBefore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each beforeCats as category (category.id)}
						<CategoryCard
							{category}							{unit}
							notesExpanded={globalNotes}
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
				{#if coreTotal > 0}
					<span class="scope-pills">
					{#if uCoreExec > 0}<span class="scope-pill pill--core">{uCoreExec}{UNIT_SHORT[unit]} <abbr title="The stuff you typically think of when asked for an estimate.">Core</abbr></span>{/if}
					{#if uCoreExec > 0 && uCoreSurround > 0}<span class="pill-sep">+</span>{/if}
					{#if uCoreSurround > 0}<span class="scope-pill pill--non-core">{uCoreSurround}{UNIT_SHORT[unit]} <abbr title="The stuff you tend to leave out — work that has real-world impacts on delivery timelines and effort required.">Non-Core</abbr></span>{/if}
						{#if uCoreExec > 0 && uCoreSurround > 0}<span class="pill-sep">=</span><span class="scope-pill pill--total">{coreTotal}{UNIT_SHORT[unit]}</span>{/if}
					</span>
				{/if}
				<span class="chevron" class:is-open={openCore} aria-hidden="true">›</span>
			</button>
			{#if openCore}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each coreCats as category (category.id)}
						<CategoryCard
							{category}							{unit}
							notesExpanded={globalNotes}
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
				{#if afterTotal > 0}
					<span class="scope-pills">
						<span class="scope-pill pill--non-core">{afterTotal}{UNIT_SHORT[unit]} <abbr title="The stuff you tend to leave out — work that has real-world impacts on delivery timelines and effort required.">Non-Core</abbr></span>
					</span>
				{/if}
				<span class="chevron" class:is-open={openAfter} aria-hidden="true">›</span>
			</button>
			{#if openAfter}
				<div class="card-stack" transition:slide={{ duration: 220 }}>
					{#each afterCats as category (category.id)}
						<CategoryCard
							{category}
							{unit}
							notesExpanded={globalNotes}
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
{/if}

{#if showBreakdown}
	<SummaryModal {categories} {unit} {projectName} inline onunitchange={(u) => (unit = u)} />
{/if}

<InlineSummary {categories} {unit} {showBreakdown} onOpenModal={() => (showBreakdown = !showBreakdown)} />

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
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
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

	.project-name-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	.project-name-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.project-name-input {
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		padding: 0.3rem 0.65rem;
		font: inherit;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
		width: 18ch;
		transition: border-color 0.15s;
	}

	.project-name-input:focus {
		outline: 2px solid var(--text);
		outline-offset: 2px;
		border-color: transparent;
	}

	.project-name-roll {
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		padding: 0.3rem 0.5rem;
		font-size: 1rem;
		cursor: pointer;
		color: var(--text-muted);
		line-height: 1;
		transition: background 0.15s, color 0.15s;
	}

	.project-name-roll:hover {
		background: var(--hover-tint);
		color: var(--text);
	}

	.hero-intro {
		font-size: 0.95rem;
		color: var(--text-muted);
		line-height: 1.8;
	}

	.hero-intro .tip {
		position: relative;
		text-decoration: underline dotted;
		cursor: help;
		color: var(--text);
		font-weight: 500;
	}

	.hero-intro .tip::after {
		content: attr(data-tip);
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		white-space: normal;
		width: 220px;
		background: var(--text);
		color: var(--bg);
		font-size: 0.75rem;
		font-weight: 400;
		line-height: 1.4;
		padding: 6px 9px;
		border-radius: 6px;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.1s ease;
		z-index: 100;
	}

	.hero-intro .tip:hover::after {
		opacity: 1;
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

	.sample-dropdown {
		position: relative;
		display: inline-block;
		vertical-align: middle;
	}

	.chevron {
		font-size: 0.65rem;
		margin-left: 0.2rem;
	}

	.sample-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 50;
		margin: 0;
		padding: 0.25rem 0;
		list-style: none;
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.12);
		min-width: 11rem;
		white-space: nowrap;
	}

	.sample-menu button {
		display: block;
		width: 100%;
		padding: 0.45rem 1rem;
		background: none;
		border: none;
		text-align: left;
		font: inherit;
		font-size: 0.82rem;
		color: var(--text);
		cursor: pointer;
	}

	.sample-menu button:hover {
		background: rgba(0,0,0,0.05);
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

	/* ── View controls ───────────────────────────────── */
	.view-controls {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.4rem;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.view-controls-label {
		font-weight: 600;
		margin-right: 0.15rem;
	}

	.view-ctrl-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		font-size: 0.75rem;
		color: var(--text-muted);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.15s;
	}

	.view-ctrl-btn:hover:not(:disabled) {
		color: var(--text);
	}

	.view-ctrl-btn:disabled {
		opacity: 0.35;
		cursor: default;
		text-decoration: none;
	}

	.view-ctrl-sep {
		opacity: 0.4;
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

	.scope-pills {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.scope-pill {
		font-size: 0.68rem;
		font-weight: 600;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.pill--core {
		background: rgba(255, 217, 102, 0.25);
		color: #7a5c00;
	}
	.pill--core abbr,
	.pill--non-core abbr {
		text-decoration: underline dotted;
		cursor: help;
	}
	:global([data-theme="dark"]) .pill--core {
		background: rgba(255, 217, 102, 0.15);
		color: #f5d76e;
	}

	.pill--non-core {
		background: var(--tally-bg);
		color: var(--text-muted);
	}

	.pill--total {
		background: rgba(0,0,0,0.06);
		color: var(--text);
	}
	:global([data-theme="dark"]) .pill--total {
		background: rgba(255,255,255,0.08);
	}

	.pill-sep {
		font-size: 0.65rem;
		color: var(--text-muted);
		opacity: 0.6;
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

	.privacy--hero {
		margin-top: 0.6rem;
		padding: 0.45rem 0.75rem;
		background: var(--tally-bg);
		border-radius: var(--radius-sm);
		line-height: 1.5;
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
