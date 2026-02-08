<template>
  <div class="btn-group time-period-filter shadow-sm" role="group">
    <button
      v-for="option in resolvedOptions"
      :key="option.value"
      type="button"
      class="btn btn-sm"
      :class="modelValue === option.value ? 'btn-primary' : 'btn-light'"
      @click="emit('update:modelValue', option.value)"
    >
      <i v-if="option.icon" :class="option.icon + ' me-2'"></i>{{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "all",
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const resolvedOptions = computed(() => {
  if (props.options && props.options.length) return props.options;
  return [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];
});
</script>

<style scoped>
.time-period-filter {
  border-radius: 8px;
  overflow: hidden;
}

.time-period-filter .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.time-period-filter .btn-light {
  background-color: #ffffff;
  color: #6c757d;
}

.time-period-filter .btn-light:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateY(-1px);
}

.time-period-filter .btn-primary {
  background-color: #0d6efd;
  color: white;
}
</style>
