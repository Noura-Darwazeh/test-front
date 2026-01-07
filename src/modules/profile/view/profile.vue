<template>
  <div class="profile-container">
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
                  v-if="authStore.user?.image"
                  :src="authStore.user.image"
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
                class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 shadow"
                style="width: 36px; height: 36px"
                @click="openImageModal"
                type="button"
              >
                <!-- <img :src="cameraIcon" alt="camera" width="16" height="16" />-->
              </button>
            </div>
          </div>

          <!-- User Info -->
          <div class="col">
            <h3 class="mb-1 fw-bold">{{ authStore.user?.name }}</h3>
            <p class="text-muted mb-2">
              <!-- <img :src="mailIcon" alt="email" width="16" height="16" class="me-2" /> -->
              {{ authStore.user?.email || $t('profile.noEmail') }}
            </p>
            <p class="text-muted mb-2">
              <!-- <img :src="phoneIcon" alt="phone" width="16" height="16" class="me-2" /> -->
              {{ authStore.user?.phone_number }}
            </p>
            <span class="badge" :class="getRoleBadgeClass(authStore.userRole)">
              {{ $t(`roles.${authStore.userRole}`) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Details Cards -->
    <div class="row g-4">
      <!-- Personal Information Card -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom">
            <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
              <!-- <img :src="userInfoIcon" alt="info" width="24" height="24" /> -->
              {{ $t('profile.personalInfo') }}
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.id') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.id }}
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.fullName') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.name }}
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.username') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.username }}
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.email') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.email || $t('profile.noEmail') }}
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.phoneNumber') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.phone_number }}
                  </div>
                </div>
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
              <!-- <img :src="settingsIcon" alt="settings" width="24" height="24" /> -->
              {{ $t('profile.accountSettings') }}
            </h5>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.userRole') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ $t(`roles.${authStore.userRole}`) }}
                  </div>
                </div>
              </div>

              <div class="col-12" v-if="authStore.user?.company_name">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.company') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.company_name }}
                  </div>
                </div>
              </div>

              <div class="col-12" v-if="authStore.user?.region_name">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.region') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.region_name }}
                  </div>
                </div>
              </div>

              <div class="col-12" v-if="authStore.user?.currency_code">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('user.currency') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.currency_code }}
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="detail-item p-3 bg-light rounded-3">
                  <label class="detail-label text-muted small fw-semibold text-uppercase mb-1 d-block">
                    {{ $t('profile.language') }}
                  </label>
                  <div class="detail-value text-dark fw-medium">
                    {{ authStore.user?.language === 'arabic' ? 'العربية' : 'English' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-3 mt-4 justify-content-center">
      <PrimaryButton
        :text="$t('profile.editProfile')"
       
        bgColor="var(--primary-color)"
        @click="openEditModal"
      />
      <PrimaryButton
        :text="$t('profile.changePassword')"
       
        bgColor="var(--color-warning)"
        @click="openPasswordModal"
      />
    </div>

    <!-- Edit Profile Modal -->
    <FormModal
      :isOpen="isEditModalOpen"
      :title="$t('profile.editProfile')"
      :fields="profileFields"
      :showImageUpload="false"
      @close="closeEditModal"
      @submit="handleUpdateProfile"
    />

    <!-- Change Password Modal -->
    <FormModal
      :isOpen="isPasswordModalOpen"
      :title="$t('profile.changePassword')"
      :fields="passwordFields"
      :showImageUpload="false"
      @close="closePasswordModal"
      @submit="handleChangePassword"
    />

    <!-- Image Upload Modal -->
    <FormModal
      :isOpen="isImageModalOpen"
      :title="$t('profile.changeProfileImage')"
      :fields="[]"
      :showImageUpload="true"
      :imageRequired="false"
      @close="closeImageModal"
      @submit="handleUpdateImage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';
import FormModal from '@/components/shared/FormModal.vue';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';
import apiServices from '@/services/apiServices.js';

// Icons
import userIcon from '@/assets/modal/user.svg';
// import cameraIcon from '@/assets/profile/camera.svg';
// import mailIcon from '@/assets/profile/mail.svg';
// import phoneIcon from '@/assets/profile/phone.svg';
// import userInfoIcon from '@/assets/profile/userInfo.svg';
// import settingsIcon from '@/assets/profile/settings.svg';
// import editIcon from '@/assets/table/edit.svg';
// import lockIcon from '@/assets/profile/lock.svg';

const { t } = useI18n();
const authStore = useAuthStore();

// State
const isEditModalOpen = ref(false);
const isPasswordModalOpen = ref(false);
const isImageModalOpen = ref(false);

// Dynamic data
const regions = ref([]);
const currencies = ref([]);
const companies = ref([]);

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

onMounted(() => {
  fetchDropdownData();
});

// Profile Fields
const profileFields = computed(() => [
  {
    name: 'name',
    label: t('user.form.name'),
    type: 'text',
    required: true,
    placeholder: t('user.form.namePlaceholder'),
    colClass: 'col-12',
    defaultValue: authStore.user?.name || '',
  },
  {
    name: 'username',
    label: t('user.form.username'),
    type: 'text',
    required: true,
    placeholder: t('user.form.usernamePlaceholder'),
    colClass: 'col-12',
    defaultValue: authStore.user?.username || '',
  },
  {
    name: 'email',
    label: t('user.form.email'),
    type: 'email',
    required: false,
    placeholder: t('user.form.emailPlaceholder'),
    colClass: 'col-12',
    defaultValue: authStore.user?.email || '',
  },
  {
    name: 'phone_number',
    label: t('user.form.phoneNumber'),
    type: 'tel',
    required: true,
    placeholder: t('user.form.phoneNumberPlaceholder'),
    colClass: 'col-12',
    defaultValue: authStore.user?.phone_number || '',
  },
  {
    name: 'company_id',
    label: t('user.form.company'),
    type: 'select',
    required: false,
    options: companies.value,
    placeholder: t('user.form.companyPlaceholder'),
    colClass: 'col-12',
    defaultValue: String(authStore.user?.company_id || ''),
  },
  {
    name: 'region_id',
    label: t('user.form.region'),
    type: 'select',
    required: false,
    options: [
      { value: '', label: t('user.form.noRegion') },
      ...regions.value
    ],
    colClass: 'col-12',
    defaultValue: authStore.user?.region_id || '',
  },
  {
    name: 'currency_id',
    label: t('user.form.currency'),
    type: 'select',
    required: false,
    options: [
      { value: '', label: t('user.form.noCurrency') },
      ...currencies.value
    ],
    colClass: 'col-12',
    defaultValue: authStore.user?.currency_id || '',
  },
]);

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

// Modal handlers
const openEditModal = () => {
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const openPasswordModal = () => {
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => {
  isPasswordModalOpen.value = false;
};

const openImageModal = () => {
  isImageModalOpen.value = true;
};

const closeImageModal = () => {
  isImageModalOpen.value = false;
};

// Handle profile update
const handleUpdateProfile = async (userData) => {
  try {
    const updatedData = {};

    // Only include changed fields
    if (userData.name !== authStore.user?.name) {
      updatedData.name = userData.name;
    }
    if (userData.username !== authStore.user?.username) {
      updatedData.username = userData.username;
    }
    if (userData.email !== authStore.user?.email) {
      updatedData.email = userData.email || '';
    }
    if (userData.phone_number !== authStore.user?.phone_number) {
      updatedData.phone_number = userData.phone_number;
    }
    if (userData.company_id !== authStore.user?.company_id) {
      updatedData.company_id = userData.company_id || null;
    }
    if (userData.region_id !== authStore.user?.region_id) {
      updatedData.region_id = userData.region_id || null;
    }
    if (userData.currency_id !== authStore.user?.currency_id) {
      updatedData.currency_id = userData.currency_id || null;
    }

    const response = await apiServices.updateUser(authStore.user.id, updatedData);

    if (response.data?.data) {
      authStore.updateUser(response.data.data);
      console.log('✅ Profile updated successfully!');
      alert(t('profile.updateSuccess'));
      closeEditModal();
    }
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    alert(t('profile.updateError'));
  }
};

// Handle password change
const handleChangePassword = async (passwordData) => {
  try {
    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert(t('profile.passwordMismatch'));
      return;
    }

    const response = await apiServices.updateUser(authStore.user.id, {
      password: passwordData.new_password,
      current_password: passwordData.current_password,
    });

    if (response.data?.success) {
      console.log('✅ Password changed successfully!');
      alert(t('profile.passwordChangeSuccess'));
      closePasswordModal();
    }
  } catch (error) {
    console.error('❌ Failed to change password:', error);
    alert(t('profile.passwordChangeError'));
  }
};

// Handle image update
const handleUpdateImage = async (imageData) => {
  try {
    if (!imageData.imagePreview) {
      alert(t('profile.noImageSelected'));
      return;
    }

    const response = await apiServices.updateUser(authStore.user.id, {
      image: imageData.imagePreview,
    });

    if (response.data?.data) {
      authStore.updateUser(response.data.data);
      console.log('✅ Profile image updated successfully!');
      alert(t('profile.imageUpdateSuccess'));
      closeImageModal();
    }
  } catch (error) {
    console.error('❌ Failed to update profile image:', error);
    alert(t('profile.imageUpdateError'));
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
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-item {
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: #e9ecef !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-label {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>