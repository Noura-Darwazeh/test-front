<template>
  <div
    class="dropdown position-relative"
    ref="dropdownRef"
    :class="dropdownClass"
  >
    <!-- Trigger button slot -->
    <div @click="toggle">
      <slot name="trigger" :isOpen="isOpen"></slot>
    </div>

    <!-- Dropdown menu -->
    <div
      class="dropdown-menu shadow-sm"
      :class="[
        { show: isOpen },
        menuPosition === 'start' ? 'dropdown-menu-start' : 'dropdown-menu-end',
        menuClass,
      ]"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <slot name="menu" :close="close"></slot>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
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
const isOpen = ref(false);

// RTL detection
const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

// -------------------- Methods --------------------
const toggle = () => {
  isOpen.value = !isOpen.value;
  emit("toggle", isOpen.value);
  if (isOpen.value) {
    emit("open");
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
  }
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    close();
  }
};

// ------------------ LifeCycle --------------------
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
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
  position: absolute;
  top: 100%;
  z-index: 1000;
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
