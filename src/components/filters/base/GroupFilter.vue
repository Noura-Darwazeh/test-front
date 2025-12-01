<template>
  <BaseDropdown menuPosition="end" :class="{ rtl: isRTL }">
    <template #trigger>
      <button class="btn btn-outline-secondary shadow-sm d-flex align-items-center gap-2" type="button"
        style="white-space: nowrap">
        <span v-if="selectedGroups.length > 0">
          {{ displayLabel }} ({{ selectedGroups.length }})
        </span>
        <span v-else>{{ displayLabel }}</span>
        <img src="/src/assets/dropdown.svg" alt="Dropdown" width="12" height="12" />
      </button>
    </template>

    <template #menu>
      <div class="p-2" style="min-width: 200px" :dir="isRTL ? 'rtl' : 'ltr'">
        <div v-for="group in availableGroups" :key="group" class="form-check" :class="{ 'text-end': isRTL }">
          <input type="checkbox" :id="`group-${group}`" :value="group" @change="addGroup(group)"
            class="form-check-input" :class="{ 'float-end': isRTL, 'ms-2': isRTL }" />
          <label :for="`group-${group}`" class="form-check-label">
            {{ translateGroupValue(group) }}
          </label>
        </div>

        <div v-if="availableGroups.length === 0 && selectedGroups.length > 0" class="text-muted text-center py-2 small">
          {{ $t("filters.allGroupsSelected") }}
        </div>

        <button v-if="selectedGroups.length > 0" @click="clearAll" class="btn btn-sm btn-link text-danger w-100 mt-2"
          type="button">
          {{ $t("filters.clearAll") }}
        </button>
      </div>
    </template>
  </BaseDropdown>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";

const { locale, t } = useI18n();
const isRTL = computed(() => locale.value === "ar");

const props = defineProps({
  data: Array,
  groupKey: String,
  modelValue: Array,
  label: String,
  translationKey: String, // مفتاح الترجمة (مثل "roles" أو "statuses")
});
const emit = defineEmits(["update:modelValue"]);

const selectedGroups = ref([]);

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
  return `${t("filters.filterBy")} ${formatted}`;
});

// دالة لترجمة قيم المنيو
const translateGroupValue = (value) => {
  if (!props.translationKey) return value;
  
  // محاولة الحصول على الترجمة
  const translationPath = `${props.translationKey}.${value}`;
  const translated = t(translationPath);
  
  // إذا لم تكن هناك ترجمة، نرجع القيمة الأصلية
  return translated === translationPath ? value : translated;
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

onMounted(() => {
  if (props.modelValue && props.modelValue.length) {
    selectedGroups.value = [...props.modelValue];
  }
});

watch(
  selectedGroups,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);
</script>

<style>
.btn-outline-secondary {
  background-color: white !important;
  border: 1px solid var(--border-color) !important;
}

.btn-outline-secondary:hover {
  background-color: white !important;
  color: inherit !important;
  border-color: var(--border-color) !important;
  box-shadow: none !important;
}
</style>