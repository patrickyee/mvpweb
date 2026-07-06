import {
  createInitialGameState,
  dealNewHand,
  draw,
  handWager,
  setHolds,
  type RandomSource,
} from '../game/gameState';
import { recommendHolds } from '../game/strategy';

export const MAX_HANDS_PER_RUN = 100_000;
export const MAX_SIMULATIONS = 100_000;
export const DEFAULT_SIMULATIONS = 1000;
export const HISTOGRAM_BINS = 20;

export interface SimRequest {
  readonly count: number;
  readonly startingCredits: number;
  readonly wagerPerCard: number;
}

export interface SimResults {
  readonly totalWager: number[];
  readonly handsPlayed: number[];
}

export type SimResponse =
  | { readonly type: 'progress'; readonly done: number; readonly total: number }
  | { readonly type: 'done'; readonly totalWager: number[]; readonly handsPlayed: number[] };

export interface BankrollResult {
  readonly totalWager: number;
  readonly handsPlayed: number;
  readonly capped: boolean;
}

/**
 * Auto-plays one game with the optimal strategy until credits can no longer cover a
 * wager (or the safety cap is hit), returning how much was wagered in total. Pure and
 * deterministic for a given `random`.
 */
export function simulateBankroll(
  startingCredits: number,
  wagerPerCard: number,
  random: RandomSource = Math.random,
  maxHands: number = MAX_HANDS_PER_RUN,
): BankrollResult {
  const wager = handWager(wagerPerCard);
  let state = createInitialGameState(startingCredits, wagerPerCard);

  while (state.credits >= wager && state.handsPlayed < maxHands) {
    state = dealNewHand(state, random);
    state = draw(setHolds(state, recommendHolds(state.hand)));
  }

  return {
    totalWager: state.totalBets,
    handsPlayed: state.handsPlayed,
    capped: state.handsPlayed >= maxHands,
  };
}

/** Runs `count` independent games, collecting total wager and hands played from each. */
export function runSimulations(
  count: number,
  startingCredits: number,
  wagerPerCard: number,
  random: RandomSource = Math.random,
  onProgress?: (done: number) => void,
): SimResults {
  const totalWager: number[] = [];
  const handsPlayed: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const result = simulateBankroll(startingCredits, wagerPerCard, random);
    totalWager.push(result.totalWager);
    handsPlayed.push(result.handsPlayed);
    if (onProgress) {
      onProgress(i + 1);
    }
  }
  return { totalWager, handsPlayed };
}

export interface HistogramBin {
  readonly start: number;
  readonly end: number;
  readonly count: number;
}

export type HistogramScale = 'linear' | 'log';

export interface Histogram {
  readonly bins: HistogramBin[];
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly median: number;
  readonly p50: number;
  readonly p90: number;
  readonly p99: number;
  readonly total: number;
}

/** Linear-interpolated quantile of a pre-sorted array (q in 0..1). */
function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next === undefined ? sorted[base] : sorted[base] + rest * (next - sorted[base]);
}

/**
 * Groups values into `binCount` bins (equal-width, or equal-ratio when `scale` is
 * `'log'`) with summary statistics including p50/p90/p99. Log scale needs positive
 * values; it falls back to linear otherwise.
 */
export function buildHistogram(
  values: readonly number[],
  binCount = HISTOGRAM_BINS,
  scale: HistogramScale = 'linear',
): Histogram {
  const total = values.length;
  if (total === 0) {
    return { bins: [], min: 0, max: 0, mean: 0, median: 0, p50: 0, p90: 0, p99: 0, total: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = sorted.reduce((sum, value) => sum + value, 0) / total;
  const p50 = quantile(sorted, 0.5);
  const p90 = quantile(sorted, 0.9);
  const p99 = quantile(sorted, 0.99);
  const stats = { min, max, mean, median: p50, p50, p90, p99, total };

  // All values equal → a single bin.
  if (min === max) {
    return { ...stats, bins: [{ start: min, end: max, count: total }] };
  }

  const bins = Math.max(1, Math.min(binCount, total));
  const useLog = scale === 'log' && min > 0;
  const lo = useLog ? Math.log(min) : min;
  const hi = useLog ? Math.log(max) : max;
  const width = (hi - lo) / bins;
  const counts = new Array<number>(bins).fill(0);

  for (const value of sorted) {
    const scaled = useLog ? Math.log(value) : value;
    const index = Math.min(bins - 1, Math.floor((scaled - lo) / width));
    counts[index] += 1;
  }

  const edge = (i: number): number => {
    const raw = lo + i * width;
    return useLog ? Math.exp(raw) : raw;
  };

  return {
    ...stats,
    bins: counts.map((count, index) => ({ start: edge(index), end: edge(index + 1), count })),
  };
}
