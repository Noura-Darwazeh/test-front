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
              <i class="fas fa-exclamation-triangle text-warning"></i>
              {{ $t('driver.reassignWorkPlansTitle') }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" style="max-height: 70vh;">
            <!-- Warning Message -->
            <div v-if="!canDelete" class="alert alert-danger d-flex align-items-start gap-2 mb-3">
              <i class="fas fa-ban mt-1"></i>
              <div>
                <strong>{{ $t('driver.cannotDelete') }}</strong>
                <p class="mb-0 mt-1">{{ $t('driver.hasActiveSteps') }}</p>
              </div>
            </div>

            <div v-else class="alert alert-warning d-flex align-items-start gap-2 mb-3">
              <i class="fas fa-info-circle mt-1"></i>
              <div>
                <strong>{{ $t('driver.workPlansFound') }}</strong>
                <p class="mb-0 mt-1">{{ $t('driver.reassignRequired') }}</p>
              </div>
            </div>

            <!-- Work Plans List -->
            <div v-if="workPlans.length > 0" class="mb-3">
              <label class="fw-semibold mb-2">
                {{ $t('driver.workPlans') }} ({{ workPlans.length }})
              </label>
              <div class="work-plans-list">
                <div
                  v-for="plan in workPlans"
                  :key="plan.id"
                  class="work-plan-item p-3 mb-2 border rounded-3 bg-light"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="mb-1 fw-semibold">{{ plan.name }}</h6>
                      <small class="text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        {{ formatDate(plan.date) }}
                      </small>
                    </div>
                    <div>
                      <span v-if="plan.orders_count" class="badge bg-primary">
                        {{ plan.orders_count }} {{ $t('driver.orders') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Driver Selection (only if can delete) -->
            <div v-if="canDelete" class="mb-3">
              <label class="form-label fw-semibold" for="newDriver">
                {{ $t('driver.selectNewDriver') }}
                <span class="text-danger">*</span>
              </label>
              <select
                id="newDriver"
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
                  {{ driver.name }} - {{ driver.username }}
                </option>
              </select>
              <div v-if="validationError" class="invalid-feedback">
                {{ validationError }}
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="reassigning" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ $t('common.loading') }}</span>
              </div>
              <p class="mt-2">{{ $t('driver.reassigning') }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton
              :text="$t('common.cancel')"
              @click="closeModal"
              bg-color="var(--color-secondary)"
              :disabled="reassigning"
            />
            <PrimaryButton
              v-if="canDelete"
              :text="$t('driver.reassignAndDelete')"
              @click="handleReassign"
              bg-color="var(--color-danger)"
              :loading="reassigning"
              :disabled="!selectedNewDriver || reassigning"
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

const emit = defineEmits(['close', 'reassign', 'force-close']);

const selectedNewDriver = ref('');
const validationError = ref('');
const reassigning = ref(false);

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
  if (!reassigning.value) {
    selectedNewDriver.value = '';
    validationError.value = '';
    emit('close');
  }
};

const handleReassign = async () => {
  if (!selectedNewDriver.value) {
    validationError.value = t('driver.validation.driverRequired');
    return;
  }

  validationError.value = '';
  reassigning.value = true;

  try {
    const workPlanIds = props.workPlans.map(plan => plan.id);
    
    await emit('reassign', {
      workPlanIds,
      oldDriverId: props.driver.id,
      newDriverId: selectedNewDriver.value
    });

    selectedNewDriver.value = '';
  } catch (error) {
    console.error('❌ Reassign failed:', error);
    validationError.value = error.message || t('common.saveFailed');
  } finally {
    reassigning.value = false;
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedNewDriver.value = '';
    validationError.value = '';
    reassigning.value = false;
    
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

.work-plans-list {
  max-height: 300px;
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
}
</style>