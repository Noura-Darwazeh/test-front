import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api.js";
import { setItem, getItem, removeItem } from "@/utils/shared/storageUtils.js";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35";

// Helper function to convert relative image path to full URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export const useAuthStore = defineStore("auth", () => {
  // ===== State =====
  const user = ref(null);
  const token = ref(null);
  const device = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // ===== Getters =====
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  
  const userRole = computed(() => {
    const role = user.value?.role;
    // Handle if backend returns role as array
    if (Array.isArray(role)) {
      return role[0] || null;
    }
    return role || null;
  });
  
  const userName = computed(() => user.value?.name || "");

  const parseIdNamePair = (value, fallbackId = null, fallbackName = "") => {
    if (Array.isArray(value)) {
      return {
        id: value[0] ?? fallbackId,
        name: value[1] ?? fallbackName,
      };
    }

    if (value && typeof value === "object") {
      return {
        id: value.id ?? fallbackId,
        name: value.name ?? fallbackName,
      };
    }

    return { id: value ?? fallbackId, name: fallbackName };
  };

  const userCompany = computed(() =>
    parseIdNamePair(user.value?.company, user.value?.company_id, user.value?.company_name || "")
  );

  const userCompanyId = computed(() => userCompany.value.id ?? null);

  const userCompanyName = computed(() => userCompany.value.name || "");

  const userCurrency = computed(() =>
    parseIdNamePair(
      user.value?.currency,
      user.value?.currency_id,
      user.value?.currency_name || ""
    )
  );

  const userCurrencyId = computed(() => userCurrency.value.id ?? null);

  const userCurrencyName = computed(() => userCurrency.value.name || "");

  // ===== Actions =====
  
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
        login: credentials.login.trim(),
        password: credentials.password,
      });

      const data = response.data;

      // Check if login was successful
      if (data.success === true) {
        // ✅ Convert image path to full URL
        if (data.user?.image) {
          data.user.image = getFullImageUrl(data.user.image);
        }

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
          setItem("user_language", uiLang);
          console.log(`🌐 User language preference: ${data.user.language}`);
        }

        console.log("✅ Login successful:", data.user.name);
        console.log("📸 User image:", data.user.image);
        return data;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.message || "Invalid credentials";
      } else if (err.response?.status === 401) {
        error.value = "Invalid username/email or password";
      } else if (err.response?.status === 422) {
        error.value = "Please check your input and try again";
      } else {
        error.value = err.message || "Login failed. Please try again.";
      }
      
      console.error("❌ Login error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    error.value = null;

    try {
      if (token.value) {
        const response = await api.post("/logout");
        
        if (response.data.success === true) {
          console.log(response.data.message);
          clearAuthData();
          return { success: true, message: response.data.message };
        } else {
          throw new Error(response.data.message || "Logout failed");
        }
      } else {
        console.warn("⚠️ No token found, clearing local data only");
        clearAuthData();
        return { success: true, message: "Logged out locally" };
      }
    } catch (err) {
      console.error("❌ Logout error:", err);
      
      if (err.response?.status === 401 || err.response?.data?.success === false) {
        console.warn("Invalid token detected, clearing local data");
        clearAuthData();
        return { 
          success: true, 
          message: "Session expired, logged out locally" 
        };
      }
      
      error.value = err.message || "Logout failed";
      clearAuthData();
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function initializeAuth() {
    const savedToken = getItem("auth_token");
    const savedUser = getItem("auth_user");
    const savedDevice = getItem("auth_device");

    if (savedToken && savedUser) {
      // ✅ Convert image path to full URL if needed
      if (savedUser.image && !savedUser.image.startsWith('http')) {
        savedUser.image = getFullImageUrl(savedUser.image);
      }

      token.value = savedToken;
      user.value = savedUser;
      device.value = savedDevice;
      console.log("✅ Auth initialized from localStorage");
      console.log("📸 User image:", savedUser.image);
    }
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    device.value = null;
    error.value = null;

    removeItem("auth_token");
    removeItem("auth_user");
    removeItem("auth_device");
    removeItem("user_language");
  }


  function clearError() {
    error.value = null;
  }

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  function updateUser(userData) {
    // ✅ Convert image path to full URL if needed
    if (userData.image && !userData.image.startsWith('http')) {
      userData.image = getFullImageUrl(userData.image);
    }

    user.value = { ...user.value, ...userData };
    setItem("auth_user", user.value);
    console.log("✅ User updated:", user.value);
    console.log("📸 User image:", user.value.image);
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

      const response = await api.post(`/users/${user.value.id}`, {
        language: language
      }, {
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      });

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
    userCompany,
    userCompanyId,
    userCompanyName,
    userCurrency,
    userCurrencyId,
    userCurrencyName,
    
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
