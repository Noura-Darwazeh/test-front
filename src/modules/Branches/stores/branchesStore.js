import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useBranchesManagementStore = defineStore("branchesManagement", () => {
  // State
  const branches = ref([]);
  const trashedBranches = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Helper function to add company_name to branches
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

      // Add company_name to each branch
      return branchesData.map(branch => ({
        ...branch,
        company_name: branch.company_name || 
                     branch.company?.name || 
                     companyMap[branch.company_id] || 
                     `Company ${branch.company_id || ''}`
      }));
    } catch (err) {
      console.warn("⚠️ Could not fetch companies, using fallback:", err);
      // If companies fetch fails, use fallback
      return branchesData.map(branch => ({
        ...branch,
        company_name: branch.company_name || 
                     branch.company?.name || 
                     `Company ${branch.company_id || ''}`
      }));
    }
  };

  // Actions
  const fetchBranches = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getBranches();

      // Enrich branches with company_name
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
      const response = await apiServices.createBranch(branchData);

      // Enrich new branch with company_name
      const enrichedBranch = (await enrichBranchesWithCompanyName([response.data.data]))[0];
      branches.value.push(enrichedBranch);
      console.log("✅ Branch added successfully");
      return enrichedBranch;
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

      // Enrich updated branch with company_name
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
        // Enrich restored branch with company_name
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