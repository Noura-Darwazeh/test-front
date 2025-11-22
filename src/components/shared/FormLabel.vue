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
    required: true
  },
  forId: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}
</style>