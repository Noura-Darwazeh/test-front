<template>
  <div :class="{ rtl: isRTL }">
    <!-- Desktop Table View -->
    <div class="table-responsive d-none d-md-block border">
      <table
        class="table table-hover align-middle"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <thead class="table-light">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="showCheckbox" class="text-center">
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
              />
            </th>

            <th
              v-for="col in columns"
              :key="col.key"
              @click="col.sortable ? handleSort(col.key) : null"
              :class="{
                'sortable-header': col.sortable,
                'user-select-none': col.sortable,
              }"
              class="text-muted fw-normal small text-uppercase"
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

            <!-- Actions Column Header -->
            <th
              v-if="hasActionsSlot"
              class="text-center text-muted fw-normal small text-uppercase"
            >
              {{ actionsLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedData" :key="row.id">
            <!-- Checkbox for each row -->
            <td v-if="showCheckbox" class="text-center">
              <input type="checkbox" :value="row.id" v-model="selectedRows" />
            </td>

            <td v-for="col in columns" :key="col.key" class="text-dark">
              <StatusBadge
                v-if="col.component === 'StatusBadge'"
                :status="row[col.key]"
                v-bind="col.componentProps || {}"
              />
              <span v-else>{{ row[col.key] }}</span>
            </td>

            <!-- Actions Slot -->
            <td v-if="hasActionsSlot" class="text-center">
              <slot name="actions" :row="row"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards View -->
    <div class="d-md-none bg-light">
      <div
        v-for="row in sortedData"
        :key="row.id"
        class="card mb-3 border shadow-sm"
      >
        <div class="card-body p-3">
          <!-- Mobile Checkbox -->
          <div v-if="showCheckbox" class="mb-2">
            <input type="checkbox" :value="row.id" v-model="selectedRows" />
          </div>

          <div
            v-for="col in columns"
            :key="col.key"
            class="row mb-2 pb-2 border-bottom"
            :class="{
              'border-0 mb-0 pb-0':
                col === columns[columns.length - 1] && !hasActionsSlot,
            }"
          >
            <div class="col-5 pe-2" :class="{ 'text-end': isRTL }">
              <small class="text-muted fw-semibold text-uppercase d-block">
                {{ col.label }}
              </small>
            </div>
            <div class="col-7 ps-2" :class="{ 'text-start': isRTL }">
              <StatusBadge
                v-if="col.component === 'StatusBadge'"
                :status="row[col.key]"
                v-bind="col.componentProps || {}"
              />
              <span v-else class="text-dark fw-medium d-block">
                {{ row[col.key] }}
              </span>
            </div>
          </div>

          <!-- Mobile Actions Slot -->
          <div v-if="hasActionsSlot" class="mt-3 text-center">
            <slot name="actions" :row="row"></slot>
          </div>
        </div>
      </div>

      <!-- No Data Message for Mobile -->
      <div v-if="sortedData.length === 0" class="text-center text-muted py-5">
        <p class="mb-0">No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from "vue";
import { sortData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import StatusBadge from "./StatusBadge.vue";

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");
const slots = useSlots();

const sortKey = ref("");
const sortDirection = ref("asc");

const selectedRows = ref([]);
const selectAll = ref(false);

const props = defineProps({
  columns: Array,
  data: Array,
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  actionsLabel: {
    type: String,
    default: "Actions",
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const hasActionsSlot = computed(() => !!slots.actions);

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

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = sortedData.value.map((row) => row.id);
  } else {
    selectedRows.value = [];
  }
};

watch(selectedRows, (newVal) => {
  selectAll.value = newVal.length === sortedData.value.length && newVal.length > 0;
  emit('update:modelValue', newVal);
});

// Watch for data changes and clear selection if needed
watch(() => props.data, () => {
  selectedRows.value = [];
  selectAll.value = false;
});
</script>

<style scoped>
.sortable-header {
  cursor: pointer;
}

.table-responsive table,
.table-responsive td {
  margin: 0 !important;
}

.card:last-child {
  margin-bottom: 0 !important;
}
</style>
