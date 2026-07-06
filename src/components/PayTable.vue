<script setup lang="ts">
import { computed } from 'vue';
import { handWager } from '../game/gameState';
import { PAYING_HAND_RANKS, PAYOUTS } from '../game/handEvaluator';
import { useI18n } from '../i18n/useI18n';

const props = defineProps<{
  wagerPerCard: number;
}>();

defineEmits<{
  close: [];
}>();

const { messages, t } = useI18n();

const rows = computed(() =>
  PAYING_HAND_RANKS.map((rank) => ({
    rank,
    name: messages.value.handRanks[rank],
    base: PAYOUTS[rank],
    scaled: (PAYOUTS[rank] * props.wagerPerCard).toFixed(2),
  })),
);

const wagerNote = computed(() =>
  t(messages.value.payTableWager, {
    perCard: props.wagerPerCard,
    perHand: handWager(props.wagerPerCard).toFixed(2),
  }),
);
</script>

<template>
  <section
    id="pay-table-panel"
    class="strategy-panel pay-table-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="pay-table-title"
  >
    <header class="strategy-header">
      <h2 id="pay-table-title">{{ messages.payTable }}</h2>
      <button
        class="strategy-close"
        type="button"
        :aria-label="messages.closePayTable"
        @click="$emit('close')"
      >
        &times;
      </button>
    </header>

    <p class="pay-table-note">{{ wagerNote }}</p>

    <table class="strategy-table">
      <thead>
        <tr>
          <th scope="col">{{ messages.payTableHand }}</th>
          <th scope="col">{{ messages.payTablePayout }}</th>
          <th scope="col">{{ messages.payTableAtWager }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.rank">
          <th scope="row">{{ row.name }}</th>
          <td>{{ row.base }}</td>
          <td>{{ row.scaled }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
