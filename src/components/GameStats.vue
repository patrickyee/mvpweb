<script setup lang="ts">
import { useI18n } from '../i18n/useI18n';

defineProps<{
  credits: number;
  rtp: string;
  lastResult: string;
  handsPlayed: number;
}>();

const { messages } = useI18n();
</script>

<template>
  <dl class="stats-grid" :aria-label="messages.gameStatusLabel">
    <div>
      <dt>{{ messages.credits }}</dt>
      <dd>{{ credits }}</dd>
    </div>
    <div>
      <dt>{{ messages.rtp }}</dt>
      <dd>{{ rtp }}</dd>
    </div>
    <div>
      <dt>{{ messages.result }}</dt>
      <dd>{{ lastResult }}</dd>
    </div>
    <div>
      <dt>{{ messages.hands }}</dt>
      <dd>{{ handsPlayed }}</dd>
    </div>
  </dl>
</template>
