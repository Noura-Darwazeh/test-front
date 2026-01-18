import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useDiscountStore = defineStore("discounts", () => {
  const discounts = ref([]);
  const trashedDiscounts = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const discountsPagination = ref({
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

  const extractIdName = (value) => {
    if (Array.isArray(value)) {
      return { id: value[0], name: value[1] || "" };
    }
    if (value && typeof value === "object") {
      return { id: value.id ?? null, name: value.name || "" };
    }
    return { id: value ?? null, name: "" };
  };

  const normalizeDiscount = (discount) => {
    const companyInfo = extractIdName(discount.company_id ?? discount.company);
    const companyId = companyInfo.id;
    const companyName =
      discount.company_name ||
      companyInfo.name ||
      (companyId ? `Company ${companyId}` : "");

    return {
      id: discount.id,
      type: discount.type || discount.discount_type || "",
      discount_percentage: parseFloat(
        discount.discount_percentage ?? discount.percentage ?? 0
      ),
      start_date: discount.start_date || discount.startDate || "",
      end_date: discount.end_date || discount.endDate || null,
      company_id: companyId,
      company_name: companyName,
      value: discount.value ?? discount.discount_value ?? "",
      status: discount.status || "",
      usage_count: discount.usage_count ?? 0,
      created_at: discount.created_at,
      updated_at: discount.updated_at,
      deleted_at: discount.deleted_at,
    };
  };

  const fetchDiscounts = async ({ page = 1, perPage = 10 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getDiscounts({ page, perPage });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      discounts.value = data.map(normalizeDiscount);

      // Update pagination metadata from response
      if (response.data.meta) {
        discountsPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch discounts";
      console.error("Error fetching discounts:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedDiscounts = async ({ page = 1, perPage = 10 } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedDiscounts({ page, perPage });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      trashedDiscounts.value = data.map(normalizeDiscount);

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
      error.value = err.message || "Failed to fetch trashed discounts";
      console.error("Error fetching trashed discounts:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addDiscount = async (discountData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createDiscount(discountData);
      const newDiscount = normalizeDiscount(response.data.data || response.data);
      discounts.value.push(newDiscount);
      return newDiscount;
    } catch (err) {
      error.value = err.message || "Failed to add discount";
      console.error("Error adding discount:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDiscount = async (discountId, discountData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateDiscount(
        discountId,
        discountData
      );
      const updated = normalizeDiscount(response.data.data || response.data);
      const index = discounts.value.findIndex((d) => d.id === discountId);
      if (index > -1) {
        discounts.value[index] = updated;
      }
      return discounts.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update discount";
      console.error("Error updating discount:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDiscount = async (discountId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteDiscount(discountId, force);

      if (force) {
        trashedDiscounts.value = trashedDiscounts.value.filter(
          (discount) => discount.id !== discountId
        );
      } else {
        const index = discounts.value.findIndex((d) => d.id === discountId);
        if (index > -1) {
          const discount = discounts.value.splice(index, 1)[0];
          trashedDiscounts.value.push(discount);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete discount";
      console.error("Error deleting discount:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreDiscount = async (discountId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreDiscount(discountId);

      const index = trashedDiscounts.value.findIndex(
        (d) => d.id === discountId
      );
      if (index > -1) {
        const discount = trashedDiscounts.value.splice(index, 1)[0];
        discounts.value.push(discount);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore discount";
      console.error("Error restoring discount:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteDiscounts = async (discountIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteDiscounts(discountIds, force);

      if (force) {
        trashedDiscounts.value = trashedDiscounts.value.filter(
          (discount) => !discountIds.includes(discount.id)
        );
      } else {
        const deleted = discounts.value.filter((discount) =>
          discountIds.includes(discount.id)
        );
        discounts.value = discounts.value.filter(
          (discount) => !discountIds.includes(discount.id)
        );
        trashedDiscounts.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete discounts";
      console.error("Error bulk deleting discounts:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreDiscounts = async (discountIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreDiscounts(discountIds);

      const restored = trashedDiscounts.value.filter((discount) =>
        discountIds.includes(discount.id)
      );
      trashedDiscounts.value = trashedDiscounts.value.filter(
        (discount) => !discountIds.includes(discount.id)
      );
      discounts.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore discounts";
      console.error("Error bulk restoring discounts:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    discounts,
    trashedDiscounts,
    loading,
    trashedLoading,
    error,
    discountsPagination,
    trashedPagination,
    // Actions
    fetchDiscounts,
    fetchTrashedDiscounts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    restoreDiscount,
    bulkDeleteDiscounts,
    bulkRestoreDiscounts,
  };
});
