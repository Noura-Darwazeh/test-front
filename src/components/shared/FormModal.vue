<template>
  <!-- Modal -->
  <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
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

                  <PrimaryButton text="Upload Image" type="button" @click="triggerFileInput" :iconBefore="uploadIcon" />

                  <PrimaryButton v-if="imagePreview" text="Remove" type="button" bgColor="#dc3545" @click="removeImage"
                    :iconBefore="removeIcon" />
                </div>
                <small v-if="imageError" class="text-danger d-block mt-2">
                  {{ imageError }}
                </small>
              </div>
            </div>

            <!-- Dynamic Fields -->
            <div class="row g-3">
              <div v-for="field in fields" :key="field.name" :class="field.colClass || 'col-md-6'">
                <label class="form-label fw-semibold" :for="field.name">
                  {{ field.label }}
                  <span v-if="field.required" class="text-danger">*</span>
                </label>

                <!-- Text/Email/Tel/Password/Number/Date Input -->
                <input
                  v-if="['text', 'email', 'tel', 'password', 'number', 'datetime-local', 'date'].includes(field.type)"
                  :id="field.name" :type="field.type" class="form-control" v-model="formData[field.name]"
                  :placeholder="field.placeholder || field.label" :required="field.required"
                  :minlength="field.minlength" :step="field.step" :min="field.min" :max="field.max" />

                <!-- Select Dropdown -->
                <select v-else-if="field.type === 'select'" :id="field.name" class="form-select"
                  v-model="formData[field.name]" :required="field.required">
                  <option value="" disabled>
                    {{ field.placeholder || field.label }}
                  </option>
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
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
                        {{ field.orderLabel || 'Order' }}
                      </label>
                      <select class="form-select" v-model="formData[field.name][index].order">
                        <option value="" disabled> Select Order </option>
                        <option v-for="option in field.orderOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>

                    <div class="col-md-5">
                      <label class="form-label">
                        {{ field.itemsLabel || 'items' }}
                      </label>
                      <select class="form-select" v-model="formData[field.name][index].items">
                        <option value="" disabled> Select items </option>
                        <option v-for="option in field.itemsOptions" :key="option.value" :value="option.value">
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

                <!-- Error Message -->
                <small v-if="errors[field.name]" class="text-danger">
                  {{ errors[field.name] }}
                </small>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 d-flex justify-content-end gap-2">
              <PrimaryButton text="Cancel" @click="closeModal" bg-color="var(--color-secondary)" />
              <PrimaryButton text="Save" bgColor="var(--color-success)" loadingText="Saving..." :loading="isSubmitting"
                type="submit" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
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
  imageUploadLabel: { type: String, default: "Upload Profile Picture" },
  imageRequired: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "submit"]);

const formData = reactive({});
const errors = reactive({});
const isSubmitting = ref(false);
const imagePreview = ref(null);
const imageFile = ref(null);
const imageError = ref("");
const fileInput = ref(null);

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
              items: "",
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
              items: "",
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
    items: "",
  });
};

const removeOrderRow = (fieldName, index) => {
  if (!Array.isArray(formData[fieldName])) return;
  formData[fieldName].splice(index, 1);
};

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = "Please select a valid image file";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = "Image size should not exceed 5MB";
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
    imageError.value = "Profile picture is required";
    isValid = false;
  }

  props.fields.forEach((field) => {
    if (!field || !field.name) return;
    const value = formData[field.name];

    if (field.type === "orderRows" && Array.isArray(value)) {
      if (field.required) {
        value.forEach((row) => {
          if (!row.order || !row.items) {
            errors[field.name] = "الرجاء تعبئة كل الأوردرات والفيز";
            isValid = false;
          }
        });
      }
      return;
    }

    if (field.required) {
      // For multiselect, check if array is empty
      if (field.type === 'multiselect' && (!value || value.length === 0)) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
        return;
      }
      // For other fields, check if value is falsy
      if (field.type !== 'multiselect' && !value) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
        return;
      }
    }

    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = "Invalid email format";
      isValid = false;
      return;
    }

    if (field.minlength && value && value.length < field.minlength) {
      errors[field.name] = `Must be at least ${field.minlength} characters`;
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

// Watch for modal open/close
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      initializeForm();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
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