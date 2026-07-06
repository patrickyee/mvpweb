import { RANK_VALUES, type Card, type HandRank } from './types';

// Base (unscaled) paytable. Actual credits are these values times the wager per card.
export const PAYOUTS: Record<HandRank, number> = {
  royalFlush: 1500,
  straightFlush: 250,
  fourOfAKind: 125,
  fullHouse: 30,
  flush: 25,
  straight: 20,
  threeOfAKind: 15,
  twoPair: 10,
  jacksOrBetter: 5,
  highCard: 0,
};

// Paying hands, best first. Shared by payout/report UI so the rank order has one source.
export const PAYING_HAND_RANKS: readonly HandRank[] = [
  'royalFlush',
  'straightFlush',
  'fourOfAKind',
  'fullHouse',
  'flush',
  'straight',
  'threeOfAKind',
  'twoPair',
  'jacksOrBetter',
];

export function evaluateHand(cards: readonly Card[]): HandRank {
  if (cards.length !== 5) {
    return 'highCard';
  }

  const values = cards.map((card) => RANK_VALUES[card.rank]).sort((a, b) => b - a);
  const uniqueValues = [...new Set(values)];
  const counts = countRanks(values).sort((a, b) => b - a);
  const isFlush = new Set(cards.map((card) => card.suit)).size === 1;
  const isStraight = isStraightValues(uniqueValues);
  const isRoyal = isStraight && values[0] === 14 && values[1] === 13;

  if (isFlush && isRoyal) {
    return 'royalFlush';
  }

  if (isFlush && isStraight) {
    return 'straightFlush';
  }

  if (counts[0] === 4) {
    return 'fourOfAKind';
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return 'fullHouse';
  }

  if (isFlush) {
    return 'flush';
  }

  if (isStraight) {
    return 'straight';
  }

  if (counts[0] === 3) {
    return 'threeOfAKind';
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return 'twoPair';
  }

  if (counts[0] === 2 && hasJacksOrBetterPair(values)) {
    return 'jacksOrBetter';
  }

  return 'highCard';
}

export function payoutForHand(cards: readonly Card[], wagerPerCard = 1): number {
  return PAYOUTS[evaluateHand(cards)] * wagerPerCard;
}

const WHOLE_HAND_RANKS = new Set<HandRank>([
  'royalFlush',
  'straightFlush',
  'flush',
  'straight',
  'fullHouse',
]);

/**
 * Returns the ids of the cards that make up the scoring combination for the given
 * five-card hand: the whole hand for straights/flushes/full houses, the matched
 * ranks for quads/trips/pairs, and nothing for a non-scoring high card.
 */
export function winningCardIds(cards: readonly Card[]): string[] {
  const rank = evaluateHand(cards);

  if (rank === 'highCard') {
    return [];
  }

  if (WHOLE_HAND_RANKS.has(rank)) {
    return cards.map((card) => card.id);
  }

  const groups = new Map<number, Card[]>();
  for (const card of cards) {
    const value = RANK_VALUES[card.rank];
    groups.set(value, [...(groups.get(value) ?? []), card]);
  }

  const matched = (predicate: (group: Card[]) => boolean): string[] =>
    [...groups.values()].filter(predicate).flatMap((group) => group.map((card) => card.id));

  switch (rank) {
    case 'fourOfAKind':
      return matched((group) => group.length === 4);
    case 'threeOfAKind':
      return matched((group) => group.length === 3);
    case 'twoPair':
      return matched((group) => group.length === 2);
    case 'jacksOrBetter':
      return matched((group) => group.length === 2 && RANK_VALUES[group[0].rank] >= 11);
    default:
      return [];
  }
}

function countRanks(values: readonly number[]): number[] {
  const counts = new Map<number, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.values()];
}

function isStraightValues(uniqueValues: readonly number[]): boolean {
  if (uniqueValues.length !== 5) {
    return false;
  }

  const highStraight = uniqueValues.every((value, index) => {
    if (index === 0) {
      return true;
    }

    return uniqueValues[index - 1] - value === 1;
  });

  return highStraight || uniqueValues.join(',') === '14,5,4,3,2';
}

function hasJacksOrBetterPair(values: readonly number[]): boolean {
  const counts = new Map<number, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts].some(([value, count]) => count === 2 && value >= 11);
}
