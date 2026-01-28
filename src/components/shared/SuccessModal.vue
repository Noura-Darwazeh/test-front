<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <!-- Success Animation Background -->
          <div class="success-background">
            <div class="success-circle-1"></div>
            <div class="success-circle-2"></div>
            <div class="success-circle-3"></div>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-5 text-center position-relative">
            <!-- Success Icon with Animation -->
            <div class="success-icon-container mb-4">
              <div class="success-checkmark-circle">
                <div class="success-checkmark">
                  <svg class="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Title with Fade In -->
            <h3 class="fw-bold text-success mb-3 title-fade-in">{{ title }}</h3>
            
            <!-- Message with Slide Up -->
            <p class="text-muted mb-4 message-slide-up">{{ message }}</p>
            
            <!-- Button with Scale -->
            <div class="button-scale d-flex justify-content-center">
              <PrimaryButton 
                :text="$t('common.ok')" 
                @click="closeModal" 
                bgColor="var(--color-success)"
                class="px-5"
              />
            </div>
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
    default: 3000,
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

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

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
/* ===== Backdrop Transitions ===== */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop {
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
}

/* ===== Modal Transitions ===== */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog {
  animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-dialog {
  animation: zoomOut 0.25s ease-in;
}

@keyframes zoomIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes zoomOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.8);
    opacity: 0;
  }
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

.modal-content {
  border: none;
  position: relative;
  overflow: hidden;
}

/* ===== Success Background Animation ===== */
.success-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.success-circle-1,
.success-circle-2,
.success-circle-3 {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(40, 167, 69, 0.05));
}

.success-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation: float 6s ease-in-out infinite;
}

.success-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite reverse;
}

.success-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* ===== Success Icon Animation ===== */
.success-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-checkmark-circle {
  width: 100px;
  height: 100px;
  position: relative;
  display: inline-block;
  animation: scaleIn 0.5s ease-in-out 0.1s both;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-checkmark {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  position: relative;
}

.checkmark-svg {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #28a745;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #28a745;
  animation: fillCircle 0.4s ease-in-out 0.4s forwards, 
             scaleCircle 0.3s ease-in-out 0.9s both;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #28a745;
  fill: none;
  animation: strokeCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #fff;
  stroke-width: 4;
  animation: strokeCheck 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes strokeCircle {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes strokeCheck {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fillCircle {
  100% {
    box-shadow: inset 0px 0px 0px 60px #28a745;
  }
}

@keyframes scaleCircle {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

/* ===== Content Animations ===== */
.title-fade-in {
  animation: fadeInDown 0.5s ease-in-out 0.6s both;
}

.message-slide-up {
  animation: fadeInUp 0.5s ease-in-out 0.8s both;
}

.button-scale {
  animation: scaleButton 0.4s ease-in-out 1s both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleButton {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== Hover Effects ===== */
.modal-body .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  transition: all 0.3s ease;
}

/* ===== Responsive ===== */
@media (max-width: 576px) {
  .success-checkmark-circle,
  .success-checkmark,
  .checkmark-svg {
    width: 80px;
    height: 80px;
  }

  .modal-body {
    padding: 2rem 1.5rem !important;
  }

  .success-circle-1 {
    width: 200px;
    height: 200px;
  }
}
</style>