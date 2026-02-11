import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const usePermissionsStore = defineStore("permissions", () => {
  // State - only permissions-related, NOT users
  const permissions = ref([]);
  const userPermissions = ref({}); // { [userId]: [permissionId, ...] }
  const loading = ref(false);
  const error = ref(null);

  // Pagination state for permissions only
  const permissionsPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  // Normalize permission from API
  const normalizePermission = (permission) => ({
    id: permission.id,
    name: permission.name,
  });

  // Fetch all available permissions
  const fetchPermissions = async ({ page = 1, perPage = 100 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getPermissions({ page, perPage });

      // API returns: { success: true, data: { current_page, data: [...permissions], total, last_page, per_page } }
      // or: { success: true, data: [...permissions] } (non-paginated)
      const paginatedData = response.data.data;
      const permissionsArray = paginatedData.data || paginatedData;

      permissions.value = Array.isArray(permissionsArray) ? permissionsArray.map(normalizePermission) : [];

      // Extract pagination from the nested data object
      if (paginatedData.current_page !== undefined) {
        permissionsPagination.value = {
          currentPage: paginatedData.current_page,
          perPage: paginatedData.per_page,
          total: paginatedData.total,
          lastPage: paginatedData.last_page,
        };
      } else if (response.data.meta) {
        // Fallback for meta structure
        permissionsPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch permissions";
      console.error("Error fetching permissions:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch users with permissions from /user_permissions to build permission map
  const fetchUserPermissionsMap = async () => {
    try {
      // Fetch all users with permissions (high perPage to get all)
      const response = await apiServices.getUsersWithPermissions({ page: 1, perPage: 1000 });
      // API returns: { success: true, data: { current_page, data: [...users with permissions], ... } }
      const paginatedData = response.data.data;
      const usersWithPerms = paginatedData.data || [];

      // Build permission map from users who have permissions
      const permMap = {};
      usersWithPerms.forEach((user) => {
        permMap[user.id] = (user.permissions || []).map((p) => p.id);
      });
      userPermissions.value = permMap;

      return permMap;
    } catch (err) {
      console.error("Error fetching user permissions map:", err);
      // Don't throw - just return empty map if this fails
      return {};
    }
  };

  // Assign permission to user
  const assignPermission = async (userId, permissionId) => {
    try {
      await apiServices.assignPermissionToUser(userId, permissionId);

      // Update local state
      const currentPerms = userPermissions.value[userId] || [];
      if (!currentPerms.includes(permissionId)) {
        userPermissions.value = {
          ...userPermissions.value,
          [userId]: [...currentPerms, permissionId],
        };
      }

      return true;
    } catch (err) {
      error.value = err.message || "Failed to assign permission";
      console.error("Error assigning permission:", err);
      throw err;
    }
  };

  // Remove permission from user
  const removePermission = async (userId, permissionId) => {
    try {
      await apiServices.removePermissionFromUser(userId, permissionId);

      // Update local state
      const currentPerms = userPermissions.value[userId] || [];
      userPermissions.value = {
        ...userPermissions.value,
        [userId]: currentPerms.filter((id) => id !== permissionId),
      };

      return true;
    } catch (err) {
      error.value = err.message || "Failed to remove permission";
      console.error("Error removing permission:", err);
      throw err;
    }
  };

  // Check if user has permission
  const hasPermission = (userId, permissionId) => {
    const perms = userPermissions.value[userId] || [];
    return perms.includes(permissionId);
  };

  return {
    // State
    permissions,
    userPermissions,
    loading,
    error,
    permissionsPagination,
    // Actions
    fetchPermissions,
    fetchUserPermissionsMap,
    assignPermission,
    removePermission,
    hasPermission,
  };
});
