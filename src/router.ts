import { createRouter, createWebHistory } from 'vue-router';
import GameView from './views/GameView.vue';
import SimulationView from './views/SimulationView.vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'game', component: GameView },
    { path: '/simulate', name: 'simulate', component: SimulationView },
  ],
});
