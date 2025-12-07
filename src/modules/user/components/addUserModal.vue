<template>
  <!-- Modal -->
  <div
    v-if="isOpen"
    class="modal fade show d-block"
    tabindex="-1"
    @click.self="closeModal"
  >
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

              <!-- Name -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="name">
                  {{ $t('user.name') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  class="form-control"
                  v-model="formData.name"
                  :placeholder="$t('user.name')"
                  required
                />
                <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
              </div>

              <!-- Email -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="email">
                  {{ $t('user.email') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  v-model="formData.email"
                  :placeholder="$t('user.email')"
                  required
                />
                <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
              </div>

              <!-- Password -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="password">
                  Password <span class="text-danger">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  v-model="formData.password"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
                <small v-if="errors.password" class="text-danger">{{ errors.password }}</small>
              </div>

              <!-- Phone -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="phoneNumber">
                  {{ $t('user.phoneNumber') }}
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  class="form-control"
                  v-model="formData.phoneNumber"
                  :placeholder="$t('user.phoneNumber')"
                  required
                />
                <small v-if="errors.phoneNumber" class="text-danger">{{ errors.phoneNumber }}</small>
              </div>

              <!-- Role -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="role">
                  {{ $t('user.role') }}
                  <span class="text-danger">*</span>
                </label>

                <select
                  id="role"
                  class="form-select"
                  v-model="formData.role"
                  required
                >
                  <option value="" disabled>{{ $t('user.role') }}</option>
                  <option value="Admin">{{ $t('roles.Admin') }}</option>
                  <option value="User">{{ $t('roles.User') }}</option>
                  <option value="Manager">{{ $t('roles.Manager') }}</option>
                </select>

                <small v-if="errors.role" class="text-danger">{{ errors.role }}</small>
              </div>

              <!-- Region ID -->
              <div class="col-md-6">
                <label class="form-label fw-semibold" for="regionId">
                  Region ID <span class="text-danger">*</span>
                </label>
                <input
                  id="regionId"
                  type="text"
                  class="form-control"
                  v-model="formData.regionId"
                  placeholder="Region ID"
                  required
                />
                <small v-if="errors.regionId" class="text-danger">{{ errors.regionId }}</small>
              </div>

              <!-- Company ID -->
              <div class="col-md-12">
                <label class="form-label fw-semibold" for="companyId">
                  Company ID <span class="text-danger">*</span>
                </label>
                <input
                  id="companyId"
                  type="text"
                  class="form-control"
                  v-model="formData.companyId"
                  placeholder="Company ID"
                  required
                />
                <small v-if="errors.companyId" class="text-danger">{{ errors.companyId }}</small>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-4 d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary px-4" @click="closeModal">
                {{ $t('cancel') }}
              </button>

              <button type="submit" class="btn btn-primary px-4" :disabled="isSubmitting">
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>{{ $t('save') }}</span>
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
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLabel from '@/components/shared/FormLabel.vue';
import TextField from '@/components/shared/TextField.vue';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Add New User',
  },
});

const emit = defineEmits(['close', 'submit']);

const formData = reactive({
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: '',
  regionId: '',
  companyId: '',
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: '',
  regionId: '',
  companyId: '',
});

const isSubmitting = ref(false);

const resetForm = () => {
  formData.name = '';
  formData.email = '';
  formData.password = '';
  formData.phoneNumber = '';
  formData.role = '';
  formData.regionId = '';
  formData.companyId = '';
  
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
};

const validateForm = () => {
  let isValid = true;
  
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
    isValid = false;
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
    isValid = false;
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required';
    isValid = false;
  }

  if (!formData.role) {
    errors.role = 'Role is required';
    isValid = false;
  }

  if (!formData.regionId.trim()) {
    errors.regionId = 'Region ID is required';
    isValid = false;
  }

  if (!formData.companyId.trim()) {
    errors.companyId = 'Company ID is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Simulate API call
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

const closeModal = () => {
  resetForm();
  emit('close');
};

// Prevent body scroll when modal is open
watch(() => props.isOpen, (newVal) => {
  console.log('Modal state changed:', newVal);
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>
