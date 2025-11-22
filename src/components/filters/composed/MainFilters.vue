<template>
  <div class="filters-wrapper d-flex gap-3">
    <SearchFilter v-model="searchText" :placeholder="placeholder" />
    <GroupFilter
      v-if="groupKey && data"
      :data="data"
      :groupKey="groupKey"
      v-model="selectedGroups"
      :label="groupLabel"
    />
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import SearchFilter from "../base/SearchFilter.vue";
import GroupFilter from "../base/GroupFilter.vue";

// ------------ Props and Emits ------------
const props = defineProps({
  modelValue: String,
  placeholder: String,
  data: Array,
  groupKey: String,
  groupModelValue: Array,
  groupLabel: String,
});
const emit = defineEmits(["update:modelValue", "update:groupModelValue"]);

// ------------- Internal State ------------
const searchText = ref(props.modelValue || "");
const selectedGroups = ref(props.groupModelValue || []);

// --------------- Watch and Emit changes ---------------
watch(searchText, (newValue) => {
  emit("update:modelValue", newValue);
});

watch(selectedGroups, (newValue) => {
  emit("update:groupModelValue", newValue);
});
</script>
<style scoped>
.filters-wrapper {
  flex: 1;
  max-width: 600px;
}
</style>
