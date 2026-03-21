# TrueEstimate

> "The work is never just 'the work'"

A project estimation tool that helps you see the full cost of a project — not just the core execution work, but everything around it: acquisition, preparation, iteration, admin, surprises, and maintenance.

Built by [Mitchell Lisle](https://github.com/mitchelllisle) based on the framework described in ["The work is never just 'the work'"](https://davestewart.co.uk/blog/work/project-estimation/) by [Dave Stewart](https://davestewart.co.uk/).

---

## What it does

Most estimates only capture the visible work. TrueEstimate prompts you to break your project into 8 categories:

| Category | Description |
|---|---|
| **Acquisition** | Sourcing, access, licensing — work before the work begins |
| **Preparation** | Setup, onboarding, environment configuration |
| **Execution** | The actual work you'd normally estimate |
| **Admin** | Meetings, reviews, coordination — runs concurrent with everything |
| **Iteration** | Feedback cycles and revisions |
| **Changes** | Scope changes and pivots |
| **Surprises** | Bugs, blockers, unexpected problems |
| **Maintenance & Ops** | Support and upkeep after delivery |

Enter effort hours (or days/weeks) for each item and the breakdown shows:
- Total effort across all categories
- Estimated **calendar time** (accounting for concurrency and spreading)
- A visual Gantt-style timeline
- Methodology transparency — exactly how each calendar estimate is calculated

## Features

- Enter estimates in hours, days, or weeks
- Load a sample project to explore the model
- Import/export via CSV
- Full breakdown modal with Gantt timeline and elapsed-time methodology
- Dark mode
- Privacy-first: nothing is stored, sent, or collected — all data lives in your browser

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Tests

```sh
npm test
```
