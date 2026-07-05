import { describe, expect, it } from 'vitest';
import { messages, type LocaleMessages } from '../src/i18n/messages';
import { detectInitialLocale, useI18n } from '../src/i18n/useI18n';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[]`];
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
}

describe('i18n messages', () => {
  it('keeps English and Traditional Chinese dictionaries structurally aligned', () => {
    const englishKeys = flattenKeys(messages.en satisfies LocaleMessages).sort();
    const chineseKeys = flattenKeys(messages['zh-Hant'] satisfies LocaleMessages).sort();

    expect(chineseKeys).toEqual(englishKeys);
  });

  it('interpolates message parameters', () => {
    const { t } = useI18n();

    expect(t(messages.en.winningPayout, { handRank: 'Royal Flush', amount: 800 })).toBe(
      'Royal Flush pays 800.',
    );
    expect(t(messages.en.holdCard, { rank: 'ace', suit: 'hearts' })).toBe('Hold ace of hearts');
  });

  it('falls back to English for unsupported browser languages', () => {
    globalThis.localStorage?.clear();
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'fr-FR',
    });

    expect(detectInitialLocale()).toBe('en');
  });

  it('uses Traditional Chinese for Chinese browser languages', () => {
    globalThis.localStorage?.clear();
    Object.defineProperty(navigator, 'language', {
      configurable: true,
      value: 'zh-TW',
    });

    expect(detectInitialLocale()).toBe('zh-Hant');
  });
});
