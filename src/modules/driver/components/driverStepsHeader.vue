<template>
    <DriverHeader v-bind="$attrs" />
</template>

<script setup>
import DriverHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>