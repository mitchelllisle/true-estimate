export type Item = {
	id: string;
	description: string;
	notes: string;
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

export type Example = {
	label: string;
	note: string;
};

export type TeamExamples = {
	frontend: Example[];
	backend:  Example[];
	data:     Example[];
};

export const CATEGORY_EXAMPLES: Record<string, TeamExamples> = {
	'around': {
		frontend: [
			{ label: 'Weekly standups & design reviews', note: 'Regular team checkpoints to align on progress and review design decisions — small individually, but they add up across a multi-week project.' },
			{ label: 'Sprint planning & retrospectives', note: 'Time spent organising upcoming work and reflecting on what went well — typically 1–2 hours per week once you account for preparation.' },
			{ label: 'Stakeholder demos & feedback sessions', note: 'Showing progress to stakeholders and gathering structured feedback — these often run longer than planned and require preparation beforehand.' },
			{ label: 'Client status emails & progress updates', note: 'Written comms to keep clients informed — takes more time than expected when done properly with screenshots and context.' },
			{ label: 'QA walkthrough sessions', note: 'Guided reviews with QA or the client to walk through functionality — distinct from the actual testing work and often overlooked in estimates.' },
		],
		backend: [
			{ label: 'Weekly standups & sprint planning', note: 'Recurring team touchpoints for alignment — small individually but significant over a multi-week project when you account for prep and follow-up.' },
			{ label: 'Code review sessions', note: 'Reviewing pull requests, leaving comments, and following up on feedback — detailed reviews of complex logic can take hours per week.' },
			{ label: 'On-call rotation & incident response calls', note: 'If there is a live system, being on call and joining incident calls is real time that consistently gets overlooked in estimates.' },
			{ label: 'Architecture decision documentation', note: 'Writing up ADRs or design docs so decisions are recorded — often skipped under time pressure but valuable and more time-consuming than it looks.' },
			{ label: 'Team retrospectives', note: 'Post-sprint reflections and process discussions — easy to treat as zero when heads-down in the work, but they accumulate across a long project.' },
		],
		data: [
			{ label: 'Weekly stakeholder syncs & data demos', note: 'Data projects often have more stakeholders than expected — regular demos and check-ins are the norm, not the exception.' },
			{ label: 'Executive reporting & presentations', note: 'Summarising findings for senior audiences requires significant preparation and multiple rounds of iteration to get the story right.' },
			{ label: 'Data governance & sign-off meetings', note: 'Decisions about data ownership, access, and compliance need formal sign-off from multiple parties — these meetings are rarely quick.' },
			{ label: 'Sprint planning & retrospectives', note: 'Team organisation overhead that accumulates across the project even when estimating only the data work itself.' },
			{ label: 'Vendor / partner coordination calls', note: 'Coordinating with data providers, platform vendors, or downstream teams adds consistent overhead throughout the project lifecycle.' },
		],
	},
	'to-get': {
		frontend: [
			{ label: 'Discovery call & UX requirements gathering', note: 'Initial calls to understand what needs building — can take several sessions before scope is actually clear enough to estimate.' },
			{ label: 'Proposal, estimate & contract', note: 'Writing up the scope, creating the estimate, and negotiating terms — this work is not billable but takes real hours and influences the whole project.' },
			{ label: 'Mood board & design reference review', note: 'Aligning on visual direction before design begins — creating and reviewing reference material takes meaningful time up front.' },
			{ label: 'Design brief & scope alignment', note: 'Getting explicit sign-off on what is and is not in scope before work starts — saves disputes later but requires real upfront effort.' },
		],
		backend: [
			{ label: 'Technical scoping call', note: 'Mapping out system requirements and constraints in enough detail to price the work accurately — often takes more than one session.' },
			{ label: 'Proposal, estimate & contract', note: 'Writing up the technical spec, estimating it, and negotiating the contract — pre-project but real unbillable effort that shapes all subsequent decisions.' },
			{ label: 'Architecture spike & feasibility review', note: 'A brief investigation to confirm the chosen approach is viable before committing — avoids expensive surprises mid-project.' },
			{ label: 'RFP or tender response', note: 'A formal written response to a procurement process — can take several days of effort and may not be won.' },
		],
		data: [
			{ label: 'Data audit & requirements scoping', note: 'Reviewing what data exists, where it lives, and what shape it is in before writing a single line of pipeline code.' },
			{ label: 'Proposal, estimate & contract', note: 'Translating audit findings into a costed proposal — typically requires multiple revisions before sign-off, especially with complex requirements.' },
			{ label: 'Stakeholder interviews & KPI discovery', note: 'Understanding what metrics actually matter and to whom requires dedicated interview sessions — not a quick conversation.' },
			{ label: 'Data governance & compliance assessment', note: 'Understanding regulatory and access constraints before committing to an architecture — skipping this causes painful rework later.' },
		],
	},
	'before': {
		frontend: [
			{ label: 'Design system & component library setup', note: 'Establishing shared components and design tokens before building features — commonly underestimated and foundational to everything that follows.' },
			{ label: 'Figma handoff & design token extraction', note: 'Interpreting design files and converting them into usable CSS variables and component specs — takes longer than it looks, especially with complex designs.' },
			{ label: 'Build tooling & CI pipeline', note: 'Configuring bundlers, linters, formatters, and continuous integration — invisible to clients but genuine hours of setup work that pays off throughout the project.' },
			{ label: 'Routing & layout scaffolding', note: 'Setting up the initial route structure, layouts, and navigation shell before any real content goes in — the frame everything else hangs on.' },
			{ label: 'Auth integration scaffold', note: 'Wiring in authentication at the start of the project — even using an existing library requires real integration work and careful testing.' },
			{ label: 'Hiring & onboarding new team members', note: 'Recruiting, interviewing, and getting new people up to speed before productive output begins — easily two to four weeks of overhead per person joining the project.' },
		],
		backend: [
			{ label: 'Dev environment & repo setup', note: 'Getting the repo, local dev environment, and shared tooling working consistently for every team member — always takes longer than expected.' },
			{ label: 'CI/CD pipeline & infrastructure provisioning', note: 'Setting up automated testing, deployment pipelines, and cloud infrastructure — underestimated on almost every project and painful to retrofit later.' },
			{ label: 'Auth scaffolding & security baseline', note: 'Implementing authentication, authorisation, and baseline security controls before any feature work — the foundation everything else depends on.' },
			{ label: 'Database schema & migrations setup', note: 'Designing the initial schema and establishing a migrations workflow — decisions made here are hard and expensive to change later.' },
			{ label: 'Third-party API integration scaffolding', note: 'Creating the skeleton for external integrations — auth flows, retry logic, and error handling — before any domain logic goes on top.' },
			{ label: 'Hiring & onboarding new team members', note: 'Recruiting, interviewing, and getting new people up to speed before productive output begins — easily two to four weeks of overhead per person joining the project.' },
		],
		data: [
			{ label: 'Data warehouse & environment setup', note: 'Provisioning cloud data infrastructure, setting up dev/staging/prod environments, and establishing naming conventions — more involved than it sounds.' },
			{ label: 'Pipeline scaffolding & orchestration config', note: 'Configuring the orchestration system (e.g. Airflow, dbt) before any pipelines are written — substantial initial effort that shapes everything downstream.' },
			{ label: 'Access, credentials & source connections', note: 'Obtaining credentials and confirming connectivity to every data source — frequently blocked by other teams and takes longer than expected in practice.' },
			{ label: 'Data catalogue & schema documentation', note: 'Documenting what exists before building on top of it — frequently skipped under time pressure and consistently paid for later in confusion and rework.' },
			{ label: 'PII masking & security controls', note: 'Implementing anonymisation and access controls for sensitive data — a compliance requirement that needs to be planned from the start, not bolted on later.' },
			{ label: 'Hiring & onboarding new team members', note: 'Recruiting, interviewing, and getting new people up to speed before productive output begins — easily two to four weeks of overhead per person joining the project.' },
		],
	},
	'the-work': {
		frontend: [
			{ label: 'Core page & view builds', note: 'Building the primary screens of the application — usually what the client pictures when describing the work, and often a smaller share of total effort than expected.' },
			{ label: 'Component library implementation', note: 'Building reusable UI components to a shared design system — takes longer than ad-hoc implementation but saves significant time as the project scales.' },
			{ label: 'Responsive layout & breakpoints', note: 'Making layouts work correctly across mobile, tablet, and desktop — often treated as an afterthought but requiring real dedicated effort to get right.' },
			{ label: 'Form flows & validation', note: 'Multi-step forms, inline validation, error states, and submission handling — one of the most consistently underestimated parts of any UI.' },
			{ label: 'Accessibility audit & remediation', note: 'Testing with screen readers and keyboard navigation, then fixing the issues found — standard practice that is frequently missing from early estimates.' },
			{ label: 'Empty states, loading indicators & error pages', note: 'The UI states that appear when there is no data, something is loading, or an error occurs — users notice when these are missing.' },
			{ label: 'Animation & micro-interactions', note: 'Transitions, hover effects, and interactive feedback that make the interface feel polished — can double the time spent on individual UI elements.' },
		],
		backend: [
			{ label: 'Core API endpoints & business logic', note: 'The primary domain logic and HTTP/RPC endpoints — the piece most people estimate, though often only a fraction of total project effort.' },
			{ label: 'Authentication & user account management', note: 'Login, registration, password reset, sessions, and identity — complex enough to warrant its own estimate line on any serious project.' },
			{ label: 'Email notifications & async job queues', note: 'Transactional emails, background jobs, and retry logic — typically added late in projects and consistently underestimated.' },
			{ label: 'Admin panel & CRUD interfaces', note: 'Internal tooling for managing application data — often treated as trivial but requiring a full secondary interface to build correctly.' },
			{ label: 'Unit & integration test suite', note: 'Writing tests alongside the code — time is proportional to coverage goals and code complexity, and it compounds if deferred.' },
			{ label: 'API documentation', note: 'Writing and maintaining docs for API consumers — Swagger/OpenAPI setup plus prose documentation is more effort than it appears.' },
		],
		data: [
			{ label: 'Ingestion & ETL pipelines', note: 'Moving data from source systems into the data layer — each source has its own schema quirks, failure modes, and latency characteristics to handle.' },
			{ label: 'Data modelling & transformation layer', note: 'Designing the intermediate tables, views, or transforms that make raw data usable for reporting and analysis — this is where most of the real complexity lives.' },
			{ label: 'KPI definitions & metrics catalogue', note: 'Agreeing metric definitions with stakeholders and implementing grain-correct logic — deceptively time-consuming to get right and to get agreement on.' },
			{ label: 'Dashboard & reporting build', note: 'Assembling visualisations and reports from the verified data layer — layout, filtering, drill-down, and mobile considerations all add up.' },
			{ label: 'Data quality checks & alerting', note: 'Automated checks that catch bad data before it reaches dashboards — easy to skip during the initial build and painful to retrofit retroactively.' },
			{ label: 'Automated pipeline testing', note: 'Unit and integration tests for dbt models or pipeline steps — consistently absent from data project estimates and consistently regretted later.' },
		],
	},
	'between': {
		frontend: [
			{ label: 'Cross-browser & device testing', note: 'Verifying layout and behaviour across browsers and real devices — reveals edge cases that responsive mode in dev tools simply does not catch.' },
			{ label: 'Design feedback iterations', note: 'Implementing changes from design reviews — rarely one round; three or four iterations is common and should be assumed upfront on client projects.' },
			{ label: 'Performance & Lighthouse optimisation', note: 'Reducing bundle sizes, optimising images, and improving Core Web Vitals — requires a dedicated pass after the initial build, not just good intentions.' },
			{ label: 'Refactoring component structure', note: 'Cleaning up component abstractions that only became clear once the feature was built — worth doing before complexity compounds into future pain.' },
			{ label: 'Design drift reconciliation', note: 'Catching and correcting places where implementation has diverged from design intent as the project has grown — a pass that is easy to skip and always useful.' },
		],
		backend: [
			{ label: 'Bug fixes from internal review rounds', note: 'Issues surfaced during code review or staging testing — there are always more than expected once real usage and real data volumes begin.' },
			{ label: 'Performance profiling & query optimisation', note: 'Identifying and fixing slow queries and bottlenecks — this work is only possible once the system has realistic data volumes to test against.' },
			{ label: 'Refactoring for maintainability', note: 'Paying down technical debt before it makes future work significantly harder — easy to defer on a deadline, expensive to undo once compounded.' },
			{ label: 'Test coverage improvements', note: 'Filling gaps in test coverage after the initial build — especially important for edge cases, error paths, and recently refactored logic.' },
			{ label: 'Dependency updates mid-project', note: 'Keeping libraries current during a long project — security patches and breaking changes do not wait for a convenient moment.' },
		],
		data: [
			{ label: 'Data validation & reconciliation', note: 'Comparing pipeline outputs against source systems to verify correctness — requires multiple rounds across different data sources and takes real time.' },
			{ label: 'Model tuning from stakeholder review', note: 'Adjusting metric logic and definitions after stakeholders review the first outputs — always needed, rarely accounted for in the original estimate.' },
			{ label: 'Query & pipeline performance optimisation', note: 'Rewriting slow queries and reducing compute costs — this work only becomes meaningful once real data volumes are present in the environment.' },
			{ label: 'Data quality issue resolution', note: 'Investigating and fixing anomalies found during validation — can spiral into significant rework depending on the underlying quality of the source data.' },
			{ label: 'Schema evolution support', note: 'Handling changes to upstream data schemas mid-project — requires coordinated updates to pipelines, models, and their tests.' },
		],
	},
	'beyond': {
		frontend: [
			{ label: 'Additional pages from stakeholder feedback', note: 'New screens requested after seeing the first build — one of the most common sources of scope growth on client-facing projects.' },
			{ label: 'Copy & asset updates after content review', note: 'Final content rarely matches the placeholder copy — updating text and resizing assets takes real time, especially across many pages.' },
			{ label: 'New responsive breakpoints or device targets', note: 'Adding support for a screen size not in the original spec — can require significant layout rework if the design does not flex cleanly.' },
			{ label: 'Feature additions post-review', note: 'New functionality requested during review that feels small but accumulates — very common on client projects where the brief evolves through seeing working software.' },
			{ label: 'Brand refresh applied mid-project', note: 'If branding changes during the build, the reskin can touch every component — easily a week of work depending on how deeply design tokens are implemented.' },
		],
		backend: [
			{ label: 'Feature additions from stakeholder review', note: 'New requirements surfaced during demos that were not in the original spec — hard to refuse when the system is working and they seem reasonable.' },
			{ label: 'API contract changes requested late', note: 'Consumers of the API requesting changes to existing endpoints — especially disruptive after integration with other systems has already begun.' },
			{ label: 'New third-party integration added mid-scope', note: 'A new external service added to the requirements after kickoff — each integration carries its own unknown complexity and coordination overhead.' },
			{ label: 'Reporting or export features added', note: 'Data exports, scheduled reports, and analytics dashboards often get added once the core system is visible and stakeholders see what is possible.' },
			{ label: 'Role & permission model changes', note: 'Expanding or restructuring access control mid-project — touches every endpoint and typically requires new database migrations.' },
		],
		data: [
			{ label: 'Additional metrics & dimensions requested mid-project', note: 'New KPIs added after stakeholders see the first dashboard — the single most common source of scope creep in data projects.' },
			{ label: 'New data source integrations added to scope', note: 'Each additional source system brings its own schema, latency profile, data quality issues, and access coordination overhead.' },
			{ label: 'Dashboard redesign after stakeholder review', note: 'Visual and structural changes requested after stakeholders see the first version — this round of feedback is almost universal on data projects.' },
			{ label: 'Compliance requirements added post-kickoff', note: 'Legal or security requirements notified mid-project that require retroactive changes to the data architecture — timing and scope are both unpredictable.' },
			{ label: 'Historical data backfill requests', note: 'Loading historical data into new pipelines after they go live — often an order of magnitude more data than the ongoing incremental load.' },
		],
	},
	'outside': {
		frontend: [
			{ label: 'API contract changes from backend team', note: 'Breaking changes to APIs the frontend depends on — each one requires investigation, fixes, and a full retest of all affected user flows.' },
			{ label: 'Third-party library conflicts or breaking changes', note: 'A package update breaking something unexpected — diagnosing and resolving dependency conflicts is unpredictable and can consume a full day.' },
			{ label: 'Browser compatibility blockers', note: 'A CSS or JS behaviour that works everywhere except one target browser — can take a full day to diagnose and a few more to fix without introducing regressions.' },
			{ label: 'Unfamiliar technology requiring ramp-up time', note: 'Any tool, framework, or API not used before will take significantly longer than expected to learn and use correctly at production quality.' },
			{ label: 'CDN or hosting misconfiguration', note: 'Routing, caching, or CORS issues in production that do not surface in development — typically only discovered at go-live under real conditions.' },
		],
		backend: [
			{ label: 'Unexpected third-party API limitations', note: 'Rate limits, missing endpoints, or poor data quality in an API being integrated — common and almost impossible to predict accurately from documentation alone.' },
			{ label: 'Security vulnerability requiring urgent patching', note: 'A CVE in a dependency requiring an emergency update and re-test cycle — timing is unpredictable but the certainty of occurrence is high over time.' },
			{ label: 'Legacy system incompatibility surfaced late', note: 'An existing system that needs to integrate turns out to have undocumented constraints — often the single biggest cause of project overrun when it surfaces.' },
			{ label: 'Scaling issues discovered under load', note: 'Performance problems that only appear under realistic data volumes or concurrency — require profiling and potentially architectural changes to resolve.' },
			{ label: 'Unfamiliar technology requiring ramp-up time', note: 'A tool or framework in the stack not used before — being genuinely proficient takes significantly longer than reading the documentation suggests.' },
		],
		data: [
			{ label: 'Upstream schema or API changes from source systems', note: 'A source system changing its data format mid-project — all pipelines reading from it need to be updated, tested, and revalidated.' },
			{ label: 'Data quality issues in source data', note: 'Nulls, duplicates, encoding errors, or wrong values discovered in source data — fixing them requires investigation and often cross-team negotiation.' },
			{ label: 'Vendor API outages or rate-limit changes', note: 'External data sources going down or throttling requests — causes pipeline failures and requires engineering workarounds to maintain data freshness.' },
			{ label: 'Compliance audit triggering rework', note: 'A security or privacy review requiring retroactive architectural changes — both timing and scope of rework tend to be unpredictable.' },
			{ label: 'Unfamiliar tools requiring ramp-up time', note: 'Data tools not used before — Spark, dbt, Airflow, BigQuery — always take longer to learn correctly than documentation and tutorials suggest.' },
		],
	},
	'after': {
		frontend: [
			{ label: 'Dependency & framework upgrades', note: 'Keeping packages current to avoid accumulating security vulnerabilities and deprecation debt — becomes a recurring maintenance cost over time.' },
			{ label: 'Bug triage & patch releases', note: 'Investigating and fixing issues reported after go-live — there are always more than anticipated once real users are interacting with the product.' },
			{ label: 'Analytics & monitoring setup', note: 'Implementing error tracking, performance monitoring, and event analytics — often deferred until after launch and then left incomplete.' },
			{ label: 'CMS content & template maintenance', note: 'Updating content templates and editor configurations as the content team\'s needs evolve beyond what was set up at launch.' },
			{ label: 'A/B test tooling upkeep', note: 'Maintaining experimentation infrastructure, cleaning up concluded tests, and updating split logic as the product and team grow.' },
		],
		backend: [
			{ label: 'Bug monitoring & patch releases', note: 'Watching production logs and error trackers, triaging alerts, and releasing fixes — an ongoing operational cost that rarely gets estimated at project start.' },
			{ label: 'Security patching & CVE response', note: 'Responding to vulnerability disclosures in dependencies — unpredictable in timing but certain to happen over any sustained period of operation.' },
			{ label: 'Database maintenance & backups', note: 'Verifying backup integrity, running vacuums, and managing index bloat — easy to defer until it causes a production incident.' },
			{ label: 'Log monitoring & alerting tuning', note: 'Refining alert thresholds and dashboards to reduce noise and improve signal — requires real iteration once production traffic patterns are visible.' },
			{ label: 'Capacity scaling & cost review', note: 'Reviewing infrastructure costs and right-sizing resources as usage grows — important and almost never included in original project estimates.' },
		],
		data: [
			{ label: 'Pipeline monitoring & incident response', note: 'Watching pipeline health, investigating failures, and restoring data freshness — more time-consuming than expected once pipelines are running in production.' },
			{ label: 'Schema migration & dependency upgrades', note: 'Propagating upstream schema changes through all dependent models and pipelines — requires careful coordination and thorough testing.' },
			{ label: 'Dashboard refresh & new KPI additions', note: 'Adding new metrics and updating visualisations as the business\'s reporting needs continue to evolve after the initial launch.' },
			{ label: 'Data retention & compliance maintenance', note: 'Enforcing data retention policies, responding to subject access requests, and maintaining compliance documentation over time.' },
			{ label: 'Stakeholder training & documentation updates', note: 'Training data consumers to interpret dashboards correctly and keeping documentation current as metrics and business definitions change.' },
		],
	},
};

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
	const add = (id: string, items: { description: string; notes: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	// Internal product build — lean overhead, large focused core
	// Risk profile: ~low probability (~32% overhead)
	add('around', [
		{ description: 'Weekly standups & sprint planning', notes: 'Regular team checkpoints to align on progress, blockers and upcoming work.', weeks: 0.5 },
	]);
	add('before', [
		{ description: 'Dev environment & repo setup', notes: 'Configure local environments, repo structure, linting and dependency management.', weeks: 0.5 },
		{ description: 'CI/CD pipeline & infrastructure', notes: 'Automated build, test and deployment pipeline plus cloud infrastructure provisioning.', weeks: 0.5 },
	]);
	add('the-work', [
		{ description: 'Authentication & user accounts', notes: 'Login, signup, password reset, session management and role-based access control.', weeks: 1.5 },
		{ description: 'Dashboard & data visualisation', notes: 'Charts, tables and summary views pulling from the core API.', weeks: 2 },
		{ description: 'Core API endpoints & business logic', notes: 'RESTful or GraphQL endpoints for the application\'s primary data and business workflows.', weeks: 2 },
		{ description: 'Email notifications & async jobs', notes: 'Transactional emails, background task queue and scheduled job processing.', weeks: 0.5 },
		{ description: 'Unit & integration tests', notes: 'Test coverage for business logic, API contracts and critical user flows.', weeks: 1 },
	]);
	add('between', [
		{ description: 'Bug fixes from internal review rounds', notes: 'Issues surfaced by the team during QA and internal testing cycles.', weeks: 0.5 },
	]);
	add('beyond', [
		{ description: 'Feature additions from stakeholder review', notes: 'Extra functionality requested after seeing the first working version.', weeks: 0.5 },
	]);
	add('outside', [
		{ description: 'Contingency buffer', notes: 'Unplanned time absorbed by unexpected complexity or external dependencies.', weeks: 0.5 },
	]);
	add('after', [
		{ description: 'Bug monitoring & patch releases', notes: 'Post-launch issue tracking, hotfixes and minor releases.', weeks: 0.25 },
	]);

	return cats;
}

function sampleFrontendProject(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; notes: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	add('around', [
		{ description: 'Weekly standups & design reviews', notes: 'Team syncs and collaborative reviews of design progress with stakeholders.', weeks: 0.5 },
		{ description: 'Sprint planning & retrospectives', notes: 'Planning upcoming sprints and reflecting on what went well or needs improving.', weeks: 0.5 },
		{ description: 'Stakeholder demos & feedback sessions', notes: 'Showing progress to clients or product owners and gathering structured feedback.', weeks: 0.25 }
	]);
	add('to-get', [
		{ description: 'Discovery call & UX requirements', notes: 'Initial meeting to understand goals, users, constraints and core flows.', weeks: 0.5 },
		{ description: 'Proposal, estimate & contract', notes: 'Scoping document, time/cost breakdown and formal project agreement.', weeks: 0.5 }
	]);
	add('before', [
		{ description: 'Design system & component library setup', notes: 'Shared tokens, base components and style foundations to build from.', weeks: 1 },
		{ description: 'Figma handoff & token extraction', notes: 'Converting design files into developer-ready specs, colours, spacing and type styles.', weeks: 0.5 },
		{ description: 'Build tooling & CI pipeline', notes: 'Vite/webpack config, linting, testing setup and automated deployment.', weeks: 0.5 }
	]);
	add('the-work', [
		{ description: 'Marketing / landing page', notes: 'Conversion-focused page with hero, features and CTAs.', weeks: 1 },
		{ description: 'Product listing & search pages', notes: 'Filterable grid/list views with search, sorting and pagination.', weeks: 1.5 },
		{ description: 'Checkout & payment flow', notes: 'Multi-step checkout, cart management, Stripe or similar integration.', weeks: 1.5 },
		{ description: 'Authentication & account pages', notes: 'Sign-in, sign-up, forgot password and account management screens.', weeks: 1 },
		{ description: 'Responsive polish & accessibility audit', notes: 'Mobile-first layout fixes, WCAG compliance checks and keyboard navigation.', weeks: 1 },
		{ description: 'Animation & micro-interactions', notes: 'Transition polish, hover states and loading feedback for key interactions.', weeks: 0.5 }
	]);
	add('between', [
		{ description: 'Cross-browser & device testing', notes: 'Manual and automated QA across Chrome, Safari, Firefox and key screen sizes.', weeks: 0.5 },
		{ description: 'Design feedback iterations', notes: 'Revisions driven by designer or stakeholder review after seeing it in the browser.', weeks: 0.5 },
		{ description: 'Performance & Lighthouse optimisation', notes: 'Image optimisation, code splitting and Core Web Vitals improvements.', weeks: 0.5 }
	]);
	add('beyond', [
		{ description: 'Additional pages from stakeholder feedback', notes: 'Pages not in the original spec, requested after seeing the initial build.', weeks: 1 },
		{ description: 'Copy & asset updates after content review', notes: 'Late-stage text changes, image swaps and final brand polish.', weeks: 0.5 }
	]);
	add('outside', [
		{ description: 'API contract changes from backend team', notes: 'Refactoring required when backend endpoints change after frontend work has started.', weeks: 0.5 },
		{ description: 'Contingency buffer', notes: 'Unplanned time absorbed by unexpected complexity or external dependencies.', weeks: 0.5 }
	]);
	add('after', [
		{ description: 'Dependency & framework upgrades', notes: 'Keeping the codebase current with security patches and major version updates.', weeks: 0.25 },
		{ description: 'Bug triage & patch releases', notes: 'Post-launch issue tracking, hotfixes and minor releases.', weeks: 0.25 }
	]);

	return cats;
}

function sampleDataProject(): Category[] {
	const cats = initialCategories();
	const add = (id: string, items: { description: string; notes: string; weeks: number | null }[]) => {
		const cat = cats.find((c) => c.id === id)!;
		cat.items = items.map((i) => ({ ...i, id: crypto.randomUUID() }));
	};

	// Complex data platform — heavy stakeholder overhead, lots of scope creep
	// Risk profile: ~high probability (~66% overhead)
	add('around', [
		{ description: 'Weekly stakeholder syncs & data demos', notes: 'Regular showcases of pipeline outputs and dashboard progress for sign-off.', weeks: 0.75 },
		{ description: 'Sprint planning & retrospectives', notes: 'Planning work cycles and reviewing team performance and blockers.', weeks: 0.25 },
		{ description: 'Executive reporting & presentations', notes: 'Preparing status decks and business-level summaries for leadership.', weeks: 0.5 },
		{ description: 'Data governance & sign-off meetings', notes: 'Formal review of data definitions, access policies and compliance requirements.', weeks: 0.5 },
	]);
	add('to-get', [
		{ description: 'Data audit & requirements scoping', notes: 'Inventory of available data sources, quality assessment and metrics requirements.', weeks: 1 },
		{ description: 'Proposal, estimate & contract', notes: 'Scoping document, time/cost breakdown and formal project agreement.', weeks: 0.5 },
	]);
	add('before', [
		{ description: 'Data warehouse & environment setup', notes: 'Provisioning Snowflake/BigQuery/Redshift, environment configs and access controls.', weeks: 1 },
		{ description: 'Pipeline scaffolding & orchestration config', notes: 'Airflow/Prefect DAG structure, secrets management and scheduling config.', weeks: 0.5 },
		{ description: 'Access, credentials & source connections', notes: 'Obtaining and testing access to all upstream data systems and APIs.', weeks: 0.5 },
	]);
	add('the-work', [
		{ description: 'Ingestion & ETL pipelines', notes: 'Extracting data from source systems, transforming and loading to the warehouse.', weeks: 2 },
		{ description: 'Data modelling & transformation layer', notes: 'dbt models or equivalent: staging, intermediate and mart layers for clean, reliable data.', weeks: 1.5 },
		{ description: 'KPI definitions & metrics catalogue', notes: 'Agreeing on business metric definitions and documenting them in a shared catalogue.', weeks: 0.5 },
		{ description: 'Dashboard & reporting build', notes: 'Building Looker/Metabase/Tableau reports from the clean data layer.', weeks: 1.5 },
		{ description: 'Data quality checks & alerting', notes: 'Automated tests on key datasets with alerting for anomalies or failures.', weeks: 0.5 },
	]);
	add('between', [
		{ description: 'Data validation & reconciliation', notes: 'Cross-checking pipeline outputs against source systems and business expectations.', weeks: 0.5 },
		{ description: 'Model tuning from stakeholder review', notes: 'Revising metric logic and dimension structures after stakeholder review sessions.', weeks: 0.5 },
		{ description: 'Query & pipeline performance optimisation', notes: 'Reducing warehouse costs and query times through partitioning, clustering and query rewrites.', weeks: 0.5 },
	]);
	add('beyond', [
		{ description: 'Additional metrics & dimensions requested mid-project', notes: 'New measures and breakdowns added to scope after stakeholders see the initial dashboard.', weeks: 1.5 },
		{ description: 'New data source integrations added to scope', notes: 'Connecting additional systems not included in the original spec.', weeks: 0.5 },
		{ description: 'Dashboard redesign after stakeholder review', notes: 'Visual and structural changes to dashboards after business users test them.', weeks: 0.5 },
	]);
	add('outside', [
		{ description: 'Upstream schema or API changes from source systems', notes: 'Unexpected breaking changes in source data that require pipeline refactoring.', weeks: 1 },
		{ description: 'Data quality issues in source data', notes: 'Time spent investigating and working around dirty, inconsistent or missing data.', weeks: 0.5 },
	]);
	add('after', [
		{ description: 'Pipeline monitoring & incident response', notes: 'Ongoing health monitoring, alerting and fixing production pipeline failures.', weeks: 0.5 },
		{ description: 'Schema migration & dependency upgrades', notes: 'Handling upstream schema changes and keeping dbt/orchestration dependencies current.', weeks: 0.25 },
	]);

	return cats;
}

export function hiddenWeeks(categories: Category[]): number {
	return totalWeeks(categories) - coreWeeks(categories);
}

export type EmptyWarning = {
	id: string;
	name: string;
	subtitle: string;
	color: string;
	textColor: string;
};

/** Returns non-core categories with no items when core work has been entered */
export function getEmptyWarnings(categories: Category[]): EmptyWarning[] {
	if (coreWeeks(categories) <= 0) return [];
	return categories
		.filter((c) => !c.isCore && c.items.length === 0)
		.map((c) => ({ id: c.id, name: c.name, subtitle: c.subtitle, color: c.color, textColor: c.textColor }));
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
	if (total < 0.5 || core <= 0 || total === core) return null;

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
		headline = 'Looks like a fairly complete estimate — not much hidden work surfaced';
		explanation = `The non-core work${nonCoreCats.length > 0 ? ` (${topNames})` : ''} makes up around ${underestimationPct}% of the total. `
			+ `A core-only quote would likely have been close — though it's still worth having the full picture visible.`;
	} else if (underestimationPct < 60) {
		level = 'medium';
		headline = 'Some hidden work surfaced — a core-only quote would probably have missed this';
		explanation = `Accounting for the non-core effort makes this estimate roughly ${underestimationPct}% more complete than a deliverable-only quote. `
			+ `The hidden work (${topNames}) represents real time that can easily go unquoted without this kind of breakdown.`;
	} else {
		level = 'high';
		headline = 'The surrounding work rivals the core — this estimate captures far more than a deliverable-only quote would';
		explanation = `A core-only quote would likely have covered only around ${100 - underestimationPct}% of the actual effort. `
			+ `This estimate appears ${underestimationPct}% more complete because it includes ${topNames} — `
			+ `work that tends to get missed when quoting only the deliverable.`;
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
	const rows: string[] = ['Category,Subtitle,Item,Notes,Weeks'];
	for (const cat of categories) {
		for (const item of cat.items) {
			const weeks = item.weeks != null ? String(item.weeks) : '';
			const desc  = `"${item.description.replace(/"/g, '""')}"`;
			const notes = `"${(item.notes ?? '').replace(/"/g, '""')}"`;
			rows.push(`"${cat.name}",${cat.subtitle},${desc},${notes},${weeks}`);
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
	const colNotes    = header.indexOf('notes');
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
		const notesVal = (colNotes !== -1 ? cols[colNotes] : '')?.trim() ?? '';
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
			notes:       notesVal,
			weeks:       (weeks != null && !isNaN(weeks)) ? weeks : null,
		});
		imported++;
	}

	return { categories: result, errors, imported, skipped };
}
