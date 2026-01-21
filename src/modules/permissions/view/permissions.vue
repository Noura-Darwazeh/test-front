<template>
  <div class="permissions-page-container bg-light">
    <!-- Page Header -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h4 class="mb-1 fw-bold">{{ $t('permissions.title') }}</h4>
          <p class="text-muted mb-0">{{ $t('permissions.subtitle') }}</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
          <!-- Search -->
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              class="form-control"
              :placeholder="$t('permissions.searchUsers')"
              v-model="searchText"
            />
          </div>
          <!-- Refresh Button -->
          <PrimaryButton
            :iconBefore="refreshIcon"
            :loading="usersStore.loading"
            @click="handleRefresh"
          />
        </div>
      </div>
    </div>

    <!-- Permissions Legend -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <h6 class="fw-bold mb-3">
          <i class="fas fa-key me-2 text-primary"></i>
          {{ $t('permissions.availablePermissions') }}
        </h6>
        <div class="d-flex flex-wrap gap-2">
          <span
            v-for="permission in permissionsStore.permissions"
            :key="permission.id"
            class="badge permission-badge"
          >
            <i class="fas fa-shield-alt me-1"></i>
            {{ permission.name }}
          </span>
          <span v-if="permissionsStore.permissions.length === 0" class="text-muted">
            {{ $t('permissions.noPermissions') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ $t('common.loading') }}</span>
      </div>
      <p class="mt-2">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="usersStore.error" class="alert alert-danger m-3">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ usersStore.error }}
    </div>

    <!-- Users Grid -->
    <div v-else>
      <div class="row">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="col-xl-4 col-lg-6 col-md-6 mb-4"
        >
          <div class="card user-card h-100 border-0 shadow-sm">
            <!-- User Header -->
            <div class="card-header user-card-header">
              <div class="d-flex align-items-center">
                <div class="user-avatar me-3">
                  <img
                    v-if="getFullImageUrl(user.image)"
                    :src="getFullImageUrl(user.image)"
                    :alt="user.name"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-0 fw-bold">{{ user.name }}</h6>
                  <small class="text-muted">@{{ user.username }}</small>
                </div>
                <span class="badge role-badge">{{ user.role }}</span>
              </div>
            </div>

            <!-- User Info -->
            <div class="card-body pb-2">
              <div class="user-info mb-3">
                <div class="info-item">
                  <i class="fas fa-envelope text-muted me-2"></i>
                  <span class="text-truncate">{{ user.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-building text-muted me-2"></i>
                  <span>{{ user.company_name || '-' }}</span>
                </div>
              </div>

              <!-- Permissions -->
              <div class="permissions-section">
                <label class="form-label fw-semibold small text-uppercase text-muted">
                  <i class="fas fa-lock me-1"></i>
                  {{ $t('permissions.userPermissions') }}
                </label>
                <div class="permissions-list">
                  <div
                    v-for="permission in permissionsStore.permissions"
                    :key="permission.id"
                    class="permission-item"
                  >
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`perm-${user.id}-${permission.id}`"
                        :checked="permissionsStore.hasPermission(user.id, permission.id)"
                        :disabled="toggleLoading[`${user.id}-${permission.id}`]"
                        @change="togglePermission(user.id, permission.id, $event)"
                      />
                      <label
                        class="form-check-label"
                        :for="`perm-${user.id}-${permission.id}`"
                      >
                        {{ permission.name }}
                        <span
                          v-if="toggleLoading[`${user.id}-${permission.id}`]"
                          class="spinner-border spinner-border-sm ms-1"
                        ></span>
                      </label>
                    </div>
                  </div>
                  <div
                    v-if="permissionsStore.permissions.length === 0"
                    class="text-muted small"
                  >
                    {{ $t('permissions.noPermissionsAvailable') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredUsers.length === 0" class="text-center py-5">
        <i class="fas fa-users fa-3x text-muted mb-3"></i>
        <p class="text-muted">{{ $t('permissions.noUsersFound') }}</p>
      </div>

      <!-- Pagination -->
      <div class="px-3 pt-1 pb-2">
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
import { useI18n } from "vue-i18n";
import { usePermissionsStore } from "../store/permissionsStore.js";
import { useUsersManagementStore } from "../../user/store/usersManagement.js";
import Pagination from "../../../components/shared/Pagination.vue";
import PrimaryButton from "../../../components/shared/PrimaryButton.vue";
import refreshIcon from "../../../assets/table/refresh.svg";

const { t } = useI18n();
const permissionsStore = usePermissionsStore();
const usersStore = useUsersManagementStore();

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35").replace(/\/api\/?$/, "");

const searchText = ref("");
const currentPage = ref(1);
const itemsPerPage = computed(() => usersStore.usersPagination.perPage || 10);
const toggleLoading = reactive({});

// Get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Filter out placeholder URLs
  if (imagePath.includes("placeholder")) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

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
      user.role?.toLowerCase().includes(search)
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
    usersStore.fetchUsers({ page: currentPage.value, perPage: itemsPerPage.value }),
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
.permissions-page-container {
  max-width: 100%;
}

/* Search Box */
.search-box {
  position: relative;
  min-width: 250px;
}

.search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box .form-control {
  padding-left: 38px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.search-box .form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

/* Permission Badge */
.permission-badge {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  border-radius: 6px;
}

/* User Card */
.user-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.user-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.25rem;
  border-bottom: none;
}

.user-avatar {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-card-header h6 {
  color: white;
}

.user-card-header small {
  color: rgba(255, 255, 255, 0.7) !important;
}

.role-badge {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* User Info */
.user-info {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.info-item i {
  width: 20px;
}

/* Permissions Section */
.permissions-section {
  padding-top: 0.75rem;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permission-item {
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.permission-item:hover {
  background-color: #e9ecef;
}

.form-check-input {
  cursor: pointer;
  width: 2.5em;
  height: 1.25em;
}

.form-check-input:checked {
  background-color: #198754;
  border-color: #198754;
}

.form-check-label {
  cursor: pointer;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .search-box {
    min-width: 100%;
  }
}
</style>
