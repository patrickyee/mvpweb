<script setup lang="ts">
import { computed, ref } from 'vue';
import { createInitialGameState, dealNewHand } from './game/gameState';

const game = ref(dealNewHand(createInitialGameState()));

const rtpLabel = computed(() => `${game.value.rtp.toFixed(2)}%`);
</script>

<template>
  <main class="game-shell" aria-labelledby="game-title">
    <section class="game-surface">
      <header class="game-header">
        <p class="eyebrow">Jacks or Better</p>
        <h1 id="game-title">Video Poker</h1>
      </header>

      <dl class="stats-grid" aria-label="Game status">
        <div>
          <dt>Credits</dt>
          <dd>{{ game.credits }}</dd>
        </div>
        <div>
          <dt>RTP</dt>
          <dd>{{ rtpLabel }}</dd>
        </div>
        <div>
          <dt>Hands</dt>
          <dd>{{ game.handsPlayed }}</dd>
        </div>
      </dl>

      <p class="phase-note">
        Phase 1-2 foundation is ready: the app shell loads and core game logic is covered by tests.
      </p>
    </section>
  </main>
</template>
