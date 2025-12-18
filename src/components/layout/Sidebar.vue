<template>
  <!-- Overlay for mobile -->
  <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="closeMobileMenu"></div>

  <!-- Mobile menu toggle button (positioned on left edge) -->
  <button v-if="isMobile && !isMobileMenuOpen" @click="toggleSidebar"
    class="btn btn-sm btn-light mobile-toggle-btn shadow-sm" :class="{ rtl: isRTL }" type="button">
    <img src="/src/assets/SelectorLines.svg" alt="Menu" width="16" height="16" />
  </button>

  <aside class="sidebar bg-white border-end" :class="{
    collapsed: isCollapsed,
    'mobile-open': isMobileMenuOpen,
    rtl: isRTL,
  }">
    <div class="sidebar-header p-3  d-flex align-items-center justify-content-between">
      <div class="logo-container">
        <h4 v-if="!isCollapsed" class="logo-text mb-0 fw-bold text-primary">
          {{ $t("sidebar.logoText") }}
        </h4>
      </div>

      <button @click="toggleSidebar" class="btn btn-sm btn-light toggle-btn" type="button">
        <img src="/src/assets/SelectorLines.svg" alt="Toggle" width="16" height="16" />
      </button>
    </div>

    <nav class="sidebar-nav p-2">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
        class="nav-item d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded text-decoration-none position-relative"
        :class="{ active: isActive(item.path) }">
        <img v-if="item.icon" :src="item.icon" :alt="item.label" width="25" height="25" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-text">{{ item.label }}</span>

        <!-- Tooltip for collapsed state -->
        <span v-if="isCollapsed" class="nav-tooltip">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useSidebar } from "@/composables/useSidebar";

const { isCollapsed, isMobile } = useSidebar();
const isMobileMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const isRTL = computed(() => locale.value === "ar");

const menuItems = computed(() => {
  return router
    .getRoutes()
    .filter((r) => r.meta?.showInSidebar)
    .map((r) => ({
      path: r.path,
      label: r.meta.titleKey ? t(r.meta.titleKey) : "Dashboard",
      icon: r.meta.icon,
    }));
});

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const isActive = (path) => {
  return route.path === path;
};

const handleResize = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 770;

  if (isMobile.value && !wasMobile) {
    isCollapsed.value = false;
    isMobileMenuOpen.value = false;
  } else if (!isMobile.value && wasMobile) {
    isMobileMenuOpen.value = false;
    isCollapsed.value = false;
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.sidebar {
  width: 250px;
  min-height: 100vh;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-toggle-btn {
  position: fixed;
  top: 3rem;
  left: -1rem;
  z-index: 998;
}

.mobile-toggle-btn.rtl {
  left: auto;
  right: -1rem;
}

.nav-item {
  color: #6c757d;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: #f8f9fa;
  color: var(--primary-color);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-item.active .nav-icon {
  filter: brightness(0) invert(1);
}

@media (max-width: 770px) {
  .sidebar {
    position: fixed;
    left: -250px;
    transition: left 0.3s ease, right 0.3s ease;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .sidebar.rtl {
    left: auto;
    right: -250px;
  }

  .sidebar.rtl.mobile-open {
    right: 0;
    left: auto;
  }

  .text-primary {
    color: var(--primary-color) !important;
  }


}




.nav-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-secondary);
  color: var(--sidebar-bg);
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 100;
}

.sidebar.collapsed .nav-item:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
}

.sidebar.collapsed.rtl .nav-item:hover .nav-tooltip {
  left: auto;
  right: 100%;
}
</style>
