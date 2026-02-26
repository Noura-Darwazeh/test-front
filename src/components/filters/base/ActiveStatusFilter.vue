<template>
  <div class="btn-group active-status-filter shadow-sm" role="group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="btn btn-sm"
      :class="modelValue === option.value ? 'btn-primary' : 'btn-light'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

const options = computed(() => [
  { value: "", label: t("common.all") },
  { value: 1, label: t("common.active") },
  { value: 0, label: t("common.inactive") },
]);
</script>

<style scoped>
.active-status-filter {
  border-radius: 8px;
  overflow: hidden;
}

.active-status-filter .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.active-status-filter .btn-light {
  background-color: #ffffff;
  color: #6c757d;
}

.active-status-filter .btn-light:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateY(-1px);
}

.active-status-filter .btn-primary {
  background-color: #0d6efd;
  color: white;
}
</style>
