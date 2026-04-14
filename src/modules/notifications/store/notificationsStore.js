import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const notificationsPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const fetchNotifications = async ({ page = 1, perPage = 10, history = 1 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getNotifications({ page, perPage, history });

      if (response && response.data && response.data.data) {
        notifications.value = response.data.data;
      } else {
        notifications.value = [];
      }

      if (response && response.data && response.data.meta) {
        notificationsPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch notifications";
      console.error("Error fetching notifications:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    notifications,
    loading,
    error,
    notificationsPagination,
    fetchNotifications,
  };
});
