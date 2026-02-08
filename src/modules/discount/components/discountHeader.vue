<template>
  <discountHeader v-bind="$attrs" />
</template>

<script setup>
import discountHeader from "../../../components/shared/TableHeader.vue";

defineOptions({
  inheritAttrs: false
});
</script>
