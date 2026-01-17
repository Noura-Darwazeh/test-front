<template>
  <TableHeader
    v-model="searchText"
    :searchPlaceholder="searchPlaceholder"
    :data="data"
    :columns="columns"
    v-model:visibleColumns="visibleColumns"
    :showAddButton="showAddButton"
    :addButtonText="addButtonText"
    :showTrashedButton="showTrashedButton"
    @add-click="$emit('add-click')"
    @trashed-click="$emit('trashed-click')"
    @refresh-click="$emit('refresh-click')"
  />
</template>

<script setup>
import TableHeader from "@/components/shared/TableHeader.vue";

// Props
defineProps({
  searchPlaceholder: String,
  data: Array,
  columns: Array,
  visibleColumns: Array,
  showAddButton: Boolean,
  addButtonText: String,
  showTrashedButton: Boolean,
});

// Model
const searchText = defineModel();
const visibleColumns = defineModel("visibleColumns");

// Emits
defineEmits(["add-click", "trashed-click", "refresh-click"]);
</script>
