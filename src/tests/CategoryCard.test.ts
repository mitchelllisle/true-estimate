import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CategoryCard from '$lib/components/CategoryCard.svelte';
import { initialCategories } from '$lib/categories';

function getCategory() {
	return initialCategories().find((c) => c.id === 'before')!;
}

describe('CategoryCard', () => {
	it('renders the category name and subtitle', () => {
		render(CategoryCard, {
			category: getCategory(),
			onadditem: () => {},
			onupdateitem: () => {},
			onremoveitem: () => {}
		});
		expect(screen.getByText('The work before the work')).toBeInTheDocument();
		expect(screen.getByText('Preparation')).toBeInTheDocument();
	});

	it('renders the description text', () => {
		render(CategoryCard, {
			category: getCategory(),
			onadditem: () => {},
			onupdateitem: () => {},
			onremoveitem: () => {}
		});
		expect(screen.getByText(/Configuration, setup/i)).toBeInTheDocument();
	});

	it('calls onadditem with the correct category id when "+ Add item" is clicked', async () => {
		let called = '';
		render(CategoryCard, {
			category: getCategory(),
			onadditem: (id: string) => { called = id; },
			onupdateitem: () => {},
			onremoveitem: () => {}
		});
		await fireEvent.click(screen.getByText('+ Add item'));
		expect(called).toBe('before');
	});

	it('does not show a week badge when there are no items', () => {
		render(CategoryCard, {
			category: getCategory(),
			onadditem: () => {},
			onupdateitem: () => {},
			onremoveitem: () => {}
		});
		// badge only renders if weekTotal > 0
		expect(screen.queryByText(/^\d+w$/)).toBeNull();
	});

	it('shows a week badge when items have week estimates', () => {
		const cat = getCategory();
		cat.items = [
			{ id: '1', description: 'setup', notes: '', weeks: 2 },
			{ id: '2', description: 'config', notes: '', weeks: 1 }
		];
		render(CategoryCard, {
			category: cat,
			onadditem: () => {},
			onupdateitem: () => {},
			onremoveitem: () => {}
		});
		expect(screen.getByText('3')).toBeInTheDocument();
	});
});
