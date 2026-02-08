import api from "./api.js";

/**
 * Currency service for managing currency data and exchange rates
 */
export class CurrencyService {
  /**
   * Fetch available currencies from the API
   * @returns {Promise<Array>} Array of currency objects
   */
  static async getCurrencies() {
    try {
      const response = await api.get("/currencies");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching currencies:", error);
      // Return default currencies if API fails
      return this.getDefaultCurrencies();
    }
  }

  /**
   * Fetch current exchange rates
   * @param {string} baseCurrency - Base currency code (default: USD)
   * @returns {Promise<Object>} Exchange rates object
   */
  static async getExchangeRates(baseCurrency = "USD") {
    try {
      const response = await api.get(`/exchange-rates?base=${baseCurrency}`);
      return {
        rates: response.data.data.rates || {},
        lastUpdated: new Date(response.data.data.lastUpdated || Date.now()),
        baseCurrency,
      };
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Return mock rates for development/fallback
      return this.getMockExchangeRates(baseCurrency);
    }
  }

  /**
   * Get default currencies for fallback
   * @returns {Array} Default currency list
   */
  static getDefaultCurrencies() {
    return [
      {
        id: 1,
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        decimalPlaces: 2,
        isActive: true,
      },
      {
        id: 2,
        code: "EUR",
        name: "Euro",
        symbol: "€",
        decimalPlaces: 2,
        isActive: true,
      },
      {
        id: 3,
        code: "GBP",
        name: "British Pound",
        symbol: "£",
        decimalPlaces: 2,
        isActive: true,
      },
      {
        id: 4,
        code: "JPY",
        name: "Japanese Yen",
        symbol: "¥",
        decimalPlaces: 0,
        isActive: true,
      },
      {
        id: 5,
        code: "AED",
        name: "UAE Dirham",
        symbol: "د.إ",
        decimalPlaces: 2,
        isActive: true,
      },
      {
        id: 6,
        code: "SAR",
        name: "Saudi Riyal",
        symbol: "ر.س",
        decimalPlaces: 2,
        isActive: true,
      },
    ];
  }

  /**
   * Get mock exchange rates for development/fallback
   * @param {string} baseCurrency - Base currency code
   * @returns {Object} Mock exchange rates
   */
  static getMockExchangeRates(baseCurrency = "USD") {
    const mockRates = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        AED: 3.67,
        SAR: 3.75,
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        JPY: 129.5,
        AED: 4.33,
        SAR: 4.42,
      },
      GBP: {
        USD: 1.37,
        EUR: 1.16,
        JPY: 150.8,
        AED: 5.04,
        SAR: 5.14,
      },
    };

    return {
      rates: mockRates[baseCurrency] || mockRates.USD,
      lastUpdated: new Date(),
      baseCurrency,
    };
  }
}
