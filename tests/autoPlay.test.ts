import { ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCard } from '../src/game/deck';
import { createInitialGameState, dealNewHand } from '../src/game/gameState';
import type { GameStateWithRtp } from '../src/game/gameState';
import { AUTO_PLAY_INTERVAL_MS, useAutoPlay } from '../src/composables/useAutoPlay';
import type { Rank, Suit } from '../src/game/types';

function c(rank: Rank, suit: Suit) {
  return createCard(rank, suit);
}

const NEUTRAL_HAND = [
  c('2', 'hearts'),
  c('5', 'diamonds'),
  c('8', 'clubs'),
  c('jack', 'spades'),
  c('king', 'hearts'),
];

afterEach(() => {
  vi.useRealTimers();
});

describe('useAutoPlay', () => {
  it('advances play over time and stops on demand', () => {
    vi.useFakeTimers();
    const game = ref(dealNewHand(createInitialGameState()));
    const { autoPlaying, start, stop } = useAutoPlay(game);

    start();
    expect(autoPlaying.value).toBe(true);

    vi.advanceTimersByTime(AUTO_PLAY_INTERVAL_MS * 6);
    expect(game.value.handsPlayed).toBeGreaterThanOrEqual(1);

    const played = game.value.handsPlayed;
    stop();
    expect(autoPlaying.value).toBe(false);

    vi.advanceTimersByTime(AUTO_PLAY_INTERVAL_MS * 6);
    expect(game.value.handsPlayed).toBe(played);
  });

  it('holds the recommended cards before drawing', () => {
    vi.useFakeTimers();
    // A made flush: strategy holds all five, so every card should be held after the
    // first tick, before any draw happens.
    const flush = [
      c('2', 'clubs'),
      c('5', 'clubs'),
      c('8', 'clubs'),
      c('jack', 'clubs'),
      c('king', 'clubs'),
    ];
    const game = ref<GameStateWithRtp>({
      ...createInitialGameState(),
      phase: 'holding',
      hand: flush,
    });
    const { start } = useAutoPlay(game);

    start();
    vi.advanceTimersByTime(AUTO_PLAY_INTERVAL_MS);

    expect(game.value.hand.every((card) => card.held)).toBe(true);
  });

  it('ticks faster at higher speed multipliers', () => {
    vi.useFakeTimers();
    const game = ref(dealNewHand(createInitialGameState()));
    const { start, speed } = useAutoPlay(game);

    speed.value = 100;
    start();
    // One base interval at 100x fits many ticks, so several hands complete.
    vi.advanceTimersByTime(AUTO_PLAY_INTERVAL_MS);

    expect(game.value.handsPlayed).toBeGreaterThan(1);
  });

  it('refuses to start when out of credits', () => {
    vi.useFakeTimers();
    const game = ref<GameStateWithRtp>({
      ...createInitialGameState(),
      phase: 'evaluating',
      credits: 0,
      hand: NEUTRAL_HAND,
    });
    const { autoPlaying, start } = useAutoPlay(game);

    start();

    expect(autoPlaying.value).toBe(false);
  });

  it('stops automatically when credits run out mid-loop', () => {
    vi.useFakeTimers();
    const game = ref(dealNewHand(createInitialGameState()));
    const { autoPlaying, start } = useAutoPlay(game);

    start();
    // Force an out-of-credits evaluating state before the next tick fires.
    game.value = { ...game.value, phase: 'evaluating', credits: 0, hand: NEUTRAL_HAND, lastWin: 0 };
    vi.advanceTimersByTime(AUTO_PLAY_INTERVAL_MS);

    expect(autoPlaying.value).toBe(false);
  });
});
