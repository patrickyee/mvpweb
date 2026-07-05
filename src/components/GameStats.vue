<script setup lang="ts">
defineProps<{
  credits: number;
  rtp: string;
  lastResult: string;
  handsPlayed: number;
}>();
</script>

<template>
  <dl class="stats-grid" aria-label="Game status">
    <div>
      <dt>Credits</dt>
      <dd>{{ credits }}</dd>
    </div>
    <div>
      <dt>RTP</dt>
      <dd>{{ rtp }}</dd>
    </div>
    <div>
      <dt>Result</dt>
      <dd>{{ lastResult }}</dd>
    </div>
    <div>
      <dt>Hands</dt>
      <dd>{{ handsPlayed }}</dd>
    </div>
  </dl>
</template>
