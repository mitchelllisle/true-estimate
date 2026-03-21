<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	let { onclose }: { onclose: () => void } = $props();

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
	aria-label="About this estimation technique"
	tabindex="-1"
	transition:fade={{ duration: 150 }}
>
	<div class="modal" transition:fly={{ y: 12, duration: 200 }}>
		<header class="modal-header">
			<h2>"The work is never just 'the work'"</h2>
			<button class="close-btn" onclick={onclose} aria-label="Close">×</button>
		</header>

		<div class="modal-body">
			<p class="byline">
				A framework by <a href="https://davestewart.co.uk/blog/work/project-estimation/" target="_blank" rel="noopener noreferrer">Dave Stewart</a>
			</p>

			<p>
				Every project has a visible core — the features you're asked to build. But around that core sits
				a ring of work that rarely makes it into estimates: the kick-off meetings, the deployment
				pipeline, the code reviews, the post-launch support, the back-and-forth over requirements.
			</p>

			<p>
				Dave's insight is that this <em>surrounding</em> work is not optional overhead — it's a
				predictable, structural part of every project. When you ignore it you don't estimate less
				work, you just make the same mistake every time.
			</p>

			<h3>The three rings</h3>
			<ul>
				<li>
					<strong>Before the work</strong> — acquisition, scoping, environment setup, access, tooling.
					Often charged to the client, often forgotten in the estimate.
				</li>
				<li>
					<strong>The actual work</strong> — split into <em>Core</em> (what you're explicitly asked
					for) and <em>Non-Core</em> (QA, reviews, iteration, surprises, stakeholder comms).
				</li>
				<li>
					<strong>After the work</strong> — handover, docs, monitoring, maintenance contracts.
				</li>
			</ul>

			<p>
				A good estimate names all three rings explicitly. Clients understand effort, not just
				deliverables — and you stop silently absorbing the work that surrounds every feature.
			</p>

			<p class="read-more">
				Read the full article:
				<a href="https://davestewart.co.uk/blog/work/project-estimation/" target="_blank" rel="noopener noreferrer">
					davestewart.co.uk — Project Estimation
				</a>
			</p>
		</div>
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
		max-width: 34rem;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.15rem 1.25rem 0.9rem;
		border-bottom: 1px solid var(--border);
	}

	.modal-header h2 {
		font-size: 1rem;
		font-weight: 700;
		line-height: 1.35;
		margin: 0;
		color: var(--text);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.3rem;
		line-height: 1;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0 0.1rem;
		flex-shrink: 0;
	}

	.close-btn:hover {
		color: var(--text);
	}

	.modal-body {
		padding: 1.1rem 1.25rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--text);
	}

	.byline {
		font-size: 0.78rem;
		color: var(--text-muted);
		margin: 0;
	}

	.byline a {
		color: var(--text-muted);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.byline a:hover {
		color: var(--text);
	}

	p {
		margin: 0;
	}

	h3 {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin: 0.25rem 0 0;
	}

	ul {
		margin: 0;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	li {
		font-size: 0.875rem;
		line-height: 1.55;
	}

	.read-more {
		font-size: 0.78rem;
		color: var(--text-muted);
		border-top: 1px solid var(--border);
		padding-top: 0.75rem;
		margin-top: 0.25rem;
	}

	.read-more a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.read-more a:hover {
		color: var(--text);
	}
</style>
