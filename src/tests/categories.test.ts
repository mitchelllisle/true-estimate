import { describe, it, expect } from 'vitest';
import {
	CATEGORIES,
	initialCategories,
	coreWeeks,
	hiddenWeeks,
	totalWeeks,
	buildCsv
} from '$lib/categories';

describe('CATEGORIES data integrity', () => {
	it('defines exactly 8 categories', () => {
		expect(CATEGORIES).toHaveLength(8);
	});

	it('has exactly one isCore category', () => {
		const coreCategories = CATEGORIES.filter((c) => c.isCore);
		expect(coreCategories).toHaveLength(1);
		expect(coreCategories[0].id).toBe('the-work');
	});

	it('has exactly 2 outsideProject categories', () => {
		const outside = CATEGORIES.filter((c) => c.outsideProject);
		expect(outside).toHaveLength(2);
	});

	it('every category has name, subtitle, description, color, textColor', () => {
		for (const cat of CATEGORIES) {
			expect(cat.name).toBeTruthy();
			expect(cat.subtitle).toBeTruthy();
			expect(cat.description).toBeTruthy();
			expect(cat.color).toMatch(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
			expect(cat.textColor).toMatch(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
		}
	});

	it('all ids are unique', () => {
		const ids = CATEGORIES.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('initialCategories()', () => {
	it('returns 8 categories each with an empty items array', () => {
		const cats = initialCategories();
		expect(cats).toHaveLength(8);
		for (const c of cats) {
			expect(c.items).toEqual([]);
		}
	});

	it('returns a new array each call (no shared reference)', () => {
		const a = initialCategories();
		const b = initialCategories();
		a[0].items.push({ id: '1', description: 'x', weeks: 1 });
		expect(b[0].items).toHaveLength(0);
	});
});

describe('week helper functions', () => {
	function makeCategories() {
		const cats = initialCategories();
		// core "the-work" → 5w
		const core = cats.find((c) => c.id === 'the-work')!;
		core.items = [{ id: '1', description: 'build', weeks: 5 }];
		// "before" → 2w + 1w
		const before = cats.find((c) => c.id === 'before')!;
		before.items = [
			{ id: '2', description: 'setup', weeks: 2 },
			{ id: '3', description: 'config', weeks: 1 }
		];
		// "around" → no estimate (null)
		const around = cats.find((c) => c.id === 'around')!;
		around.items = [{ id: '4', description: 'meetings', weeks: null }];
		return cats;
	}

	it('coreWeeks sums only the isCore category items', () => {
		expect(coreWeeks(makeCategories())).toBe(5);
	});

	it('totalWeeks sums all items (null counts as 0)', () => {
		expect(totalWeeks(makeCategories())).toBe(8); // 5 + 2 + 1 + 0
	});

	it('hiddenWeeks is total minus core', () => {
		const cats = makeCategories();
		expect(hiddenWeeks(cats)).toBe(totalWeeks(cats) - coreWeeks(cats));
		expect(hiddenWeeks(cats)).toBe(3);
	});

	it('returns 0 for all helpers when no items exist', () => {
		const empty = initialCategories();
		expect(coreWeeks(empty)).toBe(0);
		expect(totalWeeks(empty)).toBe(0);
		expect(hiddenWeeks(empty)).toBe(0);
	});
});

describe('buildCsv()', () => {
	it('includes a header row', () => {
		const csv = buildCsv(initialCategories());
		expect(csv.startsWith('Category,Subtitle,Item,Weeks')).toBe(true);
	});

	it('produces only the header when no items exist', () => {
		const csv = buildCsv(initialCategories());
		const lines = csv.trim().split('\n');
		expect(lines).toHaveLength(1);
	});

	it('produces one data row per item', () => {
		const cats = initialCategories();
		const core = cats.find((c) => c.id === 'the-work')!;
		core.items = [
			{ id: '1', description: 'feature A', weeks: 3 },
			{ id: '2', description: 'feature B', weeks: null }
		];
		const lines = buildCsv(cats).trim().split('\n');
		expect(lines).toHaveLength(3); // header + 2
	});

	it('handles descriptions with quotes correctly', () => {
		const cats = initialCategories();
		const core = cats.find((c) => c.id === 'the-work')!;
		core.items = [{ id: '1', description: 'said "hello"', weeks: 1 }];
		const csv = buildCsv(cats);
		expect(csv).toContain('"said ""hello"""');
	});

	it('leaves Weeks column empty when weeks is null', () => {
		const cats = initialCategories();
		const core = cats.find((c) => c.id === 'the-work')!;
		core.items = [{ id: '1', description: 'no estimate', weeks: null }];
		const lines = buildCsv(cats).split('\n');
		// last field should be empty string after trailing comma
		expect(lines[1]).toMatch(/,$/);
	});
});
