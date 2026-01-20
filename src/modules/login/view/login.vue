<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light" style="padding:32px;">
    <div class="row shadow rounded-4 bg-white overflow-hidden g-0" style="max-width:1200px; width:100%">
      <!-- LEFT: FORM -->
      <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center" style="padding: 48px 40px;">
        <div style="max-width: 420px; width: 100%;">
          <div class="text-center mb-4">
            <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style="width:64px;height:64px;background:var(--primary-color);color:#fff">
              <img :src="packageIcon" alt="" width="28" height="28" class="icon-white" />
            </div>
            <h3 class="mb-0">Welcome Back</h3>
            <p class="text-muted">Sign in to access your delivery dashboard</p>
          </div>

          <form @submit.prevent="onSubmit" class="needs-validation" novalidate>
            <!-- Email/Login Field -->
            <div class="mb-3">
              <FormLabel label="Email or Username" for-id="login" :required="true" />
              <TextField 
                id="login" 
                v-model="form.login" 
                type="text" 
                placeholder="Enter your email or username"
                :required="true" 
              />
              <small v-if="errors.login" class="text-danger">{{ errors.login }}</small>
            </div>

            <!-- Password Field -->
            <div class="mb-3">
              <FormLabel label="Password" for-id="password" :required="true" />
              <TextField 
                id="password" 
                v-model="form.password" 
                type="password" 
                placeholder="••••••••"
                :minlength="6" 
                :required="true" 
              />
              <small v-if="errors.password" class="text-danger">{{ errors.password }}</small>
            </div>

            <!-- Error Message from API -->
            <div v-if="authStore.error" class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>
              {{ authStore.error }}
            </div>

            <!-- Forgot Password Link -->
            <div class="d-flex justify-content-end mb-3">
              <router-link 
                to="/forgot-password" 
                class="text-decoration-none"
                style="color:var(--primary-color);font-size:14px"
              >
                Forgot Password?
              </router-link>
            </div>

            <!-- Submit Button -->
            <PrimaryButton 
              text="Sign In" 
              loading-text="Signing In..." 
              :loading="authStore.isLoading" 
              type="submit" 
            />
          </form>
        </div>
      </div>

      <!-- RIGHT: CAROUSEL -->
      <div class="col-12 col-lg-6 p-0 position-relative d-flex align-items-center d-none d-lg-flex"
        style="min-height:600px">
        <div class="w-100 h-100 position-relative">
          <div class="carousel slide h-100" ref="carousel" data-bs-ride="carousel" data-bs-interval="3000">
            <div class="carousel-inner h-100">
              <div v-for="(slide, idx) in slides" :key="idx"
                :class="['carousel-item', 'h-100', idx === 0 ? 'active' : '']">
                <img :src="slide.img" class="d-block w-100 h-100" style="object-fit:cover;" alt="slide" />
                <div class="position-absolute text-white"
                  style="left:20px;bottom:20px;text-shadow:0 2px 6px rgba(0,0,0,0.6)">
                  <h6 class="mb-1">{{ slide.text }}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.js';
import FormLabel from '../../../components/shared/FormLabel.vue';
import TextField from '../../../components/shared/TextField.vue';
import PrimaryButton from '../../../components/shared/PrimaryButton.vue';
import { setLocale } from '@/i18n/index';
import packageIcon from '../../../assets/login/package.svg';

const router = useRouter();
const authStore = useAuthStore();

const slides = [
  {
    img: new URL('../../../assets/login/slide1.jpg', import.meta.url).href,
    text: 'Secure Packaging'
  },
  {
    img: new URL('../../../assets/login/slide2.jpg', import.meta.url).href,
    text: 'Professional Couriers'
  },
  {
    img: new URL('../../../assets/login/slide3.jpg', import.meta.url).href,
    text: 'Safe Delivery'
  },
  {
    img: new URL('../../../assets/login/slide4.PNG', import.meta.url).href,
    text: 'Fast & Reliable Delivery'
  }
];

const form = reactive({ 
  login: '', 
  password: '' 
});

const errors = reactive({ 
  login: '', 
  password: '' 
});

const resolveUiLocale = (language) => {
  const normalized = (language || '').toLowerCase();
  if (normalized === 'arabic' || normalized === 'ar') return 'ar';
  return 'en';
};

async function onSubmit() {
  // Clear previous errors
  errors.login = '';
  errors.password = '';
  authStore.clearError();

  // Validate form
  if (!form.login) {
    errors.login = 'Email or username is required';
    return;
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
    return;
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    return;
  }

  try {
    // Attempt login
    await authStore.login({
      login: form.login,
      password: form.password
    });

    const uiLang = resolveUiLocale(authStore.user?.language);
    const currentLang = localStorage.getItem('lang') || 'en';
    setLocale(uiLang);

    if (uiLang !== currentLang) {
      window.location.reload();
      return;
    }

    // Redirect to user's landing page on success
    console.log('✅ Login successful, redirecting...');
      const defaultPage = authStore.user?.default_page || '/user';
    router.push(defaultPage);
  } catch (error) {
    // Error is already set in the store
    console.error('❌ Login failed:', error.message);
  }
}
</script>

<style scoped>
.icon-white {
  filter: brightness(0) invert(1);
}

@media (max-width: 991px) {
  .carousel .position-absolute {
    left: 12px;
    bottom: 12px;
  }
}
</style>
