import { RANK_LABELS, RANKS, SUIT_SYMBOLS, SUITS, type Card } from './types';

export function createCard(rank: Card['rank'], suit: Card['suit'], held = false): Card {
  return {
    id: `${rank}-of-${suit}`,
    rank,
    suit,
    held,
  };
}

export function cardDisplay(card: Card): string {
  return `${RANK_LABELS[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => createCard(rank, suit)));
}

export function shuffleDeck(deck: readonly Card[], random = Math.random): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function dealCards(deck: readonly Card[], count: number): { hand: Card[]; deck: Card[] } {
  if (count < 0) {
    throw new Error('Cannot deal a negative number of cards.');
  }

  if (deck.length < count) {
    throw new Error(`Cannot deal ${count} cards from a deck with ${deck.length} cards.`);
  }

  return {
    hand: deck.slice(0, count).map((card) => ({ ...card, held: false })),
    deck: deck.slice(count),
  };
}
