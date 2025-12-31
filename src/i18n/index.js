import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

// Check for user's language preference from profile first, then fall back to saved lang
const userLanguage = localStorage.getItem("user_language");
const saved = localStorage.getItem("lang");
const preferredLang = userLanguage || saved;
const locale = preferredLang === "ar" || preferredLang === "en" ? preferredLang : "en";
// If neither is set or they're invalid, default to "en"

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
