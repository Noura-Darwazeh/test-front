<template>
  <div class="permissions-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-3"
      >
        <div class="d-flex gap-2 align-items-center">
          <div class="search-input">
            <img :src="searchIcon" alt="search" class="search-icon" />
            <input
              type="text"
              :placeholder="$t('permissions.searchUsers')"
              v-model="searchText"
            />
          </div>
          <button
            class="btn-refresh"
            :disabled="usersStore.loading"
            @click="handleRefresh"
          >
            <img
              :src="refreshIcon"
              alt="refresh"
              class="refresh-icon"
              :class="{ rotating: usersStore.loading }"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.loading" class="loading-state">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">{{ $t("common.loading") }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="usersStore.error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ usersStore.error }}
    </div>

    <!-- Users List -->
    <div v-else class="users-container">
      <div v-for="user in filteredUsers" :key="user.id" class="user-row">
        <!-- User Info -->
        <div class="user-info-section">
          <div class="user-details">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-meta">
              <span class="username">@{{ user.username }}</span>
              <span class="separator">•</span>
              <span class="role">{{ user.role }}</span>
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <div class="permissions-section">
          <div
            v-for="permission in permissionsStore.permissions"
            :key="permission.id"
            class="permission-toggle"
          >
            <label class="switch">
              <input
                type="checkbox"
                :checked="
                  permissionsStore.hasPermission(user.id, permission.id)
                "
                :disabled="toggleLoading[`${user.id}-${permission.id}`]"
                @change="togglePermission(user.id, permission.id, $event)"
              />
              <span class="slider"></span>
            </label>
            <span class="permission-label">
              {{ permission.name }}
              <span
                v-if="toggleLoading[`${user.id}-${permission.id}`]"
                class="spinner-border spinner-border-sm ms-1"
              ></span>
            </span>
          </div>
          <div
            v-if="permissionsStore.permissions.length === 0"
            class="text-muted small"
          >
            {{ $t("permissions.noPermissionsAvailable") }}
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredUsers.length === 0" class="no-results">
        <i class="fas fa-search fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">{{ $t("permissions.noUsersFound") }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredUsers.length > 0" class="pagination-wrapper">
        <Pagination
          :totalItems="usersStore.usersPagination.total"
          :itemsPerPage="itemsPerPage"
          :currentPage="currentPage"
          :totalPages="usersStore.usersPagination.lastPage"
          @update:currentPage="(page) => (currentPage = page)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from "vue";
import { usePermissionsStore } from "../store/permissionsStore.js";
import { useUsersManagementStore } from "../../user/store/usersManagement.js";
import Pagination from "../../../components/shared/Pagination.vue";
import searchIcon from "../../../assets/search.svg";
import refreshIcon from "../../../assets/table/refresh.svg";

const permissionsStore = usePermissionsStore();
const usersStore = useUsersManagementStore();

const searchText = ref("");
const currentPage = ref(1);
const itemsPerPage = computed(() => usersStore.usersPagination.perPage || 10);
const toggleLoading = reactive({});

// Filter users by search text
const filteredUsers = computed(() => {
  if (!searchText.value.trim()) {
    return usersStore.users;
  }
  const search = searchText.value.toLowerCase();
  return usersStore.users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search),
  );
});

// Toggle permission for user
const togglePermission = async (userId, permissionId, event) => {
  const key = `${userId}-${permissionId}`;
  const isChecked = event.target.checked;

  toggleLoading[key] = true;
  try {
    if (isChecked) {
      await permissionsStore.assignPermission(userId, permissionId);
    } else {
      await permissionsStore.removePermission(userId, permissionId);
    }
  } catch (err) {
    // Revert checkbox state on error
    event.target.checked = !isChecked;
    console.error("Failed to toggle permission:", err);
  } finally {
    toggleLoading[key] = false;
  }
};

// Refresh data
const handleRefresh = async () => {
  await Promise.all([
    permissionsStore.fetchPermissions(),
    usersStore.fetchUsers({
      page: currentPage.value,
      perPage: itemsPerPage.value,
    }),
    permissionsStore.fetchUserPermissionsMap(),
  ]);
};

// Watch for page changes
watch(currentPage, async (newPage) => {
  await usersStore.fetchUsers({ page: newPage, perPage: itemsPerPage.value });
});

// Watch search to reset page
watch(searchText, () => {
  currentPage.value = 1;
});

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      permissionsStore.fetchPermissions(),
      usersStore.fetchUsers({ page: 1, perPage: itemsPerPage.value }),
      permissionsStore.fetchUserPermissionsMap(),
    ]);
  } catch (err) {
    console.error("Failed to load permissions data:", err);
  }
});
</script>

<style scoped>
.permissions-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header h4 {
  font-weight: 600;
  color: #1a1a1a;
}

/* Search Input */
.search-input {
  position: relative;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.search-input input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 0, 123, 255), 0.1);
}

/* Refresh Button */
.btn-refresh {
  width: 38px;
  height: 38px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-refresh:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #d0d0d0;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.refresh-icon.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

/* Users Container */
.users-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

/* User Row */
.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background-color: #fafafa;
}

/* User Info Section */
.user-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 20px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  font-size: 15px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.user-meta .username {
  color: #666;
}

.user-meta .separator {
  color: #ccc;
}

.user-meta .role {
  color: #888;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Permissions Section */
.permissions-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  flex: 1;
}

.permission-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-label {
  font-size: 14px;
  color: #333;
  user-select: none;
}

/* Custom Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ddd;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color, #0d6efd);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
}

/* Pagination Wrapper */
.pagination-wrapper {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

/* Responsive */
@media (max-width: 992px) {
  .user-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .user-info-section {
    width: 100%;
  }

  .permissions-section {
    width: 100%;
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .search-input {
    min-width: 100%;
  }

  .permissions-section {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
