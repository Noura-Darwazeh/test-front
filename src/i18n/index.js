import { createI18n } from "vue-i18n";
import { getItem, setItem } from "@/utils/shared/storageUtils.js";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

// Get saved language from localStorage or detect browser language
const getSavedLanguage = () => {
  // First, check localStorage
  const savedLang = getItem("lang");
  if (savedLang) {
    return savedLang;
  }

  // If no saved language, detect browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const detectedLang = browserLang.startsWith("ar") ? "ar" : "en";
  
  // Save detected language to localStorage
  setItem("lang", detectedLang);
  
  return detectedLang;
};

export const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
});

// Function to change language and save to localStorage
export const setLocale = (lang) => {
  i18n.global.locale.value = lang;
  setItem("lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
};