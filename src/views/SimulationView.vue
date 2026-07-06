<script setup lang="ts">
import { computed, ref } from 'vue';
import LanguageToggle from '../components/LanguageToggle.vue';
import {
  DEFAULT_STARTING_CREDITS,
  DEFAULT_WAGER_PER_CARD,
  STARTING_CREDIT_OPTIONS,
  WAGER_PER_CARD_OPTIONS,
} from '../game/gameState';
import {
  buildHistogram,
  DEFAULT_SIMULATIONS,
  HISTOGRAM_BINS,
  MAX_SIMULATIONS,
} from '../sim/monteCarlo';
import { useSimulation } from '../composables/useSimulation';
import { useI18n } from '../i18n/useI18n';

const { messages, t } = useI18n();
const { running, progress, results, run, cancel } = useSimulation();

const wagerPerCard = ref<number>(DEFAULT_WAGER_PER_CARD);
const startingCredits = ref<number>(DEFAULT_STARTING_CREDITS);
const simulations = ref<number>(DEFAULT_SIMULATIONS);
const metric = ref<'wager' | 'hands'>('wager');

const simulationsValid = computed(
  () =>
    Number.isFinite(simulations.value) &&
    simulations.value >= 1 &&
    simulations.value <= MAX_SIMULATIONS,
);

const selectedValues = computed<number[]>(() => {
  if (!results.value) {
    return [];
  }
  return metric.value === 'wager' ? results.value.totalWager : results.value.handsPlayed;
});

// Total wager / hands played are extremely right-skewed, so bin on a log scale.
const histogram = computed(() =>
  selectedValues.value.length > 0
    ? buildHistogram(selectedValues.value, HISTOGRAM_BINS, 'log')
    : null,
);
const maxCount = computed(() =>
  histogram.value ? Math.max(1, ...histogram.value.bins.map((bin) => bin.count)) : 1,
);
const metricLabel = computed(() =>
  metric.value === 'wager' ? messages.value.metricTotalWager : messages.value.metricHandsPlayed,
);
const progressPercent = computed(() => Math.round(progress.value * 100));
const histogramAria = computed(() =>
  histogram.value
    ? `${metricLabel.value}: ${histogram.value.total} · ${Math.round(histogram.value.min)}–${Math.round(histogram.value.max)}`
    : '',
);

function handleRun(): void {
  if (!simulationsValid.value || running.value) {
    return;
  }
  run({
    count: Math.floor(simulations.value),
    startingCredits: startingCredits.value,
    wagerPerCard: wagerPerCard.value,
  });
}
</script>

<template>
  <section class="game-surface sim-surface">
    <header class="game-header">
      <div>
        <p class="eyebrow">{{ messages.monteCarlo }}</p>
      </div>
      <LanguageToggle />
      <RouterLink class="sim-back" to="/">{{ messages.backToGame }}</RouterLink>
    </header>

    <form class="sim-form" @submit.prevent="handleRun">
      <div class="settings-field">
        <label for="sim-wager">{{ messages.wagerPerCardLabel }}</label>
        <select id="sim-wager" class="settings-select" v-model.number="wagerPerCard">
          <option v-for="option in WAGER_PER_CARD_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div class="settings-field">
        <label for="sim-credits">{{ messages.startingCreditsLabel }}</label>
        <select id="sim-credits" class="settings-select" v-model.number="startingCredits">
          <option v-for="option in STARTING_CREDIT_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div class="settings-field">
        <label for="sim-count">{{ messages.simulationsLabel }}</label>
        <input
          id="sim-count"
          class="settings-select sim-count"
          type="number"
          min="1"
          :max="MAX_SIMULATIONS"
          step="1"
          v-model.number="simulations"
        />
      </div>

      <div class="sim-actions">
        <button
          v-if="!running"
          class="primary-action"
          type="submit"
          :disabled="!simulationsValid"
        >
          {{ messages.runSimulation }}
        </button>
        <button v-else class="primary-action primary-action--stop" type="button" @click="cancel">
          {{ messages.cancel }}
        </button>
      </div>
    </form>

    <template v-if="running">
      <p class="sim-progress-text" aria-live="polite">
        {{ t(messages.simulationRunning, { done: progressPercent }) }}
      </p>
      <div
        class="sim-progress"
        role="progressbar"
        :aria-valuenow="progressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="sim-progress__bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </template>

    <section v-else-if="histogram" class="sim-results">
      <div class="settings-field sim-metric">
        <label for="sim-metric">{{ messages.metricLabel }}</label>
        <select id="sim-metric" class="settings-select" v-model="metric">
          <option value="wager">{{ messages.metricTotalWager }}</option>
          <option value="hands">{{ messages.metricHandsPlayed }}</option>
        </select>
      </div>

      <dl class="sim-summary">
        <div>
          <dt>{{ messages.statRuns }}</dt>
          <dd>{{ histogram.total }}</dd>
        </div>
        <div>
          <dt>{{ messages.statP50 }}</dt>
          <dd>{{ Math.round(histogram.p50) }}</dd>
        </div>
        <div>
          <dt>{{ messages.statP90 }}</dt>
          <dd>{{ Math.round(histogram.p90) }}</dd>
        </div>
        <div>
          <dt>{{ messages.statP99 }}</dt>
          <dd>{{ Math.round(histogram.p99) }}</dd>
        </div>
        <div>
          <dt>{{ messages.statMax }}</dt>
          <dd>{{ Math.round(histogram.max) }}</dd>
        </div>
      </dl>

      <figure class="histogram" role="img" :aria-label="histogramAria">
        <figcaption class="histogram__title">
          {{ metricLabel }} · {{ messages.logScaleNote }}
        </figcaption>
        <ul class="histogram__bars">
          <li v-for="(bin, index) in histogram.bins" :key="index" class="histogram__row">
            <span class="histogram__range">{{ Math.round(bin.start) }}–{{ Math.round(bin.end) }}</span>
            <span class="histogram__track">
              <span class="histogram__bar" :style="{ width: `${(bin.count / maxCount) * 100}%` }"></span>
            </span>
            <span class="histogram__count">{{ bin.count }}</span>
          </li>
        </ul>
      </figure>
    </section>

    <p v-else class="sim-empty">{{ messages.simulationEmpty }}</p>
  </section>
</template>
