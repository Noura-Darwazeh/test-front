<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-uppercase text-muted small fw-semibold"
            @click="col.sortable ? handleSort(col.key) : null"
            :class="{ 'sortable-header': col.sortable }"
          >
            <div class="d-flex align-items-center gap-2">
              <span>{{ col.label }}</span>
              <span v-if="col.sortable" class="sort-icon">
                <img
                  v-if="sortKey !== col.key"
                  src="/assets/table/arrowsBothWays.svg"
                  alt="Sort"
                  width="18"
                  height="18"
                />
                <img
                  v-else-if="sortDirection === 'asc'"
                  src="/assets/table/arrowUp.svg"
                  alt="Sort ascending"
                  width="18"
                  height="18"
                />
                <img
                  v-else
                  src="/assets/table/arrowDown.svg"
                  alt="Sort descending"
                  width="18"
                  height="18"
                />
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedData" :key="row.id">
          <td v-for="col in columns" :key="col.key">
            {{ row[col.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { sortData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";

const sortKey = ref("");
const sortDirection = ref("asc");

const props = defineProps({
  columns: Array,
  data: Array,
});

// ------------ Computed values -------------
const sortedData = computed(() => {
  return sortData(props.data, sortKey.value, sortDirection.value);
});

// ------------- Funcionalities ---------------

const handleSort = (columnKey) => {
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = columnKey;
    sortDirection.value = "asc";
  }
};
</script>
<style scoped>
.table-responsive {
  border-radius: 0 0 0.5rem 0.5rem;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  padding: 1rem 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.table tbody tr {
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody tr:last-child {
  border-bottom: none;
}
.sortable-header {
  cursor: pointer;
  user-select: none;
}
.sortable-header:hover {
  background-color: #e9ecef !important;
}

.sort-icon {
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.sortable-header:hover .sort-icon {
  opacity: 1;
}

.sortable-header .sort-icon svg {
  color: #6c757d;
}
</style>
