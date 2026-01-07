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

  // Getters
  const activeUsers = computed(() =>
    users.value.filter((user) => user.status === "active")
  );

  const inactiveUsers = computed(() =>
    users.value.filter((user) => user.status === "inactive")
  );

  // Actions
  const fetchUsers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getUsers();

      // Use backend data directly, no mapping needed
      users.value = response.data.data;

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch users";
      console.error("Error fetching users:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedUsers = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedUsers();

      // Use backend data directly, no mapping needed
      trashedUsers.value = response.data.data;

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
      users.value.push(response.data.data);
      return response.data.data;
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
        users.value[index] = response.data.data;
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

  const deleteUser = async (userId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteEntity('users', userId, false);

      // Remove from active users after successful API call
      const index = users.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        users.value.splice(index, 1);
      }
      // Note: Trashed users will be fetched from API when needed
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
        users.value.push(response.data.data);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore user";
      console.error("Error restoring user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteUsers = async (userIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteEntities('user', 'users', userIds, false);

      // Remove deleted users from active users list
      users.value = users.value.filter((u) => !userIds.includes(u.id));
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
        users.value.push(...response.data.data);
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
