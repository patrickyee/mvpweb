import { createDeck, dealCards, shuffleDeck } from './deck';
import { evaluateHand, payoutForHand } from './handEvaluator';
import { HAND_RANKS, type Card, type GameState, type HandStat, type HandRank } from './types';

function emptyHandStats(): Record<HandRank, HandStat> {
  return Object.fromEntries(HAND_RANKS.map((rank) => [rank, { count: 0, payout: 0 }])) as Record<
    HandRank,
    HandStat
  >;
}

export const HAND_SIZE = 5;
export const DEFAULT_STARTING_CREDITS = 100;
export const DEFAULT_WAGER_PER_CARD = 0.25;
export const WAGER_PER_CARD_OPTIONS = [0.25, 0.5, 1, 2, 5] as const;
export const STARTING_CREDIT_OPTIONS = [50, 100, 200, 500, 1000] as const;

export type RandomSource = () => number;

export interface GameStateWithRtp extends GameState {
  readonly rtp: number;
}

// Credits wagered per hand: the per-card stake across all five cards.
export function handWager(wagerPerCard: number): number {
  return wagerPerCard * HAND_SIZE;
}

export function createInitialGameState(
  startingCredits: number = DEFAULT_STARTING_CREDITS,
  wagerPerCard: number = DEFAULT_WAGER_PER_CARD,
): GameStateWithRtp {
  return withRtp({
    deck: [],
    hand: [],
    credits: startingCredits,
    phase: 'holding',
    lastWin: 0,
    lastWinningHandRank: null,
    handsPlayed: 0,
    totalBets: 0,
    totalWinnings: 0,
    wagerPerCard,
    handStats: emptyHandStats(),
  });
}

export function dealNewHand(
  state: GameState,
  random: RandomSource = Math.random,
): GameStateWithRtp {
  const wager = handWager(state.wagerPerCard);

  if (state.credits < wager) {
    return withRtp(state);
  }

  const shuffledDeck = shuffleDeck(createDeck(), random);
  const deal = dealCards(shuffledDeck, HAND_SIZE);

  return withRtp({
    ...state,
    deck: deal.deck,
    hand: deal.hand,
    credits: state.credits - wager,
    phase: 'holding',
    lastWin: 0,
    lastWinningHandRank: null,
    handsPlayed: state.handsPlayed + 1,
    totalBets: state.totalBets + wager,
  });
}

export function toggleHold(state: GameState, cardId: string): GameStateWithRtp {
  if (state.phase !== 'holding') {
    return withRtp(state);
  }

  return withRtp({
    ...state,
    hand: state.hand.map((card) =>
      card.id === cardId ? { ...card, held: !card.held } : card,
    ),
  });
}

export function setHolds(state: GameState, cardIds: readonly string[]): GameStateWithRtp {
  if (state.phase !== 'holding') {
    return withRtp(state);
  }

  const held = new Set(cardIds);

  return withRtp({
    ...state,
    hand: state.hand.map((card) => ({ ...card, held: held.has(card.id) })),
  });
}

export function draw(state: GameState): GameStateWithRtp {
  if (state.phase !== 'holding') {
    return withRtp(state);
  }

  let deck = [...state.deck];
  const hand: Card[] = state.hand.map((card) => {
    if (card.held) {
      return card;
    }

    const replacement = deck[0];
    deck = deck.slice(1);

    if (!replacement) {
      throw new Error('Cannot draw replacement card from an empty deck.');
    }

    return { ...replacement, held: false };
  });

  const handRank = evaluateHand(hand);
  const lastWin = payoutForHand(hand, state.wagerPerCard);

  return withRtp({
    ...state,
    deck,
    hand,
    credits: state.credits + lastWin,
    phase: 'evaluating',
    lastWin,
    lastWinningHandRank: lastWin > 0 ? handRank : null,
    totalWinnings: state.totalWinnings + lastWin,
    handStats: {
      ...state.handStats,
      [handRank]: {
        count: state.handStats[handRank].count + 1,
        payout: state.handStats[handRank].payout + lastWin,
      },
    },
  });
}

export function nextHand(
  state: GameState,
  random: RandomSource = Math.random,
): GameStateWithRtp {
  if (state.phase !== 'evaluating') {
    return withRtp(state);
  }

  return dealNewHand(
    {
      ...state,
      hand: [],
      lastWin: 0,
      lastWinningHandRank: null,
    },
    random,
  );
}

export function calculateRtp(totalWinnings: number, totalBets: number): number {
  if (totalBets <= 0) {
    return 0;
  }

  return (totalWinnings / totalBets) * 100;
}

function withRtp(state: GameState): GameStateWithRtp {
  return {
    ...state,
    rtp: calculateRtp(state.totalWinnings, state.totalBets),
  };
}
