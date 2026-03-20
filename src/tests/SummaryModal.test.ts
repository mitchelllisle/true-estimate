import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SummaryModal from '$lib/components/SummaryModal.svelte';
import { initialCategories } from '$lib/categories';

function categoriesWithData() {
	const cats = initialCategories();
	const core = cats.find((c) => c.id === 'the-work')!;
	core.items = [{ id: '1', description: 'Build the thing', weeks: 4 }];
	const before = cats.find((c) => c.id === 'before')!;
	before.items = [{ id: '2', description: 'Setup env', weeks: 2 }];
	return cats;
}

describe('SummaryModal', () => {
	it('renders the modal with a heading', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		expect(screen.getByText('Project breakdown')).toBeInTheDocument();
	});

	it('renders a table row for each of the 8 categories', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		// Each category name appears in the table
		expect(screen.getByText('The work')).toBeInTheDocument();
		expect(screen.getByText('The work before the work')).toBeInTheDocument();
		expect(screen.getByText('The work after the work')).toBeInTheDocument();
	});

	it('shows a Total row', () => {
		render(SummaryModal, { categories: initialCategories(), onclose: () => {} });
		expect(screen.getByText('Total')).toBeInTheDocument();
	});

	it('renders the callout with core week count when core > 0', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		expect(screen.getByText(/You estimated 4 weeks/i)).toBeInTheDocument();
	});

	it('shows the projected range in the callout', () => {
		render(SummaryModal, { categories: categoriesWithData(), onclose: () => {} });
		// projLow = 4 * 3.5 = 14, projHigh = 4 * 5 = 20
		expect(screen.getByText(/14.*20 weeks/i)).toBeInTheDocument();
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
		expect(screen.getByText('Build the thing')).toBeInTheDocument();
		expect(screen.getByText('Setup env')).toBeInTheDocument();
	});
});
