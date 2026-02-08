<template>
    <branchesHeader v-bind="$attrs" />
</template>

<script setup>
import branchesHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>