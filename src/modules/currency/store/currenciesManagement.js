import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCurrenciesManagementStore = defineStore("currenciesManagement", () => {
  // State
  const currencies = ref([]);
  const trashedCurrencies = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const currenciesPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const trashedPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  // Actions
  const fetchCurrencies = async ({ page = 1, perPage = 10 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCurrencies({ page, perPage });

      // Use backend data directly, no mapping needed
      currencies.value = response.data.data;

      // Update pagination metadata from response
      if (response.data.meta) {
        currenciesPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

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

  const fetchTrashedCurrencies = async ({ page = 1, perPage = 10 } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedCurrencies({ page, perPage });
      trashedCurrencies.value = response.data.data;

      // Update pagination metadata from response
      if (response.data.meta) {
        trashedPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed currencies";
      console.error("Error fetching trashed currencies:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const deleteCurrency = async (currencyId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteCurrency(currencyId, force);

      if (force) {
        trashedCurrencies.value = trashedCurrencies.value.filter(
          (currency) => currency.id !== currencyId
        );
      } else {
        // Move to trashed after successful API call
        const index = currencies.value.findIndex((c) => c.id === currencyId);
        if (index > -1) {
          const currency = currencies.value.splice(index, 1)[0];
          trashedCurrencies.value.push(currency);
        }
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

  const bulkDeleteCurrencies = async (currencyIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteCurrencies(currencyIds, force);

      if (force) {
        trashedCurrencies.value = trashedCurrencies.value.filter(
          (currency) => !currencyIds.includes(currency.id)
        );
      } else {
        const deleted = currencies.value.filter((currency) =>
          currencyIds.includes(currency.id)
        );
        currencies.value = currencies.value.filter(
          (currency) => !currencyIds.includes(currency.id)
        );
        trashedCurrencies.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete currencies";
      console.error("Error bulk deleting currencies:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreCurrencies = async (currencyIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreCurrencies(currencyIds);

      const restored = trashedCurrencies.value.filter((currency) =>
        currencyIds.includes(currency.id)
      );
      trashedCurrencies.value = trashedCurrencies.value.filter(
        (currency) => !currencyIds.includes(currency.id)
      );
      currencies.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore currencies";
      console.error("Error bulk restoring currencies:", err);
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
    trashedLoading,
    error,
    currenciesPagination,
    trashedPagination,
    // Actions
    fetchCurrencies,
    fetchTrashedCurrencies,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    restoreCurrency,
    bulkDeleteCurrencies,
    bulkRestoreCurrencies,
  };
});
