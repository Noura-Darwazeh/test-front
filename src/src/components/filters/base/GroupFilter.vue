<template>
  <div class="dropdown group-filter" ref="dropdownRef">
    <button @click="isOpen = !isOpen" class="btn dropdown-toggle d-flex align-items-center bg-white
" type="button">
      <!-- Chips container (when groups selected) -->
      <div v-if="selectedGroups.length > 0" class="chips-container d-flex flex-column gap-2 w-100">
        <span v-for="group in selectedGroups" :key="group"
          class="chip d-inline-flex align-items-center gap-2 bg-primary text-white px-2 py-1 rounded">
          {{ formatGroupLabel(group) }}
          <button @click.stop="removeGroup(group)" class="chip-remove" type="button">
            ×
          </button>
        </span>
      </div>

      <!-- Default label (when nothing selected) -->
      <span v-else>{{ displayLabel }}</span>
    </button>

    <!-- Dropdown menu -->
    <div class="dropdown-menu p-3 shadow border rounded-3 mt-2" :class="{ show: isOpen }" :style="menuStyles">
      <!-- Available groups (not selected) -->
      <div v-for="group in availableGroups" :key="group" class="dropdown-item py-2 d-flex align-items-center">
        <input type="checkbox" :id="`group-${group}`" :value="group" @change="addGroup(group)"
          class="form-check-input" />
        <label :for="`group-${group}`" class="form-check-label ms-2 user-select-none flex-fill">
          {{ formatGroupLabel(group) }}
        </label>
      </div>

      <!-- Empty state -->
      <div v-if="availableGroups.length === 0 && selectedGroups.length > 0" class="text-muted text-center py-2">
        All groups selected
      </div>
      <!-- Clear All button -->
      <button v-if="selectedGroups.length > 0" @click="clearAll" class="btn btn-sm btn-outline-danger w-100 mb-2"
        type="button">
        Clear All
      </button>
    </div>
  </div>
</template>
<script setup>
import PrimaryButton from "@/components/shared/PrimaryButton.vue";
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
// ---------------------- Props and Emits ----------------
const props = defineProps({
  data: Array,
  groupKey: String,
  modelValue: Array,
  label: String,
  translationKey: String,
});
const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

// ----------------------- Refs ---------------------
const dropdownRef = ref(null);
const isOpen = ref(false);
const selectedGroups = ref([]);
const menuStyles = ref({});

// ------------------------ Computed -------------------
const uniqueValues = computed(() => {
  if (!props.data || !props.groupKey) return [];

  const values = props.data.map((item) => item[props.groupKey]);

  const unique = [...new Set(values)];
  return unique.sort();
});

const availableGroups = computed(() => {
  return uniqueValues.value.filter(
    (group) => !selectedGroups.value.includes(group)
  );
});

const displayLabel = computed(() => {
  if (props.label) {
    return props.label;
  }
  const formatted =
    props.groupKey.charAt(0).toUpperCase() + props.groupKey.slice(1);
  return `Filter By ${formatted}`;
});

// --------------- Methods --------------------
const formatGroupLabel = (group) => {
  if (group === null || group === undefined) return "";
  if (typeof group === "object") {
    const name = group.name || group.label || group.value;
    return name ? String(name) : JSON.stringify(group);
  }
  if (props.translationKey) {
    const key = `${props.translationKey}.${group}`;
    const translated = t(key);
    if (translated !== key) return translated;
  }
  return String(group);
};

const addGroup = (group) => {
  selectedGroups.value.push(group);
};

const removeGroup = (group) => {
  selectedGroups.value = selectedGroups.value.filter((g) => g !== group);
};

const clearAll = () => {
  selectedGroups.value = [];
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const updateMenuPosition = () => {
  if (!dropdownRef.value) return;

  const rect = dropdownRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;
  const menuMinWidth = 220;

  // Calculate available space
  const spaceRight = viewportWidth - rect.left;
  const spaceLeft = rect.right;
  const spaceBelow = viewportHeight - rect.bottom;

  const styles = {};

  // Horizontal positioning
  if (spaceRight < menuMinWidth && spaceLeft > spaceRight) {
    // Not enough space on right, position to the left
    styles.right = "0";
    styles.left = "auto";
  } else {
    styles.left = "0";
    styles.right = "auto";
  }

  // On very small screens, make menu full width
  if (viewportWidth < 400) {
    styles.left = `${-rect.left + padding}px`;
    styles.right = "auto";
    styles.width = `${viewportWidth - padding * 2}px`;
    styles.minWidth = "auto";
  }

  // Vertical positioning - limit height if not enough space
  const maxHeight = Math.min(300, spaceBelow - padding * 2);
  if (maxHeight < 150) {
    // Position above if not enough space below
    styles.bottom = "100%";
    styles.top = "auto";
    styles.marginTop = "0";
    styles.marginBottom = "0.5rem";
  }

  styles.maxHeight = `${Math.max(150, maxHeight)}px`;
  styles.overflowY = "auto";

  menuStyles.value = styles;
};

// -------------------- LifeCycle --------------
onMounted(() => {
  if (props.modelValue && props.modelValue.length) {
    selectedGroups.value = [...props.modelValue];
  }

  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// -------------------- Watchers --------------------
watch(
  selectedGroups,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updateMenuPosition();
    });
  }
});
</script>
<style scoped>
.group-filter button {
  min-height: 42px;
  max-height: 42px;
}

.chips-container {
  max-height: 32px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.chip {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.chip-remove {
  background: none;
  border: none;
  color: white;
  font-size: 1.125rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.chip-remove:hover {
  opacity: 1;
}

.group-filter {
  position: relative;
  display: inline-flex;
}

.dropdown-menu {
  min-width: 220px;
  top: 100%;
  position: absolute;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .dropdown-menu {
    min-width: 180px;
  }
}
</style>
