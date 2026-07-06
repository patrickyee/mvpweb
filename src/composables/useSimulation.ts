import { onBeforeUnmount, ref } from 'vue';
import type { SimRequest, SimResponse, SimResults } from '../sim/monteCarlo';

/**
 * Runs Monte Carlo simulations in a Web Worker so the UI stays responsive. Exposes
 * reactive `running`/`progress`/`results` and `run`/`cancel`.
 */
export function useSimulation() {
  const running = ref(false);
  const progress = ref(0);
  const results = ref<SimResults | null>(null);

  let worker: Worker | null = null;

  function dispose(): void {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  }

  function run(request: SimRequest): void {
    dispose();
    running.value = true;
    progress.value = 0;
    results.value = null;

    worker = new Worker(new URL('../sim/monteCarlo.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<SimResponse>) => {
      const message = event.data;
      if (message.type === 'progress') {
        progress.value = message.total > 0 ? message.done / message.total : 0;
      } else {
        results.value = { totalWager: message.totalWager, handsPlayed: message.handsPlayed };
        progress.value = 1;
        running.value = false;
        dispose();
      }
    };

    worker.postMessage(request);
  }

  function cancel(): void {
    dispose();
    running.value = false;
    progress.value = 0;
  }

  onBeforeUnmount(dispose);

  return { running, progress, results, run, cancel };
}
