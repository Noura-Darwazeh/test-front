import axios from "axios";
import { getItem, removeItem } from "@/utils/shared/storageUtils";

// ---- axios instance ----
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35/api",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor ----
api.interceptors.request.use(
  (config) => {
    const token = getItem("auth_token", null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        params: config.params,
        data: config.data,
        headers: {
          Authorization: token ? "Bearer ***" : "None",
        },
      }
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ---- Response Interceptor ----
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    if (response.data?.status === "failed") {
      const error = new Error(response.data.message || "API request failed");
      error.response = response;
      throw error;
    }

    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
      console.log("🚫 Request Cancelled");
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
      error.message = "Network error. Please check your connection.";
      return Promise.reject(error);
    }

    // Handle HTTP errors
    const { status, data } = error.response;

    console.error(`❌ API Error: ${status}`, {
      url: error.config?.url,
      method: error.config?.method,
      data: data,
    });

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        removeItem("auth_token");
        error.message = "Session expired. Please login again.";
        // You can add router redirect here if needed
        break;

      case 403:
        error.message =
          "Access denied. You don't have permission for this action.";
        break;

      case 404:
        error.message = "Resource not found.";
        break;

      case 422:
        // Validation errors
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
