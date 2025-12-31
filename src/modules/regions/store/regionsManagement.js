import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useRegionsManagementStore = defineStore("regionsManagement", () => {
  // State
  const regions = ref([]);
  const trashedRegions = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchRegions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getRegions();

      // Use backend data directly, no mapping needed
      regions.value = response.data.data;

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

  const deleteRegion = async (regionId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteRegion(regionId);

      // Move to trashed after successful API call
      const index = regions.value.findIndex((r) => r.id === regionId);
      if (index > -1) {
        const region = regions.value.splice(index, 1)[0];
        trashedRegions.value.push(region);
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

  return {
    // State
    regions,
    trashedRegions,
    loading,
    error,
    // Actions
    fetchRegions,
    addRegion,
    updateRegion,
    deleteRegion,
    restoreRegion,
  };
});
