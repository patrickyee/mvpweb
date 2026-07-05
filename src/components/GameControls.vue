<script setup lang="ts">
import { useI18n } from '../i18n/useI18n';

defineProps<{
  phase: 'holding' | 'evaluating';
  canContinue: boolean;
  resultMessage: string;
  resultTone: 'neutral' | 'win' | 'loss';
}>();

const emit = defineEmits<{
  draw: [];
  nextHand: [];
}>();

const { messages } = useI18n();
</script>

<template>
  <section class="control-panel" :aria-label="messages.gameControlsLabel">
    <p class="result-message" :class="`result-message--${resultTone}`" aria-live="polite" aria-atomic="true">
      {{ resultMessage }}
    </p>

    <button v-if="phase === 'holding'" class="primary-action" type="button" @click="emit('draw')">
      {{ messages.draw }}
    </button>

    <button
      v-else
      class="primary-action"
      type="button"
      :disabled="!canContinue"
      @click="emit('nextHand')"
    >
      {{ messages.nextHand }}
    </button>
  </section>
</template>
