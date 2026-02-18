<template>
    <workPlansHeader v-bind="$attrs" />
</template>

<script setup>
import workPlansHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>