import { describe, expect, it } from 'vitest';
import { createCard, createDeck, dealCards } from '../src/game/deck';
import {
  calculateRtp,
  createInitialGameState,
  dealNewHand,
  DEFAULT_STARTING_CREDITS,
  DEFAULT_WAGER_PER_CARD,
  draw,
  handWager,
  nextHand,
  setHolds,
  toggleHold,
} from '../src/game/gameState';
import type { GameStateWithRtp } from '../src/game/gameState';
import { evaluateHand, payoutForHand, winningCardIds } from '../src/game/handEvaluator';
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
    [1500, [c('10', 'hearts'), c('jack', 'hearts'), c('queen', 'hearts'), c('king', 'hearts'), c('ace', 'hearts')]],
    [250, [c('5', 'spades'), c('6', 'spades'), c('7', 'spades'), c('8', 'spades'), c('9', 'spades')]],
    [125, [c('9', 'hearts'), c('9', 'diamonds'), c('9', 'clubs'), c('9', 'spades'), c('king', 'hearts')]],
    [30, [c('queen', 'hearts'), c('queen', 'diamonds'), c('queen', 'clubs'), c('4', 'spades'), c('4', 'hearts')]],
    [25, [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs'), c('king', 'clubs')]],
    [20, [c('6', 'hearts'), c('7', 'diamonds'), c('8', 'clubs'), c('9', 'spades'), c('10', 'hearts')]],
    [15, [c('3', 'hearts'), c('3', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')]],
    [10, [c('5', 'hearts'), c('5', 'diamonds'), c('jack', 'clubs'), c('jack', 'spades'), c('2', 'hearts')]],
    [5, [c('jack', 'hearts'), c('jack', 'diamonds'), c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')]],
    [0, [c('2', 'hearts'), c('5', 'diamonds'), c('8', 'clubs'), c('10', 'spades'), c('king', 'hearts')]],
  ])('returns base payout %d', (expected, hand) => {
    expect(payoutForHand(hand)).toBe(expected);
  });

  it('scales the payout by the wager per card', () => {
    const royal = [
      c('10', 'hearts'),
      c('jack', 'hearts'),
      c('queen', 'hearts'),
      c('king', 'hearts'),
      c('ace', 'hearts'),
    ];
    expect(payoutForHand(royal, 0.25)).toBe(375);
    expect(payoutForHand(royal, 2)).toBe(3000);
  });
});

describe('winning card ids', () => {
  function ids(cards: Card[]): string[] {
    return cards.map((card) => card.id).sort();
  }

  function sorted(hand: Card[]): string[] {
    return [...winningCardIds(hand)].sort();
  }

  it('returns the whole hand for straights, flushes, and full houses', () => {
    const straight = [c('6', 'hearts'), c('7', 'diamonds'), c('8', 'clubs'), c('9', 'spades'), c('10', 'hearts')];
    expect(sorted(straight)).toEqual(ids(straight));

    const flush = [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs'), c('king', 'clubs')];
    expect(sorted(flush)).toEqual(ids(flush));

    const fullHouse = [c('queen', 'hearts'), c('queen', 'diamonds'), c('queen', 'clubs'), c('4', 'spades'), c('4', 'hearts')];
    expect(sorted(fullHouse)).toEqual(ids(fullHouse));
  });

  it('returns only the matched ranks for quads, trips, two pair, and a high pair', () => {
    const quad = [c('9', 'hearts'), c('9', 'diamonds'), c('9', 'clubs'), c('9', 'spades')];
    expect(sorted([...quad, c('king', 'hearts')])).toEqual(ids(quad));

    const trips = [c('3', 'hearts'), c('3', 'diamonds'), c('3', 'clubs')];
    expect(sorted([...trips, c('8', 'spades'), c('king', 'hearts')])).toEqual(ids(trips));

    const twoPair = [c('5', 'hearts'), c('5', 'diamonds'), c('jack', 'clubs'), c('jack', 'spades')];
    expect(sorted([...twoPair, c('2', 'hearts')])).toEqual(ids(twoPair));

    const highPair = [c('jack', 'hearts'), c('jack', 'diamonds')];
    expect(sorted([...highPair, c('3', 'clubs'), c('8', 'spades'), c('king', 'hearts')])).toEqual(ids(highPair));
  });

  it('returns nothing for a low pair or a non-scoring high card', () => {
    const lowPair = [c('5', 'hearts'), c('5', 'diamonds'), c('2', 'clubs'), c('9', 'spades'), c('king', 'diamonds')];
    expect(winningCardIds(lowPair)).toEqual([]);

    const highCard = [c('2', 'hearts'), c('5', 'diamonds'), c('8', 'clubs'), c('10', 'spades'), c('king', 'hearts')];
    expect(winningCardIds(highCard)).toEqual([]);
  });
});

describe('setHolds', () => {
  const hand = [
    c('2', 'hearts'),
    c('5', 'diamonds'),
    c('8', 'clubs'),
    c('jack', 'spades'),
    c('king', 'hearts'),
  ];

  it('sets exactly the given cards as held during the holding phase', () => {
    const state: GameStateWithRtp = { ...createInitialGameState(), phase: 'holding', hand };
    const result = setHolds(state, [hand[0].id, hand[3].id]);

    expect(result.hand.map((card) => card.held)).toEqual([true, false, false, true, false]);
  });

  it('is a no-op outside the holding phase', () => {
    const state: GameStateWithRtp = { ...createInitialGameState(), phase: 'evaluating', hand };
    const result = setHolds(state, [hand[0].id]);

    expect(result.hand.some((card) => card.held)).toBe(false);
  });
});

describe('wager configuration', () => {
  it('computes the per-hand wager from the per-card stake', () => {
    expect(handWager(0.25)).toBe(1.25);
    expect(handWager(1)).toBe(5);
    expect(handWager(5)).toBe(25);
  });

  it('seeds starting credits and wager per card', () => {
    const state = createInitialGameState(500, 2);
    expect(state.credits).toBe(500);
    expect(state.wagerPerCard).toBe(2);
  });

  it('deducts and pays according to the configured wager per card', () => {
    const dealt = dealNewHand(createInitialGameState(200, 1), fixedRandom);
    expect(dealt.credits).toBe(195);
    expect(dealt.totalBets).toBe(5);

    const royal = [
      c('10', 'hearts'),
      c('jack', 'hearts'),
      c('queen', 'hearts'),
      c('king', 'hearts'),
      c('ace', 'hearts'),
    ];
    let held: GameStateWithRtp = { ...createInitialGameState(200, 1), deck: [], hand: royal };
    for (const card of royal) {
      held = toggleHold(held, card.id);
    }
    expect(draw(held).lastWin).toBe(1500);
  });
});

describe('game state', () => {
  it('starts a new hand by charging the wager and recording the bet', () => {
    const state = dealNewHand(createInitialGameState(), fixedRandom);

    expect(state.hand).toHaveLength(5);
    expect(state.deck).toHaveLength(47);
    expect(state.credits).toBe(DEFAULT_STARTING_CREDITS - handWager(DEFAULT_WAGER_PER_CARD));
    expect(state.totalBets).toBe(handWager(DEFAULT_WAGER_PER_CARD));
    expect(state.handsPlayed).toBe(1);
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

    expect(result.lastWin).toBe(375);
    expect(result.lastWinningHandRank).toBe('royalFlush');
    expect(result.credits).toBe(999 + 375);
    expect(result.totalWinnings).toBe(375);
    expect(result.rtp).toBe(37500);
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
  });

  it('tallies per-hand statistics across draws', () => {
    const base = createInitialGameState();
    expect(base.handStats.royalFlush).toEqual({ count: 0, payout: 0 });
    expect(base.handStats.highCard).toEqual({ count: 0, payout: 0 });

    const royal = [
      c('10', 'hearts'),
      c('jack', 'hearts'),
      c('queen', 'hearts'),
      c('king', 'hearts'),
      c('ace', 'hearts'),
    ];
    const loser = [
      c('2', 'hearts'),
      c('5', 'diamonds'),
      c('8', 'clubs'),
      c('10', 'spades'),
      c('king', 'hearts'),
    ];

    function playHeld(state: GameStateWithRtp, hand: Card[]): GameStateWithRtp {
      let held: GameStateWithRtp = { ...state, deck: [], hand, phase: 'holding' };
      for (const card of hand) {
        held = toggleHold(held, card.id);
      }
      return draw(held);
    }

    const afterWin = playHeld(base, royal);
    expect(afterWin.handStats.royalFlush).toEqual({ count: 1, payout: 375 });

    const afterLoss = playHeld({ ...afterWin, phase: 'evaluating' as const }, loser);
    expect(afterLoss.handStats.royalFlush).toEqual({ count: 1, payout: 375 });
    expect(afterLoss.handStats.highCard).toEqual({ count: 1, payout: 0 });

    const afterSecondWin = playHeld({ ...afterLoss, phase: 'evaluating' as const }, royal);
    expect(afterSecondWin.handStats.royalFlush).toEqual({ count: 2, payout: 750 });
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
    expect(result.credits).toBe(1001 - handWager(DEFAULT_WAGER_PER_CARD));
    expect(result.totalBets).toBe(1 + handWager(DEFAULT_WAGER_PER_CARD));
  });

  it('calculates RTP with and without bets', () => {
    expect(calculateRtp(0, 0)).toBe(0);
    expect(calculateRtp(3, 2)).toBe(150);
  });
});
