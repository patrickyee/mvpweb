<script setup lang="ts">
import { computed } from 'vue';
import { RANK_LABELS, SUIT_SYMBOLS, type Card } from '../game/types';
import { useI18n } from '../i18n/useI18n';

const props = defineProps<{
  card: Card;
  disabled: boolean;
}>();

const emit = defineEmits<{
  toggle: [cardId: string];
}>();

const { messages, t } = useI18n();
const isRedSuit = computed(() => props.card.suit === 'hearts' || props.card.suit === 'diamonds');
const rankLabel = computed(() => RANK_LABELS[props.card.rank]);
const suitSymbol = computed(() => SUIT_SYMBOLS[props.card.suit]);
const accessibleRank = computed(() => messages.value.ranks[props.card.rank]);
const accessibleSuit = computed(() => messages.value.suits[props.card.suit]);
const actionLabel = computed(() =>
  props.card.held
    ? t(messages.value.releaseCard, { rank: accessibleRank.value, suit: accessibleSuit.value })
    : t(messages.value.holdCard, { rank: accessibleRank.value, suit: accessibleSuit.value }),
);
</script>

<template>
  <button
    class="playing-card"
    :class="{ 'playing-card--held': card.held, 'playing-card--red': isRedSuit }"
    type="button"
    :aria-label="actionLabel"
    :aria-pressed="card.held"
    :disabled="disabled"
    @click="emit('toggle', card.id)"
  >
    <span class="card-corner card-corner--top">{{ rankLabel }}</span>
    <span class="card-center" aria-hidden="true">{{ suitSymbol }}</span>
    <span v-if="card.held" class="held-label">{{ messages.held }}</span>
    <span class="card-corner card-corner--bottom">{{ rankLabel }}</span>
  </button>
</template>
