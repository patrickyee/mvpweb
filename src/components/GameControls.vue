<script setup lang="ts">
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
</script>

<template>
  <section class="control-panel" aria-label="Game controls">
    <p class="result-message" :class="`result-message--${resultTone}`" aria-live="polite" aria-atomic="true">
      {{ resultMessage }}
    </p>

    <button v-if="phase === 'holding'" class="primary-action" type="button" @click="emit('draw')">
      Draw
    </button>

    <button
      v-else
      class="primary-action"
      type="button"
      :disabled="!canContinue"
      @click="emit('nextHand')"
    >
      Next Hand
    </button>
  </section>
</template>
