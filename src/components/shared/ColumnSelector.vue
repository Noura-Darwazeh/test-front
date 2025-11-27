<template>
  <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'" :class="{ rtl: isRTL }">
    <template #trigger>
      <button
        class="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm"
        type="button"
      >
        <img
          src="/src/assets/SelectorLines.svg"
          alt="Columns"
          width="16"
          height="16"
        />
        {{ $t("user.columns") }}
        <img
          src="/src/assets/dropdown.svg"
          alt="Dropdown"
          width="12"
          height="12"
        />
      </button>
    </template>
    <template #menu>
      <div class="p-2" style="min-width: 200px" :dir="isRTL ? 'rtl' : 'ltr'">
        <div
          class="fw-semibold py-1 text-muted small"
          :class="{ 'text-end': isRTL }"
        >
          {{ $t("filters.manageColumns") }}
        </div>
        <div class="form-check py-1" :class="{ 'text-end': isRTL }">
          <input
            type="checkbox"
            id="selectAll"
            class="form-check-input"
            :class="{ 'float-end': isRTL, 'ms-2': isRTL }"
            :checked="allSelected"
            @change="toggleAll"
          />
          <label for="selectAll" class="form-check-label">
            {{ $t("filters.selectAll") }}
          </label>
        </div>
        <hr class="dropdown-divider my-1" />
        <div
          v-for="col in columns"
          :key="col.key"
          class="form-check py-1"
          :class="{ 'text-end': isRTL }"
        >
          <input
            type="checkbox"
            v-model="visibleKeys"
            v-bind:value="col.key"
            :id="col.key"
            class="form-check-input"
            :class="{ 'float-end': isRTL, 'ms-2': isRTL }"
          />
          <label :for="col.key" class="form-check-label">
            {{ col.label }}
          </label>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

const props = defineProps({
  columns: Array,
  modelValue: Array,
});

const emit = defineEmits(["update:modelValue"]);

const visibleKeys = ref([]);

const allSelected = computed(() => {
  return visibleKeys.value.length === props.columns.length;
});

const toggleAll = () => {
  if (allSelected.value) {
    visibleKeys.value = [];
  } else {
    visibleKeys.value = props.columns.map((col) => col.key);
  }
};

onMounted(() => {
  if (props.modelValue && props.modelValue.length) {
    visibleKeys.value = props.modelValue;
  } else {
    visibleKeys.value = props.columns.map((col) => col.key);
  }
});

watch(visibleKeys, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>
<style>
.btn-outline-secondary :hover{
  color: #6c757d !important
}

</style>