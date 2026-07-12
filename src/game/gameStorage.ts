import { calculateRtp, type GameStateWithRtp } from './gameState';
import { HAND_RANKS, RANKS, SUITS, type GameState } from './types';

export const GAME_STORAGE_KEY = 'jacks-or-better.game.v1';

interface StoredGame {
  readonly game: GameState;
  readonly startingCredits: number;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function isStoredGame(value: unknown): value is StoredGame {
  if (!value || typeof value !== 'object') return false;
  const stored = value as Partial<StoredGame>;
  const game = stored.game as Partial<GameState> | undefined;
  if (!game || typeof stored.startingCredits !== 'number') return false;

  const cards = [...(Array.isArray(game.deck) ? game.deck : []), ...(Array.isArray(game.hand) ? game.hand : [])];
  const validCards = cards.every(
    (card) =>
      card &&
      typeof card.id === 'string' &&
      SUITS.includes(card.suit) &&
      RANKS.includes(card.rank) &&
      typeof card.held === 'boolean',
  );
  const stats = game.handStats as GameState['handStats'] | undefined;
  const lastRank = game.lastWinningHandRank;

  return (
    validCards &&
    Array.isArray(game.deck) &&
    Array.isArray(game.hand) &&
    game.hand.length === 5 &&
    (game.phase === 'holding' || game.phase === 'evaluating') &&
    ['credits', 'lastWin', 'handsPlayed', 'totalBets', 'totalWinnings', 'wagerPerCard'].every(
      (key) => typeof game[key as keyof GameState] === 'number',
    ) &&
    (lastRank === null || (typeof lastRank === 'string' && HAND_RANKS.some((rank) => rank === lastRank))) &&
    !!stats &&
    HAND_RANKS.every(
      (rank) => typeof stats[rank]?.count === 'number' && typeof stats[rank]?.payout === 'number',
    )
  );
}

export function loadGame(): { game: GameStateWithRtp; startingCredits: number } | null {
  try {
    const raw = storage()?.getItem(GAME_STORAGE_KEY);
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    if (!isStoredGame(stored)) return null;

    return {
      startingCredits: stored.startingCredits,
      game: { ...stored.game, rtp: calculateRtp(stored.game.totalWinnings, stored.game.totalBets) },
    };
  } catch {
    return null;
  }
}

export function saveGame(game: GameState, startingCredits: number): void {
  try {
    storage()?.setItem(GAME_STORAGE_KEY, JSON.stringify({ game, startingCredits }));
  } catch {
    // Storage can be unavailable or full; gameplay should continue normally.
  }
}

export function clearSavedGame(): void {
  try {
    storage()?.removeItem(GAME_STORAGE_KEY);
  } catch {
    // Reset the in-memory game even when storage is unavailable.
  }
}
