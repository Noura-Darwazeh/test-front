<template>
  <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
    <!-- search and group filter components -->
    <div class="d-flex gap-2 flex-grow-1">
      <MainFilters
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :placeholder="searchPlaceholder"
        :data="data"
        :groupKey="groupKey"
        :groupModelValue="groupModelValue"
        @update:groupModelValue="$emit('update:groupModelValue', $event)"
        :groupLabel="groupLabel"
        :translationKey="translationKey"
      />
    </div>
    <!-- columnSelector component -->
    <div class="d-flex gap-2">
      <ColumnSelector
        :columns="columns"
        :modelValue="visibleColumns"
        @update:modelValue="$emit('update:visibleColumns', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import ColumnSelector from "./ColumnSelector.vue";
import MainFilters from "../filters/composed/MainFilters.vue";

defineProps({
  modelValue: String, 
  searchPlaceholder: String,
  data: Array,
  groupKey: String,
  groupModelValue: Array, 
  groupLabel: String,
  translationKey: String,
  columns: Array, 
  visibleColumns: Array, 
});

defineEmits([
  "update:modelValue",
  "update:groupModelValue",
  "update:visibleColumns",
]);
</script>

<style scoped>
@media (max-width: 400px) {
  .mb-3 {
    gap: 0.75rem !important;
  }
}
</style>