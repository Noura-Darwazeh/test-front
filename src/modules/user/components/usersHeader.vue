<template>
    <usersHeader v-bind="$attrs" @refresh-click="handlePowerBIRefresh"/>
</template>

<script setup>
import usersHeader from "../../../components/shared/TableHeader.vue"

defineOptions({
  inheritAttrs: false
});
</script>