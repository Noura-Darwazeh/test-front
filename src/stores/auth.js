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
  const isSwitchedUser = ref(false); // ✅ غيّرناها من computed لـ ref

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

  const normalizeDisplayName = (name, fallback = "") => {
    if (name === null || name === undefined) return fallback;
    if (typeof name === "string" || typeof name === "number") {
      return String(name);
    }
    if (Array.isArray(name)) {
      const candidate = name[1] ?? name[0];
      return normalizeDisplayName(candidate, fallback);
    }
    if (typeof name === "object") {
      if (name.name !== undefined) return normalizeDisplayName(name.name, fallback);
      if (name.label !== undefined) return normalizeDisplayName(name.label, fallback);
      if (name.en !== undefined) return normalizeDisplayName(name.en, fallback);
      if (name.ar !== undefined) return normalizeDisplayName(name.ar, fallback);
    }
    return fallback;
  };

  const parseIdNamePair = (value, fallbackId = null, fallbackName = "") => {
    let id = fallbackId;
    let name = fallbackName;

    if (Array.isArray(value)) {
      id = value[0] ?? fallbackId;
      name = value[1] ?? fallbackName;
    } else if (value && typeof value === "object") {
      id = value.id ?? fallbackId;
      name = value.name ?? fallbackName;
    } else if (value !== undefined && value !== null) {
      id = value;
    }

    return { id, name: normalizeDisplayName(name, fallbackName) };
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

    if (data.success === true) {
      // ✅ Convert image path to full URL
      if (data.user?.image) {
        data.user.image = getFullImageUrl(data.user.image);
      }

      const savedUser = getItem("auth_user");
      if (savedUser?.default_page && data.user.id === savedUser.id) {
        data.user.default_page = savedUser.default_page;
      } else {
        data.user.default_page = data.user.landing_page || '/user';
      }

      // Save auth data
      user.value = data.user;
      token.value = data.token;
      device.value = data.device;
      isSwitchedUser.value = false;

      // Persist to localStorage
      setItem("auth_token", data.token);
      setItem("auth_user", data.user);
      setItem("auth_device", data.device);

      // Set user's preferred language
      if (data.user?.language) {
        const uiLang = data.user.language === 'arabic' ? 'ar' : 'en';
        setItem("user_language", uiLang);
      }

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

async function loginAsDriver(credentials) {
  isLoading.value = true;
  error.value = null;

  try {
    const loginValue = String(
      credentials?.login ?? credentials?.username ?? ""
    ).trim();

    if (!loginValue) {
      throw new Error("Username is required");
    }

    if (!credentials.password) {
      throw new Error("Password is required");
    }

    const response = await api.post("/login", {
      username: loginValue,
      password: credentials.password,
    }, {
      headers: {
        'X-Client': 'mobile-app',
        'User-Agent': 'iphone',
      }
    });

    const data = response.data;

    if (data.success === true) {
      if (data.user?.image) {
        data.user.image = getFullImageUrl(data.user.image);
      }

      const savedUser = getItem("auth_user");
      if (savedUser?.default_page && data.user.id === savedUser.id) {
        data.user.default_page = savedUser.default_page;
      } else {
        data.user.default_page = data.user.landing_page || "/driver-steps";
      }

      user.value = data.user;
      token.value = data.token;
      device.value = data.device;
      isSwitchedUser.value = false;

      setItem("auth_token", data.token);
      setItem("auth_user", data.user);
      setItem("auth_device", data.device);

      if (data.user?.language) {
        const uiLang = data.user.language === 'arabic' ? 'ar' : 'en';
        setItem("user_language", uiLang);
      }

      return data;
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (err) {
    if (err.response?.data?.success === false) {
      error.value = err.response.data.message || "Invalid credentials";
    } else if (err.response?.status === 401) {
      error.value = "Invalid username or password";
    } else if (err.response?.status === 422) {
      error.value = "Please check your input and try again";
    } else {
      error.value = err.message || "Login failed. Please try again.";
    }

    console.error("❌ Driver login error:", err);
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
    const savedIsSwitched = getItem("is_switched_user");  

    if (savedToken && savedUser) {
      // ✅ Convert image path to full URL if needed
      if (savedUser.image && !savedUser.image.startsWith('http')) {
        savedUser.image = getFullImageUrl(savedUser.image);
      }
  if (!savedUser.default_page) {
      savedUser.default_page = '/user';
    }
      token.value = savedToken;
      user.value = savedUser;
      device.value = savedDevice;
      isSwitchedUser.value = !!savedIsSwitched; // ✅ حدّثي الـ state
    }
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    device.value = null;
    error.value = null;
    isSwitchedUser.value = false; // ✅ امسحي الـ state

    removeItem("auth_token");
    removeItem("auth_user");
    removeItem("auth_device");
    removeItem("user_language");
    removeItem("original_admin_token");
    removeItem("original_admin_user");
    removeItem("is_switched_user");
  }

  function clearError() {
    error.value = null;
  }

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  // في src/stores/auth.js

/**
 * Update user data
 * @param {Object} userData - Updated user data
 */
function updateUser(userData) {
  // ✅ Convert image path to full URL with cache busting
  if (userData.image) {
    if (!userData.image.startsWith('http')) {
      userData.image = getFullImageUrl(userData.image);
    }
    const hasTimestamp = userData.image.includes('?t=');
    if (!hasTimestamp) {
      userData.image = `${userData.image}?t=${Date.now()}`;
    }
  }

  // ✅ دمج البيانات الجديدة مع القديمة
  user.value = { ...user.value, ...userData };

  // ✅ خزّني كل شي بالـ localStorage
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

      const response = await api.post(`/users/${user.value.id}`, {
        language: language
      }, {
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      });

      if (response.data?.data) {
        updateUser(response.data.data);
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

  function getDefaultPageByRole(role) {
    if (role === "Driver") return "/driver-steps";
    if (role === "Admin" || role === "SuperAdmin") return "/user";
    return "/user";
  }

  /**
   * Switch to another user (SuperAdmin only)
   * @param {Object} userData - New user data
   * @param {string} loginAsToken - Login-as token
   * @param {string} originalToken - Original SuperAdmin token
   */
  function switchUser(userData, loginAsToken, originalToken) {
    // Save original token to return later
    if (!getItem("original_admin_token")) {
      setItem("original_admin_token", token.value);
      setItem("original_admin_user", user.value);
    }

    // Convert image path to full URL
    if (userData.image) {
      userData.image = getFullImageUrl(userData.image);
    }

    // Update current session with switched user
    user.value = userData;
    token.value = loginAsToken;

    // Save to localStorage
    setItem("auth_token", loginAsToken);
    setItem("auth_user", userData);
    setItem("is_switched_user", true);

    isSwitchedUser.value = true; // ✅ حدّثي الـ state
  }

  /**
   * Return to original SuperAdmin account
   */
  async function returnToAdmin() {
    const originalToken = getItem("original_admin_token");
    const originalUser = getItem("original_admin_user");

    if (!originalToken || !originalUser) {
      console.warn("⚠️ No original admin session found");
      return false;
    }

    try {
      // استخدمي الـ login_as_token للرجوع
      const currentToken = token.value;
      
      // استرجعي الـ token الأصلي مؤقتًا لعمل الـ API call
      token.value = originalToken;
      
      const response = await api.post("/return_to_original");
      
      if (response.data?.status === 'success') {
        // Restore original admin session
        user.value = originalUser;
        token.value = originalToken;

        // Update localStorage
        setItem("auth_token", originalToken);
        setItem("auth_user", originalUser);

        // Clear switch session data
        removeItem("original_admin_token");
        removeItem("original_admin_user");
        removeItem("is_switched_user");

        isSwitchedUser.value = false; // ✅ حدّثي الـ state

        return true;
      }
    } catch (error) {
      console.error("❌ Error returning to admin:", error);
      
      // حتى لو فشل الـ API، ارجعي للـ admin محليًا
      user.value = originalUser;
      token.value = originalToken;
      setItem("auth_token", originalToken);
      setItem("auth_user", originalUser);
      removeItem("original_admin_token");
      removeItem("original_admin_user");
      removeItem("is_switched_user");
      
      isSwitchedUser.value = false; // ✅ حدّثي الـ state
      
      return true;
    }

    return false;
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
    isSwitchedUser, // ✅ هسا reactive ref

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
    getDefaultPageByRole,
    switchUser,
    returnToAdmin,
    loginAsDriver
  };
});