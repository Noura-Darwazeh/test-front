<template>
  <div class="table-responsive" :class="{ rtl: isRTL }">
    <table class="table table-hover align-middle" :dir="isRTL ? 'rtl' : 'ltr'">
      <thead class="table-light">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="col.sortable ? handleSort(col.key) : null"
            :class="{
              'sortable-header': col.sortable,
              'user-select-none': col.sortable,
            }"
            class="text-muted fw-normal small"
          >
            <div class="d-flex align-items-center gap-2">
              <span>{{ col.label }}</span>
              <span v-if="col.sortable" class="sort-icon">
                <img
                  v-if="sortKey !== col.key"
                  src="/src/assets/table/arrowsBothWays.svg"
                  alt="Sort"
                  width="14"
                  height="14"
                />
                <img
                  v-else-if="sortDirection === 'asc'"
                  src="/src/assets/table/arrowUp.svg"
                  alt="Sort ascending"
                  width="14"
                  height="14"
                />
                <img
                  v-else
                  src="/src/assets/table/arrowDown.svg"
                  alt="Sort descending"
                  width="14"
                  height="14"
                />
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in sortedData" :key="row.id">
          <td v-for="col in columns" :key="col.key" class="text-dark">
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

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

const sortKey = ref("");
const sortDirection = ref("asc");

const props = defineProps({
  columns: Array,
  data: Array,
});

const sortedData = computed(() => {
  return sortData(props.data, sortKey.value, sortDirection.value);
});

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
}

.sortable-header:hover {
  background-color: #e9ecef;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
