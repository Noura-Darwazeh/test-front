<!-- src/modules/loginasdriver/view/loginasdriver.vue -->
<template>
  <div class="driver-login-container">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between py-3">
          <div class="logo-section d-flex align-items-center gap-2">
            <img :src="packageIcon" alt="Logo" width="40" height="40" />
            <h5 class="mb-0 fw-bold text-white">{{ $t('login.driverPortal') }}</h5>
          </div>
          
          <!-- Language Selector -->
          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button class="btn btn-light btn-sm" type="button">
                <i class="fas fa-globe me-1"></i>
                <span>{{ currentLanguageLabel }}</span>
              </button>
            </template>
            <template #menu="{ close }">
              <ul class="list-unstyled mb-0">
                <li>
                  <a class="dropdown-item" :class="{ active: currentLanguage === 'en' }"
                    @click.prevent="changeLanguage('en', close)">
                    English
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" :class="{ active: currentLanguage === 'ar' }"
                    @click.prevent="changeLanguage('ar', close)">
                    العربية
                  </a>
                </li>
              </ul>
            </template>
          </BaseDropdown>
        </div>
      </div>
    </header>

    <!-- Login Form -->
    <div class="login-content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-7">
            <div class="login-card">
              <!-- Icon -->
              <div class="text-center mb-4">
                <div class="driver-icon-wrapper mx-auto">
                  <i class="fas fa-truck fa-3x text-primary"></i>
                </div>
                <h3 class="fw-bold mt-3 mb-2">{{ $t('login.driverLogin') }}</h3>
                <p class="text-muted">{{ $t('login.driverSubtitle') }}</p>
              </div>

              <!-- Form -->
              <form @submit.prevent="onSubmit">
                <div class="mb-3">
                  <FormLabel :label="$t('login.usernameLabel')" for-id="username" :required="true" />
                  <TextField 
                    id="username" 
                    v-model="form.username" 
                    type="text"
                    :placeholder="$t('login.usernamePlaceholder')" 
                    :required="true" 
                  />
                  <small v-if="errors.username" class="text-danger d-block mt-1">
                    {{ errors.username }}
                  </small>
                </div>

                <div class="mb-4">
                  <FormLabel :label="$t('login.passwordLabel')" for-id="password" :required="true" />
                  <TextField 
                    id="password" 
                    v-model="form.password" 
                    type="password"
                    :placeholder="$t('login.passwordPlaceholder')" 
                    :minlength="6" 
                    :required="true" 
                  />
                  <small v-if="errors.password" class="text-danger d-block mt-1">
                    {{ errors.password }}
                  </small>
                </div>

                <!-- Error Alert -->
                <div v-if="authStore.error" class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ authStore.error }}
                </div>

                <!-- Submit Button -->
                <PrimaryButton 
                  :text="$t('login.signIn')" 
                  :loading-text="$t('login.signingIn')"
                  :loading="authStore.isLoading" 
                  type="submit" 
                  class="w-100 mb-3" 
                />

                <!-- Back to Main Login -->
                <div class="text-center">
                  <router-link to="/login" class="text-decoration-none">
                    <i class="fas fa-arrow-left me-1"></i>
                    {{ $t('login.backToMainLogin') }}
                  </router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="driver-footer">
      <div class="container">
        <p class="text-center text-muted mb-0">
          © 2024 {{ $t('login.companyName') }}. {{ $t('login.allRightsReserved') }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.js';
import { setLocale } from '@/i18n/index';
import FormLabel from '@/components/shared/FormLabel.vue';
import TextField from '@/components/shared/TextField.vue';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';
import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import packageIcon from '@/assets/login/package.svg';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const currentLanguage = ref(locale.value);
const form = reactive({ username: '', password: '' });
const errors = reactive({ username: '', password: '' });

const isRTL = computed(() => currentLanguage.value === 'ar');
const currentLanguageLabel = computed(() => currentLanguage.value === 'ar' ? 'العربية' : 'English');

const changeLanguage = (lang, close) => {
  currentLanguage.value = lang;
  setLocale(lang);
  close();
};

async function onSubmit() {
  errors.username = '';
  errors.password = '';
  authStore.clearError();

  if (!form.username) {
    errors.username = t('login.validation.usernameRequired');
    return;
  }
  if (!form.password) {
    errors.password = t('login.validation.passwordRequired');
    return;
  }
  if (form.password.length < 6) {
    errors.password = t('login.validation.passwordMinLength');
    return;
  }

  try {
    await authStore.login({ login: form.username, password: form.password });
    
    // Check if user is actually a driver
    if (authStore.userRole !== 'Driver') {
      authStore.clearError();
      errors.username = t('login.validation.notADriver');
      await authStore.logout();
      return;
    }

    const userLang = authStore.user?.language?.toLowerCase() === 'arabic' || 
                     authStore.user?.language === 'ar' ? 'ar' : 'en';
    setLocale(userLang);
    await nextTick();

    router.push(authStore.user?.default_page || '/work-plans');
  } catch (error) {
    console.error('❌ Driver login failed:', error.message);
  }
}
</script>

<style scoped>
.driver-login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Mobile Header */
.mobile-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-section img {
  filter: brightness(0) invert(1);
}

/* Login Content */
.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.driver-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Footer */
.driver-footer {
  padding: 1.5rem 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .driver-icon-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .driver-icon-wrapper i {
    font-size: 1.5rem !important;
  }
}
</style>