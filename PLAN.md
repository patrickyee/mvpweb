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

Follow-up additions (built after the original scope above):

- After the draw, highlight the cards that form the winning hand with an annotation
  distinct from both hint and held styling.
- Hide the held annotation once the hand is revealed, so the winning highlight is the
  only signal during the evaluating phase.

Acceptance:

- Unit tests cover representative hands for every strategy priority.
- Hint mode marks only the recommended cards.
- Manual hold state remains user-controlled.
- Hint mode can be enabled/disabled without starting a new hand.
- Existing game logic and payouts are unchanged.
- The winning-hand cards are highlighted after a winning draw, distinct from hint and
  held styling.
- The held annotation is not shown during the evaluating phase.

Status: implemented in the current Vue codebase. The deterministic evaluator lives in
`src/game/strategy.ts` (`recommendHolds`), reusing `RANK_VALUES` and `evaluateHand`
and following the 16-row `strategyRows` priority order. A header hint toggle in
`App.vue` drives a `recommendedIds` computed that marks recommended cards in
`PlayingCard.vue` with a subtle blue corner dot plus an aria suffix, visually distinct
from the gold held state and never altering held state. The follow-up win highlight
adds `winningCardIds` in `src/game/handEvaluator.ts` (the scoring cards for the final
hand) and a `winningIds` computed in `App.vue`, active only in the evaluating phase on
a win; those cards get a green dashed ring in `PlayingCard.vue`, while the held
annotation is gated to the holding phase via a `showHeld` computed. The three
annotations never collide (hint only in holding, winning only in evaluating). Unit
tests cover a representative hand per priority and `winningCardIds` per rank
(`tests/strategy.test.ts`, `tests/game.test.ts`); App tests cover the hint toggle,
non-mutation of hold state, held-hidden-on-reveal, and win-group highlighting
(`tests/app.test.ts`).

A follow-up code review removed two pieces of dead/redundant code surfaced during the
Phase 8 work: `cardDisplay` in `src/game/deck.ts` and `HAND_RANK_LABELS` in
`src/game/types.ts` (the latter duplicated `messages.handRanks`).

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
- Add a new-game/reset control that restores credits and stats once credits are
  exhausted (carried over from review gap A). Auto play stops at zero credits, so
  without a reset the game dead-ends; the reset makes repeated auto-play sessions
  usable. Reuse `createInitialGameState()` in `src/game/gameState.ts`.
- Fix card accessibility labels so a revealed (non-holding) card no longer announces
  a "Hold {rank} of {suit}" action it cannot perform (carried over from review
  gap B). Announce a neutral name during the evaluating phase, keeping the
  "winning card" suffix when applicable. Change is scoped to `PlayingCard.vue`
  `actionLabel` plus a localized neutral-name key in `messages.ts`.

Acceptance:

- Auto play uses the same recommendation logic as hint mode.
- Credits ever played increments correctly for every auto-played hand.
- Auto play can be stopped by the user.
- Manual controls are not usable while auto play is running.
- A new-game/reset control restores play after credits run out (gap A).
- Revealed cards do not announce a hold action they cannot perform (gap B).
- Tests cover autoplay start, stop, stat updates, out-of-credits behavior, the
  reset control, and revealed-card accessibility labels.

Status: implemented. The loop lives in `src/composables/useAutoPlay.ts`
(`useAutoPlay(game)`), a timer over the game ref that applies `recommendHolds` via the
new `setHolds` in `gameState.ts`, draws, then deals the next hand, stopping when
credits fall below the bet. Auto play is a hidden mode: there is no visible toggle;
holding the Draw button for 3 seconds (`GameControls.vue` pointer long-press →
`requestAutoPlay`) opens a confirmation dialog in `App.vue`, and only on confirm does
it start. While running, `GameControls.vue` shows a Stop button, card and draw/next
interaction is disabled, and a speed slider under the cards picks 1x/10x/50x/100x
(`AUTO_PLAY_SPEEDS`; the tick delay is the base interval divided by the multiplier).
Gap A adds a New game reset (`handleNewGame` → `dealNewHand(createInitialGameState())`)
shown when credits run out. Credits ever played is tracked by the existing
`totalBets`/`handsPlayed` stats, which update live during auto play. Gap B moved card
labels to a neutral name (`cardName` i18n key) in the evaluating phase via a
`revealed` prop on `PlayingCard.vue`, keeping held visible during holding and the
winning suffix on reveal. Tests: `tests/autoPlay.test.ts` (loop, holds-before-draw,
speed multiplier, out-of-credits start refusal and mid-loop stop), `setHolds` in
`tests/game.test.ts`, and long-press/confirm/Stop/speed-slider/New game/neutral-label
coverage in `tests/app.test.ts`.

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

## Phase 11: Settings

Goal: let the player configure stakes and inspect the paytable. Take the payout
scaler out of the constant and expose it, expose the starting credits, and restart the
game whenever a setting changes.

- Store base (unscaled) payouts in `PAYOUTS` (`src/game/handEvaluator.ts`): royal 1500,
  straight flush 250, four of a kind 125, full house 30, flush 25, straight 20, three
  of a kind 15, two pair 10, jacks or better 5, high card 0. Remove `FACTOR`/`WAGER`.
- `payoutForHand(cards, wagerPerCard = 1)` returns `PAYOUTS[rank] * wagerPerCard`.
- Add a wager-per-card setting via a dropdown with options `0.25, 0.5, 1.0, 2.0, 5.0`.
  Carry `wagerPerCard` on the game state; the per-hand credit cost is
  `handWager(wagerPerCard) = wagerPerCard * HAND_SIZE` (default 0.25 → 1.25, preserving
  current behavior).
- Add a starting-credits setting via a dropdown with presets `50, 100, 200, 500, 1000`;
  `createInitialGameState(startingCredits?, wagerPerCard?)` seeds both.
- Every time a setting changes, restart the game (`stopAutoPlay()` then re-deal a fresh
  initial state); `dealNewHand`/`draw`/`useAutoPlay` read the wager from the state.
- Add a settings popup (⚙️ header button) holding the two dropdowns, following the
  existing overlay pattern.
- Add a pay-table popup (📋 header button) that displays the current paytable both as
  base payouts and scaled by the wager per card, reusing the strategy-table styling and
  `handRanks` labels.
- Localize all new controls and labels (English and Traditional Chinese).
- Reconcile `DESIGN.md` (add `wagerPerCard` to the state model; remove "Variable
  betting" from Out Of Scope; document settings and the pay table).

Acceptance:

- `PAYOUTS` holds base values; `payoutForHand` scales by the wager per card.
- Wager-per-card and starting-credits dropdowns work and restart the game on change.
- The pay-table popup shows base and at-current-wager payouts in both locales.
- Existing game behavior is unchanged at the default 0.25 wager per card.
- Tests cover base vs scaled payouts, the parameterized initial state and `handWager`,
  restart-on-change, and pay-table rendering.

Status: implemented. `PAYOUTS` (`src/game/handEvaluator.ts`) now holds base values and
`payoutForHand(cards, wagerPerCard)` scales them. The game state carries `wagerPerCard`
(`src/game/types.ts`); `gameState.ts` adds `DEFAULT_WAGER_PER_CARD`,
`DEFAULT_STARTING_CREDITS`, `WAGER_PER_CARD_OPTIONS`, `STARTING_CREDIT_OPTIONS`, a
`handWager(wagerPerCard) = wagerPerCard * HAND_SIZE` helper, and a parameterized
`createInitialGameState(startingCredits, wagerPerCard)`; `dealNewHand`/`draw` and
`useAutoPlay` read the wager from the state. `App.vue` holds `wagerPerCard`/
`startingCredits` refs and restarts the game via a `watch`; a ⚙️ settings popup holds
both dropdowns and a 📋 button opens `PayTable.vue` (base + at-current-wager columns).
i18n keys added in both locales; `DESIGN.md` reconciled (state model, Settings section,
Out Of Scope). Tests cover base/scaled payouts, `handWager`, parameterized state,
restart-on-change, and pay-table rendering.

## Phase 12: Updated Hint Mode

Goal: turn hint mode into a correctness check instead of an answer reveal. The blue
recommendation dots appear only once the player has selected exactly the optimal hold
set.

- When hint mode is on during the holding phase, compute the recommended holds and
  surface the dots only if the currently held cards exactly match that set (and the set
  is non-empty); otherwise show no dots.
- Dots disappear again if the selection changes away from the optimal holds.
- When the optimal play is to discard everything, there are no cards to mark, so no
  dots appear.
- Hints still never change held state, and toggling hint mode never deals a new hand.

Acceptance:

- Hint on with no or incorrect holds shows no dots.
- Dots appear only when the exact optimal holds are selected, and only on those cards.
- Existing game logic and payouts are unchanged.
- Tests cover the "no dots until correct, dots on match" behavior.

Status: planned.

## Hand-Off For Next Coding Agent Session

Current status:

- Phases 1 through 9 and Phase 11 (Settings) are implemented. Phase 10 is planned (blocked on card assets); Phase 12 (Updated Hint Mode) is planned.
- The app is a Vue 3 + TypeScript + Vite SPA using npm and Vitest.
- Core Jacks-or-Better game logic is implemented and covered by unit tests.
- The playable game UI is wired to the game-state functions.
- The strategy panel, responsive layout refinements, and accessibility polish are implemented.
- A follow-up UI refinement changed Help to a circular `?` control, moved strategy help into a dismissible overlay, removed the visible `Video Poker` title, locked cards to a `5:7` aspect ratio, and stabilized card keys to prevent hold-toggle reflow.
- A compact UI refinement balanced card typography with rank-only corners, rendered strategy guidance as a table, and tightened spacing for mobile landscape browsers.
- English and Traditional Chinese localization are implemented with a local i18n layer and segmented header language control.
- Phase 8 added a deterministic strategy engine (`src/game/strategy.ts`) and an optional hint mode toggled from the header; hints mark recommended cards without changing hold state.
- Phase 9 added an auto play loop (`src/composables/useAutoPlay.ts`) that plays strategy-optimal hands, hidden behind a 3-second long-press on Draw with a confirmation dialog, a 1x/10x/50x/100x speed slider shown while running, a New game reset for the out-of-credits case, and neutral accessibility labels for revealed cards.
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

- Phase 12 (Updated Hint Mode) — show recommendation dots only when the player selects
  the correct holds.
- Phase 10 (stats header and graphical card assets) remains blocked until a graphical
  card asset source is selected or provided.
