export type Item = {
	id: string;
	description: string;
	weeks: number | null;
};

export type Category = {
	id: string;
	name: string;
	subtitle: string;
	description: string;
	color: string;
	textColor: string;
	isCore: boolean;
	outsideProject: boolean;
	items: Item[];
};

export const CATEGORIES: Omit<Category, 'items'>[] = [
	{
		id: 'around',
		name: 'The work around the work',
		subtitle: 'Admin',
		description: 'Meetings, reviews, project management, etc.',
		color: '#c8c8c8',
		textColor: '#333333',
		isCore: false,
		outsideProject: true
	},
	{
		id: 'to-get',
		name: 'The work to get the work',
		subtitle: 'Acquisition',
		description: 'Research, experimentation, scoping, quoting, pitching.',
		color: '#f28b82',
		textColor: '#5a1a16',
		isCore: false,
		outsideProject: true
	},
	{
		id: 'before',
		name: 'The work before the work',
		subtitle: 'Preparation',
		description: 'Configuration, setup, services, infrastructure.',
		color: '#f4a460',
		textColor: '#5a2d00',
		isCore: false,
		outsideProject: false
	},
	{
		id: 'the-work',
		name: 'The work',
		subtitle: 'Execution',
		description: 'The actual build, product, design, tests, docs, etc.',
		color: '#ffd966',
		textColor: '#4a3600',
		isCore: true,
		outsideProject: false
	},
	{
		id: 'between',
		name: 'The work between the work',
		subtitle: 'Iteration',
		description: 'Iteration, debugging, refactoring, maintenance, tooling.',
		color: '#a8d8a8',
		textColor: '#1a3d1a',
		isCore: false,
		outsideProject: false
	},
	{
		id: 'beyond',
		name: 'The work beyond the work',
		subtitle: 'Changes',
		description: 'Changes, omissions, nice-to-haves, scope creep.',
		color: '#a0d8d8',
		textColor: '#0e3535',
		isCore: false,
		outsideProject: false
	},
	{
		id: 'outside',
		name: 'The work outside the work',
		subtitle: 'Problems',
		description: 'Surprises, contingency, disasters, mission creep.',
		color: '#a8c8e8',
		textColor: '#1a2e4a',
		isCore: false,
		outsideProject: false
	},
	{
		id: 'after',
		name: 'The work after the work',
		subtitle: 'Maintenance & Ops',
		description: 'Ongoing maintenance, dependency upgrades, security patching, performance uplift, and keeping the lights on.',
		color: '#7dabd0',
		textColor: '#0d2a44',
		isCore: false,
		outsideProject: false
	}
];

export function makeCategory(def: Omit<Category, 'items'>): Category {
	return { ...def, items: [] };
}

export function initialCategories(): Category[] {
	return CATEGORIES.map(makeCategory);
}

export function totalWeeks(categories: Category[]): number {
	return categories.flatMap((c) => c.items).reduce((sum, i) => sum + (i.weeks ?? 0), 0);
}

export function coreWeeks(categories: Category[]): number {
	return categories
		.filter((c) => c.isCore)
		.flatMap((c) => c.items)
		.reduce((sum, i) => sum + (i.weeks ?? 0), 0);
}

export function sampleCategories(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	add('around', [
		{ description: 'Weekly standups & async updates', weeks: 0.5 },
		{ description: 'Sprint planning & retrospectives', weeks: 0.5 },
		{ description: 'Client status reports', weeks: 0.25 }
	]);
	add('to-get', [
		{ description: 'Discovery call & requirements scoping', weeks: 0.5 },
		{ description: 'Proposal, estimate & contract', weeks: 0.5 }
	]);
	add('before', [
		{ description: 'Dev environment & repo setup', weeks: 0.5 },
		{ description: 'CI/CD pipeline & staging environment', weeks: 0.5 },
		{ description: 'Design system & component library scaffold', weeks: 0.5 }
	]);
	add('the-work', [
		{ description: 'Authentication & user accounts', weeks: 1 },
		{ description: 'Dashboard & data visualisation', weeks: 1.5 },
		{ description: 'Core data tables with filtering & search', weeks: 1 },
		{ description: 'REST API integration', weeks: 1 },
		{ description: 'Email notifications', weeks: 0.5 },
		{ description: 'Mobile-responsive polish', weeks: 0.5 }
	]);
	add('between', [
		{ description: 'Bug fixes from client review rounds', weeks: 0.5 },
		{ description: 'Performance optimisation', weeks: 0.5 },
		{ description: 'Code review & refactoring', weeks: 0.5 }
	]);
	add('beyond', [
		{ description: 'Feature additions from stakeholder feedback', weeks: 1 },
		{ description: 'Design revisions after visual review', weeks: 0.5 }
	]);
	add('outside', [
		{ description: 'Third-party API delays or breaking changes', weeks: 0.5 },
		{ description: 'Contingency buffer', weeks: 0.5 }
	]);
	add('after', [
		{ description: 'Monthly dependency upgrades', weeks: 0.25 },
		{ description: 'Bug monitoring & patch releases', weeks: 0.25 }
	]);

	return cats;
}

export function hiddenWeeks(categories: Category[]): number {
	return totalWeeks(categories) - coreWeeks(categories);
}

export function buildCsv(categories: Category[]): string {
	const rows: string[] = ['Category,Subtitle,Item,Weeks'];
	for (const cat of categories) {
		for (const item of cat.items) {
			const weeks = item.weeks != null ? String(item.weeks) : '';
			const desc = `"${item.description.replace(/"/g, '""')}"`;
			rows.push(`"${cat.name}",${cat.subtitle},${desc},${weeks}`);
		}
	}
	return rows.join('\n');
}
