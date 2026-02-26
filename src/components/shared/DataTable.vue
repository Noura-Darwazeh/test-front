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
            <!-- Expand Column Header -->
            <th v-if="hasExpandSlot" class="expand-col"></th>

            <!-- Checkbox Column -->
            <th v-if="showCheckbox" class="text-center">
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
                :disabled="allRowsDisabled"
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
                    :src="arrowsBothWaysIcon"
                    alt="Sort"
                    width="14"
                    height="14"
                  />
                  <img
                    v-else-if="sortDirection === 'asc'"
                    :src="arrowUpIcon"
                    alt="Sort ascending"
                    width="14"
                    height="14"
                  />
                  <img
                    v-else
                    :src="arrowDownIcon"
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
              {{ actionsLabelText }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, rowIndex) in sortedData" :key="row.id">
            <tr
              :class="[
                { 'expanded-row': isExpanded(row.id), 'expandable-row': isRowExpandable(row) },
                rowClass ? rowClass(row) : ''
              ]"
              @click="isRowExpandable(row) && toggleExpand(row.id)"
            >
              <!-- Expand Toggle -->
              <td v-if="hasExpandSlot" class="expand-col text-center">
                <button
                  v-if="isRowExpandable(row)"
                  type="button"
                  class="btn btn-sm btn-link expand-toggle p-0"
                  @click.stop="toggleExpand(row.id)"
                >
                  <i :class="isExpanded(row.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                </button>
              </td>

              <!-- Checkbox for each row - Hide if disabled -->
              <td v-if="showCheckbox" class="text-center">
                <input 
                  v-if="!isRowDisabled(row)"
                  type="checkbox" 
                  :value="row.id" 
                  v-model="selectedRows" 
                />
                <span v-else class="text-muted">—</span>
              </td>

             <td v-for="col in columns" :key="col.key" class="text-dark">
  <!-- Custom Slot for Column -->
  <slot 
    v-if="$slots[`cell-${col.key}`]" 
    :name="`cell-${col.key}`" 
    :row="row"
  ></slot>
  
  <!-- StatusBadge Component -->
  <StatusBadge
    v-else-if="col.component === 'StatusBadge'"
    :status="row[col.key]"
    v-bind="col.componentProps || {}"
  />
  
  <!-- Default Text -->
  <span v-else>
    {{
      col.key === "__index" || col.isIndex
        ? rowIndex + 1
        : col.formatter
          ? col.formatter(row[col.key], row, rowIndex)
          : row[col.key]
    }}
  </span>
</td>

              <!-- Actions Slot -->
              <td v-if="hasActionsSlot" class="text-center" @click.stop>
                <slot name="actions" :row="row" :toggleExpand="() => toggleExpand(row.id)" :isExpanded="isExpanded(row.id)"></slot>
              </td>
            </tr>

            <!-- Expanded Content Row -->
            <tr v-if="hasExpandSlot && isExpanded(row.id)" class="expand-content-row">
              <td :colspan="totalColumns" class="p-0">
                <div class="expand-content">
                  <slot name="expand" :row="row"></slot>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards View -->
    <div class="d-md-none bg-light">
      <div
        v-for="(row, rowIndex) in sortedData"
        :key="row.id"
        class="card mb-3 border shadow-sm"
        :class="[
          { 'expandable-card': isRowExpandable(row) },
          rowClass ? rowClass(row) : ''
        ]"
        @click="isRowExpandable(row) && toggleExpand(row.id)"
      >
        <div class="card-body p-3">
          <!-- Mobile Expand Toggle and Checkbox -->
          <div class="d-flex align-items-center justify-content-between mb-2" @click.stop>
            <div v-if="showCheckbox">
              <input 
                v-if="!isRowDisabled(row)"
                type="checkbox" 
                :value="row.id" 
                v-model="selectedRows" 
              />
              <span v-else class="text-muted small">—</span>
            </div>
            <button
              v-if="hasExpandSlot && isRowExpandable(row)"
              type="button"
              class="btn btn-sm btn-outline-secondary expand-toggle-mobile"
              @click="toggleExpand(row.id)"
            >
              <i :class="isExpanded(row.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="me-1"></i>
              {{ isExpanded(row.id) ? t('common.collapse') : t('common.expand') }}
            </button>
          </div>

          <div
            v-for="col in columns"
            :key="col.key"
            class="row mb-2 pb-2 border-bottom"
            :class="{
              'border-0 mb-0 pb-0':
                col === columns[columns.length - 1] && !hasActionsSlot && !hasExpandSlot,
            }"
          >
            <div class="col-5 pe-2" :class="{ 'text-end': isRTL }">
              <small class="text-muted fw-semibold text-uppercase d-block">
                {{ col.label }}
              </small>
            </div>
            <div class="col-7 ps-2" :class="{ 'text-start': isRTL }">
  <!-- Custom Slot for Column -->
  <slot 
    v-if="$slots[`cell-${col.key}`]" 
    :name="`cell-${col.key}`" 
    :row="row"
  ></slot>
  
  <!-- StatusBadge Component -->
  <StatusBadge
    v-else-if="col.component === 'StatusBadge'"
    :status="row[col.key]"
    v-bind="col.componentProps || {}"
  />
  
  <!-- Default Text -->
  <span v-else class="text-dark fw-medium d-block">
    {{
      col.key === "__index" || col.isIndex
        ? rowIndex + 1
        : col.formatter
          ? col.formatter(row[col.key], row, rowIndex)
          : row[col.key]
    }}
  </span>
</div>
          </div>

          <!-- Mobile Expanded Content -->
          <div v-if="hasExpandSlot && isExpanded(row.id)" class="expand-content-mobile mt-3 pt-3 border-top">
            <slot name="expand" :row="row"></slot>
          </div>

          <!-- Mobile Actions Slot -->
          <div v-if="hasActionsSlot" class="mt-3 text-center" @click.stop>
            <slot name="actions" :row="row" :toggleExpand="() => toggleExpand(row.id)" :isExpanded="isExpanded(row.id)"></slot>
          </div>
        </div>
      </div>

      <!-- No Data Message for Mobile -->
      <div v-if="sortedData.length === 0" class="text-center text-muted py-5">
        <p class="mb-0">{{ t('common.noDataAvailable') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from "vue";
import { sortData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import StatusBadge from "./StatusBadge.vue";
import arrowsBothWaysIcon from "@/assets/table/arrowsBothWays.svg";
import arrowUpIcon from "@/assets/table/arrowUp.svg";
import arrowDownIcon from "@/assets/table/arrowDown.svg";

const { t, locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");
const slots = useSlots();

const sortKey = ref("");
const sortDirection = ref("asc");

const selectedRows = ref([]);
const selectAll = ref(false);
const expandedRows = ref(new Set());

const props = defineProps({
  columns: Array,
  data: Array,
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  actionsLabel: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  // Function to determine if a row is expandable
  // Takes a row object and returns boolean
  isExpandable: {
    type: Function,
    default: () => true,
  },
  // ✅ Function to determine if a row checkbox should be disabled/hidden
  disableRowWhen: {
    type: Function,
    default: null,
  },
  // Function to return CSS class for a row (e.g. for inactive row styling)
  rowClass: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const hasActionsSlot = computed(() => !!slots.actions);
const hasExpandSlot = computed(() => !!slots.expand);
const actionsLabelText = computed(() => props.actionsLabel || t("common.actions"));

// Calculate total columns for colspan
const totalColumns = computed(() => {
  let count = props.columns.length;
  if (hasExpandSlot.value) count++;
  if (props.showCheckbox) count++;
  if (hasActionsSlot.value) count++;
  return count;
});

// Check if a row is expandable
const isRowExpandable = (row) => {
  if (!hasExpandSlot.value) return false;
  return props.isExpandable(row);
};

// Check if a row is expanded
const isExpanded = (rowId) => expandedRows.value.has(rowId);

// Toggle expand state of a row
const toggleExpand = (rowId) => {
  if (expandedRows.value.has(rowId)) {
    expandedRows.value.delete(rowId);
  } else {
    expandedRows.value.add(rowId);
  }
  // Force reactivity update
  expandedRows.value = new Set(expandedRows.value);
};

// ✅ Check if a row should be disabled
const isRowDisabled = (row) => {
  if (!props.disableRowWhen) return false;
  return props.disableRowWhen(row);
};

// ✅ Check if all rows are disabled
const allRowsDisabled = computed(() => {
  if (!props.disableRowWhen) return false;
  return sortedData.value.every(row => props.disableRowWhen(row));
});

const sortedData = computed(() => {
  return sortData(props.data, sortKey.value, sortDirection.value);
});

const arraysEqual = (left, right) => {
  if (left === right) return true;
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const handleSort = (columnKey) => {
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = columnKey;
    sortDirection.value = "asc";
  }
};

// ✅ Modified to only select non-disabled rows
const toggleSelectAll = () => {
  if (selectAll.value) {
    // Select only non-disabled rows
    selectedRows.value = sortedData.value
      .filter(row => !isRowDisabled(row))
      .map((row) => row.id);
  } else {
    selectedRows.value = [];
  }
};

// ✅ Modified to check only enabled rows for selectAll state
watch(selectedRows, (newVal) => {
  const enabledRows = sortedData.value.filter(row => !isRowDisabled(row));
  selectAll.value = newVal.length === enabledRows.length && enabledRows.length > 0;
  
  if (!arraysEqual(newVal, props.modelValue)) {
    emit("update:modelValue", newVal);
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (Array.isArray(newVal) && !arraysEqual(newVal, selectedRows.value)) {
      selectedRows.value = [...newVal];
    }
  },
  { immediate: true }
);

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

.table-responsive {
  overflow-x: auto;
  overflow-y: visible;
}

.card:last-child {
  margin-bottom: 0 !important;
}

/* Expandable row styles */
.expand-col {
  width: 40px;
  min-width: 40px;
}

.expand-toggle {
  color: #6c757d;
  transition: color 0.2s;
}

.expand-toggle:hover {
  color: #0d6efd;
}

.expandable-row {
  cursor: pointer;
}

.expandable-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.expanded-row {
  background-color: rgba(13, 110, 253, 0.08);
}

.expand-content-row {
  background-color: #f8f9fa;
}

.expand-content-row:hover {
  background-color: #f8f9fa;
}

.expand-content {
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Mobile expandable styles */
.expandable-card {
  border-left: 3px solid #fd7e14 !important;
}

.expand-toggle-mobile {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.expand-content-mobile {
  background-color: #fff8f0;
  margin: 0 -1rem;
  padding: 1rem;
  border-radius: 0 0 0.375rem 0.375rem;
}

/* Inactive row styles */
:deep(.row-inactive) {
  opacity: 0.55;
}

:deep(.row-inactive td) {
  background-color: #f8f9fa;
}

:deep(.card.row-inactive) {
  opacity: 0.55;
  background-color: #f8f9fa;
}
</style>
