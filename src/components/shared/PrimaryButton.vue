<!-- <template>
  <button :type="type" :disabled="disabled || loading" class="btn w-100 py-2"
    :class="disabled || loading ? 'btn-secondary' : 'btn-primary'"
    :style="disabled || loading ? '' : 'background: var(--primary-color);border:none'">
    {{ loading ? loadingText : text }}
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})
</script>

<style scoped>
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover) !important;
  transform: translateY(-1px);
  transition: all 0.2s;
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
</style> -->

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
    :style="buttonStyle"
  >
    <!-- Icon before -->
    <span v-if="iconBefore && !loading" class="icon-before">
      <img :src="iconBefore" alt="" height="18" />
    </span>

    <!-- Text -->
    {{ loading ? loadingText : text }}

    <!-- Icon after -->
    <span v-if="iconAfter && !loading" class="icon-after">
      <img :src="iconAfter" alt="" height="18" />
    </span>
  </button>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  loadingText: {
    type: String,
    default: "Loading...",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "button",
  },
  iconBefore: {
    type: String,
    default: null,
  },
  iconAfter: {
    type: String,
    default: null,
  },
  bgColor: {
    type: String,
    default: "var(--primary-color)",
  },
  textColor: {
    type: String,
    default: "#fff",
  },
});

const buttonStyle = computed(() => {
  if (props.disabled || props.loading) {
    return "";
  }
  return {
    background: props.bgColor,
    border: "none",
    color: props.textColor,
  };
});
</script>
<style scoped>
.btn {
  font-weight: 600;
  font-size: 1rem;
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.5rem !important;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--neutral-300) !important;
  color: var(--neutral-500) !important;
}

.icon-before,
.icon-after {
  display: flex;
  align-items: center;
  transition: transform var(--transition-base);
}

.btn:hover:not(:disabled) .icon-before {
  transform: translateX(-2px);
}

.btn:hover:not(:disabled) .icon-after {
  transform: translateX(2px);
}
</style>
