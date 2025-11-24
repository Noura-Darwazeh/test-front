<template>
  <label class="form-label" :for="forId">
    {{ label }}
    <span v-if="required" class="text-danger">*</span>
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  forId: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.form-label {
  font-weight: 600;
  margin-bottom: 0.625rem;
  color: var(--neutral-700);
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
}

.text-danger {
  color: var(--error);
  margin-left: 0.25rem;
}
</style>
