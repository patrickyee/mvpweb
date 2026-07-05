<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import GameControls from './components/GameControls.vue';
import GameStats from './components/GameStats.vue';
import PlayingCard from './components/PlayingCard.vue';
import StrategyPanel from './components/StrategyPanel.vue';
import { createInitialGameState, dealNewHand, draw, nextHand, toggleHold } from './game/gameState';
import { winningCardIds, WAGER } from './game/handEvaluator';
import { recommendHolds } from './game/strategy';
import { useAutoPlay, type AutoPlaySpeed } from './composables/useAutoPlay';
import { type Locale } from './i18n/messages';
import { useI18n } from './i18n/useI18n';

const game = ref(dealNewHand(createInitialGameState()));
const isStrategyOpen = ref(false);
const hintMode = ref(false);
const autoPlayConfirmOpen = ref(false);
const { locale, messages, setLocale, t } = useI18n();
const {
  autoPlaying,
  speed: autoPlaySpeed,
  start: startAutoPlay,
  toggle: toggleAutoPlay,
  stop: stopAutoPlay,
} = useAutoPlay(game);

const creditsLabel = computed(() => game.value.credits.toFixed(2));
const rtpLabel = computed(() => `${game.value.rtp.toFixed(2)}%`);
const totalWagerLabel = computed(() => (WAGER * game.value.handsPlayed).toFixed(2));
const isHolding = computed(() => game.value.phase === 'holding');
const recommendedIds = computed(
  () =>
    new Set(
      hintMode.value && isHolding.value && !autoPlaying.value ? recommendHolds(game.value.hand) : [],
    ),
);
const winningIds = computed(
  () =>
    new Set(
      game.value.phase === 'evaluating' && game.value.lastWin > 0
        ? winningCardIds(game.value.hand)
        : [],
    ),
);
const canContinue = computed(() => game.value.credits >= WAGER);

const resultMessage = computed(() => {
  if (game.value.phase === 'holding') {
    return messages.value.chooseCards;
  }

  if (game.value.lastWin > 0 && game.value.lastWinningHandRank) {
    return t(messages.value.winningPayout, {
      handRank: messages.value.handRanks[game.value.lastWinningHandRank],
      amount: game.value.lastWin.toFixed(2),
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

function handleNewGame(): void {
  stopAutoPlay();
  game.value = dealNewHand(createInitialGameState());
}

function requestAutoPlay(): void {
  if (!autoPlaying.value) {
    autoPlayConfirmOpen.value = true;
  }
}

function confirmAutoPlay(): void {
  autoPlayConfirmOpen.value = false;
  startAutoPlay();
}

function cancelAutoPlay(): void {
  autoPlayConfirmOpen.value = false;
}

function handleSetSpeed(speed: number): void {
  autoPlaySpeed.value = speed as AutoPlaySpeed;
}

function toggleStrategy(): void {
  isStrategyOpen.value = !isStrategyOpen.value;
}

function toggleHint(): void {
  hintMode.value = !hintMode.value;
}

function closeStrategy(): void {
  isStrategyOpen.value = false;
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeStrategy();
    cancelAutoPlay();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape);
  stopAutoPlay();
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
            class="hint-toggle"
            :class="{ 'hint-toggle--active': hintMode }"
            type="button"
            :aria-pressed="hintMode"
            :aria-label="hintMode ? messages.hideHints : messages.showHints"
            @click="toggleHint"
          >
            <span aria-hidden="true">💡</span>
          </button>

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
          :credits="creditsLabel"
          :rtp="rtpLabel"
          :hands-played="game.handsPlayed"
          :total-wager="totalWagerLabel"
        />

        <section class="card-row" :aria-label="messages.currentHandLabel">
          <PlayingCard
            v-for="card in game.hand"
            :key="card.id"
            :card="card"
            :disabled="!isHolding || autoPlaying"
            :revealed="!isHolding"
            :recommended="recommendedIds.has(card.id)"
            :winning="winningIds.has(card.id)"
            @toggle="handleToggle"
          />
        </section>

        <GameControls
          :phase="game.phase"
          :can-continue="canContinue"
          :result-message="resultMessage"
          :result-tone="resultTone"
          :auto-playing="autoPlaying"
          :auto-play-speed="autoPlaySpeed"
          @draw="handleDraw"
          @next-hand="handleNextHand"
          @new-game="handleNewGame"
          @toggle-auto-play="toggleAutoPlay"
          @request-auto-play="requestAutoPlay"
          @set-speed="handleSetSpeed"
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

      <Transition name="overlay-fade">
        <div v-if="autoPlayConfirmOpen" class="strategy-overlay">
          <div
            class="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auto-play-title"
            aria-describedby="auto-play-desc"
          >
            <h2 id="auto-play-title">{{ messages.autoPlay }}</h2>
            <p id="auto-play-desc">{{ messages.autoPlayPrompt }}</p>
            <div class="confirm-actions">
              <button class="secondary-action" type="button" @click="cancelAutoPlay">
                {{ messages.cancel }}
              </button>
              <button class="primary-action" type="button" @click="confirmAutoPlay">
                {{ messages.autoPlayConfirm }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </main>
</template>
