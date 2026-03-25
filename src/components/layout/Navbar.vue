<template>
  <nav class="navbar navbar-light bg-white border-bottom p-2" :class="{ rtl: isRTL }">
    <div class="container-fluid px-3 py-2">
      <div class="d-flex align-items-center justify-content-between w-100">
        <h4 class="mb-0 fw-semibold text-dark">
          {{ displayTitle }}
        </h4>

        <div class="d-flex align-items-center gap-3">
          <!-- Return to Admin Button (shown only when switched) -->
          <button v-if="authStore.isSwitchedUser" @click="returnToAdmin"
            class="btn btn-sm btn-warning d-flex align-items-center gap-2" type="button">
            <i class="fas fa-undo"></i>
            <span class="d-none d-md-inline">{{ $t('navbar.returnToAdmin') }}</span>
          </button>

          <!-- Notifications Dropdown -->
          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'" :closeOnScroll="false" minWidth="400px" maxHeight="520px">
            <template #trigger>
              <button class="btn btn-link p-0 position-relative notif-bell-btn" type="button">
                <img :src="bellIcon" alt="Notifications" width="25" height="25" />
                <span
                  v-if="notificationStore.unreadCount > 0"
                  class="notif-badge"
                >
                  {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
                </span>
              </button>
            </template>

            <template #menu="{ close }">
              <div class="nd-panel">
                <!-- Header -->
                <div class="nd-header">
                  <span class="nd-heading">{{ $t('navbar.notifications') }}</span>
                  <button
                    v-if="notificationStore.notifications.length > 0"
                    class="nd-mark-read-btn"
                    @click.stop="notificationStore.markAllAsRead()"
                  >
                    <i class="fas fa-check-double"></i>
                    {{ $t('navbar.markAllRead') }}
                  </button>
                </div>
                <div class="nd-divider"></div>

                <!-- Loading -->
                <div v-if="notificationStore.loading" class="nd-state">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                </div>

                <!-- Empty -->
                <div v-else-if="notificationStore.notifications.length === 0" class="nd-state">
                  <div class="nd-empty-icon">
                    <i class="fas fa-bell-slash"></i>
                  </div>
                  <span class="nd-empty-text">{{ $t('navbar.noNotifications') }}</span>
                </div>

                <!-- List -->
                <ul v-else class="nd-list">
                  <li
                    v-for="notification in notificationStore.notifications"
                    :key="notification.id"
                    class="nd-item"
                    :class="{ 'nd-item--unread': !notification.read }"
                    @click="handleNotificationClick(notification, close)"
                  >
                    <!-- Unread indicator dot on far left -->
                    <span class="nd-unread-dot" :class="{ 'nd-unread-dot--visible': !notification.read }"></span>

                    <!-- Square icon tile -->
                    <div class="nd-icon-tile" :class="notification.read ? 'nd-icon-tile--read' : 'nd-icon-tile--unread'">
                      <i :class="['fas', getNotificationMeta(notification.type).icon]"></i>
                    </div>

                    <!-- Content: title + timestamp -->
                    <div class="nd-item-content">
                      <span class="nd-item-title" :class="{ 'fw-semibold': !notification.read }">
                        {{ notification.title }}
                      </span>
                      <span class="nd-item-time">{{ formatTime(notification.created_at) }}</span>
                    </div>

                    <!-- Dismiss X -->
                    <button
                      class="nd-dismiss-btn"
                      :title="$t('common.remove')"
                      @click.stop="handleDismissNotification(notification.id)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </li>
                </ul>

                <!-- Footer -->
                <div v-if="notificationStore.notifications.length > 0" class="nd-footer">
                  <button class="nd-show-all-btn" @click="openShowAll(close)">
                    {{ $t('navbar.showAll') }}
                  </button>
                </div>
              </div>
            </template>
          </BaseDropdown>

          <!-- Language Selector -->
          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button class="btn btn-link p-0" type="button">
                <img :src="globeIcon" alt="Language" width="25" height="25" />
              </button>
            </template>
            <template #menu="{ close }">
              <ul class="list-unstyled mb-0">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="switchLanguage('EN'); close()">
                    English
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="switchLanguage('AR'); close()">
                    العربية
                  </a>
                </li>
              </ul>
            </template>
          </BaseDropdown>

          <!-- User Profile Dropdown -->
          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button class="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none" type="button">
                <img v-if="userAvatar" :src="userAvatar" alt="User profile picture" class="rounded-circle" width="36" height="36" />
                <div v-else class="user-avatar-placeholder rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; background-color: #667eea; color: white;">
                  <i class="fas fa-user"></i>
                </div>
                <span class="d-none d-md-inline text-dark">{{ authStore.userName || 'User' }}</span>
                <img :src="dropDownIcon" alt="Dropdown" width="16" height="16" />
              </button>
            </template>
            <template #menu="{ close }">
              <ul class="list-unstyled mb-0">
                <!-- User Info -->
                <li class="px-3 py-2 border-bottom">
                  <div class="small text-muted">{{ $t("navbar.signedInAs") }}</div>
                  <div class="fw-semibold">{{ authStore.user?.email || authStore.user?.username }}</div>
                  <div class="badge bg-primary mt-1">{{ authStore.userRole }}</div>
                  <div v-if="authStore.isSwitchedUser" class="badge bg-warning mt-1">
                    <i class="fas fa-user-friends me-1"></i>
                    {{ $t('navbar.switchedUser') }}
                  </div>
                </li>

                <!-- Profile Link -->
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleProfile(close)">
                    <i class="fas fa-user me-2"></i>
                    {{ $t("navbar.profile") }}
                  </a>
                </li>

                <!-- Settings Link -->
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleSettings(close)">
                    <i class="fas fa-cog me-2"></i>
                    {{ $t("navbar.settings") }}
                  </a>
                </li>

                <li>
                  <hr class="dropdown-divider" />
                </li>

                <!-- Switch User (Only for SuperAdmin and not already switched) -->
                <li v-if="authStore.hasRole('SuperAdmin') && !authStore.isSwitchedUser">
                  <a class="dropdown-item" href="#" @click.prevent="handleSwitchUser(close)">
                    <i class="fas fa-user-friends me-2"></i>
                    {{ $t("navbar.SwitchUser") }}
                  </a>
                </li>

                <!-- Logout -->
                <li>
                  <a class="dropdown-item" style="color: var(--color-danger);" href="#"
                    @click.prevent="handleLogout(close)">
                    <i class="fas fa-sign-out-alt me-2"></i>
                    {{ $t("navbar.logout") }}
                  </a>
                </li>
              </ul>
            </template>
          </BaseDropdown>
        </div>
      </div>
    </div>
  </nav>

  <!-- Notification Detail Modal -->
  <Teleport to="body">
    <Transition name="nm-backdrop">
      <div v-if="activeNotification" class="nm-overlay" @click.self="closeNotificationModal"></div>
    </Transition>
    <Transition name="nm-card">
      <div v-if="activeNotification" class="nm-wrap" @click.self="closeNotificationModal">
        <div class="nm-card">
          <!-- Colored top strip + icon -->
          <div class="nm-card-top" :style="{ '--nm-accent': getNotificationMeta(activeNotification.type).color }">
            <div class="nm-card-icon-wrap" :style="{ backgroundColor: getNotificationMeta(activeNotification.type).color }">
              <i :class="['fas', getNotificationMeta(activeNotification.type).icon]"></i>
            </div>
            <button class="nm-card-close" @click="closeNotificationModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="nm-card-body">
            <div class="nm-card-type">{{ formatNotificationType(activeNotification.type) }}</div>
            <h5 class="nm-card-title">{{ activeNotification.title }}</h5>
            <p class="nm-card-message">{{ activeNotification.body }}</p>
            <div class="nm-card-time">
              <i class="fas fa-clock me-1"></i>
              {{ formatFullTime(activeNotification.created_at) }}
            </div>
          </div>

          <!-- Footer -->
          <div class="nm-card-footer">
            <button class="btn btn-outline-secondary btn-sm" @click="closeNotificationModal">
              {{ $t('common.close') }}
            </button>
            <button
              v-if="activeNotification.data?.url"
              class="btn btn-primary btn-sm"
              @click="goToNotificationUrl"
            >
              {{ $t('navbar.goTo') }}
              <i class="fas fa-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Show All Notifications Modal -->
  <Teleport to="body">
    <Transition name="nm-backdrop">
      <div v-if="isShowAllOpen" class="nm-overlay" @click.self="closeShowAll"></div>
    </Transition>
    <Transition name="nm-card">
      <div v-if="isShowAllOpen" class="nm-wrap" @click.self="closeShowAll">
        <div class="sa-modal">
          <!-- Header -->
          <div class="sa-header">
            <div>
              <h5 class="sa-title">{{ $t('navbar.notifications') }}</h5>
              <span class="sa-subtitle">{{ notificationStore.notifications.length }} {{ $t('navbar.totalNotifications') }}</span>
            </div>
            <button class="nm-card-close" style="background: #f3f4f6; color: #374151;" @click="closeShowAll">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Search -->
          <div class="sa-search-wrap">
            <i class="fas fa-search sa-search-icon"></i>
            <input
              v-model="saSearch"
              class="sa-search-input"
              :placeholder="$t('navbar.searchNotifications')"
              @input="saPage = 1"
            />
          </div>

          <!-- List -->
          <div class="sa-list-wrap">
            <div v-if="saFiltered.length === 0" class="sa-empty">
              <i class="fas fa-bell-slash"></i>
              <span>{{ saSearch ? $t('navbar.noResults') : $t('navbar.noNotifications') }}</span>
            </div>
            <ul v-else class="sa-list">
              <li
                v-for="notification in saPaginated"
                :key="notification.id"
                class="sa-item"
                :class="{ 'sa-item--unread': !notification.read }"
                @click="handleNotificationClick(notification, closeShowAll)"
              >
                <span class="nd-unread-dot" :class="{ 'nd-unread-dot--visible': !notification.read }"></span>
                <div class="nd-icon-tile" :class="notification.read ? 'nd-icon-tile--read' : 'nd-icon-tile--unread'">
                  <i :class="['fas', getNotificationMeta(notification.type).icon]"></i>
                </div>
                <div class="sa-item-content">
                  <span class="nd-item-title" :class="{ 'fw-semibold': !notification.read }">{{ notification.title }}</span>
                  <span class="sa-item-body">{{ notification.body }}</span>
                  <span class="nd-item-time">{{ formatTime(notification.created_at) }}</span>
                </div>
                <button
                  class="nd-dismiss-btn"
                  :title="$t('common.remove')"
                  @click.stop="handleDismissNotification(notification.id)"
                >
                  <i class="fas fa-times"></i>
                </button>
              </li>
            </ul>
          </div>

          <!-- Pagination -->
          <div v-if="saTotalPages > 1" class="sa-pagination">
            <button class="sa-pg-btn" :disabled="saPage === 1" @click="saPage--">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="sa-pg-info">{{ saPage }} / {{ saTotalPages }}</span>
            <button class="sa-pg-btn" :disabled="saPage === saTotalPages" @click="saPage++">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Switch User Modal -->
  <SwitchUserModal :isOpen="isSwitchUserModalOpen" @close="closeSwitchUserModal" />

  <!-- Logout Confirmation Modal -->
  <ConfirmationModal
    :isOpen="isLogoutModalOpen"
    :title="$t('navbar.confirmLogoutTitle')"
    :message="$t('navbar.confirmLogout')"
    :confirmText="$t('navbar.logout')"
    :cancelText="$t('common.cancel')"
    :confirmColor="'var(--color-danger)'"
    @confirm="confirmLogout"
    @close="closeLogoutModal"
  />

  <!-- Error Modal -->
  <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n/index";
import { useAuthStore } from "@/stores/auth.js";
import { useNotificationStore } from "@/stores/notificationStore.js";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";
import SwitchUserModal from "@/components/shared/SwitchUserModal.vue";
import ConfirmationModal from "@/components/shared/ConfirmationModal.vue";
import ErrorModal from "@/components/shared/ErrorModal.vue";
import { useErrorModal } from "@/composables/useErrorModal.js";
import bellIcon from "@/assets/Navbar/Bell.svg";
import globeIcon from "@/assets/Navbar/Globe.svg";
import dropDownIcon from "@/assets/Navbar/DropDown.svg";

const props = defineProps({
  pageTitle: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { locale, t } = useI18n();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();
const isRTL = computed(() => locale.value === "ar");

const displayTitle = computed(() => {
  if (props.pageTitle) return props.pageTitle;
  return route.meta.titleKey ? t(route.meta.titleKey) : "Dashboard";
});

const notificationStore = useNotificationStore();

// ── Notification type → icon/color mapping ──────────────────────────────────
const getNotificationMeta = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('work_plan'))  return { icon: 'fa-clipboard-list', color: '#3b82f6', bg: '#eff6ff' };
  if (t.includes('order'))      return { icon: 'fa-box',            color: '#8b5cf6', bg: '#f5f3ff' };
  if (t.includes('warning') || t.includes('alert')) return { icon: 'fa-exclamation-triangle', color: '#f59e0b', bg: '#fffbeb' };
  if (t.includes('push'))       return { icon: 'fa-bell',           color: '#6366f1', bg: '#eef2ff' };
  return                               { icon: 'fa-bell',           color: '#6366f1', bg: '#eef2ff' };
};

const formatNotificationType = (type) => {
  if (!type) return '';
  // Strip Laravel class prefix (e.g. "App\Notifications\SendPushNotification")
  let label = type.includes('\\') ? type.split('\\').pop() : type;
  // snake_case → words
  label = label.replace(/_/g, ' ');
  // CamelCase → words
  label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
  return label.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
};

// ── Active notification modal ────────────────────────────────────────────────
const activeNotification = ref(null);

const handleNotificationClick = (notification, close) => {
  notificationStore.markAsRead(notification.id);
  activeNotification.value = notification;
  close(); // close dropdown, but do NOT remove from list
};

const handleDismissNotification = (id) => {
  notificationStore.dismissNotification(id);
  // If the dismissed notification is open in the modal, close it
  if (activeNotification.value?.id === id) activeNotification.value = null;
};

const handleClearAll = () => {
  notificationStore.clearAllFromUI();
  activeNotification.value = null;
};

// ── Show-all modal ────────────────────────────────────────────────────────────
const SA_PAGE_SIZE = 10;
const isShowAllOpen = ref(false);
const saSearch = ref('');
const saPage = ref(1);

const saFiltered = computed(() => {
  const q = saSearch.value.trim().toLowerCase();
  if (!q) return notificationStore.notifications;
  return notificationStore.notifications.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.body  || '').toLowerCase().includes(q),
  );
});

const saTotalPages = computed(() => Math.max(1, Math.ceil(saFiltered.value.length / SA_PAGE_SIZE)));

const saPaginated = computed(() => {
  const start = (saPage.value - 1) * SA_PAGE_SIZE;
  return saFiltered.value.slice(start, start + SA_PAGE_SIZE);
});

const openShowAll = (close) => {
  close();
  saSearch.value = '';
  saPage.value = 1;
  isShowAllOpen.value = true;
};

const closeShowAll = () => {
  isShowAllOpen.value = false;
};

const closeNotificationModal = () => {
  activeNotification.value = null;
};

const goToNotificationUrl = () => {
  const url = activeNotification.value?.data?.url;
  closeNotificationModal();
  if (url) router.push(url);
};

// ── Time formatting ──────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return t('navbar.justNow');
  if (diff < 3600)  return `${Math.floor(diff / 60)}${t('navbar.minutesAgo')}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t('navbar.hoursAgo')}`;
  return `${Math.floor(diff / 86400)}${t('navbar.daysAgo')}`;
};

const formatFullTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Misc ─────────────────────────────────────────────────────────────────────
const userAvatar = computed(() => {
  const image = authStore.user?.image;
  if (!image || image.includes("placeholder")) return null;
  return image;
});

const isSwitchUserModalOpen = ref(false);
const isLogoutModalOpen = ref(false);

const switchLanguage = async (lang) => {
  const langLower = lang.toLowerCase();
  const backendLang = langLower === 'ar' ? 'arabic' : 'english';
  try {
    setLocale(langLower);
    await authStore.updateUserLanguage(backendLang);
  } catch (error) {
    console.error("❌ Failed to update language preference:", error);
  }
};

const handleProfile  = (close) => { close(); router.push({ name: "Profile" }); };
const handleSettings = (close) => { close(); };
const handleSwitchUser = (close) => { close(); isSwitchUserModalOpen.value = true; };
const closeSwitchUserModal = () => { isSwitchUserModalOpen.value = false; };

const returnToAdmin = async () => {
  try {
    const success = await authStore.returnToAdmin();
    if (success) {
      const defaultPage = authStore.user?.default_page || authStore.user?.landing_page || '/user';
      await router.push(defaultPage);
      window.location.reload();
    } else {
      showError("Failed to return to admin account");
    }
  } catch (error) {
    showError("Error returning to admin account");
  }
};

const handleLogout = (close) => { close(); isLogoutModalOpen.value = true; };

const confirmLogout = async () => {
  try {
    await authStore.logout();
    notificationStore.clearNotifications();
    router.push({ name: "Login" });
  } catch (error) {
    showError("Logout failed. Please try again.");
  }
};

const closeLogoutModal = () => { isLogoutModalOpen.value = false; };
</script>

<style scoped>
.navbar {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
}
.btn-link:hover  { color: var(--primary-color); }
.btn-link:focus  { box-shadow: none; }

.dropdown-item:active,
.dropdown-item.active {
  background-color: var(--primary-color) !important;
  color: white !important;
}

/* ── Bell button ─────────────────────────────────────────────────────────── */
.notif-bell-btn { outline: none; }

.notif-badge {
  position: absolute;
  top: -4px;
  inset-inline-end: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid #fff;
}

/* ── Notification Dropdown Panel ─────────────────────────────────────────── */
.nd-panel {
  width: 400px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
}

.nd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  flex-shrink: 0;
}

.nd-heading {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.nd-mark-read-btn {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #3b82f6;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: opacity 0.15s;
}
.nd-mark-read-btn:hover { opacity: 0.7; }

.nd-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0;
  flex-shrink: 0;
}

/* Loading / empty state */
.nd-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  gap: 0.75rem;
  flex-shrink: 0;
}

.nd-empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #9ca3af;
}

.nd-empty-text {
  font-size: 0.83rem;
  color: #9ca3af;
}

/* Scrollable list */
.nd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

/* Individual item */
.nd-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  min-height: 60px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
  position: relative;
}
.nd-item:last-child { border-bottom: none; }
.nd-item:hover { background: #f9fafb; }
.nd-item--unread:hover { background: #eff6ff; }

/* Unread indicator — small dot on far left */
.nd-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}
.nd-unread-dot--visible {
  background: #3b82f6;
}

/* Square icon tile */
.nd-icon-tile {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.875rem;
  color: #fff;
}
.nd-icon-tile--unread { background: #3b82f6; }
.nd-icon-tile--read   { background: #4b5563; }

/* Content: title + timestamp stacked */
.nd-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nd-item-title {
  font-size: 0.83rem;
  color: #111827;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nd-item-time {
  font-size: 0.71rem;
  color: #9ca3af;
}

/* Dismiss button */
.nd-dismiss-btn {
  background: none;
  border: none;
  padding: 4px 5px;
  color: #d1d5db;
  cursor: pointer;
  font-size: 0.65rem;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
  opacity: 0;
  flex-shrink: 0;
}
.nd-item:hover .nd-dismiss-btn { opacity: 1; }
.nd-dismiss-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

/* Footer */
.nd-footer {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
}

.nd-show-all-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 11px 16px;
  font-size: 0.83rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, color 0.15s;
  border-radius: 0 0 12px 12px;
}
.nd-show-all-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

/* ── Notification Detail Modal ───────────────────────────────────────────── */
.nm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1060;
}

.nm-wrap {
  position: fixed;
  inset: 0;
  z-index: 1070;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.nm-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

/* Top colored strip */
.nm-card-top {
  position: relative;
  background: linear-gradient(135deg, var(--nm-accent, #6366f1) 0%, color-mix(in srgb, var(--nm-accent, #6366f1) 75%, #000) 100%);
  padding: 1.25rem 1.25rem 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.nm-card-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.35);
}

.nm-card-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.nm-card-close:hover { background: rgba(255, 255, 255, 0.35); }

/* Card body — pulled up over the strip */
.nm-card-body {
  padding: 0 1.5rem 1rem;
  margin-top: -0.75rem;
  position: relative;
}

.nm-card-type {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  margin-bottom: 0.6rem;
}

.nm-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.6rem;
  line-height: 1.4;
}

.nm-card-message {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.nm-card-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Footer */
.nm-card-footer {
  padding: 0.75rem 1.5rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #f1f3f5;
}

/* ── Show-all Modal ──────────────────────────────────────────────────────── */
.sa-modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid #f1f3f5;
  flex-shrink: 0;
}

.sa-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
}

.sa-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.sa-search-wrap {
  position: relative;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #f1f3f5;
  flex-shrink: 0;
}

.sa-search-icon {
  position: absolute;
  left: 1.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.8rem;
  pointer-events: none;
}

.sa-search-input {
  width: 100%;
  padding: 0.5rem 0.875rem 0.5rem 2.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #111827;
  background: #f9fafb;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.sa-search-input:focus {
  border-color: #3b82f6;
  background: #fff;
}

.sa-list-wrap {
  flex: 1;
  overflow-y: auto;
}

.sa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  color: #9ca3af;
  font-size: 0.85rem;
}
.sa-empty i { font-size: 1.5rem; }

.sa-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sa-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
.sa-item:last-child { border-bottom: none; }
.sa-item:hover { background: #f9fafb; }
.sa-item--unread:hover { background: #eff6ff; }

.sa-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sa-item-body {
  font-size: 0.78rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sa-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid #f1f3f5;
  flex-shrink: 0;
}

.sa-pg-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: background 0.15s, border-color 0.15s;
}
.sa-pg-btn:hover:not(:disabled) { background: #f3f4f6; border-color: #d1d5db; }
.sa-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.sa-pg-info {
  font-size: 0.83rem;
  color: #6b7280;
  min-width: 3rem;
  text-align: center;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.nm-backdrop-enter-active, .nm-backdrop-leave-active { transition: opacity 0.2s ease; }
.nm-backdrop-enter-from,   .nm-backdrop-leave-to     { opacity: 0; }

.nm-card-enter-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.nm-card-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.nm-card-enter-from   { opacity: 0; transform: scale(0.93) translateY(12px); }
.nm-card-leave-to     { opacity: 0; transform: scale(0.95); }
</style>
