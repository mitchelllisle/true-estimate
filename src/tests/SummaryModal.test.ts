import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SummaryModal from '$lib/components/SummaryModal.svelte';
import { initialCategories } from '$lib/categories';

function categoriesWithData() {
	const cats = initialCategories();
	const core = cats.find((c) => c.id === 'the-work')!;
	core.items = [{ id: '1', description: 'Build the thing', notes: '', weeks: 4 }];
	const before = cats.find((c) => c.id === 'before')!;
	before.items = [{ id: '2', description: 'Setup env', notes: '', weeks: 2 }];
	return cats;
}

describe('SummaryModal', () => {
	it('renders the modal with a heading', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		expect(screen.getByText('Project breakdown')).toBeInTheDocument();
	});

	it('renders a table row for categories that have items', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		// Only categories with items appear in the breakdown table
		expect(screen.getAllByText('The work').length).toBeGreaterThan(0);
		expect(screen.getAllByText('The work before the work').length).toBeGreaterThan(0);
	});

	it('shows a Total row', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		expect(screen.getByText('Total')).toBeInTheDocument();
	});

	it('renders the stats strip with core execution when core > 0', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		// Stats strip shows core execution % when pctCore > 0
		expect(screen.getByText('core execution')).toBeInTheDocument();
	});

	it('shows calendar time in the stats strip', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		// Stats strip shows estimated calendar time when there are items
		expect(screen.getByText('calendar time')).toBeInTheDocument();
	});

	it('renders the "Download CSV" button', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		expect(screen.getByText(/Download CSV/i)).toBeInTheDocument();
	});

	it('calls onclose when the × button is clicked', async () => {
		const onclose = vi.fn();
		render(SummaryModal, { categories: initialCategories(), onclose });
		await fireEvent.click(screen.getByLabelText('Close breakdown'));
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('calls onclose when the Close text button is clicked', async () => {
		const onclose = vi.fn();
		render(SummaryModal, { categories: initialCategories(), onclose });
		await fireEvent.click(screen.getByText('Close'));
		expect(onclose).toHaveBeenCalledOnce();
	});

	it('"Download CSV" is disabled when total is 0', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		expect(screen.getByText(/Download CSV/i)).toBeDisabled();
	});

	it('"Download CSV" is enabled when items have weeks', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		expect(screen.getByText(/Download CSV/i)).not.toBeDisabled();
	});

	it('shows item descriptions in the "All items" section', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		expect(screen.getAllByText('Build the thing').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Setup env').length).toBeGreaterThan(0);
	});
});
