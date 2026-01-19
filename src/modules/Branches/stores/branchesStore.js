import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useBranchesManagementStore = defineStore("branchesManagement", () => {
  // State
  const branches = ref([]);
  const trashedBranches = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  const extractIdName = (value, fallbackId = null, fallbackName = "") => {
    if (Array.isArray(value)) {
      return { id: value[0] ?? fallbackId, name: value[1] ?? fallbackName };
    }
    if (value && typeof value === "object") {
      return {
        id: value.id ?? fallbackId,
        name: value.name ?? value.label ?? fallbackName,
      };
    }
    if (value === null || value === undefined) {
      return { id: fallbackId, name: fallbackName };
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return { id: fallbackId, name: fallbackName };
      const asNumber = Number(trimmed);
      if (!Number.isNaN(asNumber)) {
        return { id: trimmed, name: fallbackName };
      }
      return { id: fallbackId, name: trimmed };
    }
    return { id: value, name: fallbackName };
  };

  // Helper function to add company_name to branches and flatten location
  const enrichBranchesWithCompanyName = async (branchesData) => {
    try {
      // Fetch companies to get company names
      const companiesResponse = await apiServices.getCompanies();
      const companies = companiesResponse.data.data || [];
      
      // Create a map of company_id to company name
      const companyMap = {};
      companies.forEach(company => {
        companyMap[company.id] = company.name;
      });

      // Add company_name to each branch and flatten location object
      return branchesData.map((branch) => {
        const companyInfo = extractIdName(branch.company ?? branch.company_id);
        const companyId = companyInfo.id;
        const companyName =
          branch.company_name ||
          companyInfo.name ||
          companyMap[companyId] ||
          (companyId ? `Company ${companyId}` : "");

        return {
          ...branch,
          company_id: companyId ?? null,
          company_name: companyName,
          // Flatten location if it's an object
          latitude: branch.latitude || branch.location?.latitude || "",
          longitude: branch.longitude || branch.location?.longitude || "",
        };
      });
    } catch (err) {
      console.warn("⚠️ Could not fetch companies, using fallback:", err);
      // If companies fetch fails, use fallback
      return branchesData.map((branch) => {
        const companyInfo = extractIdName(branch.company ?? branch.company_id);
        const companyId = companyInfo.id;
        const companyName =
          branch.company_name ||
          companyInfo.name ||
          (companyId ? `Company ${companyId}` : "");

        return {
          ...branch,
          company_id: companyId ?? null,
          company_name: companyName,
          latitude: branch.latitude || branch.location?.latitude || "",
          longitude: branch.longitude || branch.location?.longitude || "",
        };
      });
    }
  };

  // Actions
  const fetchBranches = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getBranches();

      // Enrich branches with company_name and flatten location
      branches.value = await enrichBranchesWithCompanyName(response.data.data);

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
      console.log("📤 Sending branch data to API:", branchData);
      const response = await apiServices.createBranch(branchData);

      console.log("📥 API Response:", response.data);

      // Enrich new branch with company_name and flatten location
      const enrichedBranch = (await enrichBranchesWithCompanyName([response.data.data]))[0];
      branches.value.push(enrichedBranch);
      console.log("✅ Branch added successfully");
      return enrichedBranch;
    } catch (err) {
      error.value = err.message || "Failed to add branch";
      console.error("❌ Error adding branch:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateBranch = async (branchId, branchData) => {
    loading.value = true;
    error.value = null;
    try {
      console.log("📤 Updating branch with data:", branchData);
      const response = await apiServices.updateBranch(branchId, branchData);

      console.log("📥 Update Response:", response.data);

      // Enrich updated branch with company_name and flatten location
      const enrichedBranch = (await enrichBranchesWithCompanyName([response.data.data]))[0];
      const index = branches.value.findIndex((b) => b.id === branchId);
      if (index > -1) {
        branches.value[index] = enrichedBranch;
      }
      console.log("✅ Branch updated successfully");
      return enrichedBranch;
    } catch (err) {
      error.value = err.message || "Failed to update branch";
      console.error("❌ Error updating branch:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteBranch = async (branchId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteBranch(branchId, force);

      if (force) {
        branches.value = branches.value.filter((branch) => branch.id !== branchId);
        trashedBranches.value = trashedBranches.value.filter(
          (branch) => branch.id !== branchId
        );
      } else {
        const index = branches.value.findIndex((b) => b.id === branchId);
        if (index > -1) {
          const branch = branches.value.splice(index, 1)[0];
          trashedBranches.value.push(branch);
        }
      }
      console.log("?o. Branch deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete branch";
      console.error("??O Error deleting branch:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedBranches = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedBranches();

      // Enrich branches with company_name and flatten location
      trashedBranches.value = await enrichBranchesWithCompanyName(response.data.data);

      console.log(`✅ Successfully loaded ${trashedBranches.value.length} trashed branches`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed branches";
      console.error("❌ Error fetching trashed branches:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
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
        // Enrich restored branch with company_name and flatten location
        const enrichedBranch = (await enrichBranchesWithCompanyName([response.data.data]))[0];
        branches.value.push(enrichedBranch);
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

  const bulkDeleteBranches = async (branchIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteBranches(branchIds, force);

      if (force) {
        // Permanent delete - remove from trashedBranches
        trashedBranches.value = trashedBranches.value.filter(
          (branch) => !branchIds.includes(branch.id)
        );
      } else {
        // Soft delete - move from branches to trashedBranches
        const deletedBranches = branches.value.filter((branch) =>
          branchIds.includes(branch.id)
        );
        branches.value = branches.value.filter(
          (branch) => !branchIds.includes(branch.id)
        );
        trashedBranches.value.push(...deletedBranches);
      }

      console.log(`✅ Successfully bulk deleted ${branchIds.length} branches`);
    } catch (err) {
      error.value = err.message || "Failed to bulk delete branches";
      console.error("❌ Error bulk deleting branches:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreBranches = async (branchIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreBranches(branchIds);

      // Move branches from trashedBranches to branches
      const restoredBranches = trashedBranches.value.filter((branch) =>
        branchIds.includes(branch.id)
      );
      trashedBranches.value = trashedBranches.value.filter(
        (branch) => !branchIds.includes(branch.id)
      );
      branches.value.push(...restoredBranches);

      console.log(`✅ Successfully bulk restored ${branchIds.length} branches`);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore branches";
      console.error("❌ Error bulk restoring branches:", err);
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
    trashedLoading,
    error,
    // Actions
    fetchBranches,
    fetchTrashedBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    restoreBranch,
    bulkDeleteBranches,
    bulkRestoreBranches,
  };
});
