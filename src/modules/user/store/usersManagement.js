import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useUsersManagementStore = defineStore("usersManagement", () => {
  // State
  const users = ref([]);
  const trashedUsers = ref([]);
  const loading = ref(false);
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

      // Map API response with defaults
      users.value = response.data.data.map((user) => ({
        ...user,
        image: user.image || "path/test",
        company_name: user.company_name || null,
        status: "active",
      }));

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch users";
      console.error("Error fetching users:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addUser = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createUser(userData);

      // Add new user from API response with defaults
      const newUser = {
        ...response.data.data,
        image: response.data.data.image || "path/test",
        company_name: response.data.data.company_name || null,
        status: "active",
      };

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

      // Update local state with API response
      const index = users.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        users.value[index] = {
          ...response.data.data,
          image: response.data.data.image || "path/test",
          company_name: response.data.data.company_name || null,
          status: users.value[index].status, // Preserve existing status
        };
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
      await apiServices.deleteUser(userId);

      // Move to trashed after successful API call
      const index = users.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        const user = users.value.splice(index, 1)[0];
        trashedUsers.value.push(user);
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
      await apiServices.restoreUser(userId);

      // Restore to active users after successful API call
      const index = trashedUsers.value.findIndex((u) => u.id === userId);
      if (index > -1) {
        const user = trashedUsers.value.splice(index, 1)[0];
        users.value.push(user);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore user";
      console.error("Error restoring user:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    users,
    trashedUsers,
    loading,
    error,
    // Getters
    activeUsers,
    inactiveUsers,
    // Actions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    restoreUser,
  };
});
