import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const usePermissionModuleStore = defineStore("permissionModule", () => {
  // State
  const permissions = ref([]);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchPermissions = async ({ page = 1, perPage = 10 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getPermissions({ page, perPage });
      const { data, meta } = response.data || response;
      
      permissions.value = data || [];
      if (meta && meta.pagination) {
        pagination.value = {
          currentPage: meta.pagination.current_page || 1,
          lastPage: meta.pagination.last_page || 1,
          perPage: meta.pagination.per_page || 10,
          total: meta.pagination.total || 0,
        };
      } else if (response.data && response.data.current_page) {
        // Fallback in case meta object is missing but pagination is in root
        pagination.value = {
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          perPage: response.data.per_page,
          total: response.data.total,
        };
      } else {
        // Fallback for simple array responses without pagination meta
        pagination.value = {
          currentPage: 1,
          lastPage: 1,
          perPage: permissions.value.length || 10,
          total: permissions.value.length || 0,
        };
      }
    } catch (err) {
      error.value = err.message || "Failed to fetch permissions";
      console.error("Error fetching permissions:", err);
    } finally {
      loading.value = false;
    }
  };

  const addPermission = async (payload) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.createPermission(payload);
      await fetchPermissions({ page: pagination.value.currentPage, perPage: pagination.value.perPage });
      return true;
    } catch (err) {
      error.value = err.message || "Failed to add permission";
      console.error("Error adding permission:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const editPermission = async (id, payload) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.updatePermission(id, payload);
      await fetchPermissions({ page: pagination.value.currentPage, perPage: pagination.value.perPage });
      return true;
    } catch (err) {
      error.value = err.message || "Failed to update permission";
      console.error("Error updating permission:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePermission = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deletePermission(id);
      await fetchPermissions({ page: pagination.value.currentPage, perPage: pagination.value.perPage });
      return true;
    } catch (err) {
      error.value = err.message || "Failed to delete permission";
      console.error("Error deleting permission:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    permissions,
    pagination,
    loading,
    error,
    fetchPermissions,
    addPermission,
    editPermission,
    deletePermission,
  };
});
