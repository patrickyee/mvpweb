import { describe, expect, it } from 'vitest';
import { createCard } from '../src/game/deck';
import { recommendHolds } from '../src/game/strategy';
import type { Card, Rank, Suit } from '../src/game/types';

function c(rank: Rank, suit: Suit): Card {
  return createCard(rank, suit);
}

// Compare regardless of order.
function holds(hand: Card[]): string[] {
  return [...recommendHolds(hand)].sort();
}

function idsOf(cards: Card[]): string[] {
  return cards.map((card) => card.id).sort();
}

describe('recommendHolds strategy priorities', () => {
  it('priority 1: holds all five of a straight/royal flush', () => {
    const royal = [c('10', 'hearts'), c('jack', 'hearts'), c('queen', 'hearts'), c('king', 'hearts'), c('ace', 'hearts')];
    expect(holds(royal)).toEqual(idsOf(royal));

    const straightFlush = [c('5', 'spades'), c('6', 'spades'), c('7', 'spades'), c('8', 'spades'), c('9', 'spades')];
    expect(holds(straightFlush)).toEqual(idsOf(straightFlush));
  });

  it('priority 1: holds only the quad, discarding the kicker', () => {
    const quad = [c('9', 'hearts'), c('9', 'diamonds'), c('9', 'clubs'), c('9', 'spades')];
    const hand = [...quad, c('king', 'hearts')];
    expect(holds(hand)).toEqual(idsOf(quad));
  });

  it('priority 2: holds four to a royal flush over a made pair', () => {
    const draw = [c('10', 'hearts'), c('jack', 'hearts'), c('queen', 'hearts'), c('king', 'hearts')];
    const hand = [...draw, c('3', 'spades')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 2: breaks a made flush to draw at a royal flush', () => {
    const draw = [c('10', 'hearts'), c('jack', 'hearts'), c('queen', 'hearts'), c('king', 'hearts')];
    const hand = [...draw, c('2', 'hearts')]; // flush, but four to a royal
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 3: holds all five of a made straight/flush/full house', () => {
    const fullHouse = [c('queen', 'hearts'), c('queen', 'diamonds'), c('queen', 'clubs'), c('4', 'spades'), c('4', 'hearts')];
    expect(holds(fullHouse)).toEqual(idsOf(fullHouse));

    const flush = [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs'), c('king', 'clubs')];
    expect(holds(flush)).toEqual(idsOf(flush));

    const straight = [c('6', 'hearts'), c('7', 'diamonds'), c('8', 'clubs'), c('9', 'spades'), c('10', 'hearts')];
    expect(holds(straight)).toEqual(idsOf(straight));
  });

  it('priority 3: holds only the trips of three of a kind', () => {
    const trips = [c('3', 'hearts'), c('3', 'diamonds'), c('3', 'clubs')];
    const hand = [...trips, c('8', 'spades'), c('king', 'hearts')];
    expect(holds(hand)).toEqual(idsOf(trips));
  });

  it('priority 4: holds four to a straight flush (outside and inside draws)', () => {
    const outside = [c('5', 'spades'), c('6', 'spades'), c('7', 'spades'), c('8', 'spades')];
    expect(holds([...outside, c('king', 'hearts')])).toEqual(idsOf(outside));

    const inside = [c('5', 'spades'), c('7', 'spades'), c('8', 'spades'), c('9', 'spades')];
    expect(holds([...inside, c('king', 'hearts')])).toEqual(idsOf(inside));
  });

  it('priority 5: holds both pairs of two pair', () => {
    const twoPair = [c('5', 'hearts'), c('5', 'diamonds'), c('jack', 'clubs'), c('jack', 'spades')];
    const hand = [...twoPair, c('2', 'hearts')];
    expect(holds(hand)).toEqual(idsOf(twoPair));
  });

  it('priority 6: holds a high pair', () => {
    const pair = [c('jack', 'hearts'), c('jack', 'diamonds')];
    const hand = [...pair, c('3', 'clubs'), c('7', 'spades'), c('9', 'diamonds')];
    expect(holds(hand)).toEqual(idsOf(pair));
  });

  it('priority 7: holds three to a royal flush', () => {
    const draw = [c('10', 'hearts'), c('queen', 'hearts'), c('ace', 'hearts')];
    const hand = [...draw, c('3', 'clubs'), c('7', 'spades')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 8: holds four to a flush', () => {
    const draw = [c('2', 'clubs'), c('5', 'clubs'), c('8', 'clubs'), c('jack', 'clubs')];
    const hand = [...draw, c('king', 'hearts')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 9: holds a low pair over high cards', () => {
    const pair = [c('5', 'hearts'), c('5', 'diamonds')];
    const hand = [...pair, c('2', 'clubs'), c('9', 'spades'), c('king', 'diamonds')];
    expect(holds(hand)).toEqual(idsOf(pair));
  });

  it('priority 10: holds four to an outside straight but not an inside straight', () => {
    const outside = [c('5', 'hearts'), c('6', 'diamonds'), c('7', 'clubs'), c('8', 'spades')];
    expect(holds([...outside, c('king', 'hearts')])).toEqual(idsOf(outside));

    // Gapped (inside) run is not an outside straight; falls through to the lone high card.
    const inside = [c('5', 'hearts'), c('6', 'diamonds'), c('7', 'clubs'), c('9', 'spades'), c('king', 'hearts')];
    expect(holds(inside)).toEqual([c('king', 'hearts').id]);
  });

  it('priority 11: holds two suited high cards', () => {
    const draw = [c('jack', 'hearts'), c('queen', 'hearts')];
    const hand = [...draw, c('3', 'clubs'), c('7', 'spades'), c('9', 'diamonds')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 12: holds three to a straight flush', () => {
    const draw = [c('4', 'spades'), c('5', 'spades'), c('6', 'spades')];
    const hand = [...draw, c('jack', 'hearts'), c('king', 'diamonds')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 13: holds the lowest two of unsuited high cards', () => {
    const hand = [c('jack', 'hearts'), c('queen', 'diamonds'), c('king', 'clubs'), c('3', 'spades'), c('7', 'hearts')];
    expect(holds(hand)).toEqual(idsOf([c('jack', 'hearts'), c('queen', 'diamonds')]));
  });

  it('priority 14: holds a suited ten with a high card', () => {
    const draw = [c('10', 'hearts'), c('king', 'hearts')];
    const hand = [...draw, c('3', 'clubs'), c('6', 'spades'), c('8', 'diamonds')];
    expect(holds(hand)).toEqual(idsOf(draw));
  });

  it('priority 15: holds a single high card', () => {
    const hand = [c('king', 'diamonds'), c('2', 'clubs'), c('5', 'spades'), c('8', 'hearts'), c('9', 'diamonds')];
    expect(holds(hand)).toEqual([c('king', 'diamonds').id]);
  });

  it('priority 16: discards everything when nothing is playable', () => {
    const hand = [c('3', 'clubs'), c('5', 'diamonds'), c('7', 'spades'), c('9', 'hearts'), c('2', 'diamonds')];
    expect(recommendHolds(hand)).toEqual([]);
  });
});

describe('recommendHolds contract', () => {
  it('is deterministic across repeated calls', () => {
    const hand = [c('jack', 'hearts'), c('queen', 'hearts'), c('3', 'clubs'), c('7', 'spades'), c('9', 'diamonds')];
    expect(recommendHolds(hand)).toEqual(recommendHolds(hand));
  });

  it('only ever returns ids that are present in the hand', () => {
    const hand = [c('5', 'hearts'), c('5', 'diamonds'), c('2', 'clubs'), c('9', 'spades'), c('king', 'diamonds')];
    const handIds = new Set(hand.map((card) => card.id));
    for (const id of recommendHolds(hand)) {
      expect(handIds.has(id)).toBe(true);
    }
  });

  it('returns nothing for an incomplete hand', () => {
    expect(recommendHolds([c('ace', 'hearts')])).toEqual([]);
  });
});
