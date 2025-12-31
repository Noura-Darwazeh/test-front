import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useBranchesManagementStore = defineStore("branchesManagement", () => {
  // State
  const branches = ref([]);
  const trashedBranches = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchBranches = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getBranches();

      // Use backend data directly
      branches.value = response.data.data;

      console.log("✅ Branches loaded successfully:", branches.value.length);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch branches";
      console.error("❌ Error fetching branches:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addBranch = async (branchData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createBranch(branchData);

      // Add new branch directly from backend response
      branches.value.push(response.data.data);
      console.log("✅ Branch added successfully");
      return response.data.data;
    } catch (err) {
      error.value = err.message || "Failed to add branch";
      console.error("❌ Error adding branch:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBranch = async (branchId, branchData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateBranch(branchId, branchData);

      // Update local state directly with backend response
      const index = branches.value.findIndex((b) => b.id === branchId);
      if (index > -1) {
        branches.value[index] = response.data.data;
      }
      console.log("✅ Branch updated successfully");
      return branches.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update branch";
      console.error("❌ Error updating branch:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBranch = async (branchId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteBranch(branchId);

      // Remove from active branches
      const index = branches.value.findIndex((b) => b.id === branchId);
      if (index > -1) {
        branches.value.splice(index, 1);
      }
      console.log("✅ Branch deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete branch";
      console.error("❌ Error deleting branch:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreBranch = async (branchId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.restoreBranch(branchId);

      // Remove from trashed and add to active branches
      const index = trashedBranches.value.findIndex((b) => b.id === branchId);
      if (index > -1) {
        trashedBranches.value.splice(index, 1);
      }

      if (response.data?.data) {
        branches.value.push(response.data.data);
      }
      console.log("✅ Branch restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore branch";
      console.error("❌ Error restoring branch:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    branches,
    trashedBranches,
    loading,
    error,
    // Actions
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    restoreBranch,
  };
});