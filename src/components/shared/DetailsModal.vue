<template>
  <!-- Modal -->
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
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
          <div class="row g-3">
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
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-light">
          <PrimaryButton text="Close" @click="closeModal" bg-color="var(--color-secondary)" />
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
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

const formatValue = (field) => {
  const value = props.data[field.key];
  
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  
  // If field has a translator function
  if (field.translator && typeof field.translator === 'function') {
    return field.translator(value);
  }
  
  // If field has translation key
  if (field.translationKey) {
    const translated = t(`${field.translationKey}.${value}`);
    return translated !== `${field.translationKey}.${value}` ? translated : value;
  }
  
  return value;
};

const closeModal = () => {
  emit('close');
};

// Prevent body scroll when modal is open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>

.detail-item:hover {
  background-color: #e9ecef !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

</style>