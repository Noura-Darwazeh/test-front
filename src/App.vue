<script setup>
import { useRoute } from "vue-router";
import AppLayout from "./components/layout/AppLayout.vue";
const route = useRoute();
</script>

<template>
  <div>
    <AppLayout v-if="!route.meta?.hideLayout">
      <router-view />
    </AppLayout>
    <router-view v-else />
  </div>
</template>

<style scoped></style>
