import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useLinePriceStore = defineStore("linePrice", () => {
  const normalizeLinePrice = (price) => {
    const line = price.line_id;
    const currency = price.currency_id;
    const company = price.company_id;

    const lineId = typeof line === "object" && line !== null ? line.id : line;
    const currencyId =
      typeof currency === "object" && currency !== null ? currency.id : currency;
    const companyId =
      typeof company === "object" && company !== null ? company.id : company;

    return {
      id: price.id,
      line_id: lineId,
      line_name:
        typeof line === "object" && line !== null
          ? line.name || ""
          : price.line_name || (lineId ? `Line ${lineId}` : ""),
      price: parseFloat(price.price),
      currency_id: currencyId,
      currency_code:
        typeof currency === "object" && currency !== null
          ? currency.symbol || ""
          : price.currency_code || (currencyId ? `Currency ${currencyId}` : ""),
      company_id: companyId,
      company_name:
        typeof company === "object" && company !== null
          ? company.name || ""
          : price.company_name || (companyId ? `Company ${companyId}` : ""),
      type: price.type,
      created_by: price.created_by,
      created_at: price.created_at,
      updated_at: price.updated_at,
      deleted_at: price.deleted_at,
    };
  };
  // State
  const linePrices = ref([]);
  const trashedLinePrices = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Getters
  const pricesByLine = computed(() => {
    const grouped = {};
    linePrices.value.forEach((price) => {
      const lineId = price.line_id;
      if (!grouped[lineId]) {
        grouped[lineId] = [];
      }
      grouped[lineId].push(price);
    });
    return grouped;
  });

  const pricesByCompany = computed(() => {
    const grouped = {};
    linePrices.value.forEach((price) => {
      const companyId = price.company_id;
      if (!grouped[companyId]) {
        grouped[companyId] = [];
      }
      grouped[companyId].push(price);
    });
    return grouped;
  });

  const pricesByType = computed(() => {
    const grouped = {};
    linePrices.value.forEach((price) => {
      const type = price.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(price);
    });
    return grouped;
  });

  const pricesByCurrency = computed(() => {
    const grouped = {};
    linePrices.value.forEach((price) => {
      const currencyId = price.currency_id;
      if (!grouped[currencyId]) {
        grouped[currencyId] = [];
      }
      grouped[currencyId].push(price);
    });
    return grouped;
  });

  // Actions
  const fetchLinePrices = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getLinePrices();

      // Transform API response to match frontend format
      linePrices.value = response.data.data.map((price) =>
        normalizeLinePrice(price)
      );

      console.log(`✅ Successfully loaded ${linePrices.value.length} line prices`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch line prices";
      console.error("❌ Error fetching line prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addLinePrice = async (priceData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate required fields
      if (!priceData.line_id) {
        const validationError = new Error("Line is required");
        validationError.response = {
          data: {
            success: false,
            error: "The line id field is required."
          }
        };
        throw validationError;
      }

      if (!priceData.price) {
        const validationError = new Error("Price is required");
        validationError.response = {
          data: {
            success: false,
            error: "The price field is required."
          }
        };
        throw validationError;
      }

      if (!priceData.currency_id) {
        const validationError = new Error("Currency is required");
        validationError.response = {
          data: {
            success: false,
            error: "The currency id field is required."
          }
        };
        throw validationError;
      }

      if (!priceData.company_id) {
        const validationError = new Error("Company is required");
        validationError.response = {
          data: {
            success: false,
            error: "The company id field is required."
          }
        };
        throw validationError;
      }

      if (!priceData.type) {
        const validationError = new Error("Type is required");
        validationError.response = {
          data: {
            success: false,
            error: "The type field is required."
          }
        };
        throw validationError;
      }

      // Transform frontend data to API format
      const apiData = {
        line_id: priceData.line_id,
        price: priceData.price,
        currency_id: priceData.currency_id,
        company_id: priceData.company_id,
        type: priceData.type, // 'return' or 'one_way'
      };

      console.log("📤 Sending line price data to API:", apiData);

      const response = await apiServices.createLinePrice(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newPrice = normalizeLinePrice(response.data.data);

      linePrices.value.push(newPrice);
      console.log("✅ Line price added successfully to store");
      return newPrice;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add line price";
        console.error("❌ Error adding line price:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateLinePrice = async (priceId, priceData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (priceData.line_id) apiData.line_id = priceData.line_id;
      if (priceData.price !== undefined) apiData.price = priceData.price;
      if (priceData.currency_id) apiData.currency_id = priceData.currency_id;
      if (priceData.company_id) apiData.company_id = priceData.company_id;
      if (priceData.type) apiData.type = priceData.type;

      console.log("📤 Updating line price:", apiData);

      const response = await apiServices.updateLinePrice(priceId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = linePrices.value.findIndex((p) => p.id === priceId);
      if (index > -1) {
        linePrices.value[index] = normalizeLinePrice(response.data.data);
        console.log("✅ Line price updated successfully");
      }
      return linePrices.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update line price";
      }
      console.error("❌ Error updating line price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLinePrice = async (priceId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteLinePrice(priceId, force);

      if (force) {
        linePrices.value = linePrices.value.filter((price) => price.id !== priceId);
        trashedLinePrices.value = trashedLinePrices.value.filter(
          (price) => price.id !== priceId
        );
      } else {
        const index = linePrices.value.findIndex((p) => p.id === priceId);
        if (index > -1) {
          const price = linePrices.value.splice(index, 1)[0];
          trashedLinePrices.value.push(price);
        }
      }
      console.log("? Line price deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete line price";
      console.error("? Error deleting line price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedLinePrices = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedLinePrices();

      // Transform API response to match frontend format
      trashedLinePrices.value = response.data.data.map((price) =>
        normalizeLinePrice(price)
      );

      console.log(`✅ Successfully loaded ${trashedLinePrices.value.length} trashed line prices`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed line prices";
      console.error("❌ Error fetching trashed line prices:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const restoreLinePrice = async (priceId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreLinePrice(priceId);

      const index = trashedLinePrices.value.findIndex((p) => p.id === priceId);
      if (index > -1) {
        const price = trashedLinePrices.value.splice(index, 1)[0];
        linePrices.value.push(price);
      }
      console.log("✅ Line price restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore line price";
      console.error("❌ Error restoring line price:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteLinePrices = async (priceIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteLinePrices(priceIds, force);

      if (force) {
        // Permanent delete - remove from trashedLinePrices
        trashedLinePrices.value = trashedLinePrices.value.filter(
          (price) => !priceIds.includes(price.id)
        );
      } else {
        // Soft delete - move from linePrices to trashedLinePrices
        const deletedPrices = linePrices.value.filter((price) =>
          priceIds.includes(price.id)
        );
        linePrices.value = linePrices.value.filter(
          (price) => !priceIds.includes(price.id)
        );
        trashedLinePrices.value.push(...deletedPrices);
      }

      console.log(`✅ Successfully bulk deleted ${priceIds.length} line prices`);
    } catch (err) {
      error.value = err.message || "Failed to bulk delete line prices";
      console.error("❌ Error bulk deleting line prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreLinePrices = async (priceIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreLinePrices(priceIds);

      // Move line prices from trashedLinePrices to linePrices
      const restoredPrices = trashedLinePrices.value.filter((price) =>
        priceIds.includes(price.id)
      );
      trashedLinePrices.value = trashedLinePrices.value.filter(
        (price) => !priceIds.includes(price.id)
      );
      linePrices.value.push(...restoredPrices);

      console.log(`✅ Successfully bulk restored ${priceIds.length} line prices`);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore line prices";
      console.error("❌ Error bulk restoring line prices:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    linePrices,
    trashedLinePrices,
    loading,
    trashedLoading,
    error,
    // Getters
    pricesByLine,
    pricesByCompany,
    pricesByType,
    pricesByCurrency,
    // Actions
    fetchLinePrices,
    fetchTrashedLinePrices,
    addLinePrice,
    updateLinePrice,
    deleteLinePrice,
    restoreLinePrice,
    bulkDeleteLinePrices,
    bulkRestoreLinePrices,
  };
});