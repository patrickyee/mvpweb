import { describe, expect, it } from 'vitest';
import { createCard, createDeck, dealCards } from '../src/game/deck';
import {
  BET_SIZE,
  calculateRtp,
  createInitialGameState,
  dealNewHand,
  draw,
  nextHand,
  toggleHold,
} from '../src/game/gameState';
import type { GameStateWithRtp } from '../src/game/gameState';
import { evaluateHand, payoutForHand } from '../src/game/handEvaluator';
import type { Card, Rank, Suit } from '../src/game/types';

function c(rank: Rank, suit: Suit): Card {
  return createCard(rank, suit);
}

function fixedRandom(): number {
  return 0;
}

describe('deck utilities', () => {
  it('creates 52 unique cards', () => {
    const deck = createDeck();
    const ids = new Set(deck.map((card) => card.id));

    expect(deck).toHaveLength(52);
    expect(ids.size).toBe(52);
  });

  it('deals cards and consumes them from the deck', () => {
    const deck = createDeck();
    const result = dealCards(deck, 5);

    expect(result.hand).toHaveLength(5);
    expect(result.deck).toHaveLength(47);
    expect(result.hand.every((card) => card.held === false)).toBe(true);
  });
});

describe('hand evaluation', () => {
  it.each([
    [
      'royalFlush',
      [
        c('10', 'hearts'),
        c('jack', 'hearts'),
        c('queen', 'hearts'),
        c('king', 'hearts'),
        c('ace', 'hearts'),
      ],
    ],
    [
      'straightFlush',
      [c('5', 'spades'), c('6', 'spades'), c('7', 'spades'), c('8', 'spades'), c('9', 'spades')],
    ],
    [
      'fourOfAKind',
      [c('9', 'hearts'), c('9', 'diamonds'), c('9', 'clubs'), c('9', 'spades'), c('king', 'hearts')],
    ],
    [
      'fullHouse',
      [c('queen', 'hearts'), c('queen', 'diamonds'), c('queen', 'clubs'), c('4', 'spades'), c('4', 'hearts')],
    ],
    [
      'flush',
      [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs'), c('king', 'clubs')],
    ],
    [
      'straight',
      [c('6', 'hearts'), c('7', 'diamonds'), c('8', 'clubs'), c('9', 'spades'), c('10', 'hearts')],
    ],
    [
      'threeOfAKind',
      [c('3', 'hearts'), c('3', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')],
    ],
    [
      'twoPair',
      [c('5', 'hearts'), c('5', 'diamonds'), c('jack', 'clubs'), c('jack', 'spades'), c('2', 'hearts')],
    ],
    [
      'jacksOrBetter',
      [c('jack', 'hearts'), c('jack', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')],
    ],
    [
      'highCard',
      [c('2', 'hearts'), c('5', 'diamonds'), c('8', 'clubs'), c('10', 'spades'), c('king', 'hearts')],
    ],
  ] as const)('evaluates %s', (expected, hand) => {
    expect(evaluateHand(hand)).toBe(expected);
  });

  it('treats ace-low hands as straights', () => {
    expect(
      evaluateHand([c('ace', 'hearts'), c('2', 'diamonds'), c('3', 'clubs'), c('4', 'spades'), c('5', 'hearts')]),
    ).toBe('straight');
  });

  it('treats ace-low suited hands as straight flushes', () => {
    expect(
      evaluateHand([c('ace', 'clubs'), c('2', 'clubs'), c('3', 'clubs'), c('4', 'clubs'), c('5', 'clubs')]),
    ).toBe('straightFlush');
  });

  it('does not pay low pairs', () => {
    expect(
      evaluateHand([c('10', 'hearts'), c('10', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')]),
    ).toBe('highCard');
  });

  it.each(['jack', 'queen', 'king', 'ace'] as const)('pays a pair of %ss', (rank) => {
    expect(
      evaluateHand([c(rank, 'hearts'), c(rank, 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('10', 'hearts')]),
    ).toBe('jacksOrBetter');
  });
});

describe('payouts', () => {
  it.each([
    [800, [c('10', 'hearts'), c('jack', 'hearts'), c('queen', 'hearts'), c('king', 'hearts'), c('ace', 'hearts')]],
    [50, [c('5', 'spades'), c('6', 'spades'), c('7', 'spades'), c('8', 'spades'), c('9', 'spades')]],
    [25, [c('9', 'hearts'), c('9', 'diamonds'), c('9', 'clubs'), c('9', 'spades'), c('king', 'hearts')]],
    [9, [c('queen', 'hearts'), c('queen', 'diamonds'), c('queen', 'clubs'), c('4', 'spades'), c('4', 'hearts')]],
    [6, [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs'), c('king', 'clubs')]],
    [4, [c('6', 'hearts'), c('7', 'diamonds'), c('8', 'clubs'), c('9', 'spades'), c('10', 'hearts')]],
    [3, [c('3', 'hearts'), c('3', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')]],
    [2, [c('5', 'hearts'), c('5', 'diamonds'), c('jack', 'clubs'), c('jack', 'spades'), c('2', 'hearts')]],
    [1, [c('jack', 'hearts'), c('jack', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')]],
    [0, [c('2', 'hearts'), c('5', 'diamonds'), c('8', 'clubs'), c('10', 'spades'), c('king', 'hearts')]],
  ])('returns payout %i', (expected, hand) => {
    expect(payoutForHand(hand)).toBe(expected);
  });
});

describe('game state', () => {
  it('starts a new hand by charging one credit and recording the bet', () => {
    const state = dealNewHand(createInitialGameState(), fixedRandom);

    expect(state.hand).toHaveLength(5);
    expect(state.deck).toHaveLength(47);
    expect(state.credits).toBe(1000 - BET_SIZE);
    expect(state.totalBets).toBe(BET_SIZE);
    expect(state.phase).toBe('holding');
  });

  it('toggles hold only while holding', () => {
    const state = dealNewHand(createInitialGameState(), fixedRandom);
    const held = toggleHold(state, state.hand[0].id);
    const ignored = toggleHold({ ...held, phase: 'evaluating' }, state.hand[0].id);

    expect(held.hand[0].held).toBe(true);
    expect(ignored.hand[0].held).toBe(true);
  });

  it('draw replaces only unheld cards', () => {
    const initialState = dealNewHand(createInitialGameState(), fixedRandom);
    const heldCardId = initialState.hand[0].id;
    const state = toggleHold(initialState, heldCardId);
    const originalHeldCard = state.hand.find((card) => card.id === heldCardId);
    const result = draw(state);

    expect(result.hand).toHaveLength(5);
    expect(result.hand.find((card) => card.id === heldCardId)).toEqual(originalHeldCard);
    expect(result.hand.filter((card) => state.hand.some((oldCard) => oldCard.id === card.id))).toHaveLength(1);
    expect(result.deck).toHaveLength(43);
    expect(result.phase).toBe('evaluating');
  });

  it('updates stats for a winning draw', () => {
    const state: GameStateWithRtp = {
      ...createInitialGameState(),
      deck: [],
      hand: [
        c('10', 'hearts'),
        c('jack', 'hearts'),
        c('queen', 'hearts'),
        c('king', 'hearts'),
        c('ace', 'hearts'),
      ],
      credits: 999,
      totalBets: 1,
    };
    let heldState: GameStateWithRtp = state;
    for (const card of state.hand) {
      heldState = toggleHold(heldState, card.id);
    }
    const result = draw(heldState);

    expect(result.lastWin).toBe(800);
    expect(result.lastWinningHandRank).toBe('royalFlush');
    expect(result.credits).toBe(1799);
    expect(result.totalWinnings).toBe(800);
    expect(result.handsPlayed).toBe(1);
    expect(result.rtp).toBe(80000);
  });

  it('updates stats for a losing draw', () => {
    const state: GameStateWithRtp = {
      ...createInitialGameState(),
      deck: [],
      hand: [
        c('2', 'hearts'),
        c('5', 'diamonds'),
        c('8', 'clubs'),
        c('10', 'spades'),
        c('king', 'hearts'),
      ],
      credits: 999,
      totalBets: 1,
    };
    let heldState: GameStateWithRtp = state;
    for (const card of state.hand) {
      heldState = toggleHold(heldState, card.id);
    }
    const result = draw(heldState);

    expect(result.lastWin).toBe(0);
    expect(result.lastWinningHandRank).toBeNull();
    expect(result.credits).toBe(999);
    expect(result.totalWinnings).toBe(0);
    expect(result.handsPlayed).toBe(1);
  });

  it('starts the next hand after evaluation', () => {
    const state = {
      ...createInitialGameState(),
      phase: 'evaluating' as const,
      credits: 1001,
      lastWin: 2,
      lastWinningHandRank: 'twoPair' as const,
      totalBets: 1,
      totalWinnings: 2,
      handsPlayed: 1,
    };
    const result = nextHand(state, fixedRandom);

    expect(result.phase).toBe('holding');
    expect(result.hand).toHaveLength(5);
    expect(result.lastWin).toBe(0);
    expect(result.lastWinningHandRank).toBeNull();
    expect(result.credits).toBe(1000);
    expect(result.totalBets).toBe(2);
  });

  it('calculates RTP with and without bets', () => {
    expect(calculateRtp(0, 0)).toBe(0);
    expect(calculateRtp(3, 2)).toBe(150);
  });
});
