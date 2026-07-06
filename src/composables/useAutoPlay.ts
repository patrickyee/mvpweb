import { ref, type Ref } from 'vue';
import { draw, handWager, nextHand, setHolds, type GameStateWithRtp } from '../game/gameState';
import { recommendHolds } from '../game/strategy';

export const AUTO_PLAY_INTERVAL_MS = 650;
export const AUTO_PLAY_SPEEDS = [1, 10, 50, 100] as const;
export type AutoPlaySpeed = (typeof AUTO_PLAY_SPEEDS)[number];

/**
 * Drives a self-playing loop over the given game ref: it applies the strategy holds,
 * draws, then deals the next hand, pausing between each visible step so the play stays
 * watchable. The pause is the base interval divided by the current `speed` multiplier,
 * so higher speeds tick faster. It stops automatically when credits run out.
 *
 * The loop is a plain timer over a Vue ref (no component required), so it can be
 * unit-tested directly with fake timers.
 */
export function useAutoPlay(game: Ref<GameStateWithRtp>, baseIntervalMs = AUTO_PLAY_INTERVAL_MS) {
  const autoPlaying = ref(false);
  const speed = ref<AutoPlaySpeed>(1);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let holdsApplied = false;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function schedule(): void {
    const delay = Math.max(1, Math.round(baseIntervalMs / speed.value));
    timer = setTimeout(step, delay);
  }

  function step(): void {
    const state = game.value;

    if (state.phase === 'holding') {
      if (holdsApplied) {
        game.value = draw(state);
      } else {
        game.value = setHolds(state, recommendHolds(state.hand));
        holdsApplied = true;
      }
    } else if (state.credits < handWager(state.wagerPerCard)) {
      stop();
      return;
    } else {
      game.value = nextHand(state);
      holdsApplied = false;
    }

    schedule();
  }

  function start(): void {
    if (autoPlaying.value) {
      return;
    }

    // Cannot begin a fresh loop with no credits to wager the next hand.
    if (
      game.value.phase === 'evaluating' &&
      game.value.credits < handWager(game.value.wagerPerCard)
    ) {
      return;
    }

    autoPlaying.value = true;
    holdsApplied = false;
    schedule();
  }

  function stop(): void {
    autoPlaying.value = false;
    clearTimer();
  }

  function toggle(): void {
    if (autoPlaying.value) {
      stop();
    } else {
      start();
    }
  }

  return { autoPlaying, speed, start, stop, toggle };
}
