export type Item = {
	id: string;
	description: string;
	weeks: number | null;
};

const PROJECT_ACTIONS = [
	'Flying', 'Leaping', 'Charging', 'Dancing', 'Prowling', 'Howling', 'Gliding',
	'Sprinting', 'Diving', 'Soaring', 'Trotting', 'Racing', 'Drifting', 'Roaming',
	'Wandering', 'Stalking', 'Bounding', 'Galloping', 'Perching', 'Wading',
];

const PROJECT_ANIMALS = [
	'Goose', 'Fox', 'Panda', 'Falcon', 'Otter', 'Wolf', 'Crane', 'Lynx', 'Heron',
	'Badger', 'Elk', 'Jaguar', 'Raven', 'Bison', 'Swan', 'Bear', 'Eagle', 'Hawk',
	'Deer', 'Moose', 'Owl', 'Seal', 'Dolphin', 'Marmot', 'Ibis',
];

export function generateProjectName(): string {
	const action = PROJECT_ACTIONS[Math.floor(Math.random() * PROJECT_ACTIONS.length)];
	const animal = PROJECT_ANIMALS[Math.floor(Math.random() * PROJECT_ANIMALS.length)];
	return `${action}${animal}`;
}

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

export type SampleProject = 'backend' | 'frontend' | 'data';

export function sampleCategories(type: SampleProject = 'backend'): Category[] {
	if (type === 'frontend') return sampleFrontendProject();
	if (type === 'data') return sampleDataProject();
	return sampleBackendProject();
}

function sampleBackendProject(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	// Internal product build — lean overhead, large focused core
	// Risk profile: ~low probability (~32% overhead)
	add('around', [
		{ description: 'Weekly standups & sprint planning', weeks: 0.5 },
	]);
	add('before', [
		{ description: 'Dev environment & repo setup', weeks: 0.5 },
		{ description: 'CI/CD pipeline & infrastructure', weeks: 0.5 },
	]);
	add('the-work', [
		{ description: 'Authentication & user accounts', weeks: 1.5 },
		{ description: 'Dashboard & data visualisation', weeks: 2 },
		{ description: 'Core API endpoints & business logic', weeks: 2 },
		{ description: 'Email notifications & async jobs', weeks: 0.5 },
		{ description: 'Unit & integration tests', weeks: 1 },
	]);
	add('between', [
		{ description: 'Bug fixes from internal review rounds', weeks: 0.5 },
	]);
	add('beyond', [
		{ description: 'Feature additions from stakeholder review', weeks: 0.5 },
	]);
	add('outside', [
		{ description: 'Contingency buffer', weeks: 0.5 },
	]);
	add('after', [
		{ description: 'Bug monitoring & patch releases', weeks: 0.25 },
	]);

	return cats;
}

function sampleFrontendProject(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	add('around', [
		{ description: 'Weekly standups & design reviews', weeks: 0.5 },
		{ description: 'Sprint planning & retrospectives', weeks: 0.5 },
		{ description: 'Stakeholder demos & feedback sessions', weeks: 0.25 }
	]);
	add('to-get', [
		{ description: 'Discovery call & UX requirements', weeks: 0.5 },
		{ description: 'Proposal, estimate & contract', weeks: 0.5 }
	]);
	add('before', [
		{ description: 'Design system & component library setup', weeks: 1 },
		{ description: 'Figma handoff & token extraction', weeks: 0.5 },
		{ description: 'Build tooling & CI pipeline', weeks: 0.5 }
	]);
	add('the-work', [
		{ description: 'Marketing / landing page', weeks: 1 },
		{ description: 'Product listing & search pages', weeks: 1.5 },
		{ description: 'Checkout & payment flow', weeks: 1.5 },
		{ description: 'Authentication & account pages', weeks: 1 },
		{ description: 'Responsive polish & accessibility audit', weeks: 1 },
		{ description: 'Animation & micro-interactions', weeks: 0.5 }
	]);
	add('between', [
		{ description: 'Cross-browser & device testing', weeks: 0.5 },
		{ description: 'Design feedback iterations', weeks: 0.5 },
		{ description: 'Performance & Lighthouse optimisation', weeks: 0.5 }
	]);
	add('beyond', [
		{ description: 'Additional pages from stakeholder feedback', weeks: 1 },
		{ description: 'Copy & asset updates after content review', weeks: 0.5 }
	]);
	add('outside', [
		{ description: 'API contract changes from backend team', weeks: 0.5 },
		{ description: 'Contingency buffer', weeks: 0.5 }
	]);
	add('after', [
		{ description: 'Dependency & framework upgrades', weeks: 0.25 },
		{ description: 'Bug triage & patch releases', weeks: 0.25 }
	]);

	return cats;
}

function sampleDataProject(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	// Complex data platform — heavy stakeholder overhead, lots of scope creep
	// Risk profile: ~high probability (~66% overhead)
	add('around', [
		{ description: 'Weekly stakeholder syncs & data demos', weeks: 0.75 },
		{ description: 'Sprint planning & retrospectives', weeks: 0.25 },
		{ description: 'Executive reporting & presentations', weeks: 0.5 },
		{ description: 'Data governance & sign-off meetings', weeks: 0.5 },
	]);
	add('to-get', [
		{ description: 'Data audit & requirements scoping', weeks: 1 },
		{ description: 'Proposal, estimate & contract', weeks: 0.5 },
	]);
	add('before', [
		{ description: 'Data warehouse & environment setup', weeks: 1 },
		{ description: 'Pipeline scaffolding & orchestration config', weeks: 0.5 },
		{ description: 'Access, credentials & source connections', weeks: 0.5 },
	]);
	add('the-work', [
		{ description: 'Ingestion & ETL pipelines', weeks: 2 },
		{ description: 'Data modelling & transformation layer', weeks: 1.5 },
		{ description: 'KPI definitions & metrics catalogue', weeks: 0.5 },
		{ description: 'Dashboard & reporting build', weeks: 1.5 },
		{ description: 'Data quality checks & alerting', weeks: 0.5 },
	]);
	add('between', [
		{ description: 'Data validation & reconciliation', weeks: 0.5 },
		{ description: 'Model tuning from stakeholder review', weeks: 0.5 },
		{ description: 'Query & pipeline performance optimisation', weeks: 0.5 },
	]);
	add('beyond', [
		{ description: 'Additional metrics & dimensions requested mid-project', weeks: 1.5 },
		{ description: 'New data source integrations added to scope', weeks: 0.5 },
		{ description: 'Dashboard redesign after stakeholder review', weeks: 0.5 },
	]);
	add('outside', [
		{ description: 'Upstream schema or API changes from source systems', weeks: 1 },
		{ description: 'Data quality issues in source data', weeks: 0.5 },
	]);
	add('after', [
		{ description: 'Pipeline monitoring & incident response', weeks: 0.5 },
		{ description: 'Schema migration & dependency upgrades', weeks: 0.25 },
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
	const { acq, prep, core, iter, chng, prbs, aftr, core_e, projectEnd, iter_e, chng_e, prbs_s, prbs_e, aftr_e, tMax } = timelinePositions(cats);
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
	push('around',   eff('around'), tMax,      'full project span',   'Admin & meetings run concurrently throughout — elapsed = entire project duration.');
	push('between',  iter, iter_e - (prep + core * 0.4), 'overlapping + 1.5w tail', 'Iteration begins ~40% into core work and runs 1.5w beyond the effort estimate.');
	push('beyond',   chng, chng_e - (prep + core * 0.55),'overlapping + 2w tail',   'Changes emerge ~55% into core and tend to run 2w beyond the effort estimate.');
	push('outside',  prbs, r(prbs_e - prbs_s), 'distributed (≈88%)', 'Surprises are distributed across ~88% of the project timeline — always spread out.');
	push('after',    aftr, aftr * 2,            '2:1 spread',          'Maintenance happens at a steady drip — effort spreads to roughly 2× calendar time.');

	return entries;

	function eff(id: string) { return cats.find((c) => c.id === id)?.items.reduce((s, i) => s + (i.weeks ?? 0), 0) ?? 0; }
}

// ── Unit system ────────────────────────────────────────────────────
export type Unit = 'weeks' | 'days' | 'months' | 'sprints';

// ── Risk assessment ────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export type RiskAssessment = {
	level: RiskLevel;
	/** % of total effort that is non-core (how much a core-only quote would miss) */
	underestimationPct: number;
	/** The top non-core categories by effort contribution, highest first */
	drivers: { name: string; subtitle: string; pct: number }[];
	/** One-sentence headline */
	headline: string;
	/** Full explanation of the score */
	explanation: string;
};

export function getRiskAssessment(categories: Category[]): RiskAssessment | null {
	const total = totalWeeks(categories);
	const core  = coreWeeks(categories);
	if (total < 0.5 || core <= 0) return null;

	const nonCore = total - core;
	const underestimationPct = Math.round((nonCore / total) * 100);

	const nonCoreCats = categories
		.filter((c) => !c.isCore && c.items.length > 0)
		.map((c) => ({
			name: c.name,
			subtitle: c.subtitle,
			weeks: c.items.reduce((s, i) => s + (i.weeks ?? 0), 0),
			pct: Math.round((c.items.reduce((s, i) => s + (i.weeks ?? 0), 0) / total) * 100),
		}))
		.filter((c) => c.weeks > 0)
		.sort((a, b) => b.weeks - a.weeks);

	const drivers = nonCoreCats.slice(0, 3).map(({ name, subtitle, pct }) => ({ name, subtitle, pct }));

	const topNames = drivers.map((d) => d.subtitle.toLowerCase()).join(', ');

	let level: RiskLevel;
	let headline: string;
	let explanation: string;

	if (underestimationPct < 35) {
		level = 'low';
		headline = 'Your estimate is highly accurate — very little hidden work found';
		explanation = `The non-core work${nonCoreCats.length > 0 ? ` (${topNames})` : ''} makes up only ${underestimationPct}% of the total. `
			+ `A core-only quote would have been close — but you've still captured the full picture here.`;
	} else if (underestimationPct < 60) {
		level = 'medium';
		headline = 'Solid catch — you\'ve surfaced work a core-only quote would have missed';
		explanation = `By accounting for the non-core effort, this estimate is ${underestimationPct}% more complete than a deliverable-only quote. `
			+ `The hidden work (${topNames}) represents real time that would have gone unquoted without this breakdown.`;
	} else {
		level = 'high';
		headline = 'Major accuracy win — the surrounding work is as large as the core itself';
		explanation = `A core-only quote would have captured only ${100 - underestimationPct}% of the actual effort. `
			+ `This estimate is ${underestimationPct}% more complete because it includes ${topNames} — `
			+ `work that almost always gets missed when quoting only the deliverable.`;
	}

	return { level, underestimationPct, drivers, headline, explanation };
}
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
