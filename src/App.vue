<script setup lang="ts">
import { computed, ref } from 'vue';
import GameControls from './components/GameControls.vue';
import GameStats from './components/GameStats.vue';
import PlayingCard from './components/PlayingCard.vue';
import StrategyPanel from './components/StrategyPanel.vue';
import { createInitialGameState, dealNewHand, draw, nextHand, toggleHold } from './game/gameState';
import { HAND_RANK_LABELS } from './game/types';

const game = ref(dealNewHand(createInitialGameState()));
const isStrategyOpen = ref(false);

const rtpLabel = computed(() => `${game.value.rtp.toFixed(2)}%`);
const isHolding = computed(() => game.value.phase === 'holding');
const canContinue = computed(() => game.value.credits >= 1);
const lastResult = computed(() => {
  if (game.value.phase === 'holding') {
    return 'Playing';
  }

  return game.value.lastWin > 0 ? `Win ${game.value.lastWin}` : 'Lose';
});

const resultMessage = computed(() => {
  if (game.value.phase === 'holding') {
    return 'Choose cards to hold, then draw.';
  }

  if (game.value.lastWin > 0 && game.value.lastWinningHandRank) {
    return `${HAND_RANK_LABELS[game.value.lastWinningHandRank]} pays ${game.value.lastWin}.`;
  }

  if (!canContinue.value) {
    return 'Lose. Out of credits.';
  }

  return 'Lose. Try the next hand.';
});

const resultTone = computed(() => {
  if (game.value.phase === 'evaluating' && game.value.lastWin > 0) {
    return 'win';
  }

  if (game.value.phase === 'evaluating') {
    return 'loss';
  }

  return 'neutral';
});

function handleToggle(cardId: string): void {
  game.value = toggleHold(game.value, cardId);
}

function handleDraw(): void {
  game.value = draw(game.value);
}

function handleNextHand(): void {
  game.value = nextHand(game.value);
}

function toggleStrategy(): void {
  isStrategyOpen.value = !isStrategyOpen.value;
}
</script>

<template>
  <main class="game-shell" aria-labelledby="game-title">
    <div class="game-layout" :class="{ 'game-layout--with-strategy': isStrategyOpen }">
      <section class="game-surface">
        <header class="game-header">
          <div>
            <p class="eyebrow">Jacks or Better</p>
            <h1 id="game-title">Video Poker</h1>
          </div>

          <button
            class="help-toggle"
            type="button"
            :aria-expanded="isStrategyOpen"
            aria-controls="strategy-panel"
            :aria-label="isStrategyOpen ? 'Hide strategy help' : 'Show strategy help'"
            @click="toggleStrategy"
          >
            {{ isStrategyOpen ? 'Hide' : 'Help' }}
          </button>
        </header>

        <GameStats
          :credits="game.credits"
          :rtp="rtpLabel"
          :last-result="lastResult"
          :hands-played="game.handsPlayed"
        />

        <TransitionGroup name="card-refresh" tag="section" class="card-row" aria-label="Current hand">
          <PlayingCard
            v-for="card in game.hand"
            :key="`${card.id}-${game.phase}-${card.held}`"
            :card="card"
            :disabled="!isHolding"
            @toggle="handleToggle"
          />
        </TransitionGroup>

        <GameControls
          :phase="game.phase"
          :can-continue="canContinue"
          :result-message="resultMessage"
          :result-tone="resultTone"
          @draw="handleDraw"
          @next-hand="handleNextHand"
        />
      </section>

      <Transition name="strategy-slide">
        <StrategyPanel v-if="isStrategyOpen" />
      </Transition>
    </div>
  </main>
</template>
