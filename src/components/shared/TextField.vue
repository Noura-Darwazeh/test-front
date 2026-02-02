<template>
  <div class="position-relative">
    <input
      :id="id"
      :type="currentType"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'pe-5': type === 'password' }"
      :placeholder="placeholder"
      :required="required"
      :minlength="minlength"
      :maxlength="maxlength"
      :disabled="disabled"
    />

    <button
      v-if="type === 'password'"
      type="button"
      @click="togglePasswordVisibility"
      class="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-0 me-2"
      style="z-index: 10"
      tabindex="-1"
    >
      <img
        v-if="showPassword"
        :src="showIcon"
        alt=""
        width="24"
        height="24"
        class="iconEye"
      />
      <img
        v-else
        :src="hideIcon"
        alt=""
        width="24"
        height="24"
        class="iconEye"
      />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import showIcon from "../../assets/login/show.svg";
import hideIcon from "../../assets/login/hide.svg";

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  minlength: {
    type: [String, Number],
    default: null,
  },
  maxlength: {
    type: [String, Number],
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
const showPassword = ref(false);
const currentType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<style scoped>
.form-control {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all var(--transition-base);
  background: white;
  color: var(--neutral-800);
}

.form-control::placeholder {
  color: var(--neutral-400);
  font-weight: 400;
}

.form-control:hover {
  border-color: var(--border-medium);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 4px var( --primary-text);
}

.form-control.pe-5 {
  padding-right: 3rem !important;
}

.btn {
  transition: all var(--transition-base);
}

.btn:hover {
  transform: scale(1.1);
}

.iconEye {
  filter: brightness(0) saturate(100%) invert(46%) sepia(3%) saturate(1481%)
    hue-rotate(167deg) brightness(96%) contrast(88%);
  transition: all var(--transition-base);
}

.btn:hover .iconEye {
  filter: brightness(0) saturate(100%) invert(38%) sepia(89%) saturate(2166%)
    hue-rotate(227deg) brightness(97%) contrast(92%);
}
</style>
