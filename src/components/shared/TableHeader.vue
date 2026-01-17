<template>
  <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
    <!-- search and group filter components -->
    <div class="d-flex gap-2 flex-grow-1">
      <MainFilters :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
        :placeholder="searchPlaceholder" :data="data" :groupKey="groupKey" :groupModelValue="groupModelValue"
        @update:groupModelValue="$emit('update:groupModelValue', $event)" :groupLabel="groupLabel"
        :translationKey="translationKey" />

      <PrimaryButton :iconBefore="refreshIcon" @click="handleRefreshClick" />
    </div>
    <!-- columnSelector and Add Button -->
    <div class="d-flex gap-2">
      <ColumnSelector :columns="columns" :modelValue="visibleColumns"
        @update:modelValue="$emit('update:visibleColumns', $event)" />
      <PrimaryButton v-if="showAddButton"  bgColor="var(--color-success)"  :text="addButtonText" :iconBefore="addIcon" @click="handleAddClick" />
      <PrimaryButton v-if="showTrashedButton" bgColor="var(--color-danger)" :iconBefore="trashIcon"
        @click="handleTrashedClick" />
    </div>
  </div>
</template>

<script setup>
import ColumnSelector from "./ColumnSelector.vue";
import MainFilters from "../filters/composed/MainFilters.vue";
import PrimaryButton from "../shared/PrimaryButton.vue";
import trashIcon from "../../assets/table/recycle.svg";
import addIcon from "../../assets/table/add.svg";
import refreshIcon from "../../assets/table/refresh.svg?component"
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
  showAddButton: {
    type: Boolean,
    default: true,
  },
  addButtonText: {
    type: String,
    default: "Add New",
  },
  showTrashedButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:groupModelValue",
  "update:visibleColumns",
  "add-click",
  "trashed-click",
  "refresh-click",
]);

const handleAddClick = () => {
  console.log('Add button clicked in TableHeader');
  emit('add-click');
};

const handleRefreshClick = () => {
  emit('refresh-click');
};

const handleTrashedClick = () => {
  console.log('Trashed button clicked in TableHeader');
  emit('trashed-click');
};
</script>

<style scoped>
@media (max-width: 400px) {
  .mb-3 {
    gap: 0.75rem !important;
  }

  .d-flex.gap-2:last-child {
    width: 100%;
  }
}
</style>
