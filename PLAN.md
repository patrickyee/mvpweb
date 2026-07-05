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

## Phase 7: Internationalization

Goal: support English and Traditional Chinese without changing game logic.

- Add a lightweight local i18n layer.
- Support `en` and `zh-Hant`.
- Default to the browser language when Chinese is detected, otherwise English.
- Persist the selected locale in local storage.
- Localize visible UI text, result messages, card accessibility labels, hand-rank labels, and strategy table rows.
- Add a compact language selector to the game header.

Acceptance:

- English remains available and functional.
- Traditional Chinese can be selected without resetting the current hand or stats.
- The document language updates when the locale changes.
- Tests cover dictionary parity, interpolation, locale switching, and localized UI rendering.

Status: implemented in the current Vue UI.

## Phase 8: Strategy Engine And Hint Mode

Goal: compute the best hold choice for the current hand and surface it as optional guidance.

- Implement a deterministic Jacks-or-Better strategy evaluator.
- Return the card IDs that should be held for the current dealt hand.
- Match the existing strategy priority table as the source of truth.
- Add a hint mode toggle.
- When hint mode is enabled, subtly mark recommended held cards.
- Hints must not automatically change held state.
- Keep hint styling visually distinct from selected/held styling.
- Localize hint controls and accessibility labels.

Acceptance:

- Unit tests cover representative hands for every strategy priority.
- Hint mode marks only the recommended cards.
- Manual hold state remains user-controlled.
- Hint mode can be enabled/disabled without starting a new hand.
- Existing game logic and payouts are unchanged.

Status: planned.

## Phase 9: Auto Play Mode

Goal: let the app repeatedly play strategy-optimal hands and measure credits ever played.

- Add an auto play mode toggle/control.
- Auto play uses the Phase 8 strategy evaluator to choose holds.
- Auto play performs the best move, draws, evaluates, and starts the next hand.
- Track credits ever played continuously during auto play.
- Provide a clear stop/pause control.
- Disable conflicting manual actions while auto play is running.
- Keep the loop paced enough that UI updates remain visible and the browser stays responsive.
- Stop automatically when credits are insufficient for the next hand.
- Localize auto play controls and status text.

Acceptance:

- Auto play uses the same recommendation logic as hint mode.
- Credits ever played increments correctly for every auto-played hand.
- Auto play can be stopped by the user.
- Manual controls are not usable while auto play is running.
- Tests cover autoplay start, stop, stat updates, and out-of-credits behavior.

Status: planned.

## Phase 10: Stats Header And Graphical Card Assets

Goal: update the stat header and replace simple rendered cards after a suitable card asset set is selected.

- Replace the top-row win/lose result stat with credits ever played.
- Keep win/loss feedback in the lower result/control area only.
- Track credits ever played as total one-credit hands wagered.
- Replace simple CSS/HTML card rendering with graphical card-face assets supplied or approved by the user.
- Preserve the existing `5:7` card aspect ratio.
- Keep card accessibility labels and held state behavior.
- Keep English and Traditional Chinese UI strings complete.

Acceptance:

- Top stats show current credits, credits ever played, RTP, and hands.
- Result/win/loss is no longer duplicated in the top stat row.
- Cards display from graphical card assets while remaining buttons.
- Existing hold/draw/next-hand behavior is unchanged.
- Tests cover the new stat label/value and asset-backed card rendering.

Status: planned. Do not implement until the graphical card asset source is selected or provided.

## Hand-Off For Next Coding Agent Session

Current status:

- Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, and Phase 7 are implemented. Phases 8, 9, and 10 are planned.
- The app is a Vue 3 + TypeScript + Vite SPA using npm and Vitest.
- Core Jacks-or-Better game logic is implemented and covered by unit tests.
- The playable game UI is wired to the game-state functions.
- The strategy panel, responsive layout refinements, and accessibility polish are implemented.
- A follow-up UI refinement changed Help to a circular `?` control, moved strategy help into a dismissible overlay, removed the visible `Video Poker` title, locked cards to a `5:7` aspect ratio, and stabilized card keys to prevent hold-toggle reflow.
- A compact UI refinement balanced card typography with rank-only corners, rendered strategy guidance as a table, and tightened spacing for mobile landscape browsers.
- English and Traditional Chinese localization are implemented with a local i18n layer and segmented header language control.
- Final automated release-readiness checks pass.
- Cards use the simple CSS/HTML rank-corner and center-suit rendering until Phase 10 assets are selected.

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

- Start Phase 8 by implementing the deterministic strategy engine and hint mode.
