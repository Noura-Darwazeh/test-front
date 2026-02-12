<template>
  <div class="search-filter position-relative shadow-sm" style="max-width: 300px">
    <span class="search-icon position-absolute" :class="isRTL ? 'end-0' : 'start-0'">
      <img :src="searchIcon" alt="Search" width="16" height="16" />
    </span>
    <input type="search" class="form-control" :class="isRTL ? 'pe-5' : 'ps-5'" :placeholder="placeholder"
      :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :dir="isRTL ? 'rtl' : 'ltr'" />
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import searchIcon from "@/assets/search.svg";

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "Search...",
  },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.search-icon {
  top: 50%;
  transform: translateY(-50%);
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 10;
}

.form-control:focus {
  border-color: #dee2e6;
  box-shadow: none;
}
</style>
