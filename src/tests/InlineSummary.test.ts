import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import InlineSummary from '$lib/components/InlineSummary.svelte';
import { initialCategories } from '$lib/categories';

function categoriesWithData() {
	const cats = initialCategories();
	const core = cats.find((c) => c.id === 'the-work')!;
	core.items = [{ id: '1', description: 'build', weeks: 4 }];
	const before = cats.find((c) => c.id === 'before')!;
	before.items = [{ id: '2', description: 'setup', weeks: 2 }];
	return cats; // core=4, hidden=2, total=6
}

describe('InlineSummary', () => {
	it('shows zero values when no items exist', () => {
		render(InlineSummary, {
			categories: initialCategories(),
			onOpenModal: () => {}
		});
		const values = screen.getAllByText('0');
		expect(values.length).toBeGreaterThanOrEqual(3);
	});

	it('shows correct Estimated, Hidden, and Total week values', () => {
		render(InlineSummary, {
			categories: categoriesWithData(),
			onOpenModal: () => {}
		});
		// Three stat-value elements: estimated=4, hidden=2, total=6
		expect(screen.getByText('4')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText('6')).toBeInTheDocument();
	});

	it('renders stat labels: Estimated, Hidden, Total', () => {
		render(InlineSummary, {
			categories: initialCategories(),
			onOpenModal: () => {}
		});
		expect(screen.getByText(/Estimated/i)).toBeInTheDocument();
		expect(screen.getByText(/Hidden/i)).toBeInTheDocument();
		expect(screen.getByText(/Total/i)).toBeInTheDocument();
	});

	it('renders the "See breakdown" button', () => {
		render(InlineSummary, {
			categories: initialCategories(),
			onOpenModal: () => {}
		});
		expect(screen.getByText(/See breakdown/i)).toBeInTheDocument();
	});

	it('"See breakdown" button is disabled when total is 0', () => {
		render(InlineSummary, {
			categories: initialCategories(),
			onOpenModal: () => {}
		});
		const btn = screen.getByText(/See breakdown/i);
		expect(btn).toBeDisabled();
	});

	it('"See breakdown" button is enabled when total > 0', () => {
		render(InlineSummary, {
			categories: categoriesWithData(),
			onOpenModal: () => {}
		});
		const btn = screen.getByText(/See breakdown/i);
		expect(btn).not.toBeDisabled();
	});
});
