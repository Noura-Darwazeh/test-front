<template>
    <usersHeader v-bind="$attrs" />
</template>

<script setup>
import usersHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>