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

// ── Timeline estimation helpers ────────────────────────────────────

/** Shared calculation kernel: returns elapsed-week positions, mirroring GanttChart logic */
function timelinePositions(cats: Category[]) {
	const eff = (id: string) =>
		cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0;

	const acq  = eff('to-get');
	const prep = eff('before');
	const core = eff('the-work');
	const iter = eff('between');
	const chng = eff('beyond');
	const prbs = eff('outside');
	const aftr = eff('after');

	const core_e     = prep + core;
	const aftr_e     = core_e + (aftr > 0 ? aftr * 2 : 0);
	const projectEnd = Math.max(aftr_e, core_e);

	const iter_e = iter > 0 ? (prep + core * 0.4) + iter + 1.5 : core_e;
	const chng_e = chng > 0 ? (prep + core * 0.55) + chng + 2  : core_e;
	const prbs_s = prep > 0 ? prep * 0.3 : core_e - core;
	const prbs_e = prbs > 0 ? Math.max(projectEnd * 0.88, core_e + 0.5) : prbs_s;

	const tMax = Math.max(projectEnd, iter_e, chng_e, prbs_e);

	return { acq, prep, core, iter, chng, prbs, aftr, core_e, aftr_e, projectEnd, iter_e, chng_e, prbs_s, prbs_e, tMax };
}

/** Estimated total calendar weeks for the project (from kickoff to last activity) */
export function getCalendarWeeks(cats: Category[]): number | null {
	const { acq, prep, core, iter, chng, prbs, aftr, tMax } = timelinePositions(cats);
	if (acq + prep + core + iter + chng + prbs + aftr < 0.5) return null;
	return Math.round(tMax * 10) / 10;
}

export type ElapsedEntry = {
	id: string;
	name: string;
	color: string;
	effortWeeks: number;
	elapsedWeeks: number;
	/** Very short label: "1:1", "full span", "overlapping", etc. */
	pattern: string;
	/** One-sentence explanation shown in the methodology section */
	methodology: string;
};

/** Per-category effort vs estimated elapsed calendar time */
export function getElapsedBreakdown(cats: Category[]): ElapsedEntry[] {
	const { acq, prep, core, iter, chng, prbs, aftr, core_e, projectEnd, iter_e, chng_e, prbs_s, prbs_e, aftr_e } = timelinePositions(cats);
	const r = (n: number) => Math.round(n * 10) / 10;
	const entries: ElapsedEntry[] = [];

	const push = (id: string, effort: number, elapsed: number, pattern: string, methodology: string) => {
		if (effort <= 0) return;
		const c = cats.find((cc) => cc.id === id)!;
		entries.push({ id, name: c.name, color: c.color, effortWeeks: effort, elapsedWeeks: r(elapsed), pattern, methodology });
	};

	push('to-get',   acq,  acq * 1.5,         'pre-project (1.5×)', 'Acquisition rarely happens in one block — spread 1.5× over calendar before kickoff.');
	push('before',   prep, prep,               '1:1 sequential',     'Setup work happens in order at the start; effort equals elapsed time.');
	push('the-work', core, core,               '1:1 sequential',     'Core execution is sequential; effort equals elapsed time.');
	push('around',   eff('around'), projectEnd,'full project span',   'Admin & meetings run concurrently throughout — elapsed = entire project duration.');
	push('between',  iter, iter_e - (prep + core * 0.4), 'overlapping + 1.5w tail', 'Iteration begins ~40% into core work and runs 1.5w beyond the effort estimate.');
	push('beyond',   chng, chng_e - (prep + core * 0.55),'overlapping + 2w tail',   'Changes emerge ~55% into core and tend to run 2w beyond the effort estimate.');
	push('outside',  prbs, r(prbs_e - prbs_s), 'distributed (≈88%)', 'Surprises are distributed across ~88% of the project timeline — always spread out.');
	push('after',    aftr, aftr * 2,            '2:1 spread',          'Maintenance happens at a steady drip — effort spreads to roughly 2× calendar time.');

	return entries;

	function eff(id: string) { return cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0; }
}

// ── Unit system ────────────────────────────────────────────────────
export type Unit = 'weeks' | 'days' | 'months' | 'sprints';
export const UNITS: Unit[] = ['weeks', 'days', 'months', 'sprints'];
export const UNIT_MULTIPLIERS: Record<Unit, number> = { weeks: 1, days: 5, months: 0.25, sprints: 0.5 };
export const UNIT_LABELS: Record<Unit, string>      = { weeks: 'Weeks', days: 'Days', months: 'Months', sprints: 'Sprints' };
export const UNIT_SHORT: Record<Unit, string>        = { weeks: 'w', days: 'd', months: 'mo', sprints: 'sp' };
export const UNIT_STEPS: Record<Unit, number>        = { weeks: 0.5, days: 1, months: 0.25, sprints: 1 };

/** Convert stored weeks to display value in the given unit */
export function toUnit(storedWeeks: number, unit: Unit): number {
	return Math.round(storedWeeks * UNIT_MULTIPLIERS[unit] * 100) / 100;
}
/** Convert a user-entered value in the given unit back to stored weeks */
export function fromUnit(enteredValue: number, unit: Unit): number {
	return enteredValue / UNIT_MULTIPLIERS[unit];
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

// ── CSV import ─────────────────────────────────────────────────────

export type ImportError = { row: number; message: string };

export type ImportResult = {
	categories: Category[];
	errors: ImportError[];
	imported: number;
	skipped: number;
};

function parseCsvRow(line: string): string[] {
	const cols: string[] = [];
	let inQuote = false;
	let cur = '';
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (ch === '"') {
			if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
			else inQuote = !inQuote;
		} else if (ch === ',' && !inQuote) {
			cols.push(cur); cur = '';
		} else {
			cur += ch;
		}
	}
	cols.push(cur);
	return cols;
}

export function parseCsvImport(csv: string, base: Category[]): ImportResult {
	const lines = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
	if (lines.length < 2) {
		return { categories: base.map(c => ({ ...c, items: [] })), errors: [{ row: 0, message: 'File appears empty or has no data rows.' }], imported: 0, skipped: 0 };
	}

	const header = parseCsvRow(lines[0]).map(h => h.toLowerCase().trim());
	const colCategory = header.indexOf('category');
	const colSubtitle = header.indexOf('subtitle');
	const colItem     = header.indexOf('item');
	const colWeeks    = header.indexOf('weeks');

	const errors: ImportError[] = [];

	if (colItem === -1) {
		errors.push({ row: 1, message: 'Missing required column: "Item"' });
		return { categories: base.map(c => ({ ...c, items: [] })), errors, imported: 0, skipped: 0 };
	}
	if (colSubtitle === -1 && colCategory === -1) {
		errors.push({ row: 1, message: 'Missing required column: "Subtitle" or "Category"' });
		return { categories: base.map(c => ({ ...c, items: [] })), errors, imported: 0, skipped: 0 };
	}

	const result: Category[] = base.map(c => ({ ...c, items: [] }));
	let imported = 0;
	let skipped  = 0;

	for (let i = 1; i < lines.length; i++) {
		const cols     = parseCsvRow(lines[i]);
		const subtitle = (colSubtitle !== -1 ? cols[colSubtitle] : '')?.trim() ?? '';
		const category = (colCategory !== -1 ? cols[colCategory] : '')?.trim() ?? '';
		const item     = cols[colItem]?.trim() ?? '';
		const weeksRaw = (colWeeks !== -1 ? cols[colWeeks] : '')?.trim() ?? '';

		// Skip blank rows silently
		if (!item && !weeksRaw) { skipped++; continue; }

		// Match category by Subtitle (preferred) then Category name
		const cat = result.find(c =>
			(subtitle && c.subtitle.toLowerCase() === subtitle.toLowerCase()) ||
			(category && c.name.toLowerCase() === category.toLowerCase())
		);

		if (!cat) {
			errors.push({ row: i + 1, message: `Row ${i + 1}: unknown category "${subtitle || category}" — row skipped` });
			skipped++;
			continue;
		}

		const weeks = weeksRaw !== '' ? parseFloat(weeksRaw) : null;
		cat.items.push({
			id:          crypto.randomUUID(),
			description: item,
			weeks:       (weeks != null && !isNaN(weeks)) ? weeks : null,
		});
		imported++;
	}

	return { categories: result, errors, imported, skipped };
}
