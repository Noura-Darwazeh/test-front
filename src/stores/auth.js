import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api.js";
import { setItem, getItem, removeItem } from "@/utils/shared/storageUtils.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35";

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);
  const device = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isSwitchedUser = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const userRole = computed(() => {
    const role = user.value?.role;
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

  const getDefaultPageByRole = (role) => {
    switch (role) {
      case 'Driver':
        return '/work-plans';
      case 'Admin':
        return '/statistics';
      case 'SuperAdmin':
        return '/user';
      default:
        return '/work-plans';
    }
  };

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

      // ✅ أول محاولة - بدون headers
      let response;
      try {
        response = await api.post("/login", {
          login: credentials.login.trim(),
          password: credentials.password,
        });
      } catch (firstError) {
        // ✅ لو فشل بسبب 403 "not allowed via web"
        // نحاول مرة تانية مع headers السائق
        if (firstError.response?.status === 403) {
          
          console.log('🔄 Retrying login with driver headers...');
          
          response = await api.post("/login", 
            {
              login: credentials.login.trim(),
              password: credentials.password,
            },
            {
              driverLogin: true // ✅ علامة للـ interceptor
            }
          );
        } else {
          throw firstError;
        }
      }

      const data = response.data;

      if (data.success === true) {
        if (data.user?.image) {
          data.user.image = getFullImageUrl(data.user.image);
        }

        const role = Array.isArray(data.user.role) ? data.user.role[0] : data.user.role;

        data.user.default_page = data.user.landing_page || getDefaultPageByRole(role);

        user.value = data.user;
        token.value = data.token;
        device.value = data.device;
        isSwitchedUser.value = false;

        // ✅ احفظ الـ role أولاً
        setItem("user_role", role);
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
    const savedRole = getItem("user_role");

    if (savedToken && savedUser) {
      if (savedUser.image && !savedUser.image.startsWith('http')) {
        savedUser.image = getFullImageUrl(savedUser.image);
      }

      if (!savedUser.default_page) {
        const role = savedRole || (Array.isArray(savedUser.role) ? savedUser.role[0] : savedUser.role);
        savedUser.default_page = getDefaultPageByRole(role);
      }

      token.value = savedToken;
      user.value = savedUser;
      device.value = savedDevice;
      isSwitchedUser.value = !!savedIsSwitched;
    }
  }

  function clearAuthData() {
    user.value = null;
    token.value = null;
    device.value = null;
    error.value = null;
    isSwitchedUser.value = false;

    removeItem("auth_token");
    removeItem("auth_user");
    removeItem("auth_device");
    removeItem("user_language");
    removeItem("user_role");
    removeItem("original_admin_token");
    removeItem("original_admin_user");
    removeItem("is_switched_user");
  }

  function clearError() {
    error.value = null;
  }

  function updateUser(userData) {
    if (userData.image) {
      if (!userData.image.startsWith('http')) {
        userData.image = getFullImageUrl(userData.image);
      }
      const hasTimestamp = userData.image.includes('?t=');
      if (!hasTimestamp) {
        userData.image = `${userData.image}?t=${Date.now()}`;
      }
    }

    user.value = { ...user.value, ...userData };
    setItem("auth_user", user.value);
    
    const role = Array.isArray(userData.role) ? userData.role[0] : userData.role;
    if (role) {
      setItem("user_role", role);
    }
  }

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

  function hasRole(role) {
    return userRole.value === role;
  }

  function hasAnyRole(roles) {
    return roles.includes(userRole.value);
  }

  function switchUser(userData, loginAsToken, originalToken) {
    if (!getItem("original_admin_token")) {
      setItem("original_admin_token", token.value);
      setItem("original_admin_user", user.value);
      setItem("original_user_role", userRole.value);
    }

    if (userData.image) {
      userData.image = getFullImageUrl(userData.image);
    }

    const newRole = Array.isArray(userData.role) ? userData.role[0] : userData.role;

    user.value = userData;
    token.value = loginAsToken;

    setItem("auth_token", loginAsToken);
    setItem("auth_user", userData);
    setItem("user_role", newRole);
    setItem("is_switched_user", true);

    isSwitchedUser.value = true;
  }

  async function returnToAdmin() {
    const originalToken = getItem("original_admin_token");
    const originalUser = getItem("original_admin_user");
    const originalRole = getItem("original_user_role");

    if (!originalToken || !originalUser) {
      console.warn("⚠️ No original admin session found");
      return false;
    }

    try {
      const currentToken = token.value;
      token.value = originalToken;
      
      const response = await api.post("/return_to_original");
      
      if (response.data?.status === 'success') {
        user.value = originalUser;
        token.value = originalToken;

        setItem("auth_token", originalToken);
        setItem("auth_user", originalUser);
        setItem("user_role", originalRole);

        removeItem("original_admin_token");
        removeItem("original_admin_user");
        removeItem("original_user_role");
        removeItem("is_switched_user");

        isSwitchedUser.value = false;

        return true;
      }
    } catch (error) {
      console.error("❌ Error returning to admin:", error);
      
      user.value = originalUser;
      token.value = originalToken;
      setItem("auth_token", originalToken);
      setItem("auth_user", originalUser);
      setItem("user_role", originalRole);
      
      removeItem("original_admin_token");
      removeItem("original_admin_user");
      removeItem("original_user_role");
      removeItem("is_switched_user");
      
      isSwitchedUser.value = false;
      
      return true;
    }

    return false;
  }

  initializeAuth();

  return {
    user,
    token,
    device,
    isLoading,
    error,
    isSwitchedUser,
    isAuthenticated,
    userRole,
    userName,
    userCompany,
    userCompanyId,
    userCompanyName,
    userCurrency,
    userCurrencyId,
    userCurrencyName,
    login,
    logout,
    initializeAuth,
    clearAuthData,
    clearError,
    updateUser,
    updateUserLanguage,
    hasRole,
    hasAnyRole,
    switchUser,
    returnToAdmin,
    getDefaultPageByRole,
  };
});