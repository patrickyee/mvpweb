# AGENTS.md

## Project Intent

Recreate the existing SwiftUI MVP as a Vue.js single-page application. The product is a focused Jacks-or-Better video poker game, not a casino platform, account system, or marketing site.

These are the only maintained project documents:

- `AGENTS.md`: contributor and agent ground rules.
- `DESIGN.md`: product, UX, visual, and game design.
- `PLAN.md`: phased implementation plan.

Do not add more documentation files unless explicitly instructed.

## Source Reference

The source game lives in `../MVP`. Read only the essential implementation files needed for the task:

- `MVP/Models/Card.swift`
- `MVP/Models/PokerHand.swift`
- `MVP/ViewModels/VideoPokerViewModel.swift`
- `MVP/ContentView.swift`
- `MVP/Views/CardView.swift`

Avoid copying Swift code directly. Translate the behavior, state model, and UI intent into idiomatic Vue and TypeScript.

## Technical Direction

- Build as a Vue.js SPA.
- Prefer Vue 3, TypeScript, Vite, and the Composition API unless the repo later establishes a different standard.
- Keep game logic framework-light and testable outside the component tree.
- Separate domain logic from presentation:
  - cards, deck, hand evaluation, payouts, and game phase transitions belong in plain TypeScript modules or composables;
  - components render state and emit user intent.
- Use deterministic tests for hand evaluation and payout rules.
- Do not introduce a backend unless explicitly requested.
- Do not add persistence, authentication, real-money wagering, ads, analytics, or multiplayer features unless explicitly requested.

## Game Rules To Preserve

- Start with `1000` credits.
- Use one 52-card deck with suits hearts, diamonds, clubs, and spades.
- Ranks run from `2` through ace.
- Each hand costs `1` credit.
- Deal five cards.
- Player may hold selected cards.
- Draw replaces unheld cards.
- Evaluate the final five-card hand.
- Track credits, last win, last winning hand name, hands played, total bets, total winnings, and RTP.
- RTP is `totalWinnings / totalBets * 100`, shown as `0` when no bets exist.
- After evaluation, the next hand immediately starts a fresh deal.

## Payout Table

Use Jacks-or-Better payouts for a one-credit bet:

| Hand | Payout |
| --- | ---: |
| Royal Flush | 800 |
| Straight Flush | 50 |
| Four of a Kind | 25 |
| Full House | 9 |
| Flush | 6 |
| Straight | 4 |
| Three of a Kind | 3 |
| Two Pair | 2 |
| Jacks or Better | 1 |
| High Card | 0 |

`Pair` means jacks or better only. Low pairs are not winning hands.

## Known Rule Gap

The Swift MVP checks straights by descending adjacent ranks only. During the Vue implementation, explicitly decide and test ace-low straight behavior. Unless instructed otherwise, support ace-low `A-2-3-4-5` as a straight because users expect standard poker evaluation.

## UI Ground Rules

- The first screen is the playable game, not a landing page.
- Keep the interface compact, direct, and game-focused.
- Preserve the core layout: status, five cards, hold selection, draw/next action, and a collapsible strategy cheat sheet.
- Make the game work well on desktop and mobile. The Swift source was landscape-oriented, but the web app must be responsive.
- Use semantic buttons and accessible labels for cards, hold state, and controls.
- Do not rely only on color to indicate held cards or win/loss state.
- Keep animations short and supportive; they must not block normal play.

## Code Quality Rules

- Keep changes scoped to the current phase in `PLAN.md`.
- Prefer small, named functions over inline conditional complexity in components.
- Use clear TypeScript types for `Suit`, `Rank`, `Card`, `HandRank`, `GamePhase`, and game statistics.
- Do not mutate shared constants such as rank or suit lists.
- Shuffle through a clear deck utility so tests can inject fixed decks or hands.
- Keep component state minimal; derived values should be computed.
- Avoid unrelated refactors.

## Testing Expectations

At minimum, cover:

- deck creation has 52 unique cards;
- dealing consumes five cards and one credit;
- hold/draw replaces only unheld cards;
- each payout hand evaluates correctly;
- low pair loses and jacks-or-better wins;
- RTP calculation handles zero bets and nonzero bets;
- next hand resets transient result state and begins a new deal.

## File Discipline

- Keep these three documents current when project direction changes.
- Do not create additional docs, notes, specs, or planning files without explicit instruction.
- Do not vendor generated assets or dependency output into the repo.
- Before broad edits, inspect existing files and follow established patterns.
- If the worktree later becomes a git repo, never overwrite unrelated user changes.
