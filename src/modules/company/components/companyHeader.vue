<template>
    <companyHeader v-bind="$attrs" />
</template>

<script setup>
import companyHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>
