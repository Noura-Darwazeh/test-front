import { createI18n } from "vue-i18n";
import { getItem, setItem } from "@/utils/shared/storageUtils.js";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

// Get saved language from localStorage or detect browser language
const getSavedLanguage = () => {
  // First, check localStorage
  const savedLang = getItem("user_language");
  if (savedLang) {
    return savedLang;
  }

  // If no saved language, detect browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const detectedLang = browserLang.startsWith("ar") ? "ar" : "en";
  
  // Save detected language to localStorage
  setItem("user_language", detectedLang);
  
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
  const normalizedLang = lang.toLowerCase(); 
  i18n.global.locale.value = normalizedLang;
  setItem("user_language", normalizedLang); 
  
  document.documentElement.lang = normalizedLang;
  document.documentElement.dir = normalizedLang === "ar" ? "rtl" : "ltr";
  
  console.log("✅ Language changed to:", normalizedLang); 
};