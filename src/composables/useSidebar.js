import { ref, computed } from "vue";

const isCollapsed = ref(false);
const isMobile = ref(false);

export function useSidebar() {
  const sidebarWidth = computed(() => {
    if (isMobile.value) return "0px";
    return isCollapsed.value
      ? "var(--sidebar-collapsed-width)"
      : "var(--sidebar-width)";
  });

  return {
    isCollapsed,
    isMobile,
    sidebarWidth,
  };
}
