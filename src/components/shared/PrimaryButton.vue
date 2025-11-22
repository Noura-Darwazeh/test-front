
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
import { computed } from 'vue'
const props = defineProps({
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
  },
  iconBefore: {
    type: String,
    default: null
  },
  iconAfter: {
    type: String,
    default: null
  },
  bgColor: {
    type: String,
    default: 'var(--primary-color)'
  },
  textColor: {
    type: String,
    default: '#fff'
  }
})

const buttonStyle = computed(() => {
  if (props.disabled || props.loading) {
    return ''
  }
 return {
    background: props.bgColor,
    border: 'none',
    color: props.textColor
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

.icon-before,
.icon-after {
  display: flex;
  align-items: center;
}
</style>
