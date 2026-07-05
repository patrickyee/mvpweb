import { RANK_VALUES, type Card, type HandRank } from './types';

export const PAYOUTS: Record<HandRank, number> = {
  royalFlush: 800,
  straightFlush: 50,
  fourOfAKind: 25,
  fullHouse: 9,
  flush: 6,
  straight: 4,
  threeOfAKind: 3,
  twoPair: 2,
  jacksOrBetter: 1,
  highCard: 0,
};

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

export function payoutForHand(cards: readonly Card[], bet = 1): number {
  return PAYOUTS[evaluateHand(cards)] * bet;
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
