<template>
    <!-- Modal -->
    <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg border-0 rounded-3">
                <!-- Header -->
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-semibold">{{ title }}</h5>
                    <button type="button" class="btn-close" @click="closeModal"></button>
                </div>
                <!-- Body -->
                <div class="modal-body p-4">
                    <form @submit.prevent="handleSubmit">
                        <div class="row g-3">
                            <!-- Dynamic Fields -->
                            <div v-for="field in fields" :key="field.name" :class="field.colClass || 'col-md-6'">
                                <label class="form-label fw-semibold" :for="field.name">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-danger">*</span>
                                </label>
                                <!-- Text/Email/Tel/Password Input -->
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
                                <span v-if="isSubmitting">Saving...</span>
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
});
const emit = defineEmits(['close', 'submit']);
const formData = reactive({});
const errors = reactive({});
const isSubmitting = ref(false);
// Initialize formData based on fields
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
    isSubmitting.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        emit('submit', { ...formData });
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
    }
});
// Watch for fields change
watch(() => props.fields, () => {
    if (props.isOpen) {
        initializeForm();
    }
}, { deep: true });
</script>