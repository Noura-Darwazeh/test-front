<template>
  <div class="container-fluid py-4 fb-like-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h4 mb-0 fw-bold text-dark">
        {{ $t('notifications.historyTitle', 'Notifications History') }}
      </h2>
      <button 
        class="btn btn-sm btn-light text-primary fw-medium rounded-pill px-3 shadow-sm transition-all custom-hover-btn"
        @click="markAllAsRead"
        v-if="hasUnread"
      >
        <i class="fas fa-check-double me-1"></i>
        {{ $t('notifications.markAllAsRead', 'Mark all as read') }}
      </button>
    </div>

    <!-- Main List Card -->
    <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden history-card mx-auto">
      <!-- Loading State -->
      <div v-if="store.loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div class="mt-2 text-muted fw-medium">{{ $t('notifications.loading', 'Loading history...') }}</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.notifications.length === 0" class="text-center py-5 text-muted">
        <div class="mb-3 empty-bell-wrap d-flex justify-content-center align-items-center mx-auto rounded-circle bg-light" style="width: 80px; height: 80px;">
          <i class="fas fa-bell-slash fa-2x text-secondary"></i>
        </div>
        <h5 class="fw-bold">{{ $t('notifications.noHistory', 'No notifications history found') }}</h5>
        <p class="small">{{ $t('notifications.checkLater', 'We\'ll let you know when we have news for you.') }}</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="list-group list-group-flush pt-2 pb-2">
        <div 
          v-for="notif in store.notifications" 
          :key="notif.id" 
          class="list-group-item list-group-item-action border-0 px-3 py-3 d-flex align-items-center fb-notif-item transition-all"
          :class="{'unread-notif': notif.read_at === null}"
          @click="handleNotifClick(notif)"
        >
          <!-- Icon Context -->
          <div class="icon-wrapper flex-shrink-0 me-3 position-relative rounded-circle d-flex align-items-center justify-content-center shadow-sm" :class="getBgClass(notif.type)">
            <i :class="['fas', getIconForType(notif.type)]" class="text-white fs-5"></i>
            <!-- Small floating badge if you want another layer like FB -->
            <div class="position-absolute bottom-0 end-0 bg-white rounded-circle d-flex align-items-center justify-content-center border border-white" style="width: 16px; height: 16px; transform: translate(10%, 10%);">
              <i class="fas fa-circle text-primary" style="font-size: 8px;"></i>
            </div>
          </div>

          <!-- Notification Content -->
          <div class="flex-grow-1 min-width-0">
            <div class="mb-1 text-wrap text-break">
              <span class="fw-bold text-dark me-1">{{ getTitle(notif) }}</span>
              <span class="text-secondary opacity-75 fs-6" :class="{'fw-semibold text-dark opacity-100': notif.read_at === null}">{{ getMessage(notif) }}</span>
            </div>
            
            <div class="d-flex align-items-center mt-1">
              <span class="text-primary fw-semibold small type-badge">{{ formatType(notif.type) }}</span>
              
              <!-- If created_at exists, show time -->
              <template v-if="notif.created_at">
                <span class="mx-2 text-muted fw-light" style="font-size: 6px;"><i class="fas fa-circle"></i></span>
                <span class="text-muted small time-ago">{{ formatTime(notif.created_at) }}</span>
              </template>
            </div>
          </div>
          
          <!-- Unread Dot -->
          <div v-if="notif.read_at === null" class="ms-3 flex-shrink-0 d-flex align-items-center">
            <div class="bg-primary rounded-circle" style="width: 12px; height: 12px;"></div>
          </div>
        </div>
      </div>
      
      <!-- FB-like Pagination Area -->
      <div class="card-footer bg-white border-top-0 py-3 px-3 d-flex flex-column flex-md-row justify-content-between align-items-center" v-if="store.pagination.lastPage > 1">
        <span class="text-muted small fw-medium mb-2 mb-md-0">
          {{ store.pagination.total }} {{ $t('pagination.totalNotifications', 'Notifications total') }}
        </span>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0 rounded pagination-fb shadow-inner">
            <li class="page-item" :class="{ disabled: store.pagination.currentPage === 1 }">
              <button class="page-link px-3" @click="changePage(store.pagination.currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" v-for="page in visiblePages" :key="page" :class="{ active: page === store.pagination.currentPage }">
              <button class="page-link fw-bold px-3" @click="changePage(page)">
                <span v-if="page === '...'">...</span>
                <span v-else>{{ page }}</span>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: store.pagination.currentPage === store.pagination.lastPage }">
              <button class="page-link px-3" @click="changePage(store.pagination.currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useNotificationsHistoryStore } from '../store/notificationsStore.js';
import { useI18n } from 'vue-i18n';

const store = useNotificationsHistoryStore();
const { t } = useI18n();

onMounted(() => {
  store.getNotificationsHistory();
});

const changePage = (page) => {
  if (page === '...') return;
  if (page >= 1 && page <= store.pagination.lastPage) {
    store.getNotificationsHistory(page);
  }
};

const hasUnread = computed(() => {
  return store.notifications.some(n => n.read_at === null);
});

const handleNotifClick = (notif) => {
  if (notif.read_at === null) {
    store.markAsRead([notif.id]);
  }
};

const markAllAsRead = () => {
  const unreadIds = store.notifications
    .filter(n => n.read_at === null)
    .map(n => n.id);
    
  if (unreadIds.length > 0) {
    store.markAsRead(unreadIds);
  }
};

const visiblePages = computed(() => {
  const current = store.pagination.currentPage;
  const last = store.pagination.lastPage;
  const delta = 2;
  const range = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift('...');
  }
  if (current + delta < last - 1) {
    range.push('...');
  }

  range.unshift(1);
  if (last > 1) {
    range.push(last);
  }

  return range;
});

const formatType = (type) => {
  if (!type) return 'System';
  let label = type.includes('\\') ? type.split('\\').pop() : type;
  label = label.replace(/_/g, ' ');
  label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
  return label.replace(/\b\w/g, c => c.toUpperCase()).trim();
};

const getIconForType = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('work_plan')) return 'fa-clipboard-list';
  if (t.includes('order')) return 'fa-box-open';
  if (t.includes('warning') || t.includes('alert')) return 'fa-exclamation-triangle';
  if (t.includes('user') || t.includes('account')) return 'fa-user';
  return 'fa-bell';
};

const getBgClass = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('work_plan')) return 'bg-info bg-gradient';
  if (t.includes('order')) return 'bg-success bg-gradient';
  if (t.includes('warning') || t.includes('alert')) return 'bg-warning bg-gradient';
  if (t.includes('error') || t.includes('fail')) return 'bg-danger bg-gradient';
  return 'bg-primary bg-gradient';
};

const getTitle = (notif) => {
  if (notif.items) {
    if (typeof notif.items === 'string') {
      try {
        const parsed = JSON.parse(notif.items);
        return parsed.title || formatType(notif.type);
      } catch (e) {
        return formatType(notif.type);
      }
    }
    return notif.items.title || formatType(notif.type);
  }
  return formatType(notif.type);
};

const getMessage = (notif) => {
  if (notif.items) {
    if (typeof notif.items === 'string') {
      try {
        const parsed = JSON.parse(notif.items);
        return parsed.message || t('notifications.noMessage', 'No message content.');
      } catch (e) {
        return notif.items;
      }
    }
    return notif.items.message || t('notifications.noMessage', 'No message content.');
  }
  return t('notifications.noMessage', 'No message content.');
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (diff < 60) return t('time.justNow', 'Just now');
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t('time.minutesAgo', 'm')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('time.hoursAgo', 'h')}`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ${t('time.daysAgo', 'd')}`;
  
  return date.toLocaleDateString();
};
</script>

<style scoped>
.fb-like-container {
  max-width: 900px;
  margin: 0 auto;
}

.history-card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 0px 4px rgba(0, 0, 0, 0.05) !important;
}

.fb-notif-item {
  margin: 0 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #050505;
  background-color: transparent;
}

.fb-notif-item.unread-notif {
  background-color: #e7f3ff;
}

.fb-notif-item:hover {
  background-color: #f0f2f5;
  color: #050505;
}

.fb-notif-item.unread-notif:hover {
  background-color: #dbe7f4;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  font-size: 24px;
}

.type-badge {
  background: rgba(var(--bs-primary-rgb), 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.min-width-0 {
  min-width: 0; 
}

.time-ago {
  color: #65676b !important;
  font-weight: 500;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

.pagination-fb .page-link {
  color: #1c1e21;
  border: none;
  background-color: #f0f2f5;
  margin: 0 2px;
  border-radius: 6px;
}

.pagination-fb .page-item.active .page-link {
  background-color: #e7f3ff;
  color: #1877f2;
}

.pagination-fb .page-link:hover {
  background-color: #e4e6eb;
}

.pagination-fb .page-item.disabled .page-link {
  background-color: transparent;
  color: #bcc0c4;
}

.custom-hover-btn:hover {
  background-color: #e4e6eb !important;
  color: #050505 !important;
}
</style>
