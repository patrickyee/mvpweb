# DESIGN.md

## Product

This app is a Vue.js recreation of the SwiftUI MVP: a single-player Jacks-or-Better video poker SPA. The player starts with credits, plays one-credit hands, chooses which cards to hold, draws replacements, and sees the result, winnings, hand count, and RTP.

The app should feel like a clean utility game: fast to understand, quick to replay, and visually clear under repeated use.

## Core Game Loop

1. App loads and immediately deals a five-card hand.
2. One credit is deducted.
3. Player taps cards to hold or unhold them.
4. Player taps `Draw`.
5. Unheld cards are replaced from the current deck.
6. Final hand is evaluated.
7. Win or loss is displayed.
8. Player taps `Next Hand`, which starts another fresh deal.

The app does not need a separate betting screen for the recreated MVP because the original game auto-deals on launch and uses a fixed one-credit bet.

## State Model

Game state:

- `deck`: shuffled remaining cards.
- `hand`: five visible cards.
- `credits`: starts at the configured starting credits (default `100`).
- `phase`: `holding` or `evaluating` for the web MVP. A future implementation may keep `betting` and `dealing` internally if useful for transitions.
- `lastWin`: most recent payout amount.
- `lastWinningHandRank`: winning rank name or `null`.
- `handsPlayed`: hands dealt (counted when the wager is taken).
- `totalBets`: total credits wagered.
- `totalWinnings`: total credits won.
- `wagerPerCard`: the configurable per-card stake; the per-hand wager is `wagerPerCard * 5` and payouts scale by `wagerPerCard`.
- `handStats`: per-hand-rank tally of frequency and total payout for the session.
- `rtp`: derived percentage.

Card state:

- `suit`: hearts, diamonds, clubs, spades.
- `rank`: 2 through ace.
- `held`: boolean.
- stable display identity generated from rank and suit, not from random IDs.

## Hand Ranking

Evaluate final hands in this order:

1. Royal Flush
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. Jacks or Better
10. High Card

Display names:

- `Royal Flush`
- `Straight Flush`
- `Four of a Kind`
- `Full House`
- `Flush`
- `Straight`
- `Three of a Kind`
- `Two Pair`
- `Jacks or Better`
- `High Card`

## Strategy Cheat Sheet

Include a collapsible strategy panel with the source MVP guidance:

1. Four of a kind, straight flush, royal flush
2. 4 to a royal flush
3. Three of a kind, straight, flush, full house
4. 4 to a straight flush
5. Two pair
6. High pair
7. 3 to a royal flush
8. 4 to a flush
9. Low pair
10. 4 to an outside straight
11. 2 suited high cards
12. 3 to a straight flush
13. 2 unsuited high cards, choosing the lowest two when more than two are available
14. Suited 10/J, 10/Q, or 10/K
15. One high card
16. Discard everything

The cheat sheet is guidance only. It does not need to recommend moves automatically in the first implementation.

## Layout

Primary desktop layout:

- Top/status row: credits, RTP, last result, hands played.
- Center: five cards in a single row.
- Below cards: primary action button.
- Side panel: collapsible strategy cheat sheet.

Mobile layout:

- Status condenses into a compact grid.
- Cards stay visible without horizontal page scrolling where possible.
- Strategy panel opens below or as a drawer-like section.
- Controls remain reachable after selecting holds.

## Card Design

Cards should be readable and stable:

- Each card is a button whose face is a graphical SVG (Vector-Playing-Cards by
  Byron Knoll / notpeter, public domain; files `{RANK}{SUIT}.svg` under
  `src/assets/cards/`, mapped in `src/components/cardImages.ts`).
- Fixed `5:7` aspect ratio close to physical playing cards; the face image uses
  `object-fit: contain` and never resizes when toggled.
- State cues layer over the face rather than tinting it: held shows a solid gold ring
  plus a `Held` label, the winning group shows a dashed green ring, and a losing hand
  desaturates and dims all five faces.
- Card buttons must not resize when toggled.

## Visual Style

Use a restrained card-table direction without overdecorating:

- Neutral page background with a subtle table surface.
- White or near-white cards in light mode.
- Dark cards or dark table contrast in dark mode.
- Accent colors reserved for held cards, wins, losses, and the primary action.
- Avoid a one-color purple/blue gradient theme.

Rounded corners should stay modest, generally `8px` or less for panels and controls unless the card shape needs a slightly larger radius.

## Interaction

- Tapping a card toggles hold only during the holding phase.
- `Draw` is enabled only during the holding phase.
- `Next Hand` is enabled only after evaluation.
- Winning hands show an overlay or prominent result near the cards.
- Losing hands show a clear but quieter loss state.
- Animations may slide or fade cards during deal and replacement, but the game must remain responsive.

## Accessibility

- Each card is a button with an accessible name like `Hold ace of hearts` or `Release ace of hearts`.
- Held state uses `aria-pressed`.
- The result area should be announced politely after draw.
- Controls must be keyboard reachable.
- Color is never the only held/win/loss indicator.

## Settings

- A settings popup lets the player choose the wager per card (`0.25`, `0.5`, `1.0`,
  `2.0`, `5.0`) and the starting credits (`50`, `100`, `200`, `500`, `1000`).
- Changing either setting restarts the game with fresh credits and stats.
- A separate pay-table popup shows the base paytable and the payouts scaled by the
  current wager per card.

## Reporting

- A statistics popup shows a per-hand-rank tally — Hand, Frequency, Payout (with a
  total row) — for the winning hands played this session.
- It opens automatically when the game ends (credits run out) and whenever the player
  clicks the RTP stat.

## Out Of Scope

- Real-money gambling.
- Accounts or saved profiles (settings are not persisted across reloads).
- Leaderboards.
- Multiplayer.
- Backend services.
- Additional game variants.
