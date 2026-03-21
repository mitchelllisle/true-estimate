<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { parseCsvImport, type ImportResult, type Category } from '$lib/categories';

	let {
		baseCategories,
		onimport,
		onclose
	}: {
		baseCategories: Category[];
		onimport: (categories: Category[]) => void;
		onclose: () => void;
	} = $props();

	let dragOver   = $state(false);
	let result     = $state<ImportResult | null>(null);
	let fileName   = $state('');
	let inputEl    = $state<HTMLInputElement | null>(null);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	function readFile(file: File) {
		if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
			result = {
				categories: [],
				errors: [{ row: 0, message: 'Please upload a .csv file.' }],
				imported: 0,
				skipped: 0
			};
			fileName = file.name;
			return;
		}
		fileName = file.name;
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			result = parseCsvImport(text, baseCategories);
		};
		reader.readAsText(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file) readFile(file);
	}

	function handleFileInput(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) readFile(file);
	}

	function confirmImport() {
		if (result) onimport(result.categories);
	}

	function downloadTemplate() {
		const rows = [
			'Category,Subtitle,Item,Weeks',
			'"The work to get the work",Acquisition,Write proposal,2',
			'"The work before the work",Preparation,Set up dev environment,1',
			'"The work",Execution,Build core feature,4',
			'"The work around the work",Admin,Weekly check-ins,0.5',
			'"The work between the work",Iteration,Bug fixes & QA,2',
			'"The work beyond the work",Changes,Scope changes,1',
			'"The work outside the work",Problems,Contingency buffer,1',
			'"The work after the work",Maintenance & Ops,Ongoing support,1',
		];
		const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'trueestimate-template.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	const totalImported = $derived(result?.imported ?? 0);
	const hasErrors     = $derived((result?.errors.length ?? 0) > 0);
	const canImport     = $derived(totalImported > 0);
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="backdrop"
	onclick={handleBackdrop}
	role="dialog"
	aria-modal="true"
	aria-label="Import CSV"
	tabindex="-1"
	transition:fade={{ duration: 150 }}
>
	<div class="modal" transition:fly={{ y: 12, duration: 200 }}>
		<header class="modal-header">
			<div>
				<h2>Import from CSV</h2>
				<p class="modal-sub">Upload a CSV you previously exported — or any file matching the format below.</p>
			</div>
			<button class="close-btn" onclick={onclose} aria-label="Close">×</button>
		</header>

		<div class="modal-body">
			<!-- Drop zone -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="drop-zone"
				class:drop-zone--over={dragOver}
				class:drop-zone--loaded={!!result}
				ondragover={(e) => { e.preventDefault(); dragOver = true; }}
				ondragleave={() => (dragOver = false)}
				ondrop={handleDrop}
				onclick={() => inputEl?.click()}
				onkeydown={(e) => e.key === 'Enter' && inputEl?.click()}
				role="button"
				tabindex="0"
				aria-label="Drop CSV file here or click to browse"
			>
				<input
					bind:this={inputEl}
					type="file"
					accept=".csv,text/csv"
					class="file-input"
					onchange={handleFileInput}
				/>
				{#if !result}
					<div class="drop-idle">
						<div class="drop-icon" aria-hidden="true">
							<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
								<polyline points="17 8 12 3 7 8"/>
								<line x1="12" y1="3" x2="12" y2="15"/>
							</svg>
						</div>
						<p class="drop-label">Drop your CSV here, or <span class="drop-link">browse</span></p>
						<p class="drop-hint">.csv files only</p>
					</div>
				{:else}
					<div class="drop-result">
						<div class="result-file">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
								<polyline points="14 2 14 8 20 8"/>
							</svg>
							<span class="result-filename">{fileName}</span>
						</div>
						<p class="result-summary">
							{#if canImport}
								<span class="result-ok">✓ {totalImported} item{totalImported === 1 ? '' : 's'} ready to import</span>
							{:else}
								<span class="result-none">No importable rows found</span>
							{/if}
							{#if result.skipped > 0}
								<span class="result-skipped"> · {result.skipped} row{result.skipped === 1 ? '' : 's'} skipped</span>
							{/if}
						</p>
						<p class="drop-hint drop-hint--change">Click to choose a different file</p>
					</div>
				{/if}
			</div>

			<!-- Per-category preview -->
			{#if result && canImport}
				<div class="preview">
					<h3 class="preview-title">Preview</h3>
					<div class="preview-grid">
						{#each result.categories.filter(c => c.items.length > 0) as cat}
							<div class="preview-cat" style="border-left: 3px solid {cat.color};">
								<span class="preview-cat-name">{cat.subtitle}</span>
								<span class="preview-cat-count">{cat.items.length} item{cat.items.length === 1 ? '' : 's'}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Errors -->
			{#if hasErrors}
				<div class="errors">
					<h3 class="errors-title">⚠ Warnings</h3>
					<ul>
						{#each result!.errors as err}
							<li>{err.message}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Format reference -->
			<details class="format-ref">
				<summary>Expected CSV format</summary>
				<div class="format-body">
					<p>The file must have a header row. Required columns are <code>Item</code> and either <code>Subtitle</code> or <code>Category</code>. All other columns are optional.</p>
					<table class="format-table">
						<thead>
							<tr>
								<th>Column</th>
								<th>Required?</th>
								<th>Notes</th>
							</tr>
						</thead>
						<tbody>
							<tr><td><code>Category</code></td><td>If no Subtitle</td><td>Full category name, e.g. <em>The work</em></td></tr>
							<tr><td><code>Subtitle</code></td><td>If no Category</td><td>Short label, e.g. <em>Execution</em> — preferred for matching</td></tr>
							<tr><td><code>Item</code></td><td>Yes</td><td>Task description</td></tr>
							<tr><td><code>Weeks</code></td><td>No</td><td>Numeric effort in weeks (decimals OK)</td></tr>
						</tbody>
					</table>
					<p class="format-subtitles">Valid Subtitle values: <em>Admin, Acquisition, Preparation, Execution, Iteration, Changes, Problems, Maintenance &amp; Ops</em></p>
					<button class="btn-template" onclick={downloadTemplate}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
							<polyline points="7 10 12 15 17 10"/>
							<line x1="12" y1="15" x2="12" y2="3"/>
						</svg>
						Download template
					</button>
				</div>
			</details>
		</div>

		<footer class="modal-footer">
			<button class="btn-cancel" onclick={onclose}>Cancel</button>
			<button class="btn-import" disabled={!canImport} onclick={confirmImport}>
				Import {canImport ? `${totalImported} item${totalImported === 1 ? '' : 's'}` : ''}
			</button>
		</footer>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 200;
	}

	.modal {
		background: var(--surface);
		border-radius: 14px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.25rem 1.5rem 1rem;
		border-bottom: 1px solid var(--border);
		gap: 1rem;
	}

	.modal-header h2 {
		margin: 0 0 0.2rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.modal-sub {
		margin: 0;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.4rem;
		line-height: 1;
		cursor: pointer;
		color: var(--text-muted);
		padding: 0;
		flex-shrink: 0;
	}

	.close-btn:hover { color: var(--text); }

	.modal-body {
		padding: 1.25rem 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ── Drop zone ─────────────────────────────── */
	.drop-zone {
		border: 2px dashed var(--border);
		border-radius: 10px;
		padding: 1.75rem 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		position: relative;
	}

	.drop-zone:hover,
	.drop-zone--over {
		border-color: var(--text);
		background: var(--hover-tint);
	}

	.file-input {
		display: none;
	}

	.drop-idle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.drop-icon {
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}

	.drop-label {
		margin: 0;
		font-size: 0.88rem;
		color: var(--text);
	}

	.drop-link {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.drop-hint {
		margin: 0;
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.drop-hint--change {
		margin-top: 0.35rem;
	}

	.drop-result {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.result-file {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.82rem;
		color: var(--text);
	}

	.result-filename {
		font-weight: 600;
	}

	.result-summary {
		margin: 0;
		font-size: 0.8rem;
	}

	.result-ok    { color: #258C4A; font-weight: 600; }
	.result-none  { color: #b45309; font-weight: 600; }
	.result-skipped { color: var(--text-muted); }

	/* ── Preview ────────────────────────────────── */
	.preview-title,
	.errors-title {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-muted);
		margin: 0 0 0.5rem;
	}

	.preview-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.preview-cat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--surface);
		border-radius: 6px;
		padding: 0.3rem 0.65rem;
		font-size: 0.75rem;
	}

	.preview-cat-name { font-weight: 600; color: var(--text); }
	.preview-cat-count { color: var(--text-muted); }

	/* ── Errors ─────────────────────────────────── */
	.errors {
		background: #fff8ed;
		border: 1px solid #fcd34d;
		border-radius: 8px;
		padding: 0.75rem 1rem;
	}

	:global([data-theme="dark"]) .errors {
		background: #2d1f07;
		border-color: #92400e;
	}

	.errors ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.errors li {
		font-size: 0.75rem;
		color: #92400e;
	}

	:global([data-theme="dark"]) .errors li {
		color: #fbbf24;
	}

	/* ── Format reference ───────────────────────── */
	.format-ref {
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.format-ref summary {
		cursor: pointer;
		font-weight: 600;
		color: var(--text-muted);
		user-select: none;
		padding: 0.2rem 0;
	}

	.format-ref summary:hover { color: var(--text); }

	.format-body {
		margin-top: 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.format-body p { margin: 0; line-height: 1.6; }

	.format-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.72rem;
	}

	.format-table th,
	.format-table td {
		text-align: left;
		padding: 0.3rem 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.format-table th {
		font-weight: 700;
		color: var(--text);
		background: var(--surface);
	}

	.format-subtitles {
		font-size: 0.7rem;
		color: var(--text-muted);
	}

	.btn-template {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 999px;
		padding: 0.25rem 0.75rem;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
		margin-top: 0.25rem;
	}

	.btn-template:hover {
		border-color: var(--text-muted);
		background: var(--hover-tint);
	}

	/* ── Footer ──────────────────────────────────── */
	.modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		padding: 0.9rem 1.5rem;
		border-top: 1px solid var(--border);
	}

	.btn-cancel {
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 999px;
		padding: 0.35rem 1rem;
		font: inherit;
		font-size: 0.82rem;
		cursor: pointer;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.btn-cancel:hover { border-color: var(--text-muted); }

	.btn-import {
		background: var(--text);
		color: var(--bg);
		border: none;
		border-radius: 999px;
		padding: 0.35rem 1.1rem;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-import:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.btn-import:not(:disabled):hover { opacity: 0.8; }
</style>
