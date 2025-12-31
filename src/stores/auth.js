
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
/**
   * Login user with username or email
   * @param {Object} credentials - Login credentials {login, password}
   * @returns {Promise<Object>} User data
   */
  async function login(credentials) {
    isLoading.value = true;
    error.value = null;

    try {
      // Validate input
      if (!credentials.login || !credentials.login.trim()) {
        throw new Error("Email or username is required");
      }

      if (!credentials.password) {
        throw new Error("Password is required");
      }

      const response = await api.post("/login", {
        login: credentials.login.trim(), // Backend accepts both email and username
        password: credentials.password,
      });

      const data = response.data;

      // Check if login was successful
      if (data.success === true) {
        // Save auth data
        user.value = data.user;
        token.value = data.token;
        device.value = data.device;

        // Persist to localStorage
        setItem("auth_token", data.token);
        setItem("auth_user", data.user);
        setItem("auth_device", data.device);

        // Set user's preferred language
        if (data.user?.language) {
          const uiLang = data.user.language === 'arabic' ? 'ar' : 'en';
          // We need to import setLocale at the top of the file
          // For now, just store it and let the app initialize it
          setItem("user_language", uiLang);
          console.log(`🌐 User language preference: ${data.user.language}`);
        }

        console.log("✅ Login successful:", data.user.name);
        return data;
      } else {
        // Handle unsuccessful login
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      // Handle different error scenarios
      if (err.response?.data?.success === false) {
        error.value = err.response.data.message || "Invalid credentials";
      } else if (err.response?.status === 401) {
        error.value = "Invalid username/email or password";
      } else if (err.response?.status === 422) {
        error.value = "Please check your input and try again";
      } else {
        error.value = err.message || "Login failed. Please try again.";
      }
      
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
    isLoading.value = true;
    error.value = null;

    try {
      // Only call API if we have a token
      if (token.value) {
        const response = await api.post("/logout");
        
        // Check if logout was successful
        if (response.data.success === true) {
          console.log(response.data.message);
          clearAuthData();
          return { success: true, message: response.data.message };
        } else {
          throw new Error(response.data.message || "Logout failed");
        }
      } else {
        // No token, just clear local data
        console.warn("⚠️ No token found, clearing local data only");
        clearAuthData();
        return { success: true, message: "Logged out locally" };
      }
    } catch (err) {
      console.error(" Logout error:", err);
      
      // Check if it's an authentication error (401)
      if (err.response?.status === 401 || err.response?.data?.success === false) {
        // Token is invalid/expired, clear it anyway
        console.warn("Invalid token detected, clearing local data");
        clearAuthData();
        return { 
          success: true, 
          message: "Session expired, logged out locally" 
        };
      }
      
      // For other errors, show error but still clear data
      error.value = err.message || "Logout failed";
      clearAuthData();
      throw err;
    } finally {
      isLoading.value = false;
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
      console.log("Auth initialized from localStorage");
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
    removeItem("user_language"); // Clear user's language preference
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
   * Update user language in backend and locally
   * @param {string} language - Language to set (english or arabic)
   * @returns {Promise<Object>} Updated user data
   */
  async function updateUserLanguage(language) {
    try {
      if (!user.value?.id) {
        throw new Error("No user logged in");
      }

      // Call API to update user language
      const response = await api.post(`/users/${user.value.id}`, {
        language: language
      }, {
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      });

      // Update local user data
      if (response.data?.data) {
        updateUser(response.data.data);
        console.log(`✅ User language updated to: ${language}`);
      }

      return response.data;
    } catch (err) {
      console.error("❌ Failed to update user language:", err);
      throw err;
    }
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
    updateUserLanguage,
    hasRole,
    hasAnyRole,
  };
});