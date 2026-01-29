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

          <!-- Notifications Button -->
          <button class="btn btn-link p-0 position-relative" type="button">
            <img src="/src/assets/Navbar/Bell.svg" alt="Notifications" width="25" height="25" />
            <span v-if="notificationCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ notificationCount }}
            </span>
          </button>

          <!-- Language Selector -->
          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button class="btn btn-link p-0" type="button">
                <img src="/src/assets/Navbar/Globe.svg" alt="Language" width="25" height="25" />
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
                <img src="/src/assets/Navbar/DropDown.svg" alt="Dropdown" width="16" height="16" />
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
                  <a class="dropdown-item " style="color: var(--color-danger);" href="#"
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
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n/index";
import { useAuthStore } from "@/stores/auth.js";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";
import SwitchUserModal from "@/components/shared/SwitchUserModal.vue";
import ConfirmationModal from "@/components/shared/ConfirmationModal.vue";

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
const isRTL = computed(() => locale.value === "ar");

const displayTitle = computed(() => {
  if (props.pageTitle) {
    return props.pageTitle;
  }
  return route.meta.titleKey ? t(route.meta.titleKey) : "Dashboard";
});

const notificationCount = ref(3);
const userAvatar = computed(() => {
  const image = authStore.user?.image;
  if (!image || image.includes("placeholder")) return null;
  return image;
});

const isSwitchUserModalOpen = ref(false);
const isLogoutModalOpen = ref(false);

const switchLanguage = async (lang) => {
  const langLower = lang.toLowerCase();

  // Map UI language codes to backend format
  const backendLang = langLower === 'ar' ? 'arabic' : 'english';

  try {
    // Update language in UI immediately
    setLocale(langLower);

    // Update user language in backend
    await authStore.updateUserLanguage(backendLang);
    console.log(`✅ Language switched to ${lang}`);
  } catch (error) {
    console.error("❌ Failed to update language preference:", error);
    // Language is still changed in UI even if API fails
  }
};

const handleProfile = (close) => {
  close();
  router.push({ name: "Profile" });
};

const handleSettings = (close) => {
  close();
  console.log("Navigate to settings");
  // router.push({ name: "Settings" });
};

const handleSwitchUser = (close) => {
  close();
  isSwitchUserModalOpen.value = true;
};

const closeSwitchUserModal = () => {
  isSwitchUserModalOpen.value = false;
};

const returnToAdmin = async () => {
  try {
    const success = await authStore.returnToAdmin();
    
    if (success) {
      console.log("✅ Returned to admin account");
      
      const defaultPage = authStore.user?.default_page || authStore.user?.landing_page || '/user';
      await router.push(defaultPage);
      
      window.location.reload();
    } else {
      console.error("❌ Failed to return to admin");
      alert("Failed to return to admin account");
    }
  } catch (error) {
    console.error("❌ Error returning to admin:", error);
    alert("Error returning to admin account");
  }
};

const handleLogout = (close) => {
  close();
  isLogoutModalOpen.value = true;
};

const confirmLogout = async () => {
  try {
    await authStore.logout();
    console.log("✅ Logout successful");
    router.push({ name: "Login" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    alert("Logout failed. Please try again.");
  }
};

const closeLogoutModal = () => {
  isLogoutModalOpen.value = false;
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
}

.btn-link:hover {
  color: var(--primary-color);
}

.btn-link:focus {
  box-shadow: none;
}

.dropdown-item:active,
.dropdown-item.active {
  background-color: var(--primary-color) !important;
  color: white !important;
}

.dropdown-item.text-danger:hover {
  background-color: #dc3545 !important;
  color: white !important;
}
</style>