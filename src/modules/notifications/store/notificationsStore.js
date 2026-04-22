import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiServices from '@/services/apiServices.js';

export const useNotificationsHistoryStore = defineStore('notificationsHistory', () => {
  const notifications = ref([]);
  const loading = ref(false);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  const getNotificationsHistory = async (page = 1) => {
    loading.value = true;
    try {
      const response = await apiServices.get('/notifications', {
        params: { history: 1, page, sort_column: 'created_at', sort_type: 'desc' }
      });
      // Handle the nested data structure based on the API response provided
      let responseData = response.data;
      if (responseData) {
        notifications.value = responseData.data || [];
        if (responseData.meta) {
          pagination.value = {
            currentPage: responseData.meta.current_page,
            lastPage: responseData.meta.last_page,
            total: responseData.meta.total,
            perPage: responseData.meta.per_page,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching notifications history:', error);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (ids) => {
    try {
      // Optimistic update
      notifications.value = notifications.value.map(notif => {
        if (ids.includes(notif.id)) {
          return { ...notif, read_at: new Date().toISOString() };
        }
        return notif;
      });
      await apiServices.post('/notifications/make_as_read', { ids });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    notifications,
    loading,
    pagination,
    getNotificationsHistory,
    markAsRead
  };
});
