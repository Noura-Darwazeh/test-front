import { computed } from "vue";
import { useCurrencyStore } from "@/stores/currency.js";

/**
 * Composable for currency operations in components
 * Provides reactive currency conversion and formatting
 */
export function useCurrency() {
  const currencyStore = useCurrencyStore();

  // Reactive getters
  const selectedCurrency = computed(() => currencyStore.selectedCurrency);
  const availableCurrencies = computed(() => currencyStore.availableCurrencies);
  const isLoading = computed(() => currencyStore.isLoading);
  const error = computed(() => currencyStore.error);
  const exchangeRates = computed(() => currencyStore.exchangeRates);

  // Currency operations
  const convertAmount = (amount, fromCurrency = "USD", toCurrency = null) => {
    return currencyStore.convertAmount(amount, fromCurrency, toCurrency);
  };

  const formatAmount = (amount, currency = null, locale = "en-US") => {
    return currencyStore.formatAmount(amount, currency, locale);
  };

  const convertAndFormat = (
    amount,
    fromCurrency = "USD",
    toCurrency = null,
    locale = "en-US"
  ) => {
    return currencyStore.convertAndFormat(
      amount,
      fromCurrency,
      toCurrency,
      locale
    );
  };

  const roundAmount = (amount, currency = null) => {
    return currencyStore.roundAmount(amount, currency);
  };

  // Currency management
  const setSelectedCurrency = (currency) => {
    currencyStore.setSelectedCurrency(currency);
  };

  const refreshExchangeRates = () => {
    return currencyStore.loadExchangeRates(true);
  };

  const clearError = () => {
    currencyStore.clearError();
  };

  const getCurrencyByCode = (code) => {
    return currencyStore.getCurrencyByCode(code);
  };

  // Helper functions for common use cases
  const formatPrice = (price, fromCurrency = "USD") => {
    if (!price || isNaN(price)) return formatAmount(0);
    return convertAndFormat(price, fromCurrency);
  };

  const formatPriceWithFallback = (
    price,
    fromCurrency = "USD",
    fallbackText = "N/A"
  ) => {
    if (!price || isNaN(price) || price === 0) return fallbackText;
    return formatPrice(price, fromCurrency);
  };

  // Currency comparison helpers
  const isSameCurrency = (currency1, currency2) => {
    if (!currency1 || !currency2) return false;
    return currency1.code === currency2.code;
  };

  const needsConversion = (fromCurrency) => {
    const current = selectedCurrency.value;
    return current && fromCurrency && current.code !== fromCurrency;
  };

  return {
    // Reactive state
    selectedCurrency,
    availableCurrencies,
    isLoading,
    error,
    exchangeRates,

    // Core operations
    convertAmount,
    formatAmount,
    convertAndFormat,
    roundAmount,

    // Management
    setSelectedCurrency,
    refreshExchangeRates,
    clearError,
    getCurrencyByCode,

    // Helpers
    formatPrice,
    formatPriceWithFallback,
    isSameCurrency,
    needsConversion,
  };
}
