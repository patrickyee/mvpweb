import { runSimulations, type SimRequest, type SimResponse } from './monteCarlo';

const ctx = self as unknown as Worker;

ctx.onmessage = (event: MessageEvent<SimRequest>) => {
  const { count, startingCredits, wagerPerCard } = event.data;
  const step = Math.max(1, Math.floor(count / 100));

  const { totalWager, handsPlayed } = runSimulations(
    count,
    startingCredits,
    wagerPerCard,
    Math.random,
    (done) => {
      if (done % step === 0 || done === count) {
        ctx.postMessage({ type: 'progress', done, total: count } satisfies SimResponse);
      }
    },
  );

  ctx.postMessage({ type: 'done', totalWager, handsPlayed } satisfies SimResponse);
};
