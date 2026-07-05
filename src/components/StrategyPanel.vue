<script setup lang="ts">
defineEmits<{
  close: [];
}>();

const strategyRows = [
  { priority: 1, play: 'Four of a kind, straight flush, royal flush' },
  { priority: 2, play: '4 to a royal flush' },
  { priority: 3, play: 'Three of a kind, straight, flush, full house' },
  { priority: 4, play: '4 to a straight flush' },
  { priority: 5, play: 'Two pair' },
  { priority: 6, play: 'High pair' },
  { priority: 7, play: '3 to a royal flush' },
  { priority: 8, play: '4 to a flush' },
  { priority: 9, play: 'Low pair' },
  { priority: 10, play: '4 to an outside straight' },
  { priority: 11, play: '2 suited high cards' },
  { priority: 12, play: '3 to a straight flush' },
  { priority: 13, play: '2 unsuited high cards, choose the lowest two when more than two are available' },
  { priority: 14, play: 'Suited 10/J, 10/Q, or 10/K' },
  { priority: 15, play: 'One high card' },
  { priority: 16, play: 'Discard everything' },
] as const;
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
      <h2 id="strategy-title">Strategy</h2>
      <button class="strategy-close" type="button" aria-label="Close strategy help" @click="$emit('close')">
        &times;
      </button>
    </header>

    <table class="strategy-table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Play</th>
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
