<template>
  <div class="dropdown column-selector" ref="dropdownRef">
    <button
      v-on:click="isOpen = !isOpen"
      class="btn btn-outline-secondary dropdown-toggle"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="me-2"
        viewBox="0 0 16 16"
      >
        <path
          d="M1.5 2.5A.5.5 0 0 1 2 2h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-2zm0 5A.5.5 0 0 1 2 7h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-2zm0 5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-2z"
        />
      </svg>
      Columns
    </button>
    <div class="dropdown-menu dropdown-menu-end dropdown-menu-sm-start p-3" :class="{ show: isOpen }">
      <div class="dropdown-header">Manage Columns</div>
      <div class="dropdown-item py-2 pt-2">
        <input
          type="checkbox"
          id="selectAll"
          class="form-check-input"
          :checked="allSelected"
          @change="toggleAll"
        />
        <label for="selectAll" class="form-check-label ms-2 fw-semibold">
          Select All
        </label>
      </div>
      <div class="dropdown-divider"></div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="dropdown-item py-2 pt-2"
      >
        <input
          type="checkbox"
          v-model="visibleKeys"
          v-bind:value="col.key"
          :id="col.key"
          class="form-check-input"
        />
        <label :for="col.key" class="form-check-label ms-2 user-select-none">
          {{ col.label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

// ==================== PROPS & EMITS ====================
const props = defineProps({
  columns: Array,
  modelValue: Array,
});

const emit = defineEmits(["update:modelValue"]);

// ==================== REFS ====================
const dropdownRef = ref(null);
const isOpen = ref(false);
const visibleKeys = ref([]);

// ==================== COMPUTED ====================
const allSelected = computed(() => {
  return visibleKeys.value.length === props.columns.length;
});

// ==================== METHODS ====================
const toggleAll = () => {
  if (allSelected.value) {
    visibleKeys.value = [];
  } else {
    visibleKeys.value = props.columns.map((col) => col.key);
  }
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// ==================== LIFECYCLE ====================
onMounted(() => {
  if (props.modelValue && props.modelValue.length) {
    visibleKeys.value = props.modelValue;
  } else {
    visibleKeys.value = props.columns.map((col) => col.key);
  }
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// ==================== WATCHERS ====================
watch(visibleKeys, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>

<style scoped>
.column-selector button {
  height: 42px;
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.dropdown-menu {
  min-width: 220px;
  max-width: 90vw;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  right: 0;
  left: auto;
}

@media (max-width: 576px) {
  .dropdown-menu {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}

.dropdown-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.dropdown-item {
  cursor: pointer;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item label {
  cursor: pointer;
  margin-bottom: 0;
}
</style>
