<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-3">
          <!-- Header -->
          <div class="modal-header bg-light border-bottom">
            <h5 class="modal-title fw-semibold">
              {{ $t('payment.selectPaymentMethod') }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4">
            <p class="text-muted mb-4">
              {{ $t('payment.selectedPayments', { count: selectedCount }) }}
            </p>

            <!-- Payment Method Options -->
            <div class="payment-methods">
              <!-- Bank Payment -->
              <div class="payment-method-option mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="bankPayment"
                    value="bank"
                    v-model="paymentMethod"
                  />
                  <label class="form-check-label fw-semibold" for="bankPayment">
                    <i class="fas fa-university me-2"></i>
                    {{ $t('payment.bankPayment') }}
                  </label>
                </div>
                <small class="text-muted d-block mt-1 ms-4">
                  {{ $t('payment.bankPaymentDesc') }}
                </small>
              </div>

              <!-- Driver Payment -->
              <div class="payment-method-option">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="driverPayment"
                    value="driver"
                    v-model="paymentMethod"
                  />
                  <label class="form-check-label fw-semibold" for="driverPayment">
                    <i class="fas fa-user me-2"></i>
                    {{ $t('payment.driverPayment') }}
                  </label>
                </div>
                <small class="text-muted d-block mt-1 ms-4">
                  {{ $t('payment.driverPaymentDesc') }}
                </small>

                <!-- Driver Selection -->
                <div v-if="paymentMethod === 'driver'" class="mt-3 ms-4">
                  <label class="form-label">{{ $t('payment.selectDriver') }}</label>
                  <select
                    v-model="selectedDriver"
                    class="form-select"
                    :class="{ 'is-invalid': showError && !selectedDriver }"
                  >
                    <option value="">{{ $t('payment.selectDriverPlaceholder') }}</option>
                    <option
                      v-for="driver in drivers"
                      :key="driver.value"
                      :value="driver.value"
                    >
                      {{ driver.label }}
                    </option>
                  </select>
                  <div v-if="showError && !selectedDriver" class="invalid-feedback">
                    {{ $t('payment.driverRequired') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton
              :text="$t('common.cancel')"
              @click="closeModal"
              bg-color="var(--color-secondary)"
            />
            <PrimaryButton
              :text="$t('common.done')"
              bgColor="var(--color-success)"
              :loading="loading"
              @click="handleSubmit"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  selectedCount: {
    type: Number,
    required: true,
  },
  drivers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'submit']);

const paymentMethod = ref('');
const selectedDriver = ref('');
const showError = ref(false);

const closeModal = () => {
  paymentMethod.value = '';
  selectedDriver.value = '';
  showError.value = false;
  emit('close');
};



const handleSubmit = () => {
  showError.value = false;

  // Validation
  if (!paymentMethod.value) {
    alert(t('payment.selectPaymentMethodError'));
    return;
  }

  if (paymentMethod.value === 'driver' && !selectedDriver.value) {
    showError.value = true;
    return;
  }

  // ✅ Prepare data - Always include status: "completed"
  const data = {
    status: 'completed' // ✅ دايماً نرسل completed
  };

  // ✅ إذا كان الدفع عن طريق Driver، نضيف paid_by_driver_id
  if (paymentMethod.value === 'driver') {
    data.paid_by_driver_id = parseInt(selectedDriver.value);
  }
  // ✅ إذا كان دفع بنكي، نرسل status: completed بس (بدون paid_by_driver_id)

  emit('submit', data);
};



  


// Reset on modal open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    paymentMethod.value = '';
    selectedDriver.value = '';
    showError.value = false;
    
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

.payment-method-option {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.2s;
}

.payment-method-option:hover {
  background-color: #f8f9fa;
}

.form-check-input:checked ~ .form-check-label {
  color: var(--primary-color);
}
</style>