<script setup lang="ts">
import { computed } from 'vue';
import type { Card } from '../game/types';
import { useI18n } from '../i18n/useI18n';
import { cardImageUrl } from './cardImages';

const props = defineProps<{
  card: Card;
  disabled: boolean;
  revealed?: boolean;
  recommended?: boolean;
  winning?: boolean;
}>();

const emit = defineEmits<{
  toggle: [cardId: string];
}>();

const { messages, t } = useI18n();
const faceUrl = computed(() => cardImageUrl(props.card));
const accessibleRank = computed(() => messages.value.ranks[props.card.rank]);
const accessibleSuit = computed(() => messages.value.suits[props.card.suit]);
// The held annotation is a decision-phase affordance; once the hand is revealed the
// winning-group annotation takes over. This is keyed off the phase (revealed), not
// interactivity, so held stays visible while auto play holds cards it also disables.
const showHeld = computed(() => props.card.held && !props.revealed);
const actionLabel = computed(() => {
  const rank = accessibleRank.value;
  const suit = accessibleSuit.value;

  // A non-interactive card must not announce a "Hold …" action it cannot perform;
  // use a neutral name plus whichever state annotation currently applies.
  if (props.disabled) {
    const name = t(messages.value.cardName, { rank, suit });
    if (props.winning) {
      return `${name} · ${messages.value.winningCard}`;
    }
    if (showHeld.value) {
      return `${name} · ${messages.value.held}`;
    }
    return name;
  }

  const base = props.card.held
    ? t(messages.value.releaseCard, { rank, suit })
    : t(messages.value.holdCard, { rank, suit });
  return props.recommended ? `${base} · ${messages.value.recommendedHold}` : base;
});
</script>

<template>
  <button
    class="playing-card"
    :class="{
      'playing-card--held': showHeld,
      'playing-card--recommended': recommended,
      'playing-card--winning': winning,
    }"
    type="button"
    :aria-label="actionLabel"
    :aria-pressed="card.held"
    :disabled="disabled"
    @click="emit('toggle', card.id)"
  >
    <img class="card-face" :src="faceUrl" alt="" aria-hidden="true" draggable="false" />
    <span v-if="recommended" class="hint-dot" aria-hidden="true"></span>
    <span v-if="showHeld" class="held-label">{{ messages.held }}</span>
  </button>
</template>
