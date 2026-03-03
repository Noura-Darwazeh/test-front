<template>
  <div class="table-header mb-3">
    <!-- Main header row -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <!-- search and group filter components -->
      <div class="d-flex gap-2 flex-grow-1 align-items-center">
        <MainFilters
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :placeholder="searchPlaceholder"
          :data="data"
          :groupKey="groupKey"
          :groupModelValue="groupModelValue"
          @update:groupModelValue="$emit('update:groupModelValue', $event)"
          :groupLabel="groupLabel"
          :translationKey="translationKey"
        />

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

    <!-- Extra filters toggle bar (below main row) -->
    <div v-if="hasExtraFilters" class="extra-toggle-bar" @click="showExtra = !showExtra">
      <span class="extra-toggle-icon">{{ showExtra ? '−' : '+' }}</span>
      <span class="extra-toggle-label">{{ showExtra ? $t('common.lessFilters') : $t('common.moreFilters') }}</span>
      <span v-if="activeExtraCount > 0" class="badge bg-danger">{{ activeExtraCount }}</span>
    </div>

    <!-- Extra filters content (collapsible) -->
    <div v-if="showExtra && hasExtraFilters" class="extra-filters d-flex gap-2 align-items-center flex-wrap">
      <GroupFilter
        v-if="groupKey2 && (data2 || data)"
        :data="data2 || data"
        :groupKey="groupKey2"
        v-model="selectedGroups2"
        :label="groupLabel2"
        :translationKey="translationKey2"
      />
      <GroupFilter
        v-for="ef in extraFilters"
        :key="ef.key"
        :data="data2 || data"
        :groupKey="ef.key"
        v-model="extraFilterSelections[ef.key]"
        :label="ef.label"
        :translationKey="ef.translationKey"
      />
      <ActiveStatusFilter
        v-if="showActiveFilter"
        v-model="activeFilter"
      />
      <TimePeriodFilter
        v-if="showTimeFilter"
        v-model="timePeriod"
        :options="timeOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive } from "vue";
import ColumnSelector from "./ColumnSelector.vue";
import MainFilters from "../filters/composed/MainFilters.vue";
import GroupFilter from "../filters/base/GroupFilter.vue";
import ActiveStatusFilter from "../filters/base/ActiveStatusFilter.vue";
import TimePeriodFilter from "../filters/base/TimePeriodFilter.vue";
import PrimaryButton from "../shared/PrimaryButton.vue";
import trashIcon from "../../assets/table/recycle.svg";
import addIcon from "../../assets/table/add.svg";
import refreshIcon from "../../assets/table/refresh.svg?component"

const props = defineProps({
  modelValue: String,
  searchPlaceholder: String,
  data: Array,
  data2: Array,
  groupKey: String,
  groupModelValue: Array,
  groupLabel: String,
  translationKey: String,
  // Extra filter props
  groupKey2: String,
  groupModelValue2: Array,
  groupLabel2: String,
  translationKey2: String,
  showActiveFilter: {
    type: Boolean,
    default: false,
  },
  activeFilterValue: {
    type: [String, Number],
    default: "",
  },
  showTimeFilter: {
    type: Boolean,
    default: false,
  },
  timeModelValue: String,
  timeOptions: Array,
  extraFilters: {
    type: Array,
    default: () => [],
  },
  extraFilterValues: {
    type: Object,
    default: () => ({}),
  },
  // Table header props
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
  "update:groupModelValue2",
  "update:activeFilterValue",
  "update:timeModelValue",
  "update:extraFilterValues",
  "update:visibleColumns",
  "add-click",
  "trashed-click",
  "refresh-click",
]);

// Extra filters state
const showExtra = ref(false);
const selectedGroups2 = ref(props.groupModelValue2 || []);
const activeFilter = ref(props.activeFilterValue);
const timePeriod = ref(props.timeModelValue || "all");

const extraFilterSelections = reactive({});
if (props.extraFilters) {
  props.extraFilters.forEach((ef) => {
    extraFilterSelections[ef.key] = props.extraFilterValues?.[ef.key] || [];
  });
}

const hasExtraFilters = computed(() => {
  return !!(
    props.groupKey2 ||
    props.showActiveFilter ||
    props.showTimeFilter ||
    (props.extraFilters && props.extraFilters.length > 0)
  );
});

const activeExtraCount = computed(() => {
  let count = 0;
  if (selectedGroups2.value.length > 0) count++;
  if (props.showActiveFilter && activeFilter.value !== "") count++;
  if (props.showTimeFilter && timePeriod.value !== "all") count++;
  if (props.extraFilters) {
    for (const ef of props.extraFilters) {
      if (extraFilterSelections[ef.key]?.length > 0) count++;
    }
  }
  return count;
});

// Watchers for extra filters
watch(selectedGroups2, (newValue) => {
  emit("update:groupModelValue2", newValue);
});

watch(activeFilter, (newValue) => {
  emit("update:activeFilterValue", newValue);
});

watch(timePeriod, (newValue) => {
  emit("update:timeModelValue", newValue);
});

// Watch extra filter selections
if (props.extraFilters) {
  for (const ef of props.extraFilters) {
    watch(
      () => extraFilterSelections[ef.key],
      () => {
        const values = {};
        props.extraFilters.forEach((f) => {
          values[f.key] = extraFilterSelections[f.key] || [];
        });
        emit("update:extraFilterValues", values);
      }
    );
  }
}

// Sync props back to local state
watch(() => props.groupModelValue2, (newValue) => {
  if (newValue !== undefined) {
    selectedGroups2.value = newValue || [];
  }
});

watch(() => props.activeFilterValue, (newValue) => {
  if (newValue !== undefined) {
    activeFilter.value = newValue;
  }
});

watch(() => props.timeModelValue, (newValue) => {
  if (newValue !== undefined) {
    timePeriod.value = newValue || "all";
  }
});

watch(() => props.extraFilterValues, (newValue) => {
  if (newValue && props.extraFilters) {
    props.extraFilters.forEach((ef) => {
      if (newValue[ef.key] !== undefined) {
        extraFilterSelections[ef.key] = newValue[ef.key];
      }
    });
  }
}, { deep: true });

const handleAddClick = () => {
  emit('add-click');
};

const handleRefreshClick = () => {
  emit('refresh-click');
};

const handleTrashedClick = () => {
  emit('trashed-click');
};
</script>

<style scoped>
.extra-toggle-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
  cursor: pointer;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
  user-select: none;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.extra-toggle-bar:hover {
  color: #0d6efd;
  background-color: #e9ecef;
}

.extra-toggle-icon {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
}

.extra-toggle-label {
  font-size: 0.8rem;
}

.extra-toggle-bar .badge {
  font-size: 0.6rem;
  padding: 0.2em 0.45em;
}

.extra-filters {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 400px) {
  .mb-3 {
    gap: 0.75rem !important;
  }

  .d-flex.gap-2:last-child {
    width: 100%;
  }

  .extra-filters {
    flex-direction: column;
    align-items: stretch !important;
  }
}
</style>
