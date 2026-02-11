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
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-semibold">{{ title }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4">
            <p class="mb-0">{{ message }}</p>
          </div>

          <!-- Footer -->
          <div class="modal-footer bg-light">
            <PrimaryButton :text="cancelText" @click="closeModal" bg-color="var(--color-secondary)" />
            <PrimaryButton :text="confirmText" @click="handleConfirm" :bg-color="confirmColor" />
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
    default: 'Confirm',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  confirmColor: {
    type: String,
    default: 'var(--color-danger)',
  },
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
  emit('close');
};

const handleConfirm = () => {
  emit('confirm');
  closeModal();
};

// Prevent body scroll when modal is open with scrollbar compensation
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
</style>
