<template>
  <span class="badge" :class="badgeClass">
    {{ displayText }}
  </span>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "default", // default, order, driver, discount, etc.
  },
});

const displayText = computed(() => {
  // Use translation key based on type
  const translationKey = getTranslationKey();
  return t(translationKey);
});

const getTranslationKey = () => {
  switch (props.type) {
    case "order":
      return `orderStatus.${props.status}`;
    case "driver":
      return `statuses.${props.status}`;
    case "discount":
      return `discount.status.${props.status}`;
    case "currency":
      return `currency.status.${props.status}`;
    case "driverLine":
      return `driverLine.status.${props.status}`;
    case "user":
      return `user.${props.status}`;
    default:
      return props.status;
  }
};

const badgeClass = computed(() => {
  const baseClass = getBadgeClass();
  return `${baseClass} status-badge`;
});

const getBadgeClass = () => {
  // Common status mappings
  const statusMap = {
    // Success states
    active: "bg-success",
    available: "bg-success",
    done: "bg-success",
    completed: "bg-success",
    ready: "bg-success",

    // Warning states
    pending: "bg-warning text-dark",
    busy: "bg-warning text-dark",

    // Danger states
    inactive: "bg-danger",
    expired: "bg-danger",
    failed: "bg-danger",
    cancelled: "bg-danger",
    offline: "bg-danger",
    deleted: "bg-danger",
    stopped: "bg-danger",

    // Info states
    in_progress: "bg-info",
    inprocess: "bg-info",

    // Secondary states
    draft: "bg-secondary",
  };

  return statusMap[props.status] || "bg-secondary";
};
</script>

<style scoped>
.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  text-transform: capitalize;
}
</style>
