<template>
    <LinePriceHeader v-bind="$attrs" />
</template>

<script setup>
import LinePriceHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>