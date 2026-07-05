<script setup lang="ts">
import { useI18n } from '../i18n/useI18n';

defineProps<{
  credits: string;
  rtp: string;
  handsPlayed: number;
  totalWager: string;
}>();

const { messages } = useI18n();
</script>

<template>
  <dl class="stats-grid" :aria-label="messages.gameStatusLabel">
    <div>
      <dt>
        <span aria-hidden="true">💰</span>
        <span class="visually-hidden">{{ messages.credits }}</span>
      </dt>
      <dd>{{ credits }}</dd>
    </div>
    <div>
      <dt>
        <span aria-hidden="true">📈</span>
        <span class="visually-hidden">{{ messages.rtp }}</span>
      </dt>
      <dd>{{ rtp }}</dd>
    </div>
    <div class="stat-push">
      <dt>
        <span aria-hidden="true">🃏</span>
        <span class="visually-hidden">{{ messages.hands }}</span>
      </dt>
      <dd>{{ handsPlayed }}</dd>
    </div>
    <div>
      <dt>
        <span aria-hidden="true">💵</span>
        <span class="visually-hidden">{{ messages.totalWager }}</span>
      </dt>
      <dd>{{ totalWager }}</dd>
    </div>
  </dl>
</template>
