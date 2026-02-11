<template>
  <OrdersHeader v-bind="$attrs" />
</template>

<script setup>
import OrdersHeader from "../../../components/shared/TableHeader.vue";

defineOptions({
  inheritAttrs: false
});
</script>
