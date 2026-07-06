import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.vue';
import GameControls from '../src/components/GameControls.vue';
import StrategyPanel from '../src/components/StrategyPanel.vue';
import { createCard } from '../src/game/deck';
import { payoutForHand, winningCardIds } from '../src/game/handEvaluator';
import { recommendHolds } from '../src/game/strategy';
import type { Rank, Suit } from '../src/game/types';
import { useI18n } from '../src/i18n/useI18n';

describe('App playable UI', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('renders an initial dealt hand and post-deal credits', () => {
    const wrapper = mount(App);
    const cards = wrapper.findAll('.playing-card');

    expect(cards).toHaveLength(5);
    expect(wrapper.text()).toContain('Credits');
    expect(wrapper.text()).toContain('98.75');
    expect(wrapper.text()).toContain('Draw');
  });

  it('shows a brief three-stat bar with emoji and no duplicate result', () => {
    const wrapper = mount(App);
    const stats = wrapper.find('.stats-grid');
    const values = stats.findAll('dd');

    expect(values).toHaveLength(4);
    expect(stats.text()).toContain('💰');
    expect(stats.text()).not.toContain('Result');
    // The opening hand is already dealt and wagered, so total wager reflects it.
    expect(values[3].text()).toBe('1.25');
    // The win/lose signal still lives in the control panel below the cards.
    expect(wrapper.find('.result-message').exists()).toBe(true);
  });

  it('marks a clicked card as held with visible text and aria state', async () => {
    const wrapper = mount(App);
    const firstCard = wrapper.find('.playing-card');

    await firstCard.trigger('click');

    expect(wrapper.find('.playing-card').attributes('aria-pressed')).toBe('true');
    expect(wrapper.find('.playing-card').text()).toContain('Held');
  });

  it('renders rank-only corners while preserving center suit and accessible card name', () => {
    const wrapper = mount(App);
    const firstCard = wrapper.find('.playing-card');
    const cornerTexts = firstCard.findAll('.card-corner').map((corner) => corner.text());
    const centerSuit = firstCard.find('.card-center').text();

    expect(cornerTexts).toHaveLength(2);
    expect(cornerTexts[0]).toBe(cornerTexts[1]);
    expect(cornerTexts[0]).not.toMatch(/[♥♦♣♠]/);
    expect(centerSuit).toMatch(/[♥♦♣♠]/);
    expect(firstCard.attributes('aria-label')).toMatch(/Hold .+ of .+/);
  });


  it('draws into result state and disables card toggling', async () => {
    const wrapper = mount(App);

    await wrapper.find('.playing-card').trigger('click');
    await wrapper.find('button.primary-action').trigger('click');

    expect(wrapper.find('button.primary-action').text()).toBe('Next Hand');
    expect(wrapper.find('.playing-card').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toMatch(/Lose|pays/);
  });

  it('starts another hand from the result state', async () => {
    const wrapper = mount(App);

    await wrapper.find('button.primary-action').trigger('click');
    await wrapper.find('button.primary-action').trigger('click');

    expect(wrapper.find('button.primary-action').text()).toBe('Draw');
    expect(wrapper.findAll('.playing-card')).toHaveLength(5);
    expect(wrapper.find('.playing-card').attributes('disabled')).toBeUndefined();
  });

  it('opens and closes the strategy overlay with accessible toggle state', async () => {
    const wrapper = mount(App);
    const helpButton = wrapper.find('.help-toggle');

    expect(wrapper.find('#strategy-panel').exists()).toBe(false);
    expect(helpButton.attributes('aria-expanded')).toBe('false');
    expect(helpButton.classes()).toContain('help-toggle');
    expect(helpButton.text()).toBe('?');

    await helpButton.trigger('click');

    expect(wrapper.find('#strategy-panel').exists()).toBe(true);
    expect(wrapper.find('.strategy-overlay').exists()).toBe(true);
    expect(wrapper.find('.game-layout--with-strategy').exists()).toBe(false);
    expect(wrapper.find('.help-toggle').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('.help-toggle').attributes('aria-controls')).toBe('strategy-panel');

    await wrapper.find('.help-toggle').trigger('click');

    expect(wrapper.find('#strategy-panel').exists()).toBe(false);
    expect(wrapper.find('.help-toggle').attributes('aria-expanded')).toBe('false');
  });

  it('switches to Traditional Chinese without resetting the current game', async () => {
    const wrapper = mount(App);
    const initialCredits = wrapper.findAll('.stats-grid dd')[0].text();
    const initialCardCount = wrapper.findAll('.playing-card').length;

    const languageButtons = wrapper.findAll('.language-toggle__button');

    expect(languageButtons).toHaveLength(2);
    expect(languageButtons[0].attributes('aria-pressed')).toBe('true');
    expect(languageButtons[1].attributes('aria-pressed')).toBe('false');

    await languageButtons[1].trigger('click');

    expect(wrapper.text()).toContain('點數');
    expect(wrapper.text()).toContain('換牌');
    expect(wrapper.find('.help-toggle').attributes('aria-label')).toBe('顯示策略說明');
    expect(wrapper.findAll('.stats-grid dd')[0].text()).toBe(initialCredits);
    expect(wrapper.findAll('.playing-card')).toHaveLength(initialCardCount);
    expect(wrapper.findAll('.language-toggle__button')[0].attributes('aria-pressed')).toBe('false');
    expect(wrapper.findAll('.language-toggle__button')[1].attributes('aria-pressed')).toBe('true');
    expect(document.documentElement.lang).toBe('zh-Hant');
  });

  it('closes the strategy overlay from backdrop, close button, and Escape', async () => {
    const wrapper = mount(App);

    await wrapper.find('.help-toggle').trigger('click');
    await wrapper.find('.strategy-overlay').trigger('click');
    expect(wrapper.find('#strategy-panel').exists()).toBe(false);

    await wrapper.find('.help-toggle').trigger('click');
    await wrapper.find('.strategy-close').trigger('click');
    expect(wrapper.find('#strategy-panel').exists()).toBe(false);

    await wrapper.find('.help-toggle').trigger('click');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect(wrapper.find('#strategy-panel').exists()).toBe(false);
  });

  it('keeps card hold and draw flow working when strategy is open', async () => {
    const wrapper = mount(App);

    await wrapper.find('.help-toggle').trigger('click');
    await wrapper.find('.playing-card').trigger('click');
    await wrapper.find('button.primary-action').trigger('click');

    expect(wrapper.find('#strategy-panel').exists()).toBe(true);
    expect(wrapper.find('button.primary-action').text()).toBe('Next Hand');
    expect(wrapper.text()).toMatch(/Lose|pays/);
  });

  it('keeps the five card buttons stable when holding a card', async () => {
    const wrapper = mount(App);
    const beforeLabels = wrapper.findAll('.playing-card').map((card) => card.attributes('aria-label'));

    await wrapper.find('.playing-card').trigger('click');

    const afterCards = wrapper.findAll('.playing-card');
    expect(afterCards).toHaveLength(5);
    expect(afterCards[0].attributes('aria-label')).toContain('Release');
    expect(afterCards.slice(1).map((card) => card.attributes('aria-label'))).toEqual(beforeLabels.slice(1));
  });
});

describe('GameControls', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('displays a winning state', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Royal Flush pays 800.',
        resultTone: 'win',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });

    expect(wrapper.text()).toContain('Royal Flush pays 800.');
    expect(wrapper.find('.result-message--win').exists()).toBe(true);
    expect(wrapper.find('.primary-action').text()).toBe('Next Hand');
  });

  it('displays a losing state', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Lose. Try the next hand.',
        resultTone: 'loss',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });

    expect(wrapper.text()).toContain('Lose');
    expect(wrapper.find('.result-message--loss').exists()).toBe(true);
  });

  it('offers a new game with no auto play control when out of credits', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: false,
        resultMessage: 'Lose. Out of credits.',
        resultTone: 'loss',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });

    const primary = wrapper.find('.primary-action');
    expect(primary.text()).toBe('New game');
    expect(primary.attributes('disabled')).toBeUndefined();

    primary.trigger('click');
    expect(wrapper.emitted('newGame')).toHaveLength(1);
  });

  it('shows a stop button that emits toggle while auto playing', async () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'holding',
        canContinue: true,
        resultMessage: 'Choose cards to hold, then draw.',
        resultTone: 'neutral',
        autoPlaying: true,
        autoPlaySpeed: 1,
      },
    });

    const stop = wrapper.find('.primary-action--stop');
    expect(stop.text()).toBe('Stop');

    await stop.trigger('click');
    expect(wrapper.emitted('toggleAutoPlay')).toHaveLength(1);
  });

  it('requests auto play only after a long press on Draw', () => {
    vi.useFakeTimers();
    const wrapper = mount(GameControls, {
      props: {
        phase: 'holding',
        canContinue: true,
        resultMessage: 'Choose cards to hold, then draw.',
        resultTone: 'neutral',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });
    const draw = wrapper.find('.primary-action');

    // A quick click just draws.
    draw.trigger('click');
    expect(wrapper.emitted('draw')).toHaveLength(1);
    expect(wrapper.emitted('requestAutoPlay')).toBeUndefined();

    // Holding for the full duration requests auto play and swallows the click.
    draw.trigger('pointerdown');
    vi.advanceTimersByTime(3000);
    expect(wrapper.emitted('requestAutoPlay')).toHaveLength(1);

    draw.trigger('click');
    expect(wrapper.emitted('draw')).toHaveLength(1);

    vi.useRealTimers();
  });

  it('does not request auto play if the press is released early', () => {
    vi.useFakeTimers();
    const wrapper = mount(GameControls, {
      props: {
        phase: 'holding',
        canContinue: true,
        resultMessage: 'Choose cards to hold, then draw.',
        resultTone: 'neutral',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });
    const draw = wrapper.find('.primary-action');

    draw.trigger('pointerdown');
    vi.advanceTimersByTime(1500);
    draw.trigger('pointerup');
    vi.advanceTimersByTime(3000);

    expect(wrapper.emitted('requestAutoPlay')).toBeUndefined();

    vi.useRealTimers();
  });

  it('announces result messages politely and atomically', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Lose. Try the next hand.',
        resultTone: 'loss',
        autoPlaying: false,
        autoPlaySpeed: 1,
      },
    });
    const result = wrapper.find('.result-message');

    expect(result.attributes('aria-live')).toBe('polite');
    expect(result.attributes('aria-atomic')).toBe('true');
  });
});

describe('StrategyPanel', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('renders all strategy items in a table', () => {
    const wrapper = mount(StrategyPanel);

    expect(wrapper.find('table.strategy-table').exists()).toBe(true);
    expect(wrapper.findAll('tbody tr')).toHaveLength(16);
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['#', 'Play']);
    expect(wrapper.text()).toContain('Four of a kind, straight flush, royal flush');
    expect(wrapper.text()).toContain('Discard everything');
  });

  it('is an accessible dialog and emits close', async () => {
    const wrapper = mount(StrategyPanel);

    expect(wrapper.attributes('role')).toBe('dialog');
    expect(wrapper.attributes('aria-modal')).toBe('true');

    await wrapper.find('.strategy-close').trigger('click');

    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('renders Traditional Chinese table labels and rows', () => {
    useI18n().setLocale('zh-Hant');

    const wrapper = mount(StrategyPanel);

    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['#', '打法']);
    expect(wrapper.text()).toContain('四條、同花順、皇家同花順');
    expect(wrapper.text()).toContain('全部棄牌');
  });
});

// Reconstruct the dealt hand from the English card aria-labels. Handles both the
// interactive form ("Hold ace of hearts") and the revealed neutral form
// ("ace of hearts · winning card").
function readHandIds(labels: (string | undefined)[]): string[] {
  return labels.map((label) => {
    const match = /(\S+) of (\S+)/.exec(label ?? '');
    if (!match) {
      throw new Error(`Unexpected card label: ${label}`);
    }
    return createCard(match[1] as Rank, match[2] as Suit).id;
  });
}

describe('App hint mode', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('shows no recommendations until hint mode is enabled', () => {
    const wrapper = mount(App);

    expect(wrapper.find('.hint-toggle').attributes('aria-pressed')).toBe('false');
    expect(wrapper.findAll('.playing-card--recommended')).toHaveLength(0);
  });

  it('marks exactly the strategy-recommended cards when enabled', async () => {
    const wrapper = mount(App);
    await wrapper.find('.hint-toggle').trigger('click');

    const cards = wrapper.findAll('.playing-card');
    const handIds = readHandIds(cards.map((card) => card.attributes('aria-label')));
    const recommended = new Set(recommendHolds(handIds.map((id) => {
      const [rank, , suit] = id.split('-');
      return createCard(rank as Rank, suit as Suit);
    })));

    cards.forEach((card, index) => {
      expect(card.classes().includes('playing-card--recommended')).toBe(recommended.has(handIds[index]));
    });
    expect(wrapper.find('.hint-toggle').attributes('aria-pressed')).toBe('true');
  });

  it('does not change held state or deal a new hand when toggled', async () => {
    const wrapper = mount(App);
    const before = wrapper.findAll('.playing-card');
    const heldBefore = before.map((card) => card.attributes('aria-pressed'));
    const handBefore = readHandIds(before.map((card) => card.attributes('aria-label')));

    await wrapper.find('.hint-toggle').trigger('click');

    const after = wrapper.findAll('.playing-card');
    const heldAfter = after.map((card) => card.attributes('aria-pressed'));
    const handAfter = readHandIds(after.map((card) => card.attributes('aria-label')));

    expect(heldAfter).toEqual(heldBefore);
    expect(handAfter).toEqual(handBefore);
  });
});

describe('App win highlight', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('hides the held annotation once the hand is revealed', async () => {
    const wrapper = mount(App);
    await wrapper.find('.playing-card').trigger('click');
    expect(wrapper.find('.playing-card--held').exists()).toBe(true);

    await wrapper.find('.primary-action').trigger('click');

    expect(wrapper.find('.playing-card--held').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Held');
  });

  it('annotates exactly the winning group after the draw', async () => {
    const wrapper = mount(App);
    await wrapper.find('.primary-action').trigger('click');

    const cards = wrapper.findAll('.playing-card');
    const handIds = readHandIds(cards.map((card) => card.attributes('aria-label')));
    const hand = handIds.map((id) => {
      const [rank, , suit] = id.split('-');
      return createCard(rank as Rank, suit as Suit);
    });
    const expected = new Set(payoutForHand(hand) > 0 ? winningCardIds(hand) : []);

    cards.forEach((card, index) => {
      expect(card.classes().includes('playing-card--winning')).toBe(expected.has(handIds[index]));
    });
  });

  it('gives revealed cards a neutral name without a hold action', async () => {
    const wrapper = mount(App);
    expect(wrapper.find('.playing-card').attributes('aria-label')).toMatch(/^(Hold|Release) /);

    await wrapper.find('.primary-action').trigger('click');

    for (const card of wrapper.findAll('.playing-card')) {
      const label = card.attributes('aria-label') ?? '';
      expect(label).not.toMatch(/Hold|Release/);
      expect(label).toMatch(/ of /);
    }
  });
});

describe('App auto play', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // The secret gesture: long-press Draw, then confirm the dialog.
  async function activateAutoPlay(wrapper: ReturnType<typeof mount>): Promise<void> {
    await wrapper.find('.primary-action').trigger('pointerdown');
    vi.advanceTimersByTime(3000);
    await nextTick();
    await wrapper.find('.confirm-dialog .primary-action').trigger('click');
    await nextTick();
  }

  it('keeps auto play hidden and requires confirmation via a Draw long-press', async () => {
    vi.useFakeTimers();
    const wrapper = mount(App);

    // No auto play control is visible up front.
    expect(wrapper.find('.primary-action--stop').exists()).toBe(false);
    expect(wrapper.find('.auto-speed').exists()).toBe(false);

    // Long-press opens the confirmation dialog but does not start yet.
    await wrapper.find('.primary-action').trigger('pointerdown');
    vi.advanceTimersByTime(3000);
    await nextTick();
    expect(wrapper.find('.confirm-dialog').exists()).toBe(true);
    expect(wrapper.find('.primary-action--stop').exists()).toBe(false);

    // Cancelling closes the dialog without starting.
    await wrapper.find('.secondary-action').trigger('click');
    expect(wrapper.find('.confirm-dialog').exists()).toBe(false);
    expect(wrapper.find('.primary-action--stop').exists()).toBe(false);
  });

  it('runs after confirmation, disables manual controls, and can be stopped', async () => {
    vi.useFakeTimers();
    const wrapper = mount(App);

    await activateAutoPlay(wrapper);

    expect(wrapper.find('.primary-action--stop').text()).toBe('Stop');
    expect(wrapper.find('.auto-speed').exists()).toBe(true);
    expect(wrapper.find('.playing-card').attributes('disabled')).toBeDefined();

    const handsPlayed = () => Number(wrapper.findAll('.stats-grid dd')[2].text());
    vi.advanceTimersByTime(650 * 6);
    await nextTick();
    expect(handsPlayed()).toBeGreaterThanOrEqual(1);

    await wrapper.find('.primary-action--stop').trigger('click');
    await nextTick();
    expect(wrapper.find('.primary-action--stop').exists()).toBe(false);
    expect(wrapper.find('.auto-speed').exists()).toBe(false);

    const settled = handsPlayed();
    vi.advanceTimersByTime(650 * 6);
    await nextTick();
    expect(handsPlayed()).toBe(settled);
  });

  it('changes the play speed from the slider', async () => {
    vi.useFakeTimers();
    const wrapper = mount(App);

    await activateAutoPlay(wrapper);

    const slider = wrapper.find('.auto-speed__slider');
    await slider.setValue('3'); // index 3 -> 100x
    await nextTick();

    expect(slider.attributes('aria-valuetext')).toBe('100x');
    expect(wrapper.find('.auto-speed__value').text()).toBe('100x');
  });
});

describe('App settings and pay table', () => {
  beforeEach(() => {
    useI18n().setLocale('en');
  });

  it('restarts the game with new stakes when the wager per card changes', async () => {
    const wrapper = mount(App);

    await wrapper.find('.settings-toggle').trigger('click');
    await wrapper.find('#wager-per-card').setValue('1'); // per card 1 -> hand wager 5
    await nextTick();

    const values = wrapper.findAll('.stats-grid dd');
    expect(values[0].text()).toBe('95.00'); // 100 starting - 5 wager
    expect(values[2].text()).toBe('1'); // hands reset to the fresh deal
    expect(values[3].text()).toBe('5.00'); // total wager
  });

  it('restarts with the chosen starting credits', async () => {
    const wrapper = mount(App);

    await wrapper.find('.settings-toggle').trigger('click');
    await wrapper.find('#starting-credits').setValue('500');
    await nextTick();

    // 500 starting - 1.25 default wager
    expect(wrapper.findAll('.stats-grid dd')[0].text()).toBe('498.75');
  });

  it('shows the pay table with base and at-current-wager payouts', async () => {
    const wrapper = mount(App);

    await wrapper.find('.paytable-toggle').trigger('click');
    const table = wrapper.find('#pay-table-panel');

    expect(table.exists()).toBe(true);
    expect(table.text()).toContain('Royal Flush');
    expect(table.text()).toContain('1500'); // base
    expect(table.text()).toContain('375.00'); // scaled at default 0.25
  });
});
