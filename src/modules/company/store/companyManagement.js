import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCompanyManagementStore = defineStore("companyManagement", () => {
  // State
  const companies = ref([]);
  const trashedCompanies = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Getters
  const activeCompanies = computed(() =>
    companies.value.filter((company) => company.status === "active")
  );

  const inactiveCompanies = computed(() =>
    companies.value.filter((company) => company.status === "inactive")
  );

  // Actions
  const fetchCompanies = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCompanies();

      // Use backend data directly, no mapping needed
      companies.value = response.data.data;

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch companies";
      console.error("Error fetching companies:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedCompanies = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedCompanies();

      // Use backend data directly, no mapping needed
      trashedCompanies.value = response.data.data;

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed companies";
      console.error("Error fetching trashed companies:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addCompany = async (companyData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createCompany(companyData);

      // Add new company directly from backend response
      companies.value.push(response.data.data);
      return response.data.data;
    } catch (err) {
      error.value = err.message || "Failed to add company";
      console.error("Error adding company:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCompany = async (companyId, companyData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateCompany(companyId, companyData);

      // Update local state directly with backend response
      const index = companies.value.findIndex((c) => c.id === companyId);
      if (index > -1) {
        companies.value[index] = response.data.data;
      }
      return companies.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update company";
      console.error("Error updating company:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompany = async (companyId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteEntity('companies', companyId, force);

      if (force) {
        // Permanent delete from trashed companies
        const index = trashedCompanies.value.findIndex((c) => c.id === companyId);
        if (index > -1) {
          trashedCompanies.value.splice(index, 1);
        }
      } else {
        // Soft delete from active companies
        const index = companies.value.findIndex((c) => c.id === companyId);
        if (index > -1) {
          companies.value.splice(index, 1);
        }
      }
      // Note: Trashed companies will be fetched from API when needed
    } catch (err) {
      error.value = err.message || "Failed to delete company";
      console.error("Error deleting company:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreCompany = async (companyId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.restoreEntity('companies', companyId);

      // Remove from trashed companies and add to active companies
      const index = trashedCompanies.value.findIndex((c) => c.id === companyId);
      if (index > -1) {
        trashedCompanies.value.splice(index, 1);
      }

      // Add the restored company to active companies list
      if (response.data?.data) {
        companies.value.push(response.data.data);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore company";
      console.error("Error restoring company:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteCompanies = async (companyIds, force = false) => {
    if (force) {
      trashedLoading.value = true;
    } else {
      loading.value = true;
    }
    error.value = null;
    try {
      await apiServices.bulkDeleteEntities('company', 'companies', companyIds, force);

      if (force) {
        // Remove permanently deleted companies from trashed list
        trashedCompanies.value = trashedCompanies.value.filter((c) => !companyIds.includes(c.id));
      } else {
        // Remove soft deleted companies from active list
        companies.value = companies.value.filter((c) => !companyIds.includes(c.id));
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete companies";
      console.error("Error bulk deleting companies:", err);
      throw err;
    } finally {
      if (force) {
        trashedLoading.value = false;
      } else {
        loading.value = false;
      }
    }
  };

  const bulkRestoreCompanies = async (companyIds) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.bulkRestoreEntities('company', 'companies', companyIds);

      // Remove restored companies from trashed companies list
      trashedCompanies.value = trashedCompanies.value.filter((c) => !companyIds.includes(c.id));

      // Add restored companies to active companies list
      if (response.data?.data) {
        companies.value.push(...response.data.data);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk restore companies";
      console.error("Error bulk restoring companies:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  return {
    // State
    companies,
    trashedCompanies,
    loading,
    trashedLoading,
    error,
    // Getters
    activeCompanies,
    inactiveCompanies,
    // Actions
    fetchCompanies,
    fetchTrashedCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    restoreCompany,
    bulkDeleteCompanies,
    bulkRestoreCompanies,
  };
});
