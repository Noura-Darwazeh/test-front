<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0 rounded-3">
          <!-- Header -->
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title fw-semibold d-flex align-items-center gap-2">
              <i class="fas fa-user-friends"></i>
              {{ $t('navbar.SwitchUser') }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" style="max-height: 70vh;">
            <!-- Search Filter -->
            <div class="mb-3">
              <input
                v-model="searchText"
                type="text"
                class="form-control"
                :placeholder="$t('user.searchPlaceholder')"
              />
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}</span>
              </div>
              <p class="mt-2">{{ $t('common.loading') }}</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ error }}
            </div>

            <!-- Users List -->
            <div v-else class="users-list">
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-item p-3 mb-2 border rounded-3 cursor-pointer"
                :class="{ 'selected': selectedUserId === user.id }"
                @click="selectUser(user)"
              >
                <div class="d-flex align-items-center gap-3">
                  <!-- User Avatar -->
                  <div class="user-avatar">
                    <img
                      v-if="user.image"
                      :src="getFullImageUrl(user.image)"
                      alt="User"
                      class="rounded-circle"
                      width="48"
                      height="48"
                      style="object-fit: cover;"
                    />
                    <div
                      v-else
                      class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style="width: 48px; height: 48px;"
                    >
                      {{ getUserInitials(user.name) }}
                    </div>
                  </div>

                  <!-- User Info -->
                  <div class="flex-grow-1">
                    <div class="fw-semibold">{{ user.name }}</div>
                    <div class="text-muted small">
                      @{{ user.username }} • {{ getRoleLabel(user.role) }}
                    </div>
                    <div v-if="user.company_name" class="text-muted small">
                      <i class="fas fa-building me-1"></i>
                      {{ user.company_name }}
                    </div>
                  </div>

                  <!-- Switch Button -->
                  <button
                    class="btn btn-sm btn-primary"
                    @click.stop="switchToUser(user)"
                    :disabled="switching"
                  >
                    <i class="fas fa-sign-in-alt me-1"></i>
                    {{ $t('navbar.switchToUser') }}
                  </button>
                </div>
              </div>

              <!-- No Users Found -->
              <div v-if="filteredUsers.length === 0" class="text-center text-muted py-5">
                <i class="fas fa-users fa-3x mb-3"></i>
                <p>{{ $t('user.noUsersFound') }}</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton
              :text="$t('common.cancel')"
              @click="closeModal"
              bg-color="var(--color-secondary)"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Error Modal -->
  <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import PrimaryButton from './PrimaryButton.vue';
import ErrorModal from './ErrorModal.vue';
import { useAuthStore } from '@/stores/auth.js';
import apiServices from '@/services/apiServices.js';
import { useErrorModal } from '@/composables/useErrorModal.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const users = ref([]);
const searchText = ref('');
const loading = ref(false);
const error = ref(null);
const selectedUserId = ref(null);
const switching = ref(false);

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

const getUserInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getRoleLabel = (role) => {
  const roleValue = Array.isArray(role) ? role[0] : role;
  return t(`roles.${roleValue}`);
};

const filteredUsers = computed(() => {
  if (!searchText.value) return users.value;
  
  const search = searchText.value.toLowerCase();
  return users.value.filter(user => 
    user.name.toLowerCase().includes(search) ||
    user.username.toLowerCase().includes(search) ||
    (user.email && user.email.toLowerCase().includes(search)) ||
    (user.company_name && user.company_name.toLowerCase().includes(search))
  );
});

const selectUser = (user) => {
  selectedUserId.value = user.id;
};

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiServices.getUsers();
    
    // Filter out SuperAdmin users and current user
    users.value = response.data.data.filter(user => {
      if (user.id === authStore.user?.id) return false;
      
      const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
      if (userRole?.toLowerCase() === 'superadmin') return false;
      
      return true;
    });
  } catch (err) {
    error.value = err.message || t('common.errorLoadingData');
    console.error('❌ Error loading users:', err);
  } finally {
    loading.value = false;
  }
};

const switchToUser = async (user) => {
  switching.value = true;

  try {
    const response = await apiServices.switchToUser(user.id);

    if (response.data?.status === 'success' && response.data?.user && response.data?.authorization) {
      // Update auth store with new user and tokens
      authStore.switchUser(
        response.data.user,
        response.data.authorization.login_as_token,
        response.data.authorization.token
      );
      
      // Close modal
      closeModal();
      
      // Redirect to user's default page or home
      const defaultPage = response.data.user.default_page || response.data.user.landing_page || '/driver';
      await router.push(defaultPage);
    } else {
      throw new Error(t('navbar.switchUserFailed'));
    }
  } catch (err) {
    error.value = err.message || t('navbar.switchUserFailed');
    console.error('❌ Switch user error:', err);
    showError(error.value);
  } finally {
    switching.value = false;
  }
};

const closeModal = () => {
  searchText.value = '';
  selectedUserId.value = null;
  error.value = null;
  emit('close');
};

// Fetch users when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchUsers();
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
});
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
}

.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog {
  transition: transform 0.2s ease-out;
}

.modal-leave-active .modal-dialog {
  transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-dialog {
  transform: scale(0.95);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
}

.users-list {
  max-height: 500px;
  overflow-y: auto;
}

.user-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.user-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-item.selected {
  background-color: #e7f3ff;
  border-color: var(--primary-color);
}

.cursor-pointer {
  cursor: pointer;
}
</style>