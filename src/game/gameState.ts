import { createDeck, dealCards, shuffleDeck } from './deck';
import { evaluateHand, payoutForHand, WAGER } from './handEvaluator';
import type { Card, GameState } from './types';

export const STARTING_CREDITS = 100;
export const HAND_SIZE = 5;

export type RandomSource = () => number;

export interface GameStateWithRtp extends GameState {
  readonly rtp: number;
}

export function createInitialGameState(): GameStateWithRtp {
  return withRtp({
    deck: [],
    hand: [],
    credits: STARTING_CREDITS,
    phase: 'holding',
    lastWin: 0,
    lastWinningHandRank: null,
    handsPlayed: 0,
    totalBets: 0,
    totalWinnings: 0,
  });
}

export function dealNewHand(
  state: GameState,
  random: RandomSource = Math.random,
): GameStateWithRtp {
  if (state.credits < WAGER) {
    return withRtp(state);
  }

  const shuffledDeck = shuffleDeck(createDeck(), random);
  const deal = dealCards(shuffledDeck, HAND_SIZE);

  return withRtp({
    ...state,
    deck: deal.deck,
    hand: deal.hand,
    credits: state.credits - WAGER,
    phase: 'holding',
    lastWin: 0,
    lastWinningHandRank: null,
    handsPlayed: state.handsPlayed + 1,
    totalBets: state.totalBets + WAGER,
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
  const lastWin = payoutForHand(hand);

  return withRtp({
    ...state,
    deck,
    hand,
    credits: state.credits + lastWin,
    phase: 'evaluating',
    lastWin,
    lastWinningHandRank: lastWin > 0 ? handRank : null,
    totalWinnings: state.totalWinnings + lastWin,
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
