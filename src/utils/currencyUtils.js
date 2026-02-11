/**
 * Currency conversion and formatting utilities
 */

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} exchangeRates - Exchange rates object
 * @returns {number} Converted amount
 */
export function convertCurrency(
  amount,
  fromCurrency,
  toCurrency,
  exchangeRates
) {
  if (!amount || isNaN(amount)) {
    return 0;
  }

  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // If no exchange rates available, return original amount
  if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
    console.warn("No exchange rates available for conversion");
    return amount;
  }

  // Get the base currency from exchange rates
  const baseCurrency = exchangeRates.baseCurrency || "USD";

  let convertedAmount = amount;

  // Convert to base currency first if needed
  if (fromCurrency !== baseCurrency) {
    const toBaseRate = exchangeRates.rates[fromCurrency];
    if (!toBaseRate) {
      console.warn(`No exchange rate found for ${fromCurrency}`);
      return amount;
    }
    // If rate is from base to currency, we need to divide to get back to base
    convertedAmount = amount / toBaseRate;
  }

  // Convert from base currency to target currency
  if (toCurrency !== baseCurrency) {
    const fromBaseRate = exchangeRates.rates[toCurrency];
    if (!fromBaseRate) {
      console.warn(`No exchange rate found for ${toCurrency}`);
      return amount;
    }
    convertedAmount = convertedAmount * fromBaseRate;
  }

  return convertedAmount;
}

/**
 * Format currency amount with symbol and proper decimal places
 * @param {number} amount - Amount to format
 * @param {Object} currency - Currency object with symbol and decimalPlaces
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency, locale = "en-US") {
  if (!amount || isNaN(amount)) {
    amount = 0;
  }

  if (!currency) {
    return amount.toFixed(2);
  }

  const decimalPlaces = currency.decimalPlaces ?? 2;

  // Round to appropriate decimal places
  const roundedAmount = Number(amount.toFixed(decimalPlaces));

  // Format with locale
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(roundedAmount);

  // Return with currency symbol
  return `${currency.symbol}${formattedNumber}`;
}

/**
 * Round amount to currency's decimal places
 * @param {number} amount - Amount to round
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {number} Rounded amount
 */
export function roundToCurrency(amount, decimalPlaces = 2) {
  if (!amount || isNaN(amount)) {
    return 0;
  }

  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(amount * multiplier) / multiplier;
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export function parseCurrencyString(currencyString) {
  if (typeof currencyString === "number") {
    return currencyString;
  }

  if (!currencyString) {
    return 0;
  }

  // Remove currency symbols and formatting
  const cleanString = currencyString.replace(/[^0-9.-]/g, "").trim();

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
}
