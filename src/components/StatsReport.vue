<script setup lang="ts">
import { computed } from 'vue';
import type { HandRank, HandStat } from '../game/types';
import { useI18n } from '../i18n/useI18n';

const props = defineProps<{
  handStats: Readonly<Record<HandRank, HandStat>>;
}>();

defineEmits<{
  close: [];
}>();

const { messages } = useI18n();

// Winning hands, best first.
const WIN_ORDER: readonly HandRank[] = [
  'royalFlush',
  'straightFlush',
  'fourOfAKind',
  'fullHouse',
  'flush',
  'straight',
  'threeOfAKind',
  'twoPair',
  'jacksOrBetter',
];

const rows = computed(() =>
  WIN_ORDER.map((rank) => ({
    rank,
    name: messages.value.handRanks[rank],
    count: props.handStats[rank].count,
    payout: props.handStats[rank].payout.toFixed(2),
  })),
);

const totalCount = computed(() => rows.value.reduce((sum, row) => sum + row.count, 0));
const totalPayout = computed(() =>
  WIN_ORDER.reduce((sum, rank) => sum + props.handStats[rank].payout, 0).toFixed(2),
);
</script>

<template>
  <section
    id="report-panel"
    class="strategy-panel report-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="report-title"
  >
    <header class="strategy-header">
      <h2 id="report-title">{{ messages.reportTitle }}</h2>
      <button
        class="strategy-close"
        type="button"
        :aria-label="messages.closeReport"
        @click="$emit('close')"
      >
        &times;
      </button>
    </header>

    <table class="strategy-table">
      <thead>
        <tr>
          <th scope="col">{{ messages.reportHand }}</th>
          <th scope="col">{{ messages.reportFrequency }}</th>
          <th scope="col">{{ messages.reportPayout }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.rank">
          <th scope="row">{{ row.name }}</th>
          <td>{{ row.count }}</td>
          <td>{{ row.payout }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">{{ messages.reportTotal }}</th>
          <td>{{ totalCount }}</td>
          <td>{{ totalPayout }}</td>
        </tr>
      </tfoot>
    </table>
  </section>
</template>
