<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import GameControls from './components/GameControls.vue';
import GameStats from './components/GameStats.vue';
import PlayingCard from './components/PlayingCard.vue';
import StrategyPanel from './components/StrategyPanel.vue';
import { createInitialGameState, dealNewHand, draw, nextHand, toggleHold } from './game/gameState';
import { type Locale } from './i18n/messages';
import { useI18n } from './i18n/useI18n';

const game = ref(dealNewHand(createInitialGameState()));
const isStrategyOpen = ref(false);
const { locale, messages, setLocale, t } = useI18n();

const rtpLabel = computed(() => `${game.value.rtp.toFixed(2)}%`);
const isHolding = computed(() => game.value.phase === 'holding');
const canContinue = computed(() => game.value.credits >= 1);
const lastResult = computed(() => {
  if (game.value.phase === 'holding') {
    return messages.value.playing;
  }

  return game.value.lastWin > 0
    ? t(messages.value.winResult, { amount: game.value.lastWin })
    : messages.value.lose;
});

const resultMessage = computed(() => {
  if (game.value.phase === 'holding') {
    return messages.value.chooseCards;
  }

  if (game.value.lastWin > 0 && game.value.lastWinningHandRank) {
    return t(messages.value.winningPayout, {
      handRank: messages.value.handRanks[game.value.lastWinningHandRank],
      amount: game.value.lastWin,
    });
  }

  if (!canContinue.value) {
    return messages.value.outOfCredits;
  }

  return messages.value.tryNextHand;
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

function closeStrategy(): void {
  isStrategyOpen.value = false;
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeStrategy();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
});

watchEffect(() => {
  document.title = messages.value.appTitle;
});
</script>

<template>
  <main class="game-shell" aria-labelledby="game-title">
    <div class="game-layout">
      <section class="game-surface">
        <header class="game-header">
          <div>
            <h1 id="game-title" class="visually-hidden">{{ messages.appTitle }}</h1>
            <p class="eyebrow">{{ messages.appTitle }}</p>
          </div>

          <div class="language-toggle" role="group" :aria-label="messages.languageLabel">
            <button
              type="button"
              :class="{ 'language-toggle__button--active': locale === 'en' }"
              class="language-toggle__button"
              :aria-pressed="locale === 'en'"
              aria-label="Switch to English"
              @click="setLocale('en' as Locale)"
            >
              EN
            </button>
            <button
              type="button"
              :class="{ 'language-toggle__button--active': locale === 'zh-Hant' }"
              class="language-toggle__button"
              :aria-pressed="locale === 'zh-Hant'"
              aria-label="切換至繁體中文"
              @click="setLocale('zh-Hant' as Locale)"
            >
              繁
            </button>
          </div>

          <button
            class="help-toggle"
            type="button"
            :aria-expanded="isStrategyOpen"
            aria-controls="strategy-panel"
            :aria-label="isStrategyOpen ? messages.hideStrategyHelp : messages.showStrategyHelp"
            @click="toggleStrategy"
          >
            <span aria-hidden="true">?</span>
          </button>
        </header>

        <GameStats
          :credits="game.credits"
          :rtp="rtpLabel"
          :last-result="lastResult"
          :hands-played="game.handsPlayed"
        />

        <section class="card-row" :aria-label="messages.currentHandLabel">
          <PlayingCard
            v-for="card in game.hand"
            :key="card.id"
            :card="card"
            :disabled="!isHolding"
            @toggle="handleToggle"
          />
        </section>

        <GameControls
          :phase="game.phase"
          :can-continue="canContinue"
          :result-message="resultMessage"
          :result-tone="resultTone"
          @draw="handleDraw"
          @next-hand="handleNextHand"
        />
      </section>

      <Transition name="overlay-fade">
        <div
          v-if="isStrategyOpen"
          class="strategy-overlay"
          :aria-label="messages.strategyOverlayLabel"
          @click.self="closeStrategy"
        >
          <StrategyPanel @close="closeStrategy" />
        </div>
      </Transition>
    </div>
  </main>
</template>
