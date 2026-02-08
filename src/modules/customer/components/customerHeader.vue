<template>
    <customerHeader v-bind="$attrs" />
</template>

<script setup>
import customerHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>