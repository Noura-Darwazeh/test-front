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
                                                <img :src=userIcon alt="user" width="50" height="50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex gap-2 justify-content-center">
                                    <input type="file" class="d-none" accept="image/*" @change="handleImageUpload"
                                        ref="fileInput" />

                                    <PrimaryButton text="Upload Image" type="button" @click="triggerFileInput"
                                        :iconBefore="uploadIcon" />

                                    <PrimaryButton v-if="imagePreview" text="Remove" type="button" bgColor="#dc3545"
                                        @click="removeImage" :iconBefore="removeIcon" />
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

                                <!--  Location Button if needed -->
                                <PrimaryButton v-else-if="field.type === 'button'" type="button"
                                    :text="field.text || field.label" @click="field.onClick && field.onClick()">
                                    {{ field.text || field.label }}
                                </PrimaryButton>
                                <!-- Error Message -->
                                <small v-if="errors[field.name]" class="text-danger">
                                    {{ errors[field.name] }}
                                </small>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="mt-4 d-flex justify-content-end gap-2">
                            <PrimaryButton text="Cancel" @click="closeModal" bg-color="var(--color-secondary)" />
                            <PrimaryButton text="Save" bgColor="var(--color-success)" loadingText="Saving..."
                                :loading="isSubmitting" type="submit" />
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
import uploadIcon from '../../assets/modal/upload.svg';
import removeIcon from '../../assets/table/recycle.svg';
import userIcon from '../../assets/modal/user.svg';


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

    // Clear all errors
    props.fields.forEach(field => {
        if (field && field.name) {
            errors[field.name] = '';
        }
    });

    // Validate image if required
    if (props.showImageUpload && props.imageRequired && !imageFile.value && !imagePreview.value) {
        imageError.value = 'Profile picture is required';
        isValid = false;
    }

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
    isSubmitting.value = true;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const submitData = { ...formData };

        // add image
        if (imageFile.value) {
            submitData.image = imageFile.value;
            submitData.imagePreview = imagePreview.value;
        }

        console.log('Submitting data with image:', submitData);
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
