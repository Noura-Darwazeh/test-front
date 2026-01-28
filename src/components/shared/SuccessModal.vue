<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-3">
          <!-- Success Icon -->
          <div class="modal-body p-5 text-center">
            <div class="success-icon-container mb-4">
              <div class="success-checkmark">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
            
            <h4 class="fw-bold text-success mb-3">{{ title }}</h4>
            <p class="text-muted mb-4">{{ message }}</p>
            
            <PrimaryButton 
              :text="$t('common.ok')" 
              @click="closeModal" 
              bgColor="var(--color-success)"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue';
import PrimaryButton from './PrimaryButton.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Success!',
  },
  message: {
    type: String,
    required: true,
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
  autoCloseDelay: {
    type: Number,
    default: 2000, // 2 seconds
  },
});

const emit = defineEmits(['close']);

let autoCloseTimer = null;

const closeModal = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
  emit('close');
};

// Auto-close functionality
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Auto close if enabled
    if (props.autoClose) {
      autoCloseTimer = setTimeout(() => {
        closeModal();
      }, props.autoCloseDelay);
    }
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
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
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-dialog {
  transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
  transform: scale(0.7) translateY(-20px);
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

/* Success Checkmark Animation */
.success-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #28a745;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #28a745;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #28a745;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #28a745;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #28a745;
  }
}
</style>