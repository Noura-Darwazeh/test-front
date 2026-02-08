<template>
    <LineWorkHeader v-bind="$attrs" />
</template>

<script setup>
import LineWorkHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>