import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useRegionsManagementStore = defineStore("regionsManagement", () => {
  // State
  const regions = ref([]);
  const trashedRegions = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const regionsPagination = ref({
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
  const fetchRegions = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getRegions({ page, perPage, filters });

      // Use backend data directly, no mapping needed
      regions.value = response.data.data;

      // Update pagination metadata from response
      if (response.data.meta) {
        regionsPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch regions";
      console.error("Error fetching regions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addRegion = async (regionData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createRegion(regionData);

      // Add new region directly from backend response
      regions.value.push(response.data.data);
      return response.data.data;
    } catch (err) {
      error.value = err.message || "Failed to add region";
      console.error("Error adding region:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRegion = async (regionId, regionData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateRegion(regionId, regionData);

      // Update local state directly with backend response
      const index = regions.value.findIndex((r) => r.id === regionId);
      if (index > -1) {
        regions.value[index] = response.data.data;
      }
      return regions.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update region";
      console.error("Error updating region:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedRegions = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedRegions({ page, perPage, filters });
      trashedRegions.value = response.data.data;

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
      error.value = err.message || "Failed to fetch trashed regions";
      console.error("Error fetching trashed regions:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const deleteRegion = async (regionId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteRegion(regionId, force);

      if (force) {
        trashedRegions.value = trashedRegions.value.filter(
          (region) => region.id !== regionId
        );
      } else {
        // Move to trashed after successful API call
        const index = regions.value.findIndex((r) => r.id === regionId);
        if (index > -1) {
          const region = regions.value.splice(index, 1)[0];
          trashedRegions.value.push(region);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete region";
      console.error("Error deleting region:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreRegion = async (regionId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreRegion(regionId);

      // Restore to active regions after successful API call
      const index = trashedRegions.value.findIndex((r) => r.id === regionId);
      if (index > -1) {
        const region = trashedRegions.value.splice(index, 1)[0];
        regions.value.push(region);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore region";
      console.error("Error restoring region:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteRegions = async (regionIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteRegions(regionIds, force);

      if (force) {
        trashedRegions.value = trashedRegions.value.filter(
          (region) => !regionIds.includes(region.id)
        );
      } else {
        const deleted = regions.value.filter((region) =>
          regionIds.includes(region.id)
        );
        regions.value = regions.value.filter(
          (region) => !regionIds.includes(region.id)
        );
        trashedRegions.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete regions";
      console.error("Error bulk deleting regions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreRegions = async (regionIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreRegions(regionIds);

      const restored = trashedRegions.value.filter((region) =>
        regionIds.includes(region.id)
      );
      trashedRegions.value = trashedRegions.value.filter(
        (region) => !regionIds.includes(region.id)
      );
      regions.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore regions";
      console.error("Error bulk restoring regions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    regions,
    trashedRegions,
    loading,
    trashedLoading,
    error,
    regionsPagination,
    trashedPagination,
    // Actions
    fetchRegions,
    fetchTrashedRegions,
    addRegion,
    updateRegion,
    deleteRegion,
    restoreRegion,
    bulkDeleteRegions,
    bulkRestoreRegions,
  };
});
