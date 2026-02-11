<template>
  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button
        class="nav-link"
        :class="{ active: modelValue === 'details' }"
        @click="$emit('update:modelValue', 'details')"
      >
        <i class="fas fa-info-circle me-2"></i>{{ $t("orders.details.detailsTab") }}
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        :class="{
          active: modelValue === 'exchanged',
          'text-success': hasExchange,
          'text-muted': !hasExchange
        }"
        @click="$emit('update:modelValue', 'exchanged')"
      >
        <i class="fas fa-exchange-alt me-2"></i>{{ $t("orders.details.exchangedTab") }}
        <span v-if="hasExchange" class="badge bg-success ms-2">{{ $t("common.active") }}</span>
        <span v-else class="badge bg-secondary ms-2">{{ $t("orders.details.notExchanged") }}</span>
      </button>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: "details",
  },
  hasExchange: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
</script>
