import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import App from '../src/App.vue';
import GameControls from '../src/components/GameControls.vue';
import StrategyPanel from '../src/components/StrategyPanel.vue';

describe('App playable UI', () => {
  it('renders an initial dealt hand and post-deal credits', () => {
    const wrapper = mount(App);
    const cards = wrapper.findAll('.playing-card');

    expect(cards).toHaveLength(5);
    expect(wrapper.text()).toContain('Credits');
    expect(wrapper.text()).toContain('999');
    expect(wrapper.text()).toContain('Draw');
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
  it('displays a winning state', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Royal Flush pays 800.',
        resultTone: 'win',
      },
    });

    expect(wrapper.text()).toContain('Royal Flush pays 800.');
    expect(wrapper.find('.result-message--win').exists()).toBe(true);
    expect(wrapper.find('button').text()).toBe('Next Hand');
  });

  it('displays a losing state', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Lose. Try the next hand.',
        resultTone: 'loss',
      },
    });

    expect(wrapper.text()).toContain('Lose');
    expect(wrapper.find('.result-message--loss').exists()).toBe(true);
  });

  it('disables continuing when out of credits', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: false,
        resultMessage: 'Lose. Out of credits.',
        resultTone: 'loss',
      },
    });

    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('announces result messages politely and atomically', () => {
    const wrapper = mount(GameControls, {
      props: {
        phase: 'evaluating',
        canContinue: true,
        resultMessage: 'Lose. Try the next hand.',
        resultTone: 'loss',
      },
    });
    const result = wrapper.find('.result-message');

    expect(result.attributes('aria-live')).toBe('polite');
    expect(result.attributes('aria-atomic')).toBe('true');
  });
});

describe('StrategyPanel', () => {
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
});
