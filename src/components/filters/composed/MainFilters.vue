<template>
  <div class="main-filters d-flex gap-2 align-items-center">
    <SearchFilter v-model="searchText" :placeholder="placeholder" />
    <GroupFilter 
      v-if="groupKey && data" 
      :data="data" 
      :groupKey="groupKey" 
      v-model="selectedGroups"
      :label="groupLabel"
      :translationKey="translationKey" 
    />
    <TimePeriodFilter
      v-if="showTimeFilter"
      v-model="timePeriod"
      :options="timeOptions"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import SearchFilter from "../base/SearchFilter.vue";
import GroupFilter from "../base/GroupFilter.vue";
import TimePeriodFilter from "../base/TimePeriodFilter.vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
  data: Array,
  groupKey: String,
  groupModelValue: Array,
  groupLabel: String,
  translationKey: String, 
  timeModelValue: String,
  timeOptions: Array,
  showTimeFilter: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  "update:modelValue",
  "update:groupModelValue",
  "update:timeModelValue",
]);

const searchText = ref(props.modelValue || "");
const selectedGroups = ref(props.groupModelValue || []);
const timePeriod = ref(props.timeModelValue || "all");

watch(searchText, (newValue) => {
  emit("update:modelValue", newValue);
});

watch(selectedGroups, (newValue) => {
  emit("update:groupModelValue", newValue);
});

watch(timePeriod, (newValue) => {
  emit("update:timeModelValue", newValue);
});

watch(
  () => props.timeModelValue,
  (newValue) => {
    if (newValue !== undefined) {
      timePeriod.value = newValue || "all";
    }
  }
);
</script>

<style scoped>
@media (max-width: 400px) {
  .main-filters {
    flex-direction: column;
    align-items: stretch !important;
  }
}
</style>
