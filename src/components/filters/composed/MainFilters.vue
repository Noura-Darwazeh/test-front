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
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import SearchFilter from "../base/SearchFilter.vue";
import GroupFilter from "../base/GroupFilter.vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
  data: Array,
  groupKey: String,
  groupModelValue: Array,
  groupLabel: String,
  translationKey: String, // مفتاح الترجمة الجديد
});
const emit = defineEmits(["update:modelValue", "update:groupModelValue"]);

const searchText = ref(props.modelValue || "");
const selectedGroups = ref(props.groupModelValue || []);

watch(searchText, (newValue) => {
  emit("update:modelValue", newValue);
});

watch(selectedGroups, (newValue) => {
  emit("update:groupModelValue", newValue);
});
</script>

<style scoped>
@media (max-width: 400px) {
  .main-filters {
    flex-direction: column;
    align-items: stretch !important;
  }
}
</style>