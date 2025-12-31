import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCurrenciesManagementStore = defineStore("currenciesManagement", () => {
  // State
  const currencies = ref([]);
  const trashedCurrencies = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchCurrencies = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCurrencies();

      // Use backend data directly, no mapping needed
      currencies.value = response.data.data;

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch currencies";
      console.error("Error fetching currencies:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addCurrency = async (currencyData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createCurrency(currencyData);

      // Add new currency directly from backend response
      currencies.value.push(response.data.data);
      return response.data.data;
    } catch (err) {
      error.value = err.message || "Failed to add currency";
      console.error("Error adding currency:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrency = async (currencyId, currencyData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateCurrency(currencyId, currencyData);

      // Update local state directly with backend response
      const index = currencies.value.findIndex((c) => c.id === currencyId);
      if (index > -1) {
        currencies.value[index] = response.data.data;
      }
      return currencies.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update currency";
      console.error("Error updating currency:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCurrency = async (currencyId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteCurrency(currencyId);

      // Move to trashed after successful API call
      const index = currencies.value.findIndex((c) => c.id === currencyId);
      if (index > -1) {
        const currency = currencies.value.splice(index, 1)[0];
        trashedCurrencies.value.push(currency);
      }
    } catch (err) {
      error.value = err.message || "Failed to delete currency";
      console.error("Error deleting currency:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreCurrency = async (currencyId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreCurrency(currencyId);

      // Restore to active currencies after successful API call
      const index = trashedCurrencies.value.findIndex((c) => c.id === currencyId);
      if (index > -1) {
        const currency = trashedCurrencies.value.splice(index, 1)[0];
        currencies.value.push(currency);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore currency";
      console.error("Error restoring currency:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    currencies,
    trashedCurrencies,
    loading,
    error,
    // Actions
    fetchCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    restoreCurrency,
  };
});
