<template>
  <div class="search-filter-wrapper">
    <span class="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
    </span>
    <input
      type="search"
      class="form-control search-input"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
<script setup>
// --------------------- Props and Emits ---------------------
defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "Search...",
  },
});
defineEmits(["update:modelValue"]);
</script>
<style scoped>
.search-filter-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

.search-input {
  padding-left: 40px;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  height: 42px;
}

.search-input:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}
</style>
