import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useUsersManagementStore = defineStore("usersManagement", () => {
  // State
  const users = ref([]);
  const trashedUsers = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const usersPagination = ref({
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
    return { id: value, name: fallbackName };
  };

// src/modules/user/store/usersManagement.js

// في src/modules/user/store/usersManagement.js

const normalizeUser = (user) => {
  const roleValue = Array.isArray(user.role) ? user.role[0] : user.role;
  const companyInfo = extractIdName(user.company ?? user.company_id);
  const regionInfo = extractIdName(user.region ?? user.region_id);
  const currencyInfo = extractIdName(user.currency ?? user.currency_id);

  return {
    ...user,
    role: roleValue ?? "",
    company_id: companyInfo.id ?? null,
    company_name: user.company_name || companyInfo.name || "",
    region_id: regionInfo.id ?? null,
    region_name: user.region_name || regionInfo.name || "",
    currency_id: currencyInfo.id ?? null,
    currency_name: user.currency_name || currencyInfo.name || "",
    shared_line: Number(user.shared_line ?? 0),
  };
};

  const extractUsersPayload = (payload) => {
    const dataRoot = payload?.data;
    const usersArray = Array.isArray(dataRoot)
      ? dataRoot
      : Array.isArray(dataRoot?.data)
        ? dataRoot.data
        : [];

    const metaSource =
      payload?.meta ||
      dataRoot?.meta ||
      (dataRoot && dataRoot.current_page !== undefined ? dataRoot : null);

    return { usersArray, metaSource };
  };

  const buildPagination = (metaSource, page, perPage, totalFallback) => {
    const resolvedPerPage = metaSource?.per_page ?? perPage;
    const resolvedTotal = metaSource?.total ?? totalFallback;
    const resolvedLastPage =
      metaSource?.last_page ??
      Math.max(1, Math.ceil(resolvedTotal / resolvedPerPage));

    return {
      currentPage: metaSource?.current_page ?? page,
      perPage: resolvedPerPage,
      total: resolvedTotal,
      lastPage: resolvedLastPage,
    };
  };

  // Getters
  const activeUsers = computed(() =>
    users.value.filter((user) => user.status === "active")
  );

  const inactiveUsers = computed(() =>
    users.value.filter((user) => user.status === "inactive")
  );

  // Actions
  const fetchUsers = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getUsers({ page, perPage, filters });

      const { usersArray, metaSource } = extractUsersPayload(response.data);
      users.value = usersArray.map(normalizeUser);
      usersPagination.value = buildPagination(
        metaSource,
        page,
        perPage,
        usersArray.length,
      );

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch users";
      console.error("Error fetching users:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedUsers = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedUsers({ page, perPage, filters });

      const { usersArray, metaSource } = extractUsersPayload(response.data);
      trashedUsers.value = usersArray.map(normalizeUser);
      trashedPagination.value = buildPagination(
        metaSource,
        page,
        perPage,
        usersArray.length,
      );

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed users";
      console.error("Error fetching trashed users:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addUser = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createUser(userData);

      // Add new user directly from backend response
      const newUser = normalizeUser(response.data.data);
      users.value.push(newUser);
      return newUser;
    } catch (err) {
      error.value = err.message || "Failed to add user";
      console.error("Error adding user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (userId, userData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateUser(userId, userData);

      // Update local state directly with backend response
      const index = users.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        users.value[index] = normalizeUser(response.data.data);
      }
      return users.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update user";
      console.error("Error updating user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (userId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteEntity('users', userId, force);

      if (force) {
        users.value = users.value.filter((u) => u.id !== userId);
        trashedUsers.value = trashedUsers.value.filter((u) => u.id !== userId);
      } else {
        // Remove from active users after successful API call
        const index = users.value.findIndex((u) => u.id === userId);
        if (index > -1) {
          users.value.splice(index, 1);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete user";
      console.error("Error deleting user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreUser = async (userId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.restoreEntity('users', userId);

      // Remove from trashed users and add to active users
      const index = trashedUsers.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        trashedUsers.value.splice(index, 1);
      }

      // Add the restored user to active users list
      if (response.data?.data) {
        users.value.push(normalizeUser(response.data.data));
      }
    } catch (err) {
      error.value = err.message || "Failed to restore user";
      console.error("Error restoring user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteUsers = async (userIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteEntities('user', 'users', userIds, force);

      if (force) {
        trashedUsers.value = trashedUsers.value.filter(
          (u) => !userIds.includes(u.id)
        );
        users.value = users.value.filter((u) => !userIds.includes(u.id));
      } else {
        // Remove deleted users from active users list
        users.value = users.value.filter((u) => !userIds.includes(u.id));
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete users";
      console.error("Error bulk deleting users:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreUsers = async (userIds) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.bulkRestoreEntities('user', 'users', userIds);

      // Remove restored users from trashed users list
      trashedUsers.value = trashedUsers.value.filter((u) => !userIds.includes(u.id));

      // Add restored users to active users list
      if (response.data?.data) {
        users.value.push(...response.data.data.map(normalizeUser));
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk restore users";
      console.error("Error bulk restoring users:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  return {
    // State
    users,
    trashedUsers,
    loading,
    trashedLoading,
    error,
    usersPagination,
    trashedPagination,
    // Getters
    activeUsers,
    inactiveUsers,
    // Actions
    fetchUsers,
    fetchTrashedUsers,
    addUser,
    updateUser,
    deleteUser,
    restoreUser,
    bulkDeleteUsers,
    bulkRestoreUsers,
  };
});
