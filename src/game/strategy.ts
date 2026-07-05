import { RANK_VALUES, type Card, type Suit } from './types';
import { evaluateHand } from './handEvaluator';

// Deterministic Jacks-or-Better hold strategy. The ordered priority list below is
// the source of truth mirrored by `messages.strategyRows` and DESIGN.md. The engine
// walks the priorities top-to-bottom and returns the ids of the first matching hold.

const ROYAL_VALUES = new Set([10, 11, 12, 13, 14]);
const HIGH_CARD_MIN = 11; // jack or better

// Every valid five-card straight as a value set, including the ace-low wheel.
const STRAIGHTS: ReadonlySet<number>[] = [new Set([14, 2, 3, 4, 5])];
for (let high = 6; high <= 14; high += 1) {
  STRAIGHTS.push(new Set([high, high - 1, high - 2, high - 3, high - 4]));
}

function val(card: Card): number {
  return RANK_VALUES[card.rank];
}

function ids(cards: readonly Card[]): string[] {
  return cards.map((card) => card.id);
}

function sumValues(cards: readonly Card[]): number {
  return cards.reduce((total, card) => total + val(card), 0);
}

function groupBySuit(cards: readonly Card[]): Map<Suit, Card[]> {
  const groups = new Map<Suit, Card[]>();
  for (const card of cards) {
    const group = groups.get(card.suit) ?? [];
    group.push(card);
    groups.set(card.suit, group);
  }
  return groups;
}

function groupByValue(cards: readonly Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>();
  for (const card of cards) {
    const group = groups.get(val(card)) ?? [];
    group.push(card);
    groups.set(val(card), group);
  }
  return groups;
}

function valueGroupOfSize(cards: readonly Card[], size: number): Card[] | null {
  for (const group of groupByValue(cards).values()) {
    if (group.length === size) {
      return group;
    }
  }
  return null;
}

// How many distinct valid straights contain all of these (distinct) values.
// 2 => open-ended (outside) draw, 1 => inside/one-way draw.
function straightsContaining(values: readonly number[]): number {
  const unique = [...new Set(values)];
  return STRAIGHTS.filter((straight) => unique.every((value) => straight.has(value))).length;
}

// All four-card subsets of a five-card hand, in a stable order.
function fourCardSubsets(cards: readonly Card[]): Card[][] {
  return cards.map((_, index) => cards.filter((__, other) => other !== index));
}

// Priority 1: four of a kind, straight flush, royal flush.
function madeTopHand(cards: readonly Card[]): Card[] | null {
  const rank = evaluateHand(cards);
  if (rank === 'royalFlush' || rank === 'straightFlush') {
    return [...cards];
  }
  if (rank === 'fourOfAKind') {
    return valueGroupOfSize(cards, 4);
  }
  return null;
}

// Priority 2: four to a royal flush.
function fourToRoyalFlush(cards: readonly Card[]): Card[] | null {
  for (const group of groupBySuit(cards).values()) {
    const royal = group.filter((card) => ROYAL_VALUES.has(val(card)));
    if (royal.length === 4) {
      return royal;
    }
  }
  return null;
}

// Priority 3: three of a kind, straight, flush, full house.
function madeMidHand(cards: readonly Card[]): Card[] | null {
  const rank = evaluateHand(cards);
  if (rank === 'fullHouse' || rank === 'flush' || rank === 'straight') {
    return [...cards];
  }
  if (rank === 'threeOfAKind') {
    return valueGroupOfSize(cards, 3);
  }
  return null;
}

// Priority 4: four to a straight flush (any four suited cards that fit a straight).
function fourToStraightFlush(cards: readonly Card[]): Card[] | null {
  for (const group of groupBySuit(cards).values()) {
    if (group.length === 4 && straightsContaining(group.map(val)) >= 1) {
      return group;
    }
  }
  return null;
}

// Priority 5: two pair.
function twoPair(cards: readonly Card[]): Card[] | null {
  const pairs = [...groupByValue(cards).values()].filter((group) => group.length === 2);
  return pairs.length === 2 ? pairs.flat() : null;
}

// Priority 6: high pair (jacks or better).
function highPair(cards: readonly Card[]): Card[] | null {
  for (const group of groupByValue(cards).values()) {
    if (group.length === 2 && val(group[0]) >= HIGH_CARD_MIN) {
      return group;
    }
  }
  return null;
}

// Priority 7: three to a royal flush.
function threeToRoyalFlush(cards: readonly Card[]): Card[] | null {
  for (const group of groupBySuit(cards).values()) {
    const royal = group.filter((card) => ROYAL_VALUES.has(val(card)));
    if (royal.length === 3) {
      return royal;
    }
  }
  return null;
}

// Priority 8: four to a flush.
function fourToFlush(cards: readonly Card[]): Card[] | null {
  for (const group of groupBySuit(cards).values()) {
    if (group.length === 4) {
      return group;
    }
  }
  return null;
}

// Priority 9: low pair (twos through tens).
function lowPair(cards: readonly Card[]): Card[] | null {
  for (const group of groupByValue(cards).values()) {
    if (group.length === 2 && val(group[0]) < HIGH_CARD_MIN) {
      return group;
    }
  }
  return null;
}

// Priority 10: four to an outside (open-ended) straight.
function fourToOutsideStraight(cards: readonly Card[]): Card[] | null {
  for (const subset of fourCardSubsets(cards)) {
    const values = subset.map(val);
    if (new Set(values).size === 4 && straightsContaining(values) === 2) {
      return subset;
    }
  }
  return null;
}

// Priority 11: two suited high cards (prefer the lowest such pair).
function twoSuitedHighCards(cards: readonly Card[]): Card[] | null {
  let best: Card[] | null = null;
  for (const group of groupBySuit(cards).values()) {
    const high = group.filter((card) => val(card) >= HIGH_CARD_MIN);
    if (high.length === 2 && (best === null || sumValues(high) < sumValues(best))) {
      best = high;
    }
  }
  return best;
}

// Priority 12: three to a straight flush.
function threeToStraightFlush(cards: readonly Card[]): Card[] | null {
  for (const group of groupBySuit(cards).values()) {
    if (group.length === 3 && straightsContaining(group.map(val)) >= 1) {
      return group;
    }
  }
  return null;
}

// Priority 13: two unsuited high cards (keep the lowest two when more than two).
function twoHighCards(cards: readonly Card[]): Card[] | null {
  const high = cards.filter((card) => val(card) >= HIGH_CARD_MIN).sort((a, b) => val(a) - val(b));
  return high.length >= 2 ? high.slice(0, 2) : null;
}

// Priority 14: suited 10 with a jack, queen, or king (prefer 10/J).
function suitedTenAndHighCard(cards: readonly Card[]): Card[] | null {
  let best: Card[] | null = null;
  for (const group of groupBySuit(cards).values()) {
    const ten = group.find((card) => val(card) === 10);
    if (!ten) {
      continue;
    }
    const partners = group
      .filter((card) => val(card) >= 11 && val(card) <= 13)
      .sort((a, b) => val(a) - val(b));
    if (partners.length > 0 && (best === null || val(partners[0]) < val(best[1]))) {
      best = [ten, partners[0]];
    }
  }
  return best;
}

// Priority 15: one high card (the lowest one).
function oneHighCard(cards: readonly Card[]): Card[] | null {
  const high = cards.filter((card) => val(card) >= HIGH_CARD_MIN).sort((a, b) => val(a) - val(b));
  return high.length >= 1 ? [high[0]] : null;
}

const STRATEGY: ReadonlyArray<(cards: readonly Card[]) => Card[] | null> = [
  madeTopHand,
  fourToRoyalFlush,
  madeMidHand,
  fourToStraightFlush,
  twoPair,
  highPair,
  threeToRoyalFlush,
  fourToFlush,
  lowPair,
  fourToOutsideStraight,
  twoSuitedHighCards,
  threeToStraightFlush,
  twoHighCards,
  suitedTenAndHighCard,
  oneHighCard,
];

/**
 * Returns the ids of the cards that should be held for the given five-card hand,
 * following the Jacks-or-Better strategy priority table. Returns an empty array
 * when the best play is to discard everything (priority 16).
 */
export function recommendHolds(cards: readonly Card[]): string[] {
  if (cards.length !== 5) {
    return [];
  }
  for (const detector of STRATEGY) {
    const held = detector(cards);
    if (held) {
      return ids(held);
    }
  }
  return [];
}
