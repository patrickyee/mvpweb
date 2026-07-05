<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { AUTO_PLAY_SPEEDS } from '../composables/useAutoPlay';
import { useI18n } from '../i18n/useI18n';

const props = defineProps<{
  phase: 'holding' | 'evaluating';
  canContinue: boolean;
  resultMessage: string;
  resultTone: 'neutral' | 'win' | 'loss';
  autoPlaying: boolean;
  autoPlaySpeed: number;
}>();

const emit = defineEmits<{
  draw: [];
  nextHand: [];
  newGame: [];
  toggleAutoPlay: [];
  requestAutoPlay: [];
  setSpeed: [speed: number];
}>();

const { messages } = useI18n();

const speedIndex = computed(() => AUTO_PLAY_SPEEDS.indexOf(props.autoPlaySpeed as never));

function handleSpeedInput(event: Event): void {
  const index = Number((event.target as HTMLInputElement).value);
  emit('setSpeed', AUTO_PLAY_SPEEDS[index] ?? AUTO_PLAY_SPEEDS[0]);
}

// New game acts as the reset once credits run out; otherwise the primary action is
// draw (holding) or next hand (evaluating).
const showNewGame = computed(() => props.phase === 'evaluating' && !props.canContinue);

// Auto play is a hidden mode: holding the Draw button for this long requests it.
const LONG_PRESS_MS = 3000;
let pressTimer: ReturnType<typeof setTimeout> | null = null;
let longPressed = false;

function startPress(): void {
  clearPress();
  longPressed = false;
  pressTimer = setTimeout(() => {
    pressTimer = null;
    longPressed = true;
    emit('requestAutoPlay');
  }, LONG_PRESS_MS);
}

function clearPress(): void {
  if (pressTimer !== null) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

function handleDrawClick(): void {
  // Swallow the click that ends a completed long press so it does not also draw.
  if (longPressed) {
    longPressed = false;
    return;
  }
  emit('draw');
}

onBeforeUnmount(clearPress);
</script>

<template>
  <section class="control-panel" :aria-label="messages.gameControlsLabel">
    <p class="result-message" :class="`result-message--${resultTone}`" aria-live="polite" aria-atomic="true">
      {{ resultMessage }}
    </p>

    <div class="control-actions">
      <div v-if="autoPlaying" class="auto-speed">
        <input
          class="auto-speed__slider"
          type="range"
          min="0"
          :max="AUTO_PLAY_SPEEDS.length - 1"
          step="1"
          :value="speedIndex"
          :aria-label="messages.autoPlaySpeedLabel"
          :aria-valuetext="`${autoPlaySpeed}x`"
          @input="handleSpeedInput"
        />
        <span class="auto-speed__value" aria-hidden="true">{{ autoPlaySpeed }}x</span>
      </div>

      <button
        v-if="autoPlaying"
        class="primary-action primary-action--stop"
        type="button"
        @click="emit('toggleAutoPlay')"
      >
        {{ messages.stopAutoPlay }}
      </button>
      <button
        v-else-if="showNewGame"
        class="primary-action"
        type="button"
        @click="emit('newGame')"
      >
        {{ messages.newGame }}
      </button>
      <button
        v-else-if="phase === 'holding'"
        class="primary-action"
        type="button"
        @pointerdown="startPress"
        @pointerup="clearPress"
        @pointerleave="clearPress"
        @pointercancel="clearPress"
        @click="handleDrawClick"
      >
        {{ messages.draw }}
      </button>
      <button
        v-else
        class="primary-action"
        type="button"
        @click="emit('nextHand')"
      >
        {{ messages.nextHand }}
      </button>
    </div>
  </section>
</template>
