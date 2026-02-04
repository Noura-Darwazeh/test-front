<template>
  <button :type="type" :disabled="disabled || loading" @click="handleClick"
    class="btn btn-primary d-flex align-items-center gap-2 shadow-sm" :style="buttonStyle">
    <!-- Icon before -->
    <span v-if="iconBefore && !loading" class="icon-before" :style="iconStyle">
      <img :src="iconBefore" alt="" height="18" />
    </span>

    <!-- Text -->
    <span v-if="text">{{ loading ? loadingText : text }}</span>

    <!-- Icon after -->
    <span v-if="iconAfter && !loading" class="icon-after" :style="iconStyle">
      <img :src="iconAfter" alt="" height="18" />
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: '',
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
  iconColor: {
    type: String,
    default: "#fff",
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};

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

const iconStyle = computed(() => {
  if (props.disabled || props.loading) {
    return {};
  }

  if (props.iconColor === "#fff" || props.iconColor === "#ffffff" || props.iconColor === "white") {
    return {
      filter: "brightness(0) invert(1)"
    };
  }
  if (props.iconColor === "#000" || props.iconColor === "#000000" || props.iconColor === "black") {
    return {
      filter: "brightness(0)"
    };
  }

});

</script>

<style scoped>
.btn-primary {
  background-color: var(--primary-color);
  border: none;
  padding: 0.4rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
   display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.btn-primary:hover {
  background-color: var(--primary-color);
  opacity: 0.9;
  transform: translateY(-1px);
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
</style>