<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0 rounded-3">
          <!-- Header -->
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title fw-semibold d-flex align-items-center gap-2">
              <img :src="detailsIcon" alt="Details" width="24" height="24" />
              {{ title }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" style="max-height: 70vh;">
            <!-- Custom Slot for Content Before Details -->
            <slot name="before-details"></slot>

            <!-- Image Section -->
            <div v-if="data.image || data.imagePreview" class="text-center mb-4">
              <div class="d-flex justify-content-center">
                <div class="position-relative" style="width: 120px; height: 120px;">
                  <div class="rounded-circle overflow-hidden border border-3 border-light bg-white w-100 h-100 shadow-sm">
                    <img :src="data.imagePreview || data.image" alt="Profile" class="w-100 h-100" style="object-fit: cover;" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Details Grid -->
            <div v-if="displayFields.length > 0" class="row g-3">
              <div v-for="field in displayFields" :key="field.key" :class="field.colClass || 'col-md-6'">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ field.label }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ formatValue(field) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Slot for Additional Content -->
            <slot name="after-details"></slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton text="Close" @click="closeModal" bg-color="var(--color-secondary)" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimaryButton from './PrimaryButton.vue';
import detailsIcon from '../../assets/table/details.svg';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Details',
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(['close']);

const displayFields = computed(() => {
  return props.fields.filter(field => props.data[field.key] !== undefined);
});

const normalizeDisplayValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const candidate = value.length === 2 ? value[1] ?? value[0] : value;
    if (Array.isArray(candidate)) {
      return candidate.map(normalizeDisplayValue).filter(Boolean).join(", ");
    }
    if (typeof candidate === "object" && candidate !== null) {
      return normalizeDisplayValue(candidate);
    }
    return normalizeDisplayValue(candidate);
  }
  if (typeof value === "object") {
    if (value.name !== undefined) return normalizeDisplayValue(value.name);
    if (value.label !== undefined) return normalizeDisplayValue(value.label);
    if (value.symbol !== undefined) return normalizeDisplayValue(value.symbol);
    if (value.code !== undefined) return normalizeDisplayValue(value.code);
    if (value.id !== undefined) return normalizeDisplayValue(value.id);
    try {
      return JSON.stringify(value);
    } catch (err) {
      return "";
    }
  }
  return "";
};

const formatValue = (field) => {
  const value = props.data[field.key];

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  // Special case for orders array
  if (field.key === 'orders' && Array.isArray(value)) {
    return value.map(order => `${order.order}: ${order.items}`).join(' | ');
  }

  // If field has a translator function
  if (field.translator && typeof field.translator === 'function') {
    return field.translator(value);
  }

  const normalizedValue = normalizeDisplayValue(value);
  if (!normalizedValue) {
    return 'N/A';
  }

  // If field has translation key
  if (field.translationKey) {
    const translated = t(`${field.translationKey}.${normalizedValue}`);
    return translated !== `${field.translationKey}.${normalizedValue}`
      ? translated
      : normalizedValue;
  }

  return normalizedValue;
};

const closeModal = () => {
  emit('close');
};

// Prevent body scroll when modal is open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
});
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
}

/* Modal transitions */
.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog {
  transition: transform 0.2s ease-out;
}

.modal-leave-active .modal-dialog {
  transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-dialog {
  transform: scale(0.95);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
}

.detail-item {
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: #e9ecef !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>