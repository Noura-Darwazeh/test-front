<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content shadow-lg border-0 rounded-3">
        <!-- Header -->
        <div class="modal-header bg-light border-bottom">
          <h5 class="modal-title fw-semibold">{{ title }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4" style="max-height: 70vh">
          <form @submit.prevent="handleSubmit">
            <!-- Image Upload Section -->
            <div v-if="showImageUpload" class="mb-4 text-center">
              <div class="p-3 bg-light rounded-3">
                <div class="d-flex justify-content-center mb-3">
                  <div class="position-relative" style="width: 150px; height: 150px">
                    <div
                      class="rounded-circle overflow-hidden border border-3 border-light bg-white w-100 h-100 d-flex align-items-center justify-content-center">
                      <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="w-100 h-100"
                        style="object-fit: cover" />
                      <div v-else
                        class="d-flex flex-column align-items-center justify-content-center text-secondary p-3">
                        <img :src="userIcon" alt="user" width="50" height="50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-center">
                  <input type="file" class="d-none" accept="image/*" @change="handleImageUpload" ref="fileInput" />

                  <PrimaryButton :text="uploadLabel" type="button" @click="triggerFileInput" :iconBefore="uploadIcon" />

                  <PrimaryButton v-if="imagePreview" :text="removeLabel" type="button" bgColor="#dc3545" @click="removeImage"
                    :iconBefore="removeIcon" />
                </div>
                <small v-if="imageError" class="text-danger d-block mt-2">
                  {{ imageError }}
                </small>
              </div>
            </div>

            <!-- Dynamic Fields -->
            <div class="row g-3">
              <div
                v-for="field in fields"
                :key="field.name"
                :class="field.hidden ? 'd-none' : field.colClass || 'col-md-6'"
              >
                <input v-if="field.hidden" type="hidden" v-model="formData[field.name]" />
                <template v-else>
                  <label class="form-label fw-semibold" :for="field.name">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>

                <!-- Text/Email/Tel/Password/Number/Date Input -->
                <input
                  v-if="['text', 'email', 'tel', 'password', 'number', 'datetime-local', 'date'].includes(field.type)"
                  :id="field.name" :type="field.type" class="form-control" v-model="formData[field.name]"
                  :placeholder="field.placeholder || field.label" :required="field.required"
                  :minlength="field.minlength" :step="field.step" :min="field.min" :max="field.max"
                  :disabled="field.disabled" :readonly="field.readonly" />

                <!-- Select Dropdown -->
                <select v-else-if="field.type === 'select'" :id="field.name" class="form-select"
                  v-model="formData[field.name]" :required="field.required"
                  :disabled="field.disabled || field.locked"
                  :class="{ 'locked-select': field.locked }">
                  <option value="" disabled>
                    {{ field.placeholder || field.label }}
                  </option>
                  <option v-for="option in getSelectOptions(field)" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>

                <!-- Multi-Select Dropdown -->
                <select
                  v-else-if="field.type === 'multiselect'"
                  :id="field.name"
                  class="form-select"
                  v-model="formData[field.name]"
                  :required="field.required"
                  :disabled="field.disabled || field.locked"
                  multiple
                  :size="field.size || 5"
                  style="min-height: 120px;"
                >
                  <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <!-- Button field -->
                <PrimaryButton v-else-if="field.type === 'button'" type="button" :text="field.text || field.label"
                  @click="field.onClick && field.onClick()">
                  {{ field.text || field.label }}
                </PrimaryButton>

                <!-- Order + items dynamic rows with + -->
                <div v-else-if="field.type === 'orderRows'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">{{ field.label }}</span>

                    <PrimaryButton type="button" @click="addOrderRow(field.name)" bgColor="var(--color-success)"
                      :iconBefore="addIcon" />
                  </div>

                  <div v-for="(row, index) in formData[field.name]" :key="index" class="row g-2 align-items-end mb-2">
                    <div class="col-md-5">
                      <label class="form-label">
                        {{ field.orderLabel || t('common.order') }}
                      </label>
                      <select class="form-select" v-model="formData[field.name][index].order" @change="formData[field.name][index].items = ''">
                        <option value="" disabled>{{ t('common.selectOrder') }}</option>
                        <option v-for="option in getOrderOptionsForField(field)" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>

                    <div class="col-md-5">
                      <label class="form-label">
                        {{ field.itemsLabel || t('common.items') }}
                      </label>
                      <select 
                        class="form-select" 
                        v-model="formData[field.name][index].items" 
                        :disabled="!formData[field.name][index].order"
                        multiple
                        :size="field.itemsSize || 5"
                        style="min-height: 120px;"
                      >
                        <option v-for="option in getItemsOptions(field, formData[field.name][index].order)" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>

                    <div class="col-md-2">

                      <PrimaryButton type="button" @click="removeOrderRow(field.name, index)"
                        bgColor="var(--color-danger)" :iconBefore="crossIcon" />

                    </div>
                  </div>
                </div>

                <!-- Branch name dynamic rows with + -->
                <div v-else-if="field.type === 'branchRows'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">{{ field.label }}</span>

                    <PrimaryButton type="button" @click="addBranchRow(field.name)" bgColor="var(--color-success)"
                      :iconBefore="addIcon" />
                  </div>

                  <div v-for="(row, index) in formData[field.name]" :key="index" class="row g-2 align-items-end mb-2">
                    <div class="col-md-10">
                      <label class="form-label">
                        {{ field.branchLabel || t('company.form.branchName') }}
                      </label>
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="formData[field.name][index].name"
                        :placeholder="field.branchLabel || t('company.form.branchName')"
                      />
                    </div>

                    <div class="col-md-2">
                      <PrimaryButton type="button" @click="removeBranchRow(field.name, index)"
                        bgColor="var(--color-danger)" :iconBefore="crossIcon" />
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <small v-if="errors[field.name]" class="text-danger">
                  {{ errors[field.name] }}
                </small>
                </template>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 d-flex justify-content-end gap-2">
              <PrimaryButton :text="t('common.cancel')" @click="closeModal" bg-color="var(--color-secondary)" />
              <PrimaryButton :text="t('common.save')" bgColor="var(--color-success)" :loadingText="t('common.saving')" :loading="isSubmitting"
                type="submit" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import PrimaryButton from "./PrimaryButton.vue";
import uploadIcon from "../../assets/modal/upload.svg";
import removeIcon from "../../assets/table/recycle.svg";
import userIcon from "../../assets/modal/user.svg";
import addIcon from "../../assets/table/add.svg";
import crossIcon from "../../assets/modal/cross.svg";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: "Add New" },
  fields: { type: Array, required: true },
  showImageUpload: { type: Boolean, default: true },
  imageUploadLabel: { type: String, default: "" },
  imageRequired: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "submit"]);

const { t } = useI18n();

const formData = reactive({});
const errors = reactive({});
const isSubmitting = ref(false);
const imagePreview = ref(null);
const imageFile = ref(null);
const imageError = ref("");
const fileInput = ref(null);

const uploadLabel = computed(() =>
  props.imageUploadLabel ? props.imageUploadLabel : t("common.uploadImage")
);
const removeLabel = computed(() => t("common.remove"));

// Get select options (supports computed properties)
const getSelectOptions = (field) => {
  if (!field.options) return [];
  
  // Check if it's a Vue ref/computed (has value property)
  if (typeof field.options === 'object' && 'value' in field.options) {
    const options = unref(field.options);
    return Array.isArray(options) ? options : [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(field.options)) {
    return field.options;
  }
  
  return [];
};

// Get order options for a field
const getOrderOptionsForField = (field) => {
  // If field has a function to get order options, use it
  if (field.getOrderOptions && typeof field.getOrderOptions === 'function') {
    return field.getOrderOptions() || [];
  }
  
  // If field has orderOptions
  if (field.orderOptions) {
    // Check if it's a Vue ref/computed (has value property)
    if (typeof field.orderOptions === 'object' && 'value' in field.orderOptions) {
      const options = unref(field.orderOptions);
      console.log("📋 Order options from computed:", options);
      return Array.isArray(options) ? options : [];
    }
    
    // If it's already an array, return it
    if (Array.isArray(field.orderOptions)) {
      console.log("📋 Order options from array:", field.orderOptions);
      return field.orderOptions;
    }
  }
  
  // Otherwise, return empty array
  console.log("⚠️ No order options found for field:", field.name);
  return [];
};

// Get items options based on selected order
const getItemsOptions = (field, selectedOrder) => {
  if (!selectedOrder) {
    return [];
  }
  
  // If field has a function to get items options, use it
  if (field.getItemsOptions && typeof field.getItemsOptions === 'function') {
    return field.getItemsOptions(selectedOrder) || [];
  }
  
  // Otherwise, use static itemsOptions
  return field.itemsOptions || [];
};

// Initialize form
const initializeForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  props.fields.forEach((field) => {
    if (field && field.name) {
      if (field.type === "orderRows") {
        formData[field.name] =
          field.defaultValue ||
          [
            {
              order: "",
              items: [],
            },
          ];
      } else if (field.type === "branchRows") {
        // NEW: Handle branchRows
        formData[field.name] =
          field.defaultValue ||
          [
            {
              name: "",
            },
          ];
      } else {
        // Initialize multiselect fields as arrays
      if (field.type === 'multiselect') {
        formData[field.name] = field.defaultValue || [];
      } else {
        formData[field.name] = field.defaultValue || "";
      }
      }
      errors[field.name] = "";
    }
  });
};

// Reset form
const resetForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  props.fields.forEach((field) => {
    if (field && field.name) {
      if (field.type === "orderRows") {
        formData[field.name] =
          field.defaultValue ||
          [
            {
              order: "",
              items: [],
            },
          ];
      } else if (field.type === "branchRows") {
        // NEW: Handle branchRows
        formData[field.name] =
          field.defaultValue ||
          [
            {
              name: "",
            },
          ];
      } else {
        // Reset multiselect fields as arrays
      if (field.type === 'multiselect') {
        formData[field.name] = field.defaultValue || [];
      } else {
        formData[field.name] = field.defaultValue || "";
      }
      }
      errors[field.name] = "";
    }
  });

  imagePreview.value = null;
  imageFile.value = null;
  imageError.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Add / Remove order rows
const addOrderRow = (fieldName) => {
  if (!Array.isArray(formData[fieldName])) {
    formData[fieldName] = [];
  }
  formData[fieldName].push({
    order: "",
    items: [],
  });
};

const removeOrderRow = (fieldName, index) => {
  if (!Array.isArray(formData[fieldName])) return;
  formData[fieldName].splice(index, 1);
};

// Add / Remove branch rows
const addBranchRow = (fieldName) => {
  if (!Array.isArray(formData[fieldName])) {
    formData[fieldName] = [];
  }
  formData[fieldName].push({
    name: ""
  });
};

const removeBranchRow = (fieldName, index) => {
  if (!Array.isArray(formData[fieldName])) return;
  formData[fieldName].splice(index, 1);
};

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = t("common.validation.invalidImageFile");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = t("common.validation.imageMaxSize", { size: 5 });
    return;
  }

  imageError.value = "";
  imageFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Remove image
const removeImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  imageError.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Trigger file input click
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Validate form
const validateForm = () => {
  let isValid = true;
  if (!props.fields || props.fields.length === 0) return false;

  props.fields.forEach((field) => {
    if (field && field.name) {
      errors[field.name] = "";
    }
  });

  if (props.showImageUpload && props.imageRequired && !imageFile.value && !imagePreview.value) {
    imageError.value = t("common.validation.imageRequired");
    isValid = false;
  }

  props.fields.forEach((field) => {
    if (!field || !field.name) return;
    const value = formData[field.name];

    if (field.type === "orderRows" && Array.isArray(value)) {
      if (field.required) {
        value.forEach((row) => {
          if (!row.order || !row.items || (Array.isArray(row.items) && row.items.length === 0)) {
            errors[field.name] = t("common.validation.orderRowRequired");
            isValid = false;
          }
        });
      }
      return;
    }

    // NEW: Validate branchRows
    if (field.type === "branchRows" && Array.isArray(value)) {
      if (field.required) {
        const hasEmptyBranch = value.some(row => !row.name || row.name.trim() === "");
        if (hasEmptyBranch) {
          errors[field.name] = t("common.validation.branchNameRequired");
          isValid = false;
        }
      }
      return;
    }

    if (field.required) {
      // For multiselect, check if array is empty
      if (field.type === 'multiselect' && (!value || value.length === 0)) {
        errors[field.name] = t("common.validation.requiredField", { field: field.label });
        isValid = false;
        return;
      }
      // For other fields, check if value is falsy
      if (field.type !== 'multiselect' && !value) {
        errors[field.name] = t("common.validation.requiredField", { field: field.label });
        isValid = false;
        return;
      }
    }

    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = t("common.validation.invalidEmail");
      isValid = false;
      return;
    }

    if (field.minlength && value && value.length < field.minlength) {
      errors[field.name] = t("common.validation.minLength", { min: field.minlength });
      isValid = false;
      return;
    }

    if (field.validate && typeof field.validate === "function") {
      const validationError = field.validate(value);
      if (validationError) {
        errors[field.name] = validationError;
        isValid = false;
      }
    }
  });

  return isValid;
};

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const submitData = { ...formData };

    if (imageFile.value) {
      submitData.image = imageFile.value;
      submitData.imagePreview = imagePreview.value;
    }

    emit("submit", submitData);

    resetForm();
    closeModal();
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Close modal
const closeModal = () => {
  resetForm();
  emit("close");
};

// Initialize on mount
onMounted(() => {
  initializeForm();
});

// Watch for modal open/close with smooth handling and scrollbar compensation
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      initializeForm();
      // Calculate scrollbar width BEFORE hiding overflow to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Apply both styles simultaneously in one operation to minimize reflow
      requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      });
    } else {
      // Remove styles in one operation
      requestAnimationFrame(() => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      });
    }
  }
);

// Watch for fields change
watch(
  () => props.fields,
  () => {
    if (props.isOpen) {
      initializeForm();
    }
  },
  { deep: true }
);
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
  /* Performance optimizations */
  will-change: opacity;
  backface-visibility: hidden;
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
  /* CSS isolation to prevent affecting main page */
  contain: layout style paint;
  will-change: opacity;
  backface-visibility: hidden;
  /* Create new stacking context */
  isolation: isolate;
}

.modal-dialog {
  /* Optimize rendering performance */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.modal-content {
  /* Prevent layout shifts */
  contain: layout style;
}

.locked-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 0.75rem;
}
</style>