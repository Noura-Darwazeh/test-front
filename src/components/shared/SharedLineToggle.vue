<template>
  <div class="form-check form-switch d-flex justify-content-center">
    <input
      class="form-check-input cursor-pointer"
      type="checkbox"
      role="switch"
      :id="`shared-line-${companyId}`"
      :checked="isShared"
      @change="handleToggle"
      :disabled="loading || !canEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.js';
import apiServices from '@/services/apiServices.js';

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  sharedLine: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['updated']);

const authStore = useAuthStore();
const loading = ref(false);

const isShared = computed(() => props.sharedLine === 1);

// Only SuperAdmin can edit
const canEdit = computed(() => authStore.hasRole('SuperAdmin'));

const handleToggle = async (event) => {
  if (!canEdit.value) {
    event.preventDefault();
    return;
  }

  const newValue = event.target.checked ? 1 : 0;
  
  loading.value = true;
  try {
    await apiServices.updateCompanySharedLine(props.companyId, newValue);
    emit('updated', { companyId: props.companyId, sharedLine: newValue });
  } catch (error) {
    console.error('❌ Failed to update shared line:', error);
    // Revert checkbox
    event.target.checked = !event.target.checked;
    alert(error.message || 'Failed to update shared line');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.form-check-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-check-input {
  width: 2.5rem;
  height: 1.25rem;
}

.form-check-input:checked {
  background-color: var(--color-success);
  border-color: var(--color-success);
}
</style>