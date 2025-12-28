<template>
  <nav class="navbar navbar-light bg-white border-bottom p-2" :class="{ rtl: isRTL }">
    <div class="container-fluid px-3 py-2">
      <div class="d-flex align-items-center justify-content-between w-100">
        <h4 class="mb-0 fw-semibold text-dark">
          {{ displayTitle }}
        </h4>

        <div class="d-flex align-items-center gap-3">
          <!-- Notifications Button -->
          <button class="btn btn-link p-0 position-relative" type="button">
            <img src="/src/assets/Navbar/Bell.svg" alt="Notifications" width="25" height="25" />
            <span v-if="notificationCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {{ notificationCount }}
            </span>
          </button>

          <!-- Currency Selector -->
          <CurrencySelector :position="isRTL ? 'start' : 'end'" @currencyChanged="handleCurrencyChange" />

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
                <img :src="userAvatar" alt="User profile picture" class="rounded-circle" width="36" height="36" />
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

                <!-- Switch User (Only for SuperAdmin) -->
                <li v-if="authStore.hasRole('SuperAdmin')">
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
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n/index";
import { useAuthStore } from "@/stores/auth.js";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";
import CurrencySelector from "@/components/shared/CurrencySelector.vue";

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
const userAvatar = ref("https://via.placeholder.com/36");

const switchLanguage = (lang) => {
  setLocale(lang.toLowerCase());
};

const handleProfile = (close) => {
  close();
  console.log("Navigate to profile");
  // router.push({ name: "Profile" });
};

const handleSettings = (close) => {
  close();
  console.log("Navigate to settings");
  // router.push({ name: "Settings" });
};

const handleSwitchUser = (close) => {
  close();
  console.log("Switch user");
  // Implement switch user functionality
};

const handleLogout = async (close) => {
  close();

  // Confirm logout
  if (confirm(t("navbar.confirmLogout") || "Are you sure you want to logout?")) {
    try {
      await authStore.logout();
      console.log(" Logout successful");

      // Redirect to login
      router.push({ name: "Login" });
    } catch (error) {
      console.error(" Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  }
};

const handleCurrencyChange = (currency) => {
  console.log("Currency changed to:", currency);
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