<template>
    <customerAccountHeader v-bind="$attrs" />
</template>

<script setup>
import customerAccountHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>
