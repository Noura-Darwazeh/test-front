<template>
  <div class="user-page-container">
    <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div class="d-flex gap-2 flex-grow-1">
        <MainFilters 
          v-model="searchText" 
          :placeholder="searchPlaceholder" 
          :data="data" 
          :groupKey="groupKey"
          v-model:groupModelValue="selectedGroups" 
          :groupLabel="groupLabel" 
        />
      </div>
      <div class="d-flex gap-2">
        <ColumnSelector :columns="columns" v-model="visibleColumns" />
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <DataTable :columns="filteredColumns" :data="paginatedData" />
        <div class="px-3 pb-3">
          <Pagination 
            :totalItems="filteredData.length" 
            :itemsPerPage="itemsPerPage" 
            :currentPage="currentPage"
            @update:currentPage="currentPage = $event" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../../components/shared/DataTable.vue";
import ColumnSelector from "../../../../components/shared/ColumnSelector.vue";
import MainFilters from "../../../../components/filters/composed/MainFilters.vue";
import Pagination from "../../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";

// =============== Props ===============
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  searchPlaceholder: {
    type: String,
    default: "Search..."
  },
  groupKey: {
    type: String,
    default: null
  },
  groupLabel: {
    type: String,
    default: null
  },
  defaultItemsPerPage: {
    type: Number,
    default: 25
  }
});

// =============== State ===============
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(props.defaultItemsPerPage);
const visibleColumns = ref(props.columns.map(col => col.key)); // Initialize with all columns

// =============== Computed ===============
const filteredColumns = computed(() => {
  return props.columns.filter((col) => visibleColumns.value.includes(col.key));
});

const filteredData = computed(() => {
  let result = props.data;

  // Apply group filtering first
  if (props.groupKey && selectedGroups.value.length > 0) {
    result = filterByGroups(result, selectedGroups.value, props.groupKey);
  }

  // Then apply search filtering
  if (searchText.value) {
    result = filterData(result, searchText.value);
  }

  return result;
});

const paginatedData = computed(() => {
  return paginateData(
    filteredData.value,
    currentPage.value,
    itemsPerPage.value
  );
});

// =============== Watchers ===============
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>