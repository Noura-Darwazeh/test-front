<template>
    <DriversHeader v-bind="$attrs" />
</template>

<script setup>
import DriversHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>