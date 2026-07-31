# Repository Guidelines

## Project Overview
This repo is a Uebersicht widget that renders a calendar/time chart. The entry point is `index.jsx`; the UI lives under `lib/` and pulls calendar data from `gcalcli` at runtime.

## Architecture & Data Flow
- `index.jsx` is the widget entry. It exports `render`, `className`, and `refreshFrequency = false`.
- `render()` shows `lib/components/error.jsx` when Uebersicht passes an error, otherwise it renders `lib/components/chart.jsx`.
- `lib/components/chart.jsx` owns the live clock state and the SVG bounding box measurement, then renders:
  - `lib/components/axis.jsx` for the time axis and grid lines
  - `lib/components/eventsList.jsx` for calendar event blocks
- `lib/components/eventsList.jsx` loads events once on mount, calls `lib/gcal.js:getRawEvents()`, then positions them with `lib/calendar-events-layout.js:layoutCalendarEvents()`.
- `lib/calendar-events-layout.js` is the main pure logic module: it validates input, groups overlaps into columns, and returns layout metadata (`x`, `width`, `column`, `columnSpan`, `columnCount`).
- Shared timing constants live in `lib/settings.js` and are used by both axis and event rendering.

## Key Directories
- `lib/components/` — SVG components and render logic.
- `lib/hooks/` — reusable hooks (`useBbox`, `useWindowSize`, `useInterval`).
- `lib/` — calendar integration, layout logic, and shared settings.
- Root `index.jsx` — Uebersicht widget entry.

## Development Commands
There are no repo-defined build or lint scripts.
- Install dependencies: `npm install`
- Test script: `npm test` exists but currently exits with `Error: no test specified`
- Runtime verification: reload the widget in Uebersicht after editing files under `index.jsx` or `lib/`

## Code Conventions & Common Patterns
- CommonJS package with JSX files: `package.json` sets `"type": "commonjs"` and `main: "index.jsx"`.
- Imports use double quotes and 2-space indentation.
- React comes from `uebersicht.React`, not a direct `react` import.
- Components are function components with local state via hooks; there is no global store.
- SVG drawing is imperative in `axis.jsx` and `eventsList.jsx` via `d3`/`d3fc` selections, `join`, and `call`.
- Async work is done in `useEffect` with cleanup where needed (`setInterval`, event listeners).
- Keep validation and failure modes explicit in pure modules; `layoutCalendarEvents()` throws `TypeError`/`RangeError` for invalid input.
- `settings.js` is the shared place for simple constants such as `timeBefore` and `timeAfter`.
- `lib/hooks/useWindowSize.js` and `lib/hooks/useInterval.js` are reusable utilities; prefer them over ad hoc copies if you need the same behavior.

## Important Files
- `index.jsx` — widget entry point.
- `lib/settings.js` — shared CSS/class and timing constants.
- `lib/gcal.js` — shells out to `/opt/homebrew/bin/gcalcli` and parses TSV event data.
- `lib/calendar-events-layout.js` — overlap packing and layout math.
- `lib/components/chart.jsx` — top-level SVG viewport, clock updates, and child composition.
- `lib/components/axis.jsx` — d3/d3fc axis and grid rendering.
- `lib/components/eventsList.jsx` — data fetch + event block rendering.
- `lib/components/error.jsx` — minimal fallback UI.

## Runtime/Tooling Preferences
- Node is pinned to `8` in `.nvmrc`; respect that unless you are intentionally modernizing the repo.
- npm is the expected package manager; `package-lock.json` is present and no Yarn/pnpm metadata is checked in.
- No bundler/tooling config is present at the root; the widget appears to be loaded directly by Uebersicht.
- Uebersicht provides React `16.13.1`; import React from `uebersicht` instead of adding a separate React dependency.
- `gcalcli` is an external runtime dependency for calendar data.

## Testing & QA
- There is no automated test suite in the repo today.
- `npm test` is only a placeholder and will fail by design.
- For behavior changes, manually verify the widget in Uebersicht, especially:
  - event fetching in `lib/gcal.js`
  - event packing in `lib/calendar-events-layout.js`
  - SVG rendering in `lib/components/chart.jsx`, `axis.jsx`, and `eventsList.jsx`
- If you add tests later, start with pure logic (`lib/calendar-events-layout.js`) and parser behavior (`lib/gcal.js`).