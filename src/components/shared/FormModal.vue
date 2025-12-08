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
                <div class="modal-body p-4" style="max-height: 70vh;">
                    <form @submit.prevent="handleSubmit">
                        <!-- Image Upload Section -->
                        <div v-if="showImageUpload" class="mb-4 text-center">
                            <div class="p-3 bg-light rounded-3">
                                <div class="d-flex justify-content-center mb-3">
                                    <div class="position-relative" style="width: 150px; height: 150px;">
                                        <div
                                            class="rounded-circle overflow-hidden border border-3 border-light bg-white w-100 h-100 d-flex align-items-center justify-content-center">
                                            <img v-if="imagePreview" :src="imagePreview" alt="Preview"
                                                class="w-100 h-100" style="object-fit: cover;" />
                                            <div v-else
                                                class="d-flex flex-column align-items-center justify-content-center text-secondary p-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                                    fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
                                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                                    <path fill-rule="evenodd"
                                                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                                                </svg>
                                                <p class="mt-2 mb-0 text-muted small">{{ imageUploadLabel }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex gap-2 justify-content-center">
                                    <label for="imageUpload">
                                        <PrimaryButton text="Upload Image" :icon-before=uploadIcon type="button" />

                                    </label>
                                    <input type="file" id="imageUpload" class="d-none" accept="image/*"
                                        @change="handleImageUpload" ref="fileInput" />
                                        <PrimaryButton v-if="imagePreview" type="button"  text="Remove" :icon-before=uploadIcon @click="removeImage" />

                                    <!-- <button v-if="imagePreview" type="button" class="btn btn-sm btn-outline-danger"
                                        @click="removeImage">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            fill="currentColor" class="bi bi-trash me-1" viewBox="0 0 16 16">
                                            <path
                                                d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fill-rule="evenodd"
                                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
                                        Remove
                                    </button> -->
                                </div>
                                <small v-if="imageError" class="text-danger d-block mt-2">{{ imageError }}</small>
                            </div>
                        </div>

                        <!-- Dynamic Fields -->
                        <div class="row g-3">
                            <div v-for="field in fields" :key="field.name" :class="field.colClass || 'col-md-6'">
                                <label class="form-label fw-semibold" :for="field.name">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-danger">*</span>
                                </label>

                                <!-- Text/Email/Tel/Password/Number Input -->
                                <input v-if="['text', 'email', 'tel', 'password', 'number'].includes(field.type)"
                                    :id="field.name" :type="field.type" class="form-control"
                                    v-model="formData[field.name]" :placeholder="field.placeholder || field.label"
                                    :required="field.required" :minlength="field.minlength" :step="field.step" />

                                <!-- Select Dropdown -->
                                <select v-else-if="field.type === 'select'" :id="field.name" class="form-select"
                                    v-model="formData[field.name]" :required="field.required">
                                    <option value="" disabled>{{ field.placeholder || field.label }}</option>
                                    <option v-for="option in field.options" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </option>
                                </select>

                                <!-- Button -->
                                <button v-else-if="field.type === 'button'" type="button" class="btn btn-primary w-100"
                                    @click="field.onClick && field.onClick()">
                                    {{ field.text || field.label }}
                                </button>

                                <!-- Error Message -->
                                <small v-if="errors[field.name]" class="text-danger">
                                    {{ errors[field.name] }}
                                </small>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="mt-4 d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-secondary px-4" @click="closeModal">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary px-4" :disabled="isSubmitting">
                                <span v-if="isSubmitting">
                                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Saving...
                                </span>
                                <span v-else>Save</span>
                            </button>
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
import { ref, reactive, watch, onMounted } from 'vue';
import PrimaryButton from './PrimaryButton.vue';
import uploadIcon from '../../assets/modal/upload.svg'
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: 'Add New',
    },
    fields: {
        type: Array,
        required: true,
    },
    showImageUpload: {
        type: Boolean,
        default: true,
    },
    imageUploadLabel: {
        type: String,
        default: 'Upload Profile Picture',
    },
    imageRequired: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'submit']);

const formData = reactive({});
const errors = reactive({});
const isSubmitting = ref(false);
const imagePreview = ref(null);
const imageFile = ref(null);
const imageError = ref('');
const fileInput = ref(null);

// Initialize form
const initializeForm = () => {
    if (!props.fields || props.fields.length === 0) return;

    props.fields.forEach(field => {
        if (field && field.name) {
            formData[field.name] = field.defaultValue || '';
            errors[field.name] = '';
        }
    });
};

// Reset form
const resetForm = () => {
    if (!props.fields || props.fields.length === 0) return;

    props.fields.forEach(field => {
        if (field && field.name) {
            formData[field.name] = field.defaultValue || '';
            errors[field.name] = '';
        }
    });

    imagePreview.value = null;
    imageFile.value = null;
    imageError.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// Handle image upload
const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        imageError.value = 'Please select a valid image file';
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        imageError.value = 'Image size should not exceed 5MB';
        return;
    }

    imageError.value = '';
    imageFile.value = file;

    // Create preview
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
    imageError.value = '';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// Validate form
const validateForm = () => {
    let isValid = true;
    if (!props.fields || props.fields.length === 0) return false;

    // Clear all errors
    props.fields.forEach(field => {
        if (field && field.name) {
            errors[field.name] = '';
        }
    });

    // Validate each field
    props.fields.forEach(field => {
        if (!field || !field.name) return;
        const value = formData[field.name];

        // Required validation
        if (field.required && !value) {
            errors[field.name] = `${field.label} is required`;
            isValid = false;
            return;
        }

        // Email validation
        if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field.name] = 'Invalid email format';
            isValid = false;
            return;
        }

        // Minlength validation
        if (field.minlength && value && value.length < field.minlength) {
            errors[field.name] = `Must be at least ${field.minlength} characters`;
            isValid = false;
            return;
        }

        // Custom validation
        if (field.validate && typeof field.validate === 'function') {
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
    if (!validateForm()) {
        return;
    }

    // Validate image if required
    if (props.showImageUpload && props.imageRequired && !imageFile.value && !imagePreview.value) {
        imageError.value = 'Profile picture is required';
        return;
    }

    isSubmitting.value = true;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const submitData = { ...formData };
        if (imageFile.value) {
            submitData.image = imageFile.value;
            submitData.imagePreview = imagePreview.value;
        }

        emit('submit', submitData);
        resetForm();
        closeModal();
    } catch (error) {
        console.error('Error submitting form:', error);
    } finally {
        isSubmitting.value = false;
    }
};

// Close modal
const closeModal = () => {
    resetForm();
    emit('close');
};

// Initialize on mount
onMounted(() => {
    initializeForm();
});

// Watch for modal open/close
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        initializeForm();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Watch for fields change
watch(() => props.fields, () => {
    if (props.isOpen) {
        initializeForm();
    }
}, { deep: true });
</script>
