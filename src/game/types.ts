export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'jack',
  'queen',
  'king',
  'ace',
] as const;
export type Rank = (typeof RANKS)[number];

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  jack: 11,
  queen: 12,
  king: 13,
  ace: 14,
};

export const RANK_LABELS: Record<Rank, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  jack: 'J',
  queen: 'Q',
  king: 'K',
  ace: 'A',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export interface Card {
  readonly id: string;
  readonly suit: Suit;
  readonly rank: Rank;
  readonly held: boolean;
}

export const HAND_RANKS = [
  'highCard',
  'jacksOrBetter',
  'twoPair',
  'threeOfAKind',
  'straight',
  'flush',
  'fullHouse',
  'fourOfAKind',
  'straightFlush',
  'royalFlush',
] as const;
export type HandRank = (typeof HAND_RANKS)[number];

export const HAND_RANK_LABELS: Record<HandRank, string> = {
  highCard: 'High Card',
  jacksOrBetter: 'Jacks or Better',
  twoPair: 'Two Pair',
  threeOfAKind: 'Three of a Kind',
  straight: 'Straight',
  flush: 'Flush',
  fullHouse: 'Full House',
  fourOfAKind: 'Four of a Kind',
  straightFlush: 'Straight Flush',
  royalFlush: 'Royal Flush',
};

export type GamePhase = 'holding' | 'evaluating';

export interface GameState {
  readonly deck: readonly Card[];
  readonly hand: readonly Card[];
  readonly credits: number;
  readonly phase: GamePhase;
  readonly lastWin: number;
  readonly lastWinningHandRank: HandRank | null;
  readonly handsPlayed: number;
  readonly totalBets: number;
  readonly totalWinnings: number;
}
