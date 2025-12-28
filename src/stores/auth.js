
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api.js";
import { setItem, getItem, removeItem } from "@/utils/shared/storageUtils.js";

export const useAuthStore = defineStore("auth", () => {
  // ===== State =====
  const user = ref(null);
  const token = ref(null);
  const device = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // ===== Getters =====
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  
  const userRole = computed(() => user.value?.role || null);
  
  const userName = computed(() => user.value?.name || "");

  // ===== Actions =====
  
  /**
   * Login user
   * @param {Object} credentials - Login credentials {login, password}
   * @returns {Promise<Object>} User data
   */
  async function login(credentials) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post("/login", {
        login: credentials.login,
        password: credentials.password,
      });

      const data = response.data;

      if (data.success) {
        // Save auth data
        user.value = data.user;
        token.value = data.token;
        device.value = data.device;

        // Persist to localStorage
        setItem("auth_token", data.token);
        setItem("auth_user", data.user);
        setItem("auth_device", data.device);

        console.log("Login successful:", data.user.name);
        return data;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      error.value = err.message || "Login failed";
      console.error(" Login error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      // Call logout endpoint if available
      if (token.value) {
        await api.post("/logout").catch(() => {
          // Ignore logout API errors
          console.warn("Logout API call failed, proceeding with local logout");
        });
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      // Clear local state
      clearAuthData();
      console.log("✅ Logout successful");
    }
  }

  /**
   * Initialize auth from localStorage
   */
  function initializeAuth() {
    const savedToken = getItem("auth_token");
    const savedUser = getItem("auth_user");
    const savedDevice = getItem("auth_device");

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = savedUser;
      device.value = savedDevice;
      console.log("✅ Auth initialized from localStorage");
    }
  }

  /**
   * Clear all auth data
   */
  function clearAuthData() {
    user.value = null;
    token.value = null;
    device.value = null;
    error.value = null;

    removeItem("auth_token");
    removeItem("auth_user");
    removeItem("auth_device");
  }

  /**
   * Clear error message
   */
  function clearError() {
    error.value = null;
  }

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  function updateUser(userData) {
    user.value = { ...user.value, ...userData };
    setItem("auth_user", user.value);
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  function hasRole(role) {
    return userRole.value === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Array of roles to check
   * @returns {boolean}
   */
  function hasAnyRole(roles) {
    return roles.includes(userRole.value);
  }

  // Initialize auth on store creation
  initializeAuth();

  return {
    // State
    user,
    token,
    device,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    logout,
    initializeAuth,
    clearAuthData,
    clearError,
    updateUser,
    hasRole,
    hasAnyRole,
  };
});