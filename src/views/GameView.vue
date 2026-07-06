<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import GameControls from '../components/GameControls.vue';
import GameStats from '../components/GameStats.vue';
import LanguageToggle from '../components/LanguageToggle.vue';
import PayTable from '../components/PayTable.vue';
import PlayingCard from '../components/PlayingCard.vue';
import StatsReport from '../components/StatsReport.vue';
import StrategyPanel from '../components/StrategyPanel.vue';
import {
  createInitialGameState,
  dealNewHand,
  DEFAULT_STARTING_CREDITS,
  DEFAULT_WAGER_PER_CARD,
  draw,
  handWager,
  nextHand,
  STARTING_CREDIT_OPTIONS,
  toggleHold,
  WAGER_PER_CARD_OPTIONS,
} from '../game/gameState';
import { winningCardIds } from '../game/handEvaluator';
import { recommendHolds } from '../game/strategy';
import { useAutoPlay, type AutoPlaySpeed } from '../composables/useAutoPlay';
import { useI18n } from '../i18n/useI18n';

const wagerPerCard = ref<number>(DEFAULT_WAGER_PER_CARD);
const startingCredits = ref<number>(DEFAULT_STARTING_CREDITS);

const game = ref(dealNewHand(createInitialGameState(startingCredits.value, wagerPerCard.value)));
const isStrategyOpen = ref(false);
const isSettingsOpen = ref(false);
const isPayTableOpen = ref(false);
const isReportOpen = ref(false);
const hintMode = ref(false);
const autoPlayConfirmOpen = ref(false);
const { messages, t } = useI18n();
const {
  autoPlaying,
  speed: autoPlaySpeed,
  start: startAutoPlay,
  toggle: toggleAutoPlay,
  stop: stopAutoPlay,
} = useAutoPlay(game);

const creditsLabel = computed(() => game.value.credits.toFixed(2));
const rtpLabel = computed(() => `${game.value.rtp.toFixed(2)}%`);
const totalWagerLabel = computed(() =>
  (handWager(game.value.wagerPerCard) * game.value.handsPlayed).toFixed(2),
);
const isHolding = computed(() => game.value.phase === 'holding');
// Hint mode confirms correctness: the dots appear only once the held cards exactly
// match the strategy-recommended holds (and there is something to hold).
const recommendedIds = computed(() => {
  if (!hintMode.value || !isHolding.value || autoPlaying.value) {
    return new Set<string>();
  }

  const recommended = recommendHolds(game.value.hand);
  if (recommended.length === 0) {
    return new Set<string>();
  }

  const heldIds = game.value.hand.filter((card) => card.held).map((card) => card.id);
  const matchesRecommended =
    heldIds.length === recommended.length && recommended.every((id) => heldIds.includes(id));

  return matchesRecommended ? new Set(recommended) : new Set<string>();
});
const winningIds = computed(
  () =>
    new Set(
      game.value.phase === 'evaluating' && game.value.lastWin > 0
        ? winningCardIds(game.value.hand)
        : [],
    ),
);
const isLosing = computed(
  () => game.value.phase === 'evaluating' && game.value.lastWin === 0,
);
const canContinue = computed(() => game.value.credits >= handWager(game.value.wagerPerCard));

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

function restartGame(): void {
  stopAutoPlay();
  game.value = dealNewHand(createInitialGameState(startingCredits.value, wagerPerCard.value));
}

function handleNewGame(): void {
  restartGame();
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

function toggleSettings(): void {
  isSettingsOpen.value = !isSettingsOpen.value;
}

function togglePayTable(): void {
  isPayTableOpen.value = !isPayTableOpen.value;
}

function closeStrategy(): void {
  isStrategyOpen.value = false;
}

function closeSettings(): void {
  isSettingsOpen.value = false;
}

function closePayTable(): void {
  isPayTableOpen.value = false;
}

function openReport(): void {
  isReportOpen.value = true;
}

function closeReport(): void {
  isReportOpen.value = false;
}

// Changing a stake setting restarts the game.
watch([wagerPerCard, startingCredits], restartGame);

// Surface the report automatically the first time the game runs out of credits.
const isGameOver = computed(() => game.value.phase === 'evaluating' && !canContinue.value);
watch(isGameOver, (over) => {
  if (over) {
    isReportOpen.value = true;
  }
});

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeStrategy();
    closeSettings();
    closePayTable();
    closeReport();
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
</script>

<template>
  <section class="game-surface">
    <header class="game-header">
      <div>
        <h1 id="game-title" class="visually-hidden">{{ messages.appTitle }}</h1>
        <p class="eyebrow">{{ messages.appTitle }}</p>
      </div>

      <LanguageToggle />

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
        class="settings-toggle"
        type="button"
        :aria-expanded="isSettingsOpen"
        :aria-label="messages.settings"
        @click="toggleSettings"
      >
        <span aria-hidden="true">⚙️</span>
      </button>

      <button
        class="paytable-toggle"
        type="button"
        :aria-expanded="isPayTableOpen"
        :aria-label="messages.payTable"
        @click="togglePayTable"
      >
        <span aria-hidden="true">📋</span>
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
      @report="openReport"
    />

    <section
      class="card-row"
      :class="{ 'card-row--losing': isLosing }"
      :aria-label="messages.currentHandLabel"
    >
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

  <Transition name="overlay-fade">
    <div v-if="isSettingsOpen" class="strategy-overlay" @click.self="closeSettings">
      <section
        class="strategy-panel settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header class="strategy-header">
          <h2 id="settings-title">{{ messages.settings }}</h2>
          <button
            class="strategy-close"
            type="button"
            :aria-label="messages.closeSettings"
            @click="closeSettings"
          >
            &times;
          </button>
        </header>

        <div class="settings-field">
          <label for="wager-per-card">{{ messages.wagerPerCardLabel }}</label>
          <select id="wager-per-card" class="settings-select" v-model.number="wagerPerCard">
            <option v-for="option in WAGER_PER_CARD_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div class="settings-field">
          <label for="starting-credits">{{ messages.startingCreditsLabel }}</label>
          <select id="starting-credits" class="settings-select" v-model.number="startingCredits">
            <option v-for="option in STARTING_CREDIT_OPTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </section>
    </div>
  </Transition>

  <Transition name="overlay-fade">
    <div v-if="isPayTableOpen" class="strategy-overlay" @click.self="closePayTable">
      <PayTable :wager-per-card="game.wagerPerCard" @close="closePayTable" />
    </div>
  </Transition>

  <Transition name="overlay-fade">
    <div v-if="isReportOpen" class="strategy-overlay" @click.self="closeReport">
      <StatsReport :hand-stats="game.handStats" @close="closeReport" />
    </div>
  </Transition>
</template>
