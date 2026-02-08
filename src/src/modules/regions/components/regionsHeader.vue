<template>
    <RegionsHeader v-bind="$attrs" />
</template>

<script setup>
import RegionsHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>