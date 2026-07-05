<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n/useI18n';

defineEmits<{
  close: [];
}>();

const { messages } = useI18n();
const strategyRows = computed(() =>
  messages.value.strategyRows.map((play, index) => ({ priority: index + 1, play })),
);
</script>

<template>
  <section
    id="strategy-panel"
    class="strategy-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="strategy-title"
  >
    <header class="strategy-header">
      <h2 id="strategy-title">{{ messages.strategy }}</h2>
      <button class="strategy-close" type="button" :aria-label="messages.closeStrategyHelp" @click="$emit('close')">
        &times;
      </button>
    </header>

    <table class="strategy-table">
      <thead>
        <tr>
          <th scope="col">{{ messages.priority }}</th>
          <th scope="col">{{ messages.play }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in strategyRows" :key="row.priority">
          <th scope="row">{{ row.priority }}</th>
          <td>{{ row.play }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
