<script setup lang="ts">
const strategyItems = [
  'Four of a kind, straight flush, royal flush',
  '4 to a royal flush',
  'Three of a kind, straight, flush, full house',
  '4 to a straight flush',
  'Two pair',
  'High pair',
  '3 to a royal flush',
  '4 to a flush',
  'Low pair',
  '4 to an outside straight',
  '2 suited high cards',
  '3 to a straight flush',
  '2 unsuited high cards, choose the lowest two when more than two are available',
  'Suited 10/J, 10/Q, or 10/K',
  'One high card',
  'Discard everything',
] as const;
</script>

<template>
  <aside id="strategy-panel" class="strategy-panel" aria-labelledby="strategy-title">
    <h2 id="strategy-title">Strategy</h2>
    <ol class="strategy-list">
      <li v-for="item in strategyItems" :key="item">{{ item }}</li>
    </ol>
  </aside>
</template>
