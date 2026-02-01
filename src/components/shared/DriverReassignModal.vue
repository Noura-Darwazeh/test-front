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
              <i class="fas fa-info-circle text-primary"></i>
              {{ $t('driver.workPlansFound') }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" style="max-height: 70vh;">
            <!-- Info Message -->
            <div v-if="!canDelete" class="alert alert-danger d-flex align-items-start gap-3 mb-4">
              <i class="fas fa-exclamation-triangle mt-1 fs-5"></i>
              <div>
                <strong class="d-block mb-1">{{ $t('driver.cannotDelete') }}</strong>
                <p class="mb-0 small">{{ $t('driver.hasActiveSteps') }}</p>
              </div>
            </div>

            <div v-else class="alert alert-info d-flex align-items-start gap-3 mb-4">
              <i class="fas fa-info-circle mt-1 fs-5"></i>
              <div>
                <strong class="d-block mb-1">{{ $t('driver.workPlansFoundTitle') }}</strong>
                <p class="mb-0 small">{{ $t('driver.deleteOptions') }}</p>
              </div>
            </div>

            <!-- Work Plans List -->
            <div v-if="workPlans.length > 0" class="mb-4">
              <label class="fw-semibold mb-3 d-flex align-items-center gap-2">
                <i class="fas fa-clipboard-list text-primary"></i>
                {{ $t('driver.workPlans') }} ({{ workPlans.length }})
              </label>
              <div class="work-plans-list">
                <div
                  v-for="plan in workPlans"
                  :key="plan.id"
                  class="work-plan-item p-3 mb-2 border rounded-3 bg-light"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1">
                      <h6 class="mb-1 fw-semibold text-dark">
                        <i class="fas fa-file-alt text-primary me-2"></i>
                        {{ plan.name }}
                      </h6>
                      <small class="text-muted d-flex align-items-center gap-3 mt-2">
                        <span>
                          <i class="fas fa-calendar me-1"></i>
                          {{ formatDate(plan.date) }}
                        </span>
                        <span v-if="plan.orders_count" class="badge bg-primary-subtle text-primary">
                          <i class="fas fa-box me-1"></i>
                          {{ plan.orders_count }} {{ $t('driver.orders') }}
                        </span>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delete Options (only if can delete) -->
            <div v-if="canDelete" class="delete-options">
              <label class="fw-semibold mb-3 d-flex align-items-center gap-2">
                <i class="fas fa-cog text-primary"></i>
                {{ $t('driver.selectDeleteOption') }}
              </label>

              <!-- Option 1: Delete without reassigning -->
              <div 
                class="option-card p-3 mb-3 border rounded-3 cursor-pointer"
                :class="{ 'selected': deleteOption === 'without_reassign' }"
                @click="deleteOption = 'without_reassign'"
              >
                <div class="d-flex align-items-start gap-3">
                  <input 
                    type="radio" 
                    name="deleteOption" 
                    value="without_reassign"
                    v-model="deleteOption"
                    class="form-check-input mt-1"
                  />
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">
                      <i class="fas fa-trash-alt text-danger me-2"></i>
                      {{ $t('driver.deleteWithoutReassign') }}
                    </h6>
                    <p class="mb-0 small text-muted">{{ $t('driver.deleteWithoutReassignDesc') }}</p>
                  </div>
                </div>
              </div>

              <!-- Option 2: Reassign to another driver -->
              <div 
                class="option-card p-3 border rounded-3 cursor-pointer"
                :class="{ 'selected': deleteOption === 'with_reassign' }"
                @click="deleteOption = 'with_reassign'"
              >
                <div class="d-flex align-items-start gap-3">
                  <input 
                    type="radio" 
                    name="deleteOption" 
                    value="with_reassign"
                    v-model="deleteOption"
                    class="form-check-input mt-1"
                  />
                  <div class="flex-grow-1">
                    <h6 class="mb-1 fw-semibold">
                      <i class="fas fa-exchange-alt text-success me-2"></i>
                      {{ $t('driver.reassignToDriver') }}
                    </h6>
                    <p class="mb-0 small text-muted">{{ $t('driver.reassignToDriverDesc') }}</p>
                  </div>
                </div>
              </div>

              <!-- Driver Selection (only if reassign option selected) -->
              <Transition name="slide-down">
                <div v-if="deleteOption === 'with_reassign'" class="driver-selection mt-3 p-3 bg-light rounded-3">
                  <label class="form-label fw-semibold d-flex align-items-center gap-2">
                    <i class="fas fa-user-tie text-primary"></i>
                    {{ $t('driver.selectNewDriver') }}
                    <span class="text-danger">*</span>
                  </label>
                  <select
                    v-model="selectedNewDriver"
                    class="form-select"
                    :class="{ 'is-invalid': validationError }"
                  >
                    <option value="" disabled>{{ $t('driver.chooseDriver') }}</option>
                    <option
                      v-for="driver in availableDrivers"
                      :key="driver.id"
                      :value="driver.id"
                    >
                      <i class="fas fa-user me-2"></i>
                      {{ driver.name }} - {{ driver.username }}
                    </option>
                  </select>
                  <div v-if="validationError" class="invalid-feedback">
                    {{ validationError }}
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Loading State -->
            <div v-if="processing" class="text-center py-4">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}</span>
              </div>
              <p class="text-muted">{{ $t('driver.processing') }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton
              :text="$t('common.cancel')"
              @click="closeModal"
              bg-color="var(--color-secondary)"
              :disabled="processing"
            />
            <PrimaryButton
              v-if="canDelete"
              :text="getConfirmButtonText"
              @click="handleConfirm"
              :bg-color="deleteOption === 'with_reassign' ? 'var(--color-success)' : 'var(--color-danger)'"
              :loading="processing"
              :disabled="isConfirmDisabled"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimaryButton from './PrimaryButton.vue';

const { t, locale } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  driver: {
    type: Object,
    required: true
  },
  workPlans: {
    type: Array,
    default: () => []
  },
  availableDrivers: {
    type: Array,
    default: () => []
  },
  canDelete: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close', 'delete', 'reassign']);

const deleteOption = ref('without_reassign');
const selectedNewDriver = ref('');
const validationError = ref('');
const processing = ref(false);

const getConfirmButtonText = computed(() => {
  if (deleteOption.value === 'with_reassign') {
    return t('driver.reassignAndDelete');
  }
  return t('driver.deleteDriver');
});

const isConfirmDisabled = computed(() => {
  if (processing.value) return true;
  if (deleteOption.value === 'with_reassign' && !selectedNewDriver.value) {
    return true;
  }
  return false;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const closeModal = () => {
  if (!processing.value) {
    resetForm();
    emit('close');
  }
};

const resetForm = () => {
  deleteOption.value = 'without_reassign';
  selectedNewDriver.value = '';
  validationError.value = '';
  processing.value = false;
};

const handleConfirm = async () => {
  if (deleteOption.value === 'with_reassign' && !selectedNewDriver.value) {
    validationError.value = t('driver.validation.driverRequired');
    return;
  }

  validationError.value = '';
  processing.value = true;

  try {
    if (deleteOption.value === 'with_reassign') {
      // Reassign and delete
      const workPlanIds = props.workPlans.map(plan => plan.id);
      await emit('reassign', {
        workPlanIds,
        oldDriverId: props.driver.id,
        newDriverId: selectedNewDriver.value
      });
    } else {
      // Delete without reassigning
      await emit('delete', props.driver.id);
    }

    resetForm();
  } catch (error) {
    console.error('❌ Action failed:', error);
    validationError.value = error.message || t('common.saveFailed');
  } finally {
    processing.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetForm();
    
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

watch(deleteOption, () => {
  if (deleteOption.value === 'without_reassign') {
    selectedNewDriver.value = '';
    validationError.value = '';
  }
});
</script>

<style scoped>
/* Transitions */
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

/* Work Plans List */
.work-plans-list {
  max-height: 250px;
  overflow-y: auto;
}

.work-plans-list::-webkit-scrollbar {
  width: 6px;
}

.work-plans-list::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

.work-plan-item {
  transition: all 0.2s ease;
}

.work-plan-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #f0f7ff !important;
}

/* Option Cards */
.option-card {
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: white;
}

.option-card:hover {
  border-color: var(--primary-color) !important;
  transform: translateX(4px);
}

.option-card.selected {
  background-color: #f0f7ff;
  border-color: var(--primary-color) !important;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}

.option-card .form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Driver Selection Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.driver-selection {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Alert Styling */
.alert {
  border-radius: 12px;
  border: none;
}

.alert-danger {
  background-color: #fee;
  color: #c33;
}

.alert-info {
  background-color: #e7f3ff;
  color: #0066cc;
}

/* Cursor */
.cursor-pointer {
  cursor: pointer;
}
</style>