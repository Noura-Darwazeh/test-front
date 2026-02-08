import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { CurrencyService } from "@/services/currencyService.js";
import {
  convertCurrency,
  formatCurrency,
  roundToCurrency,
} from "@/utils/currencyUtils.js";
import { getItem, setItem } from "@/utils/shared/storageUtils.js";

export const useCurrencyStore = defineStore("currency", () => {
  // State
  const selectedCurrency = ref(null);
  const availableCurrencies = ref([]);
  const exchangeRates = ref({});
  const isLoading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const STORAGE_KEYS = {
    SELECTED_CURRENCY: "selected_currency",
    EXCHANGE_RATES: "exchange_rates",
    LAST_UPDATED: "exchange_rates_last_updated",
  };

  // Getters
  const defaultCurrency = computed(() => {
    return (
      availableCurrencies.value.find((c) => c.code === "USD") ||
      availableCurrencies.value[0] || {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        decimalPlaces: 2,
      }
    );
  });

  const currentCurrency = computed(() => {
    return selectedCurrency.value || defaultCurrency.value;
  });

  const isExchangeRatesCached = computed(() => {
    const lastUpdate = lastUpdated.value || getItem(STORAGE_KEYS.LAST_UPDATED);
    if (!lastUpdate) return false;

    const now = new Date().getTime();
    const updateTime = new Date(lastUpdate).getTime();
    return now - updateTime < CACHE_DURATION;
  });

  // Actions
  async function initializeCurrencies() {
    try {
      isLoading.value = true;
      error.value = null;

      // Load currencies
      const currencies = await CurrencyService.getCurrencies();
      availableCurrencies.value = currencies;

      // Load saved currency preference
      const savedCurrency = getItem(STORAGE_KEYS.SELECTED_CURRENCY);
      if (savedCurrency) {
        const currency = currencies.find((c) => c.code === savedCurrency.code);
        if (currency) {
          selectedCurrency.value = currency;
        }
      }

      // Set default if no saved currency
      if (!selectedCurrency.value) {
        selectedCurrency.value = defaultCurrency.value;
      }

      // Load exchange rates
      await loadExchangeRates();
    } catch (err) {
      error.value = err.message || "Failed to initialize currencies";
      console.error("Currency initialization error:", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadExchangeRates(forceRefresh = false) {
    try {
      // Check if we have cached rates and don't need to refresh
      if (!forceRefresh && isExchangeRatesCached.value) {
        const cachedRates = getItem(STORAGE_KEYS.EXCHANGE_RATES);
        if (cachedRates) {
          exchangeRates.value = cachedRates;
          return;
        }
      }

      isLoading.value = true;
      const baseCurrency = currentCurrency.value?.code || "USD";
      const ratesData = await CurrencyService.getExchangeRates(baseCurrency);

      exchangeRates.value = ratesData;
      lastUpdated.value = ratesData.lastUpdated;

      // Cache the rates
      setItem(STORAGE_KEYS.EXCHANGE_RATES, ratesData);
      setItem(STORAGE_KEYS.LAST_UPDATED, ratesData.lastUpdated);
    } catch (err) {
      error.value = err.message || "Failed to load exchange rates";
      console.error("Exchange rates loading error:", err);

      // Try to use cached rates as fallback
      const cachedRates = getItem(STORAGE_KEYS.EXCHANGE_RATES);
      if (cachedRates) {
        exchangeRates.value = cachedRates;
        console.warn("Using cached exchange rates due to API error");
      }
    } finally {
      isLoading.value = false;
    }
  }

  function setSelectedCurrency(currency) {
    if (!currency) return;

    selectedCurrency.value = currency;
    setItem(STORAGE_KEYS.SELECTED_CURRENCY, currency);

    // Reload exchange rates with new base currency
    loadExchangeRates(true);
  }

  function convertAmount(amount, fromCurrency = "USD", toCurrency = null) {
    const targetCurrency = toCurrency || currentCurrency.value?.code || "USD";

    if (!exchangeRates.value || !exchangeRates.value.rates) {
      console.warn("No exchange rates available for conversion");
      return amount;
    }

    return convertCurrency(
      amount,
      fromCurrency,
      targetCurrency,
      exchangeRates.value
    );
  }

  function formatAmount(amount, currency = null, locale = "en-US") {
    const targetCurrency = currency || currentCurrency.value;
    return formatCurrency(amount, targetCurrency, locale);
  }

  function convertAndFormat(
    amount,
    fromCurrency = "USD",
    toCurrency = null,
    locale = "en-US"
  ) {
    const convertedAmount = convertAmount(amount, fromCurrency, toCurrency);
    const targetCurrency = toCurrency
      ? availableCurrencies.value.find((c) => c.code === toCurrency) ||
        currentCurrency.value
      : currentCurrency.value;

    return formatAmount(convertedAmount, targetCurrency, locale);
  }

  function roundAmount(amount, currency = null) {
    const targetCurrency = currency || currentCurrency.value;
    const decimalPlaces = targetCurrency?.decimalPlaces ?? 2;
    return roundToCurrency(amount, decimalPlaces);
  }

  function clearError() {
    error.value = null;
  }

  function getCurrencyByCode(code) {
    return availableCurrencies.value.find((c) => c.code === code);
  }

  // Initialize on store creation
  initializeCurrencies();

  return {
    // State
    selectedCurrency,
    availableCurrencies,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,

    // Getters
    defaultCurrency,
    currentCurrency,
    isExchangeRatesCached,

    // Actions
    initializeCurrencies,
    loadExchangeRates,
    setSelectedCurrency,
    convertAmount,
    formatAmount,
    convertAndFormat,
    roundAmount,
    clearError,
    getCurrencyByCode,
  };
});
