import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

const saved = localStorage.getItem("lang"); // saved is a constant that gets the language from the localStorage.
const locale = saved === "ar" || saved === "en" ? saved : "en"; // locale is a constant that sets the default language.
// and in case saved is not ar or en, the default language is en.

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
  if (lang !== "en" && lang !== "ar") return; // i
  // f the language is not en or ar, return.
  i18n.global.locale.value = lang; // i18n.global.locale.value is the language of the application.
  localStorage.setItem("lang", lang); // This sets the current language in the localStorage to save it for the entire session.
  applyDir(lang);
}
