import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCompanyPriceStore = defineStore("companyPrices", () => {
  const companyPrices = ref([]);
  const trashedCompanyPrices = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  const extractIdName = (value) => {
    if (Array.isArray(value)) {
      return { id: value[0], name: value[1] || "" };
    }
    if (value && typeof value === "object") {
      return { id: value.id ?? null, name: value.name || "" };
    }
    return { id: value ?? null, name: "" };
  };

  const normalizeCompanyPrice = (price) => {
    const companyInfo = extractIdName(price.company_id ?? price.company);
    const companyId = companyInfo.id;
    const companyName =
      price.company_name ||
      companyInfo.name ||
      (companyId ? `Company ${companyId}` : "");
    const currencyInfo = extractIdName(price.currency_id ?? price.currency);
    const currencyId = currencyInfo.id;
    const currencyName =
      price.currency_name ||
      price.currency?.name ||
      currencyInfo.name ||
      "";
    const currencySymbol =
      price.currency_symbol ||
      price.currency?.symbol ||
      price.currency?.name ||
      currencyName ||
      "";

    return {
      id: price.id,
      price: parseFloat(price.price ?? 0),
      itemType: price.itemType || price.item_type || "",
      company_id: companyId,
      company_name: companyName,
      currency_id: currencyId,
      currency_name: currencyName,
      currency_symbol: currencySymbol,
      created_at: price.created_at,
      updated_at: price.updated_at,
      deleted_at: price.deleted_at,
      is_active: price.is_active ?? 1,
    };
  };

  const fetchCompanyPrices = async ({ filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCompanyPrices({ page: 1, perPage: 1000, filters });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      companyPrices.value = data.map(normalizeCompanyPrice);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch company prices";
      console.error("Error fetching company prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedCompanyPrices = async ({ filters = {} } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedCompanyPrices({ page: 1, perPage: 1000, filters });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      trashedCompanyPrices.value = data.map(normalizeCompanyPrice);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed company prices";
      console.error("Error fetching trashed company prices:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addCompanyPrice = async (priceData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createCompanyPrice(priceData);
      const newPrice = normalizeCompanyPrice(response.data.data || response.data);
      companyPrices.value.push(newPrice);
      return newPrice;
    } catch (err) {
      error.value = err.message || "Failed to add company price";
      console.error("Error adding company price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCompanyPrice = async (priceId, priceData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateCompanyPrice(priceId, priceData);
      const updated = normalizeCompanyPrice(response.data.data || response.data);
      const index = companyPrices.value.findIndex((p) => p.id === priceId);
      if (index > -1) {
        companyPrices.value[index] = updated;
      }
      return companyPrices.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update company price";
      console.error("Error updating company price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompanyPrice = async (priceId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteCompanyPrice(priceId, force);

      if (force) {
        trashedCompanyPrices.value = trashedCompanyPrices.value.filter(
          (price) => price.id !== priceId
        );
      } else {
        const index = companyPrices.value.findIndex((p) => p.id === priceId);
        if (index > -1) {
          const price = companyPrices.value.splice(index, 1)[0];
          trashedCompanyPrices.value.push(price);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete company price";
      console.error("Error deleting company price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreCompanyPrice = async (priceId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreCompanyPrice(priceId);

      const index = trashedCompanyPrices.value.findIndex(
        (p) => p.id === priceId
      );
      if (index > -1) {
        const price = trashedCompanyPrices.value.splice(index, 1)[0];
        companyPrices.value.push(price);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore company price";
      console.error("Error restoring company price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteCompanyPrices = async (priceIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteCompanyPrices(priceIds, force);

      if (force) {
        trashedCompanyPrices.value = trashedCompanyPrices.value.filter(
          (price) => !priceIds.includes(price.id)
        );
      } else {
        const deleted = companyPrices.value.filter((price) =>
          priceIds.includes(price.id)
        );
        companyPrices.value = companyPrices.value.filter(
          (price) => !priceIds.includes(price.id)
        );
        trashedCompanyPrices.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete company prices";
      console.error("Error bulk deleting company prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreCompanyPrices = async (priceIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreCompanyPrices(priceIds);

      const restored = trashedCompanyPrices.value.filter((price) =>
        priceIds.includes(price.id)
      );
      trashedCompanyPrices.value = trashedCompanyPrices.value.filter(
        (price) => !priceIds.includes(price.id)
      );
      companyPrices.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore company prices";
      console.error("Error bulk restoring company prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    companyPrices,
    trashedCompanyPrices,
    loading,
    trashedLoading,
    error,
    // Actions
    fetchCompanyPrices,
    fetchTrashedCompanyPrices,
    addCompanyPrice,
    updateCompanyPrice,
    deleteCompanyPrice,
    restoreCompanyPrice,
    bulkDeleteCompanyPrices,
    bulkRestoreCompanyPrices,
  };
});
