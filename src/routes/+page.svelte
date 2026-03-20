<script lang="ts">
	import { initialCategories } from '$lib/categories';
	import type { Item } from '$lib/categories';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import InlineSummary from '$lib/components/InlineSummary.svelte';
	import SummaryModal from '$lib/components/SummaryModal.svelte';
	let categories = $state(initialCategories());
	let modalOpen = $state(false);

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

	const outsideCats = $derived(categories.filter((c) => c.outsideProject));
	const beforeCats  = $derived(categories.filter((c) => c.id === 'before'));
	const coreCat     = $derived(categories.find((c) => c.isCore) as Category);
	const afterCats   = $derived(categories.filter((c) => !c.outsideProject && !c.isCore && c.id !== 'before'));
</script>

<div class="page">
	<header class="hero">
		<h1>The work is never just&nbsp;"the&nbsp;work"</h1>
		<p class="hero-sub">
			Add tasks under each phase with optional week estimates — then see the full picture of what it actually takes to ship something.
		</p>
	</header>

	<main class="content">

		<!-- ── Outside the project scope ───────────────────────── -->
		<div class="scope scope--outside" aria-label="Outside the project scope">
			<div class="scope-header">
				<span class="scope-title">Outside the project scope</span>
				<span class="scope-hint">Real costs, rarely estimated</span>
			</div>
			<div class="card-stack">
				{#each outsideCats as category (category.id)}
					<CategoryCard
						{category}
						onadditem={addItem}
						onupdateitem={updateItem}
						onremoveitem={removeItem}
					/>
				{/each}
			</div>
		</div>

		<!-- ── The project ──────────────────────────────────────── -->
		<div class="scope scope--project" aria-label="The project">
			<div class="scope-header">
				<span class="scope-title">The project</span>
			</div>

			<!-- Before the work -->
			<div class="phase-row">
				<span class="phase-chip phase-chip--before">Before the work</span>
				<span class="phase-rule" aria-hidden="true"></span>
			</div>
			<div class="card-stack">
				{#each beforeCats as category (category.id)}
					<CategoryCard
						{category}
						onadditem={addItem}
						onupdateitem={updateItem}
						onremoveitem={removeItem}
					/>
				{/each}
			</div>

			<!-- The work -->
			<div class="phase-row phase-row--core">
				<span class="phase-chip phase-chip--core">⭐ The work</span>
				<span class="phase-sub">what you'll actually estimate</span>
				<span class="phase-rule" aria-hidden="true"></span>
			</div>
			<CategoryCard
				category={coreCat}
				onadditem={addItem}
				onupdateitem={updateItem}
				onremoveitem={removeItem}
			/>

			<!-- After the work -->
			<div class="phase-row">
				<span class="phase-chip phase-chip--after">After the work</span>
				<span class="phase-rule" aria-hidden="true"></span>
			</div>
			<div class="card-stack">
				{#each afterCats as category (category.id)}
					<CategoryCard
						{category}
						onadditem={addItem}
						onupdateitem={updateItem}
						onremoveitem={removeItem}
					/>
				{/each}
			</div>
		</div>

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

	/* ── Hero ────────────────────────────────────────── */
	.hero {
		text-align: center;
		margin-bottom: 2.5rem;
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
		gap: 1.5rem;
	}

	/* ── Scope containers ────────────────────────────── */
	.scope {
		border-radius: 12px;
		padding: 1rem 1.25rem 1.25rem;
	}

	.scope--outside {
		border: 2px dashed #c0c0c0;
		background: rgba(200, 200, 200, 0.04);
	}

	.scope--project {
		border: 2px solid var(--border);
		background: rgba(255, 255, 255, 0.5);
	}

	.scope-header {
		display: flex;
		align-items: baseline;
		gap: 0.65rem;
		margin-bottom: 0.85rem;
	}

	.scope-title {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.scope-hint {
		font-size: 0.7rem;
		color: #9ca3af;
	}

	/* ── Card stacks ─────────────────────────────────── */
	.card-stack {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	/* ── Phase dividers ──────────────────────────────── */
	.phase-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 1.1rem 0 0.5rem;
	}

	.phase-row--core {
		margin-top: 1.4rem;
	}

	.phase-chip {
		flex-shrink: 0;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		white-space: nowrap;
	}

	.phase-chip--before {
		background: #fff3e0;
		color: #a04000;
		border: 1px solid #f4a460;
	}

	.phase-chip--core {
		background: #fffbeb;
		color: #92650a;
		border: 1px solid #fde68a;
		font-size: 0.7rem;
	}

	.phase-chip--after {
		background: #f0fdf4;
		color: #166534;
		border: 1px solid #a8d8a8;
	}

	.phase-sub {
		font-size: 0.68rem;
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.phase-rule {
		flex: 1;
		display: block;
		height: 1px;
		background: var(--border);
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
