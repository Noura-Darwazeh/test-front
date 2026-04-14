<template>
  <div class="notifications-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div class="d-flex align-items-center gap-3">
          <!-- <h4 class="mb-0">{{ $t('notifications.title', 'Notifications') }}</h4> -->
        </div>
        
        <div class="d-flex gap-2 align-items-center">
          <!-- Sort Dropdown -->
          <div class="sort-dropdown custom-select-wrapper">
            <select v-model="sortOrder" class="form-select custom-select shadow-sm border-0">
              <option value="desc">{{ $t('common.newestFirst', 'Newest First') }}</option>
              <option value="asc">{{ $t('common.oldestFirst', 'Oldest First') }}</option>
            </select>
          </div>

          <button
            class="btn-refresh shadow-sm border-0"
            :disabled="notificationsStore.loading"
            @click="handleRefresh"
          >
            <i
              class="fas fa-sync-alt refresh-icon text-secondary"
              :class="{ rotating: notificationsStore.loading }"
            ></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="notificationsStore.loading && notificationsStore.notifications.length === 0" class="loading-state">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">{{ $t("common.loading", "Loading...") }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="notificationsStore.error" class="alert alert-danger shadow-sm border-0 rounded-3">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ notificationsStore.error }}
    </div>

    <!-- Notifications List -->
    <div v-else class="notifications-container">
      <div v-if="sortedNotifications.length === 0" class="no-results">
        <i class="fas fa-bell-slash fa-3x text-muted mb-3 opacity-50"></i>
        <p class="text-muted mb-0 fs-5">{{ $t("notifications.noNotifications", "No notifications found.") }}</p>
      </div>

      <transition-group name="list" tag="div" class="notifications-list">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="notification-card"
        >
          <div class="notification-icon-wrapper" :class="getIconClass(notification)">
            <i :class="getIcon(notification)"></i>
          </div>

          <div class="notification-content">
            <h6 class="notification-title mb-1">
              {{ getNotificationData(notification).title || formatType(notification.type) }}
            </h6>
            <p class="notification-message mb-2 text-secondary">
              {{ getNotificationData(notification).message || $t('notifications.noMessage', 'No message content.') }}
            </p>
            
            <div class="notification-meta d-flex align-items-center gap-3">
              <span v-if="notification.notifiable" class="meta-item">
                <i class="fas fa-user-circle me-1 opacity-75"></i> 
                {{ notification.notifiable.name }}
              </span>
              <span v-if="getNotificationData(notification).order_id" class="meta-item badge bg-light text-dark border">
                Order #{{ getNotificationData(notification).order_id }}
              </span>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Pagination -->
      <div v-if="notificationsStore.notifications.length > 0" class="pagination-wrapper">
        <Pagination
          :totalItems="notificationsStore.notificationsPagination?.total || 0"
          :itemsPerPage="itemsPerPage"
          :currentPage="currentPage"
          :totalPages="notificationsStore.notificationsPagination?.lastPage || 1"
          @update:currentPage="(page) => (currentPage = page)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useNotificationsStore } from "../store/notificationsStore.js";
import Pagination from "../../../components/shared/Pagination.vue";

const notificationsStore = useNotificationsStore();

const currentPage = ref(1);
const sortOrder = ref("desc"); // 'asc' or 'desc'
const itemsPerPage = computed(() => notificationsStore.notificationsPagination?.perPage || 5);

// Fetch notifications logic
const fetchNotifications = async (page = 1) => {
  try {
    await notificationsStore.fetchNotifications({
      page,
      perPage: 5,
      history: 1,
    });
  } catch (error) {
    console.error("Failed to fetch notifications", error);
  }
};

// handle refresh button click
const handleRefresh = () => {
  fetchNotifications(currentPage.value);
};

// sort the local notifications
const sortedNotifications = computed(() => {
  const notifications = [...notificationsStore.notifications];
  
  if (sortOrder.value === "desc") {
    return notifications; // Assuming API returns desc by default
  } else {
    return notifications.reverse(); // simple reverse for asc
  }
});

// Helper to get payload data safely
const getNotificationData = (notification) => {
  if (!notification) return {};
  
  let payload = notification.items || notification.data;
  
  if (!payload) return {};

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      console.error("Failed to parse items:", e);
    }
  }
  
  // Verify one more time in case of double encoding
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {}
  }

  // Handle cases where the parsed JSON might still have a nested object
  if (payload && typeof payload === 'object' && payload.items) {
    payload = payload.items;
  }

  return payload || {};
};

// Format class based on notification type
const getIconClass = (notification) => {
  const data = getNotificationData(notification);
  const type = data.type || notification.type || '';
  if (type.includes('new_order') || type.includes('OrderAssigned')) return 'bg-primary-soft text-primary';
  if (type.includes('update_order') || type.includes('status')) return 'bg-warning-soft text-warning';
  if (type.includes('alert') || type.includes('error')) return 'bg-danger-soft text-danger';
  if (type.includes('success')) return 'bg-success-soft text-success';
  return 'bg-info-soft text-info';
};

// Format icon based on notification type
const getIcon = (notification) => {
  const data = getNotificationData(notification);
  const type = data.type || notification.type || '';
  if (type.includes('new_order') || type.includes('OrderAssigned')) return 'fas fa-box-open';
  if (type.includes('update_order')) return 'fas fa-sync-alt';
  if (type.includes('alert')) return 'fas fa-exclamation-circle';
  return 'fas fa-bell';
};

// Helper to format raw class name if title is missing
const formatType = (type) => {
  if (!type) return 'Notification';
  const parts = type.split('\\');
  const name = parts[parts.length - 1];
  return name.replace(/([A-Z])/g, ' $1').trim();
};

watch(currentPage, (newPage) => {
  fetchNotifications(newPage);
});

onMounted(() => {
  fetchNotifications(currentPage.value);
});
</script>

<style scoped>
.notifications-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header h4 {
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.custom-select {
  border-radius: 8px;
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  font-weight: 500;
  color: #4b5563;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.custom-select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.btn-refresh {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.refresh-icon {
  font-size: 1.1rem;
  transition: transform 0.4s ease;
}

.refresh-icon.rotating {
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}

.notifications-container {
  background: transparent;
}

.no-results {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notification-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.notification-card:hover::before {
  background: var(--bs-primary, #0d6efd);
}

.notification-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
.bg-warning-soft { background-color: rgba(255, 193, 7, 0.15); color: #b28900; }
.bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
.bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
.bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.05rem;
}

.notification-message {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

.notification-meta {
  font-size: 0.85rem;
}

.meta-item {
  color: #6b7280;
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: 24px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}

/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-active {
  position: absolute;
}
</style>
