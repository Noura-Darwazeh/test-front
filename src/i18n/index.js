import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

/**
 * Detect browser language
 * @returns {string} - 'ar' or 'en'
 */
function detectBrowserLanguage() {
  try {
    const browserLang = navigator.language || navigator.userLanguage;
    // Check if browser language is Arabic
    if (browserLang.startsWith('ar')) {
      return 'ar';
    }
    // Default to English for all other languages
    return 'en';
  } catch (error) {
    console.warn('Error detecting browser language:', error);
    return 'en';
  }
}

/**
 * Get initial locale with priority:
 * 1. User language from profile (highest priority)
 * 2. Saved language preference
 * 3. Browser language (first visit)
 * 4. Default 'en' (fallback)
 */
function getInitialLocale() {
  // Check user's language preference from profile first
  const userLanguage = localStorage.getItem("user_language");
  if (userLanguage === "ar" || userLanguage === "en") {
    return userLanguage;
  }

  // Then check saved language preference
  const saved = localStorage.getItem("lang");
  if (saved === "ar" || saved === "en") {
    return saved;
  }

  // First visit - detect browser language
  const browserLang = detectBrowserLanguage();
  
  // Save browser language for next time
  localStorage.setItem("lang", browserLang);
  
  return browserLang;
}

// Get the initial locale
const locale = getInitialLocale();

export const i18n = createI18n({
  legacy: false, // composition api is used instead of options api.
  locale, // sets the default language.
  fallbackLocale: "en", // fallback emergency if the language is found with an error or not found.
  messages: { en, ar }, // messages is an object that registers translation files.
});

function applyDir(current) {
  const isRTL = current === "ar"; // isRTL is a boolean value that determines if the language is ar or not.
  document.documentElement.lang = current; // document.documentElement.lang is the language of the document.
  document.documentElement.dir = isRTL ? "rtl" : "ltr"; // document.documentEldement.dir is the direction of the document.
}

applyDir(locale);

export function setLocale(lang) {
  if (lang !== "en" && lang !== "ar") return;

  i18n.global.locale.value = lang; // Set the language in the application
  localStorage.setItem("lang", lang); // Save to localStorage for persistence
  localStorage.setItem("user_language", lang); // Also update user_language to keep in sync
  applyDir(lang);
}