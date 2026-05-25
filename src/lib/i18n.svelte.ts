import { translations, type Lang, type TranslationKey } from "./i18n.js";

const STORAGE_KEY = "gigdeploy_lang";

function getInitialLang(): Lang {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "ar" || s === "en") return s;
  } catch {}
  return "ar";
}

class I18nStore {
  lang = $state<Lang>(getInitialLang());

  get isRtl() {
    return this.lang === "ar";
  }

  t(key: TranslationKey): string {
    return (translations[this.lang][key] ?? translations.ar[key] ?? key) as string;
  }

  toggleLang() {
    this.lang = this.lang === "ar" ? "en" : "ar";
    try {
      localStorage.setItem(STORAGE_KEY, this.lang);
    } catch {}
    this.applyToDocument();
  }

  applyToDocument() {
    document.documentElement.dir = this.isRtl ? "rtl" : "ltr";
    document.documentElement.lang = this.lang;
  }
}

export const i18n = new I18nStore();
