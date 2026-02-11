<template>
  <div :class="{ rtl: isRTL }">
    <!-- Desktop Table View -->
    <div class="table-responsive d-none d-md-block border">
      <table class="table table-hover align-middle" :dir="isRTL ? 'rtl' : 'ltr'">
        <thead class="table-light">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="showCheckbox" class="text-center">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
            </th>

            <th v-for="col in columns" :key="col.key" class="text-muted fw-normal small text-uppercase">
              {{ col.label }}
            </th>
            <!-- Actions Column Header -->
            <th v-if="hasActionsSlot" class="text-center text-muted fw-normal small text-uppercase">
              {{ actionsLabelText }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <!-- Checkbox for each row -->
            <td v-if="showCheckbox" class="text-center">
              <input type="checkbox" :value="row.id" v-model="selectedRows" />
            </td>

            <td v-for="col in columns" :key="col.key" class="text-dark">
              <StatusBadge v-if="col.component === 'StatusBadge'" :status="row[col.key]"
                v-bind="col.componentProps || {}" />
              <span v-else>{{ row[col.key] }}</span>
            </td>

            <!-- Actions Column -->
            <td v-if="hasActionsSlot" class="text-center">
              <slot name="actions" :row="row"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards View -->
    <div class="d-md-none bg-light">
      <div v-for="row in data" :key="row.id" class="card mb-3 border shadow-sm">
        <div class="card-body p-3">
          <!-- Mobile Checkbox -->
          <div v-if="showCheckbox" class="mb-2">
            <input type="checkbox" :value="row.id" v-model="selectedRows" />
          </div>

          <div v-for="col in columns" :key="col.key" class="row mb-2 pb-2 border-bottom" :class="{
            'border-0 mb-0 pb-0': col === columns[columns.length - 1]
          }">
            <div class="col-5 pe-2" :class="{ 'text-end': isRTL }">
              <small class="text-muted fw-semibold text-uppercase d-block">
                {{ col.label }}
              </small>
            </div>
            <div class="col-7 ps-2" :class="{ 'text-start': isRTL }">
              <StatusBadge v-if="col.component === 'StatusBadge'" :status="row[col.key]"
                v-bind="col.componentProps || {}" />
              <span v-else class="text-dark fw-medium d-block">
                {{ row[col.key] }}
              </span>
            </div>
          </div>

          <!-- Mobile Actions -->
          <div v-if="hasActionsSlot" class="mt-3 text-center">
            <slot name="actions" :row="row"></slot>
          </div>
        </div>
      </div>

      <!-- No Data Message for Mobile -->
      <div v-if="data.length === 0" class="text-center text-muted py-5">
        <p class="mb-0">{{ t('common.noDataAvailable') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, useSlots } from "vue";
import { useI18n } from "vue-i18n";
import StatusBadge from "./StatusBadge.vue";

const { t, locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");
const slots = useSlots();

const selectedRows = ref([]);
const selectAll = ref(false);

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  actionsLabel: {
    type: String,
    default: "",
  },
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const hasActionsSlot = computed(() => !!slots.actions);
const actionsLabelText = computed(() => props.actionsLabel || t("common.actions"));

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedRows.value = props.data.map((row) => row.id);
  } else {
    selectedRows.value = [];
  }
};

watch(selectedRows, (newVal) => {
  selectAll.value = newVal.length === props.data.length && newVal.length > 0;
  emit('update:modelValue', newVal);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (Array.isArray(newVal)) {
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
</style>
