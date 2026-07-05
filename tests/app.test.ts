import { mount } from '@vue/test-utils';
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

  it('opens and closes the strategy panel with accessible toggle state', async () => {
    const wrapper = mount(App);
    const helpButton = wrapper.find('.help-toggle');

    expect(wrapper.find('#strategy-panel').exists()).toBe(false);
    expect(helpButton.attributes('aria-expanded')).toBe('false');

    await helpButton.trigger('click');

    expect(wrapper.find('#strategy-panel').exists()).toBe(true);
    expect(wrapper.find('.help-toggle').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('.help-toggle').attributes('aria-controls')).toBe('strategy-panel');

    await wrapper.find('.help-toggle').trigger('click');

    expect(wrapper.find('#strategy-panel').exists()).toBe(false);
    expect(wrapper.find('.help-toggle').attributes('aria-expanded')).toBe('false');
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
  it('renders all strategy items', () => {
    const wrapper = mount(StrategyPanel);

    expect(wrapper.findAll('li')).toHaveLength(16);
    expect(wrapper.text()).toContain('Four of a kind, straight flush, royal flush');
    expect(wrapper.text()).toContain('Discard everything');
  });
});
