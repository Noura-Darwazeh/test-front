<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
    </Transition>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="isOpen" class="modal d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <!-- Error Animation Background -->
          <div class="error-background">
            <div class="error-circle-1"></div>
            <div class="error-circle-2"></div>
            <div class="error-circle-3"></div>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-5 text-center position-relative">
            <!-- Error Icon with Animation -->
            <div class="error-icon-container mb-4">
              <div class="error-x-circle">
                <div class="error-x-mark">
                  <svg class="x-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="x-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="x-line-1" fill="none" d="M16 16 36 36"/>
                    <path class="x-line-2" fill="none" d="M36 16 16 36"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Title with Fade In -->
            <h3 class="fw-bold text-danger mb-3 title-fade-in">{{ title }}</h3>

            <!-- Message with Slide Up -->
            <p class="text-muted mb-4 message-slide-up">{{ message }}</p>

            <!-- Button with Scale -->
            <div class="button-scale d-flex justify-content-center">
              <PrimaryButton
                :text="$t('common.ok')"
                @click="closeModal"
                bgColor="var(--color-danger, #dc3545)"
                class="px-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
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
    default: 'Error',
  },
  message: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

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
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
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

/* ===== Error Background Animation ===== */
.error-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.error-circle-1,
.error-circle-2,
.error-circle-3 {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
}

.error-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation: float 6s ease-in-out infinite;
}

.error-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite reverse;
}

.error-circle-3 {
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

/* ===== Error Icon Animation ===== */
.error-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-x-circle {
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

.error-x-mark {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  position: relative;
}

.x-svg {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #dc3545;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #dc3545;
  animation: fillCircle 0.4s ease-in-out 0.4s forwards,
             scaleCircle 0.3s ease-in-out 0.9s both;
}

.x-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #dc3545;
  fill: none;
  animation: strokeCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.x-line-1,
.x-line-2 {
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 29;
  stroke-dashoffset: 29;
}

.x-line-1 {
  animation: strokeCheck 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.x-line-2 {
  animation: strokeCheck 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.95s forwards;
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
    box-shadow: inset 0px 0px 0px 60px #dc3545;
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
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
  transition: all 0.3s ease;
}

/* ===== Responsive ===== */
@media (max-width: 576px) {
  .error-x-circle,
  .error-x-mark,
  .x-svg {
    width: 80px;
    height: 80px;
  }

  .modal-body {
    padding: 2rem 1.5rem !important;
  }

  .error-circle-1 {
    width: 200px;
    height: 200px;
  }
}
</style>
