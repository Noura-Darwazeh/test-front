<template>
    <LinesHeader v-bind="$attrs" />
</template>

<script setup>
import LinesHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>