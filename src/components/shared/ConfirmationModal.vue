<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="confirm-backdrop">
      <div v-if="isOpen" class="confirm-backdrop" @click.self="closeModal"></div>
    </Transition>

    <!-- Modal -->
    <Transition name="confirm-modal">
      <div v-if="isOpen" class="confirm-overlay" tabindex="-1" @click.self="closeModal">
        <div class="confirm-dialog">
          <div class="confirm-card">
            <!-- Header -->
            <div class="confirm-header">
              <h5 class="confirm-title">{{ title }}</h5>
              <button type="button" class="confirm-close-btn" @click="closeModal">&times;</button>
            </div>

            <!-- Body -->
            <div class="confirm-body">
              <p>{{ message }}</p>
            </div>

            <!-- Footer -->
            <div class="confirm-footer">
              <template v-if="reverseButtons">
                <PrimaryButton :text="confirmText" @click="handleConfirm" :bg-color="confirmColor" />
                <PrimaryButton :text="cancelText" @click="closeModal" bg-color="var(--color-secondary)" />
              </template>
              <template v-else>
                <PrimaryButton :text="cancelText" @click="closeModal" bg-color="var(--color-secondary)" />
                <PrimaryButton :text="confirmText" @click="handleConfirm" :bg-color="confirmColor" />
              </template>
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
  reverseButtons: {
    type: Boolean,
    default: false,
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

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight =
      (window.innerWidth - document.documentElement.clientWidth) + 'px';
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
});
</script>

<style>
/* ── Backdrop ── */
.confirm-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 1040;
}

/* ── Overlay (full-screen flex centering) ── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Dialog sizing ── */
.confirm-dialog {
  width: 100%;
  max-width: 480px;
}

/* ── Card ── */
.confirm-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

/* ── Header ── */
.confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.confirm-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.confirm-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.confirm-close-btn:hover {
  color: #212529;
}

/* ── Body ── */
.confirm-body {
  padding: 1.5rem 1.25rem;
  background: #fff;
}

.confirm-body p {
  margin: 0;
  font-size: 0.95rem;
  color: #495057;
  line-height: 1.5;
}

/* ── Footer ── */
.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* ── Backdrop transitions ── */
.confirm-backdrop-enter-active,
.confirm-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-backdrop-enter-from,
.confirm-backdrop-leave-to {
  opacity: 0;
}

/* ── Modal transitions ── */
.confirm-modal-enter-active {
  transition: opacity 0.2s ease;
}

.confirm-modal-enter-active .confirm-dialog {
  transition: transform 0.2s ease-out;
}

.confirm-modal-leave-active {
  transition: opacity 0.15s ease;
}

.confirm-modal-leave-active .confirm-dialog {
  transition: transform 0.15s ease-in;
}

.confirm-modal-enter-from,
.confirm-modal-leave-to {
  opacity: 0;
}

.confirm-modal-enter-from .confirm-dialog {
  transform: scale(0.9) translateY(-20px);
}

.confirm-modal-leave-to .confirm-dialog {
  transform: scale(0.95);
}
</style>
