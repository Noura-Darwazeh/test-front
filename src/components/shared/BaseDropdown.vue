<template>
  <div
    class="dropdown position-relative"
    ref="dropdownRef"
    :class="dropdownClass"
  >
    <!-- Trigger button slot -->
    <div ref="triggerRef" @click="toggle">
      <slot name="trigger" :isOpen="isOpen"></slot>
    </div>

    <!-- Dropdown menu -->
    <Teleport to="body">
      <div
        v-show="isOpen"
        ref="menuRef"
        class="dropdown-menu shadow-sm"
        :class="[
          { show: isOpen },
          menuPosition === 'start' ? 'dropdown-menu-start' : 'dropdown-menu-end',
          menuClass,
        ]"
        :dir="isRTL ? 'rtl' : 'ltr'"
        :style="menuStyles"
      >
        <slot name="menu" :close="close"></slot>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";

// -------------------- Props ----------------------
const props = defineProps({
  menuPosition: {
    type: String,
    default: "end", // 'start' or 'end'
    validator: (value) => ["start", "end"].includes(value),
  },
  dropdownClass: {
    type: String,
    default: "",
  },
  menuClass: {
    type: String,
    default: "",
  },
});

// ------------------------ Emits -----------------------
const emit = defineEmits(["open", "close", "toggle"]);

// ---------------- State -------------------
const dropdownRef = ref(null);
const triggerRef = ref(null);
const menuRef = ref(null);
const isOpen = ref(false);
const menuStyles = ref({});

// RTL detection
const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

// -------------------- Methods --------------------
const toggle = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
  if (isOpen.value) {
    emit("open");
    nextTick(() => {
      updateMenuPosition();
    });
  } else {
    emit("close");
  }
};

const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
    emit("close");
  }
};

const open = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    emit("open");
    nextTick(() => {
      updateMenuPosition();
    });
  }
};

const handleClickOutside = (event) => {
  const isInsideTrigger = dropdownRef.value?.contains(event.target);
  const isInsideMenu = menuRef.value?.contains(event.target);
  if (!isInsideTrigger && !isInsideMenu) {
    close();
  }
};

const updateMenuPosition = () => {
  if (!triggerRef.value || !menuRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const menuRect = menuRef.value.getBoundingClientRect();
  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate menu width - ensure it doesn't exceed viewport on mobile
  const maxMenuWidth = viewportWidth - (padding * 2);
  const menuWidth = Math.min(menuRect.width, maxMenuWidth);

  // Determine horizontal position
  let left;
  if (props.menuPosition === "start") {
    left = triggerRect.left;
  } else {
    left = triggerRect.right - menuWidth;
  }

  // Ensure horizontal bounds - clamp to viewport
  left = Math.max(padding, Math.min(left, viewportWidth - menuWidth - padding));

  // Determine vertical position
  let top;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const menuHeight = menuRect.height;

  // Check if there's enough space below
  if (spaceBelow >= menuHeight + padding) {
    // Position below the trigger
    top = triggerRect.bottom + 2;
  } else if (spaceAbove >= menuHeight + padding) {
    // Position above the trigger
    top = triggerRect.top - menuHeight - 2;
  } else {
    // Not enough space above or below - position where there's more space
    if (spaceBelow > spaceAbove) {
      top = triggerRect.bottom + 2;
    } else {
      top = Math.max(padding, triggerRect.top - menuHeight - 2);
    }
  }

  // Final vertical bounds check
  top = Math.max(padding, Math.min(top, viewportHeight - menuHeight - padding));

  menuStyles.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 2000,
    maxWidth: `${maxMenuWidth}px`,
    maxHeight: `${viewportHeight - padding * 2}px`,
    overflowY: "auto",
  };
};

const handleWindowChange = () => {
  if (isOpen.value) {
    updateMenuPosition();
  }
};

// ------------------ LifeCycle --------------------
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleWindowChange);
  window.addEventListener("scroll", handleWindowChange, true);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleWindowChange);
  window.removeEventListener("scroll", handleWindowChange, true);
});

// Expose methods for parent components
defineExpose({
  close,
  open,
  toggle,
  isOpen,
});
</script>

<style>
.dropdown-menu {
  position: fixed;
  z-index: 2000;
  display: none;
  min-width: 10rem;
  margin: 0.125rem 0 0;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

.dropdown-menu-start {
  left: 0;
  right: auto;
}

.dropdown-menu[dir="rtl"] {
  text-align: right;
}

.dropdown-menu[dir="rtl"] .dropdown-item {
  text-align: right;
}

.dropdown-menu[dir="rtl"] ul,
.dropdown-menu[dir="rtl"] .list-unstyled {
  padding-right: 0;
  padding-left: 0;
}
</style>
