<template>
  <EventsHeader v-bind="$attrs" />
</template>

<script setup>
import EventsHeader from "../../../components/shared/TableHeader.vue";

defineOptions({ inheritAttrs: false });
</script>
