import { computed, ref } from 'vue';
import { isSupportedLocale, type Locale, messages } from './messages';

const STORAGE_KEY = 'mvpweb.locale';

const locale = ref<Locale>(detectInitialLocale());
const currentMessages = computed(() => messages[locale.value]);

export function useI18n() {
  function setLocale(nextLocale: Locale): void {
    locale.value = nextLocale;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLocale;
    }
    getStorage()?.setItem(STORAGE_KEY, nextLocale);
  }

  function t(template: string, params: Record<string, string | number> = {}): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale.value;
  }

  return {
    locale,
    messages: currentMessages,
    setLocale,
    t,
  };
}

export function detectInitialLocale(): Locale {
  const storedLocale = getStorage()?.getItem(STORAGE_KEY);

  if (storedLocale && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')) {
    return 'zh-Hant';
  }

  return 'en';
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
