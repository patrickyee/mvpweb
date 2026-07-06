import { describe, expect, it } from 'vitest';
import { handWager } from '../src/game/gameState';
import { buildHistogram, runSimulations, simulateBankroll } from '../src/sim/monteCarlo';

// Small seeded PRNG so simulations are deterministic in tests.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('simulateBankroll', () => {
  it('is deterministic for a seed and wagers a multiple of the hand wager', () => {
    const a = simulateBankroll(100, 0.25, mulberry32(1));
    const b = simulateBankroll(100, 0.25, mulberry32(1));

    expect(a).toEqual(b);
    expect(a.handsPlayed).toBeGreaterThan(0);
    expect(a.totalWager).toBeCloseTo(a.handsPlayed * handWager(0.25), 6);
  });

  it('plays nothing when starting credits cannot cover a wager', () => {
    const result = simulateBankroll(1, 0.25, mulberry32(2)); // hand wager 1.25 > 1

    expect(result.handsPlayed).toBe(0);
    expect(result.totalWager).toBe(0);
    expect(result.capped).toBe(false);
  });

  it('flags a run that hits the hand cap', () => {
    const result = simulateBankroll(100, 0.25, mulberry32(3), 3);

    expect(result.handsPlayed).toBe(3);
    expect(result.capped).toBe(true);
  });
});

describe('runSimulations', () => {
  it('returns total wager and hands played per run and reports final progress', () => {
    let last = 0;
    const result = runSimulations(5, 100, 0.25, mulberry32(4), (done) => {
      last = done;
    });

    expect(result.totalWager).toHaveLength(5);
    expect(result.handsPlayed).toHaveLength(5);
    expect(last).toBe(5);
    expect(result.totalWager.every((value) => value >= 0)).toBe(true);
  });
});

describe('buildHistogram', () => {
  it('bins values with counts summing to N and correct summary stats', () => {
    const histogram = buildHistogram([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5);

    expect(histogram.total).toBe(10);
    expect(histogram.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(10);
    expect(histogram.min).toBe(0);
    expect(histogram.max).toBe(9);
    expect(histogram.mean).toBeCloseTo(4.5, 6);
    expect(histogram.p50).toBeCloseTo(4.5, 6);
    expect(histogram.p90).toBeCloseTo(8.1, 6);
    expect(histogram.p99).toBeCloseTo(8.91, 6);
  });

  it('bins on a log scale with equal ratios and counts summing to N', () => {
    const values = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    const histogram = buildHistogram(values, 5, 'log');

    expect(histogram.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(values.length);
    // Log bins grow by a constant ratio, so the last bin is far wider than the first.
    const first = histogram.bins[0];
    const last = histogram.bins[histogram.bins.length - 1];
    expect(last.end - last.start).toBeGreaterThan(first.end - first.start);
  });

  it('collapses a single distinct value into one bin', () => {
    const histogram = buildHistogram([5, 5, 5], 20);

    expect(histogram.bins).toHaveLength(1);
    expect(histogram.bins[0].count).toBe(3);
    expect(histogram.min).toBe(5);
    expect(histogram.max).toBe(5);
  });

  it('handles empty input', () => {
    const histogram = buildHistogram([], 10);

    expect(histogram.total).toBe(0);
    expect(histogram.bins).toHaveLength(0);
  });
});
