<template>
  <div
    class="app-layout d-flex"
    :class="{ rtl: isRTL, 'sidebar-collapsed': isCollapsed }"
  >
    <Sidebar />
    <div class="layout-body flex-grow-1 d-flex flex-column">
      <Navbar />
      <main
        class="main-content flex-grow-1 bg-light"
        :class="{ 'p-4': !isMapPage }"
      >
        <slot></slot>
      </main>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useSidebar } from "@/composables/useSidebar";
import { useAuthStore } from "@/stores/auth.js";
import { useNotificationStore } from "@/stores/notificationStore.js";
import { requestFCMToken, onForegroundMessage } from "@/services/firebase.js";
import Navbar from "./Navbar.vue";
import Sidebar from "./Sidebar.vue";

const { locale } = useI18n();
const route = useRoute();
const isRTL = computed(() => locale.value === "ar");
const { isCollapsed } = useSidebar();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Check if current route is the map page
const isMapPage = computed(() => route.name === "Map");

onMounted(async () => {
  if (!authStore.isAuthenticated) return;

  // Delay slightly so router navigation + cancelAllRequests finishes first
  setTimeout(() => notificationStore.fetchNotifications(), 300);

  // Register FCM token and send to backend
  const token = await requestFCMToken();
  if (token) {
    await notificationStore.saveFCMToken(token);
  }

  // Listen for foreground messages (app is open)
  onForegroundMessage((payload) => {
    notificationStore.addForegroundNotification(payload);
  });
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  width: 100%;
}

.layout-body {
  overflow-x: hidden;
}

.main-content {
  background-color: #f8f9fa;
}
</style>
