import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiServices from '@/services/apiServices.js';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const loading = ref(false);
  const fcmToken = ref(null);

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.read).length
  );

  const hasUnread = computed(() => unreadCount.value > 0);

  // Fetch stored notifications from backend — treat all as already-read (historical)
  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const response = await apiServices.getNotifications();
      const data = response.data?.data ?? response.data ?? [];
      notifications.value = Array.isArray(data)
        ? data.map((n) => ({ ...normalizeNotification(n), read: true }))
        : [];
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') {
        console.error('Failed to fetch notifications:', err);
      }
    } finally {
      loading.value = false;
    }
  };

  // Add a notification received via FCM foreground message
  const addForegroundNotification = (payload) => {
    const notification = {
      id: `fcm_${Date.now()}`,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      read: false,
      created_at: new Date().toISOString(),
    };
    notifications.value.unshift(notification);
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    const local = notifications.value.find((n) => n.id === id);
    if (local) local.read = true;

    // Only call API for server-persisted notifications (not fcm_ prefixed)
    if (!String(id).startsWith('fcm_')) {
      try {
        await apiServices.markNotificationRead(id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    notifications.value.forEach((n) => (n.read = true));
    try {
      await apiServices.markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Save FCM token (for this session/user)
  const saveFCMToken = async (token) => {
    if (!token || token === fcmToken.value) return;
    fcmToken.value = token;
    try {
      await apiServices.saveFCMToken(token);
    } catch (err) {
      console.error('Failed to save FCM token:', err);
    }
  };

  // Dismiss (remove) a notification from the list after clicking it
  const dismissNotification = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  // Clear all notifications (on logout)
  const clearNotifications = () => {
    notifications.value = [];
    fcmToken.value = null;
  };

  // Dismiss all from local list (UI "Clear all" — does not reset FCM token)
  const clearAllFromUI = () => {
    notifications.value = [];
  };

  return {
    notifications,
    loading,
    fcmToken,
    unreadCount,
    hasUnread,
    fetchNotifications,
    addForegroundNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllFromUI,
    saveFCMToken,
    clearNotifications,
  };
});

function normalizeNotification(n) {
  // Backend sends `data` as a JSON string — parse it
  let parsedData = {};
  if (typeof n.data === 'string') {
    try { parsedData = JSON.parse(n.data); } catch { /* ignore */ }
  } else if (n.data && typeof n.data === 'object') {
    parsedData = n.data;
  }

  return {
    id: n.id,
    type: n.type || parsedData.type || '',
    title: parsedData.title || n.title || 'Notification',
    body: parsedData.message || parsedData.body || n.body || n.message || '',
    data: parsedData,
    read: !!n.read_at || !!n.read,
    created_at: n.created_at || new Date().toISOString(),
  };
}
