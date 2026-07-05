# PLAN.md

## Phase 1: Scaffold The Vue SPA

Goal: establish a minimal runnable Vue.js application.

- Create a Vue 3 + TypeScript + Vite app structure.
- Add npm scripts for development, build, type-checking, and tests.
- Create the initial app shell with no marketing page.
- Confirm the app runs locally.

Acceptance:

- `npm run dev` starts the SPA.
- The first route/screen is the game surface.
- No documentation files are added beyond `AGENTS.md`, `DESIGN.md`, and `PLAN.md`.

## Phase 2: Implement Core Game Logic

Goal: port the Swift MVP behavior into testable TypeScript.

- Define `Suit`, `Rank`, `Card`, `HandRank`, `GamePhase`, and statistics types.
- Implement 52-card deck creation.
- Implement shuffle and deal helpers.
- Implement Jacks-or-Better hand evaluation.
- Implement payouts.
- Implement fixed one-credit game state transitions.
- Decide and test ace-low straight handling.

Acceptance:

- Unit tests cover every payout rank.
- Unit tests cover low pair versus jacks-or-better.
- Unit tests cover deck uniqueness and draw replacement behavior.

Status: implemented in the current Vue/TypeScript codebase.

## Phase 3: Build Playable UI

Goal: make the game playable end to end in the browser.

- Render status: credits, RTP, last result, and hands played.
- Render five card buttons.
- Support hold/unhold interactions.
- Add `Draw` and `Next Hand` controls.
- Show winning hand names and loss state.
- Start with an initial hand on app load.

Acceptance:

- A user can play repeated hands without refreshing.
- Credits, winnings, hands, and RTP update correctly.
- Controls are only active in the correct phases.

Status: implemented in the current Vue UI.

## Phase 4: Add Strategy Panel And Responsive Layout

Goal: recreate the MVP help panel while making the SPA usable on common screen sizes.

- Add the collapsible strategy cheat sheet.
- Implement desktop side-panel layout.
- Implement mobile stacked or drawer-like layout.
- Make card sizing responsive without layout jumps.
- Add light and dark mode styling.

Acceptance:

- Strategy guidance can be shown and hidden.
- The game is usable on desktop and mobile widths.
- Text and controls do not overlap or overflow.

Status: implemented in the current Vue UI.

## Phase 5: Polish Interaction And Accessibility

Goal: make the game feel complete without expanding scope.

- Add short card transition animations.
- Add accessible labels and `aria-pressed` for held cards.
- Add polite result announcements.
- Ensure keyboard navigation works.
- Verify contrast for held, win, and loss states.

Acceptance:

- The game is playable with keyboard input.
- Held state is clear without relying only on color.
- Result changes are accessible to assistive technology.

Status: implemented in the current Vue UI.

## Phase 6: Verification And Release Readiness

Goal: stabilize the SPA for handoff.

- Run build, type-check, and tests.
- Manually verify repeated hands, all controls, responsive layouts, and dark mode.
- Update only these maintained docs if project reality changed.

Acceptance:

- Build succeeds.
- Tests pass.
- Manual verification notes are reflected in these three docs only when they affect future work.

Status: implemented. Final automated verification passes with `npm run type-check`, `npm run test`, and `npm run build`. Browser MCP verification covered Help/Hide, hold, draw, next-hand, strategy panel accessibility state, and console logs.

## Hand-Off For Next Coding Agent Session

Current status:

- Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, and Phase 6 are implemented.
- The app is a Vue 3 + TypeScript + Vite SPA using npm and Vitest.
- Core Jacks-or-Better game logic is implemented and covered by unit tests.
- The playable game UI is wired to the game-state functions.
- The strategy panel, responsive layout refinements, and accessibility polish are implemented.
- A follow-up UI refinement changed Help to a circular `?` control, moved strategy help into a dismissible overlay, removed the visible `Video Poker` title, locked cards to a `5:7` aspect ratio, and stabilized card keys to prevent hold-toggle reflow.
- A compact UI refinement balanced card typography with rank-only corners, rendered strategy guidance as a table, and tightened spacing for mobile landscape browsers.
- Final automated release-readiness checks pass.
- Cards are rendered from data and should remain CSS/HTML-based unless instructed otherwise.

Before starting new work, run:

- `npm install`
- `npm run type-check`
- `npm run test`
- `npm run build`

Authoritative docs:

- `AGENTS.md`
- `DESIGN.md`
- `PLAN.md`

Do not create additional documentation files unless explicitly instructed.

Next target:

- No planned phases remain. Future work should start from a new explicit request and update only these maintained docs when project direction changes.
