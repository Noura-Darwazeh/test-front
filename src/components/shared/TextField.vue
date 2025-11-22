<template>
  <div class="position-relative">
    <input :id="id" :type="currentType" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
      class="form-control" :class="{ 'pe-5': type === 'password' }" :placeholder="placeholder" :required="required"
      :minlength="minlength" :maxlength="maxlength" :disabled="disabled" />

    <!-- Eye Icon for Password Toggle -->
    <button v-if="type === 'password'" type="button" @click="togglePasswordVisibility"
      class="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-0 me-2"
      style="z-index: 10;" tabindex="-1">
      <img v-if="showPassword" :src="showIcon" alt="" width="28" height="28" class="iconEye" />
      <img v-else :src="hideIcon" alt="" width="28" height="28" class="iconEye" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import showIcon from '../../assets/login/show.svg'
import hideIcon from '../../assets/login/hide.svg'

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  minlength: {
    type: [String, Number],
    default: null
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
const showPassword = ref(false)
const currentType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.form-control.pe-5 {
  padding-right: 2.5rem !important;
}

.iconEye {
  filter: brightness(0) saturate(100%) invert(46%) sepia(3%) saturate(1481%) hue-rotate(167deg) brightness(96%) contrast(88%);
}
</style>