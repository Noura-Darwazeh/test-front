import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useLinePriceStore = defineStore("linePrice", () => {
  // State
  const linePrices = ref([]);
  const trashedLinePrices = ref([]);
  const loading = ref(false);
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
      linePrices.value = response.data.data.map((price) => ({
        id: price.id,
        line_id: price.line_id,
        line_name: `Line ${price.line_id}`, // You can map this to actual line names from lines store
        price: parseFloat(price.price),
        currency_id: price.currency_id,
        currency_code: `Currency ${price.currency_id}`, // You can map this to actual currency codes
        company_id: price.company_id,
        company_name: `Company ${price.company_id}`, // You can map this to actual company names
        type: price.type, // 'return' or 'one_way'
        created_by: price.created_by,
        created_at: price.created_at,
        updated_at: price.updated_at,
        deleted_at: price.deleted_at,
      }));

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
      const newPrice = {
        id: response.data.data.id,
        line_id: response.data.data.line_id,
        line_name: `Line ${response.data.data.line_id}`,
        price: parseFloat(response.data.data.price),
        currency_id: response.data.data.currency_id,
        currency_code: `Currency ${response.data.data.currency_id}`,
        company_id: response.data.data.company_id,
        company_name: `Company ${response.data.data.company_id}`,
        type: response.data.data.type,
        created_by: response.data.data.created_by,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
        deleted_at: response.data.data.deleted_at,
      };

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
        linePrices.value[index] = {
          id: response.data.data.id,
          line_id: response.data.data.line_id,
          line_name: `Line ${response.data.data.line_id}`,
          price: parseFloat(response.data.data.price),
          currency_id: response.data.data.currency_id,
          currency_code: `Currency ${response.data.data.currency_id}`,
          company_id: response.data.data.company_id,
          company_name: `Company ${response.data.data.company_id}`,
          type: response.data.data.type,
          created_by: response.data.data.created_by,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          deleted_at: response.data.data.deleted_at,
        };
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

  const deleteLinePrice = async (priceId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteLinePrice(priceId);

      const index = linePrices.value.findIndex((p) => p.id === priceId);
      if (index > -1) {
        const price = linePrices.value.splice(index, 1)[0];
        trashedLinePrices.value.push(price);
      }
      console.log("✅ Line price deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete line price";
      console.error("❌ Error deleting line price:", err);
      throw err;
    } finally {
      loading.value = false;
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

  return {
    // State
    linePrices,
    trashedLinePrices,
    loading,
    error,
    // Getters
    pricesByLine,
    pricesByCompany,
    pricesByType,
    pricesByCurrency,
    // Actions
    fetchLinePrices,
    addLinePrice,
    updateLinePrice,
    deleteLinePrice,
    restoreLinePrice,
  };
});