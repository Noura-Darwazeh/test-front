<template>
  <div :class="{ rtl: isRTL }">
    <!-- Desktop Table View -->
    <div class="table-responsive d-none d-md-block border">
      <table class="table table-hover align-middle" :dir="isRTL ? 'rtl' : 'ltr'">
        <thead class="table-light">
          <tr>
            <th v-for="col in columns" :key="col.key" class="text-muted fw-normal small text-uppercase">
              {{ col.label }}
            </th>
            <!-- Actions Column Header -->
            <th class="text-center text-muted fw-normal small text-uppercase">
              {{ actionsLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in data" :key="row.id">
            <td v-for="col in columns" :key="col.key" class="text-dark">
              <StatusBadge v-if="col.component === 'StatusBadge'" :status="row[col.key]"
                v-bind="col.componentProps || {}" />
              <span v-else>{{ row[col.key] }}</span>
            </td>

            <!-- Actions Column -->
            <td class="text-center">
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
          <div class="mt-3 text-center">
            <slot name="actions" :row="row"></slot>
          </div>
        </div>
      </div>

      <!-- No Data Message for Mobile -->
      <div v-if="data.length === 0" class="text-center text-muted py-5">
        <p class="mb-0">No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import StatusBadge from "./StatusBadge.vue";

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

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
    default: "Actions",
  },
});
</script>

<style scoped>
.table-responsive table,
.table-responsive td {
  margin: 0 !important;
}

.card:last-child {
  margin-bottom: 0 !important;
}
</style>
