<template>
  <div>
    <!-- Desktop Table View -->
    <div class="table-responsive d-none d-md-block rounded-bottom">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th v-for="col in columns" :key="col.key" class="text-uppercase text-muted small fw-semibold py-3 px-3"
              @click="col.sortable ? handleSort(col.key) : null" :class="{ 'sortable-header': col.sortable }"
              style="font-size: 0.75rem; letter-spacing: 0.5px;">
              <div class="d-flex align-items-center gap-2">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="sort-icon opacity-50">
                  <img v-if="sortKey !== col.key" src="/assets/table/arrowsBothWays.svg" alt="Sort" width="18"
                    height="18" />
                  <img v-else-if="sortDirection === 'asc'" src="/assets/table/arrowUp.svg" alt="Sort ascending"
                    width="18" height="18" />
                  <img v-else src="/assets/table/arrowDown.svg" alt="Sort descending" width="18" height="18" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedData" :key="row.id" class="border-bottom">
            <td v-for="col in columns" :key="col.key" class="py-3 px-3">
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="d-md-none p-2">
      <div v-for="row in sortedData" :key="row.id" class="card mb-3 shadow-sm border">
        <div class="card-body p-3">
          <div v-for="(col, index) in columns" :key="col.key"
            class="d-flex justify-content-between align-items-center py-2"
            :class="{ 'border-bottom': index < columns.length - 1 }">
            <strong class="text-muted small text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">
              {{ col.label }}
            </strong>
            <span class="text-dark">{{ row[col.key] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { sortData } from "@/utils/dataHelpers";

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
.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background-color: #e9ecef !important;
}

.sortable-header:hover .sort-icon {
  opacity: 1 !important;
}

.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>