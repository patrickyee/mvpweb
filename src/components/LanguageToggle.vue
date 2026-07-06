<script setup lang="ts">
import { type Locale } from '../i18n/messages';
import { useI18n } from '../i18n/useI18n';

const { locale, messages, setLocale } = useI18n();
</script>

<template>
  <div class="language-toggle" role="group" :aria-label="messages.languageLabel">
    <button
      type="button"
      class="language-toggle__button"
      :class="{ 'language-toggle__button--active': locale === 'en' }"
      :aria-pressed="locale === 'en'"
      aria-label="Switch to English"
      @click="setLocale('en' as Locale)"
    >
      EN
    </button>
    <button
      type="button"
      class="language-toggle__button"
      :class="{ 'language-toggle__button--active': locale === 'zh-Hant' }"
      :aria-pressed="locale === 'zh-Hant'"
      aria-label="切換至繁體中文"
      @click="setLocale('zh-Hant' as Locale)"
    >
      繁
    </button>
  </div>
</template>
