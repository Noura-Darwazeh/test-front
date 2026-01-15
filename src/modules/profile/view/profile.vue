<template>
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Profile Header Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <!-- Profile Image -->
            <div class="col-auto">
              <div class="position-relative">
                <div
                  class="rounded-circle overflow-hidden border border-3 border-light bg-white shadow-sm"
                  style="width: 120px; height: 120px"
                >
                  <img
                    v-if="formData.imagePreview || userProfile?.image"
                    :src="formData.imagePreview || getImageUrl(userProfile.image)"
                    alt="Profile"
                    class="w-100 h-100"
                    style="object-fit: cover"
                  />
                  <div
                    v-else
                    class="d-flex flex-column align-items-center justify-content-center h-100 bg-light"
                  >
                    <img :src="userIcon" alt="user" width="50" height="50" />
                  </div>
                </div>
                <!-- Edit Profile Image Button -->
                <button
                  class="btn btn-sm rounded-circle position-absolute bottom-0 end-0 shadow"
                  style="width: 36px; height: 36px"
                  @click="triggerFileInput"
                  type="button"
                >
                  <img :src="cameraIcon" alt="camera" width="16" height="16" />
                </button>
                <input
                  type="file"
                  class="d-none"
                  accept="image/*"
                  @change="handleImageUpload"
                  ref="fileInput"
                />
              </div>
            </div>

            <!-- User Info -->
            <div class="col">
              <h3 class="mb-1 fw-bold">{{ formData.name || userProfile?.name }}</h3>
              <p class="text-muted mb-2">
                {{ formData.email || userProfile?.email || $t('profile.noEmail') }}
              </p>
              <p class="text-muted mb-2">
                {{ formData.phone_number || userProfile?.phone_number }}
              </p>
              <span class="badge" :class="getRoleBadgeClass(userProfile?.role?.[0])">
                {{ $t(`roles.${userProfile?.role?.[0]}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="handleSaveChanges">
        <div class="row g-4">
          <!-- Personal Information Card -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <img :src="userIcon" alt="user" width="32" height="32" />
                  {{ $t('profile.personalInfo') }}
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- ID (Read-only) -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.id')" />
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="userProfile?.id"
                      disabled
                    />
                  </div>

                  <!-- Full Name -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.fullName')" :required="true" />
                    <TextField
                      v-model="formData.name"
                      type="text"
                      :placeholder="$t('user.form.namePlaceholder')"
                      @input="markAsChanged"
                    />
                  </div>

                  <!-- Username -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.username')" :required="true" />
                    <TextField
                      v-model="formData.username"
                      type="text"
                      :placeholder="$t('user.form.usernamePlaceholder')"
                      @input="markAsChanged"
                    />
                  </div>

                  <!-- Email -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.email')" />
                    <TextField
                      v-model="formData.email"
                      type="email"
                      :placeholder="$t('user.form.emailPlaceholder')"
                      @input="markAsChanged"
                    />
                  </div>

                  <!-- Phone Number -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.phoneNumber')" :required="true" />
                    <TextField
                      v-model="formData.phone_number"
                      type="tel"
                      :placeholder="$t('user.form.phoneNumberPlaceholder')"
                      @input="markAsChanged"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Settings Card -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <img :src="settingIcon" alt="settings" width="32" height="32" />
                  {{ $t('profile.accountSettings') }}
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- User Role (Read-only) -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.userRole')" />
                    <input
                      type="text"
                      class="form-control bg-light"
                      :value="$t(`roles.${userProfile?.role?.[0]}`)"
                      disabled
                    />
                  </div>

                  <!-- Company -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.company')" />
                    <select
                      v-model="formData.company_id"
                      class="form-select"
                      @change="markAsChanged"
                    >
                      <option value="">{{ $t('user.form.companyPlaceholder') }}</option>
                      <option
                        v-for="company in companies"
                        :key="company.value"
                        :value="company.value"
                      >
                        {{ company.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Region -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.region')" />
                    <select
                      v-model="formData.region_id"
                      class="form-select"
                      @change="markAsChanged"
                    >
                      <option value="">{{ $t('user.form.noRegion') }}</option>
                      <option
                        v-for="region in regions"
                        :key="region.value"
                        :value="region.value"
                      >
                        {{ region.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Currency -->
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.currency')" />
                    <select
                      v-model="formData.currency_id"
                      class="form-select"
                      @change="markAsChanged"
                    >
                      <option value="">{{ $t('user.form.noCurrency') }}</option>
                      <option
                        v-for="currency in currencies"
                        :key="currency.value"
                        :value="currency.value"
                      >
                        {{ currency.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Default Landing Page -->
                  <div class="col-12">
                    <FormLabel :label="$t('profile.defaultLandingPage')" />
                    <select
                      v-model="formData.default_page"
                      class="form-select"
                      @change="markAsChanged"
                    >
                      <option
                        v-for="page in availablePages"
                        :key="page.value"
                        :value="page.value"
                      >
                        {{ page.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Language -->
                  <div class="col-12">
                    <FormLabel :label="$t('profile.language')" />
                    <select
                      v-model="formData.language"
                      class="form-select"
                      @change="handleLanguageChange"
                    >
                      <option value="english">{{ $t('profile.languages.english') }}</option>
                      <option value="arabic">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <Transition name="slide-up">
          <div
            v-if="hasChanges"
            class="fixed-action-bar bg-white border-top shadow-lg"
          >
            <div class="container-fluid">
              <div class="d-flex gap-3 justify-content-center align-items-center py-3">
                <PrimaryButton
                  :text="$t('common.cancel')"
                  bgColor="var(--color-secondary)"
                  @click="handleCancel"
                  type="button"
                />
                <PrimaryButton
                  :text="$t('common.saveChanges')"
                  bgColor="var(--color-success)"
                  :loading="isSaving"
                  type="submit"
                />
                <PrimaryButton
                  :text="$t('profile.changePassword')"
                  bgColor="var(--color-warning)"
                  @click="openPasswordModal"
                  type="button"
                />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Change Password Button (when no changes) -->
        <div v-if="!hasChanges" class="d-flex gap-3 mt-4 justify-content-center">
          <PrimaryButton
            :text="$t('profile.changePassword')"
            bgColor="var(--color-warning)"
            @click="openPasswordModal"
            type="button"
          />
        </div>
      </form>

      <!-- Change Password Modal -->
      <FormModal
        :isOpen="isPasswordModalOpen"
        :title="$t('profile.changePassword')"
        :fields="passwordFields"
        :showImageUpload="false"
        @close="closePasswordModal"
        @submit="handleChangePassword"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import FormModal from '@/components/shared/FormModal.vue';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';
import FormLabel from '@/components/shared/FormLabel.vue';
import TextField from '@/components/shared/TextField.vue';
import apiServices from '@/services/apiServices.js';
import { setLocale } from '@/i18n/index';
import cameraIcon from '@/assets/profile/camera.svg';
import settingIcon from '@/assets/profile/setting.svg';
import userIcon from '@/assets/sidebar/userIcon.svg';

// ✅ API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://192.168.100.35:80';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// State
const isLoading = ref(true);
const userProfile = ref(null);
const isPasswordModalOpen = ref(false);
const isSaving = ref(false);
const hasChanges = ref(false);
const fileInput = ref(null);

const resolveIdValue = (value) => {
  if (Array.isArray(value)) {
    return value[0] === null || value[0] === undefined ? "" : String(value[0]);
  }
  if (value && typeof value === "object") {
    return value.id === null || value.id === undefined ? "" : String(value.id);
  }
  return value === null || value === undefined ? "" : String(value);
};

const resolveUiLocale = (language) => {
  const normalized = (language || "").toLowerCase();
  if (normalized === "arabic" || normalized === "ar") return "ar";
  return "en";
};

// Form data
const formData = reactive({
  name: '',
  username: '',
  email: '',
  phone_number: '',
  company_id: '',
  region_id: '',
  currency_id: '',
  language: 'english',
  default_page: '/user',
  imagePreview: null,
  imageBase64: null,
});

// Original data for comparison
const originalData = ref({});

// Dynamic data
const regions = ref([]);
const currencies = ref([]);
const companies = ref([]);

// Available pages for landing page selection
const availablePages = computed(() => {
  const routes = router.getRoutes()
    .filter(route => route.meta?.showInSidebar)
    .map(route => ({
      value: route.path,
      label: route.meta.titleKey ? t(route.meta.titleKey) : route.name
    }));
  
  return routes;
});

// Password Fields
const passwordFields = computed(() => [
  {
    name: 'current_password',
    label: t('profile.currentPassword'),
    type: 'password',
    required: true,
    placeholder: t('profile.currentPasswordPlaceholder'),
    colClass: 'col-12',
    minlength: 6,
  },
  {
    name: 'new_password',
    label: t('profile.newPassword'),
    type: 'password',
    required: true,
    placeholder: t('profile.newPasswordPlaceholder'),
    colClass: 'col-12',
    minlength: 6,
  },
  {
    name: 'confirm_password',
    label: t('profile.confirmPassword'),
    type: 'password',
    required: true,
    placeholder: t('profile.confirmPasswordPlaceholder'),
    colClass: 'col-12',
    minlength: 6,
  },
]);

// ✅ Fetch User Profile from API
const fetchUserProfile = async () => {
  try {
    isLoading.value = true;
    const userId = authStore.user?.id;
    
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    const response = await apiServices.getUserProfile(userId);
    userProfile.value = response.data.data;
    
    console.log('✅ User profile loaded:', userProfile.value);
    
    // Initialize form with fetched data
    initializeFormData();
    
  } catch (error) {
    console.error('❌ Failed to fetch user profile:', error);
    alert(t('profile.loadError') || 'Failed to load profile');
  } finally {
    isLoading.value = false;
  }
};

// Fetch dropdown data
const fetchDropdownData = async () => {
  try {
    const [regionsResponse, currenciesResponse, companiesResponse] = await Promise.all([
      apiServices.getRegions(),
      apiServices.getCurrencies(),
      apiServices.getCompanies()
    ]);

    regions.value = regionsResponse.data.data.map(region => ({
      value: String(region.id),
      label: region.name
    }));

    currencies.value = currenciesResponse.data.data.map(currency => ({
      value: String(currency.id),
      label: `${currency.code} (${currency.symbol})`
    }));

    companies.value = companiesResponse.data.data.map(company => ({
      value: String(company.id),
      label: company.name
    }));
  } catch (error) {
    console.error('❌ Failed to load dropdown data:', error);
  }
};

// Initialize form data from userProfile
const initializeFormData = () => {
  if (!userProfile.value) return;
  
  const user = userProfile.value;
  
  formData.name = user.name || '';
  formData.username = user.username || '';
  formData.email = user.email || '';
  formData.phone_number = user.phone_number || '';
  formData.company_id = resolveIdValue(user.company);
  formData.region_id = resolveIdValue(user.region);
  formData.currency_id = resolveIdValue(user.currency);
  formData.language = user.language || 'english';
  formData.default_page = user.default_page || user.landing_page || '/user';
  formData.imagePreview = null;
  formData.imageBase64 = null;

  // Store original data
  originalData.value = {
    name: formData.name,
    username: formData.username,
    email: formData.email,
    phone_number: formData.phone_number,
    company_id: formData.company_id,
    region_id: formData.region_id,
    currency_id: formData.currency_id,
    language: formData.language,
    default_page: formData.default_page,
  };
};

// ✅ Get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

// Mark as changed
const markAsChanged = () => {
  hasChanges.value = true;
};

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert(t('common.validation.invalidImageFile'));
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert(t('common.validation.imageMaxSize', { size: 5 }));
    return;
  }

  // ✅ Store the actual File object
  // formData.imageFile = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.imagePreview = e.target.result;
    formData.imageBase64 = e.target.result.split(',')[1]; // Store base64 without prefix
    markAsChanged();
  };
  reader.readAsDataURL(file);
};

// Trigger file input
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Handle language change
const handleLanguageChange = async () => {
  markAsChanged();
  
  // Update UI language immediately for better UX
  const uiLang = resolveUiLocale(formData.language);
  setLocale(uiLang);
};

// Handle save changes
const handleSaveChanges = async () => {
  const languageChanged = formData.language !== originalData.value.language;
  try {
    isSaving.value = true;

    // Prepare data to send
    const updatedData = {
      name: formData.name,
      email: formData.email || '',
      phone_number: formData.phone_number,
      company_id: formData.company_id || null,
      region_id: formData.region_id || null,
      currency_id: formData.currency_id || null,
      language: formData.language,
    };

    // Only include username if it changed
    if (formData.username !== originalData.value.username) {
      updatedData.username = formData.username;
    }

    // Add image if it exists
    if (formData.imageBase64) {
      updatedData.image = formData.imageBase64;
    }

    console.log("📤 Sending update data:", {
      ...updatedData,
      image: updatedData.image ? 'File object' : 'No image'
    });

    // Send POST request to /api/users/{id}
    const response = await apiServices.updateUser(userProfile.value.id, updatedData);

    if (response.data?.data) {
      const userData = response.data.data;
      
      // Build full image URL if needed
      if (userData.image && !userData.image.startsWith('http')) {
        userData.image = `${API_BASE_URL}${userData.image}`;
      }
      
      // Update auth store
      authStore.updateUser(userData);
      
      console.log('✅ Profile updated successfully!', userData);
      alert(t('profile.updateSuccess') || 'Profile updated successfully!');

      // Reload if language changed
      if (languageChanged) {
        const uiLang = resolveUiLocale(formData.language);
        setLocale(uiLang);
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      
      // Reload profile data from API
      await fetchUserProfile();
      hasChanges.value = false;
    }
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    const errorMessage = error.response?.data?.message || error.message || t('profile.updateError') || 'Failed to update profile';
    alert(errorMessage);
  } finally {
    isSaving.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  if (confirm(t('common.confirmCancel'))) {
    initializeFormData();
    hasChanges.value = false;
  }
};

// Modal handlers
const openPasswordModal = () => {
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
};

// Handle password change
const handleChangePassword = async (passwordData) => {
  try {
    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert(t('profile.passwordMismatch'));
      return;
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#]).{8,}$/;
    if (!passwordRegex.test(passwordData.new_password)) {
      alert('Password must contain:\n- At least one uppercase letter\n- At least one lowercase letter\n- At least one symbol (@$!%*?&#)\n- Minimum 8 characters');
      return;
    }
    
    const response = await apiServices.changePassword({
      current_password: passwordData.current_password,
      password: passwordData.new_password,
      password_confirmation: passwordData.confirm_password
    });

    if (response.data?.message) {
      console.log('✅ Password changed successfully!', response.data);
      alert(t('profile.passwordChangeSuccess'));
      closePasswordModal();
      
      // Logout after password change
      setTimeout(() => {
        authStore.logout();
        router.push('/login');
      }, 1000);
    }
  } catch (error) {
    console.error('❌ Failed to change password:', error);
    alert(error.message || t('profile.passwordChangeError'));
  }
};

// Get role badge class
const getRoleBadgeClass = (role) => {
  const roleClasses = {
    SuperAdmin: 'bg-danger',
    Admin: 'bg-primary',
    Employee: 'bg-info',
    Supervisor: 'bg-warning text-dark',
    Driver: 'bg-success',
  };
  return roleClasses[role] || 'bg-secondary';
};

// Initialize on mount
onMounted(async () => {
  await fetchDropdownData();
  await fetchUserProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 100px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.form-control,
.form-select {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-control.bg-light {
  background-color: #f9fafb !important;
  cursor: not-allowed;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

/* Fixed Action Bar */
.fixed-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>