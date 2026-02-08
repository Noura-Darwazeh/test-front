<template>
    <invoicesHeader v-bind="$attrs" />
</template>

<script setup>
import invoicesHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>