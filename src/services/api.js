import axios from "axios";
import { getItem, removeItem } from "@/utils/shared/storageUtils";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35:80/api";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

const shouldLogApi = import.meta.env.DEV;

const toQueryString = (params) => {
  if (!params || typeof params !== "object") return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== null && entry !== undefined && entry !== "") {
          query.append(key, String(entry));
        }
      });
      return;
    }
    query.append(key, String(value));
  });
  return query.toString();
};
api.interceptors.request.use(
  (config) => {
    const token = getItem("auth_token", null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ أضيفي الـ headers لكل الـ requests (بما فيهم login)
    config.headers["X-Client"] = 'mobile-app';
    config.headers['User-Agent'] = 'iphone';

    if (shouldLogApi) {
      const method = String(config.method || "get").toUpperCase();
      const queryString = toQueryString(config.params);
      const fullUrl = queryString ? `${config.url}?${queryString}` : config.url;
      console.log(`🚀 API Request: ${method} ${fullUrl}`, {
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.status === "failed") {
      const error = new Error(response.data.message || "API request failed");
      error.response = response;
      throw error;
    }

    if (shouldLogApi) {
      console.log(`✅ API Response: ${String(response.config?.method || "get").toUpperCase()} ${response.config?.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
      error.message = "Network error. Please check your connection.";
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isOptionalEndpoint = error.config?.url?.includes("/exchange-rates");
    
    if (!isOptionalEndpoint) {
      console.error(`❌ API Error: ${status}`, {
        url: error.config?.url,
        method: error.config?.method,
        data: data,
      });
    }

    switch (status) {
      case 401:
        removeItem("auth_token");
        error.message = "Session expired. Please login again.";
        break;
      case 403:
        error.message = "Access denied. You don't have permission for this action.";
        break;
      case 404:
        error.message = "Resource not found.";
        break;
      case 422:
        if (data?.errors) {
          const validationErrors = Object.values(data.errors).flat();
          error.message = validationErrors.join(", ");
        } else {
          error.message = data?.message || "Validation failed.";
        }
        break;
      case 429:
        error.message = "Too many requests. Please try again later.";
        break;
      case 500:
        error.message = "Server error. Please try again later.";
        break;
      default:
        error.message = data?.message || `Request failed with status ${status}`;
    }

    return Promise.reject(error);
  }
);

export default api;