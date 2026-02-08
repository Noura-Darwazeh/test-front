<template>
  <Transition name="slide-down">
    <div
      v-if="selectedCount > 0"
      class="bulk-actions-bar"
      :class="[
        { 'position-sticky': position === 'sticky' },
        { 'rtl': isRTL }
      ]"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <!-- Left: Selection count -->
      <div v-if="showCount" class="selection-info">
        <span class="text-muted">
          {{ selectedCount }} {{ entityLabel }} {{ $t('common.selected') }}
        </span>
      </div>

      <!-- Right: Action buttons -->
      <div class="actions-group d-flex gap-2">
        <PrimaryButton
          v-for="action in actions"
          :key="action.id"
          :text="getActionLabel(action.label)"
          :iconBefore="action.icon"
          :bgColor="action.bgColor || 'var(--primary-color)'"
          :textColor="action.textColor"
          :disabled="action.disabled || loading"
          :loading="loading"
          @click="handleActionClick(action.id)"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimaryButton from './PrimaryButton.vue';

const props = defineProps({
  selectedCount: { type: Number, required: true },
  entityName: { type: String, required: true },
  actions: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  position: { type: String, default: 'sticky' },
  showCount: { type: Boolean, default: true },
});

const emit = defineEmits(['action']);

const { t, locale } = useI18n();
const isRTL = computed(() => locale.value === 'ar');

// Smart pluralization based on module namespace
const entityLabel = computed(() => {
  const key = props.selectedCount === 1
    ? `${props.entityName}.entitySingular`
    : `${props.entityName}.entityPlural`;
  return t(key);
});

// Resolve i18n key or return string
const getActionLabel = (label) => {
  return label.includes('.') ? t(label) : label;
};

// Emit action event to parent
const handleActionClick = (actionId) => {
  emit('action', {
    actionId,
    selectedCount: props.selectedCount
  });
};
</script>

<style scoped>
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #dee2e6;
  z-index: 10;
}

.position-sticky {
  position: sticky;
  top: 0;
  /* Note: If header is fixed/sticky, adjust top value accordingly */
}

/* RTL Support */
.bulk-actions-bar.rtl {
  direction: rtl;
}

.bulk-actions-bar.rtl .selection-info {
  text-align: right;
}

/* Smooth animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 576px) {
  .bulk-actions-bar {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .selection-info {
    width: 100%;
    text-align: center;
  }

  .actions-group {
    width: 100%;
    justify-content: center;
  }
}
</style>
