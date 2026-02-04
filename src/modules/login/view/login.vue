<template>
  <div class="login-container">
    <!-- Language Selector -->
    <div class="position-fixed top-0 end-0 p-4" style="z-index: 1000;">
      <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
        <template #trigger>
          <button class="btn btn-light border-primary shadow-sm" type="button">
            <span>{{ currentLanguageLabel }}</span>
          </button>
        </template>
        <template #menu="{ close }">
          <ul class="list-unstyled mb-0">
            <li>
              <a class="dropdown-item rounded" :class="{ active: currentLanguage === 'en' }"
                @click.prevent="changeLanguage('en', close)">
                <div class="fw-semibold">English</div>
              </a>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <a class="dropdown-item rounded" :class="{ active: currentLanguage === 'ar' }"
                @click.prevent="changeLanguage('ar', close)">
                <div class="fw-semibold">العربية</div>
              </a>
            </li>
          </ul>
        </template>
      </BaseDropdown>
    </div>

    <div class="row g-0 min-vh-100">
      <!-- Form Section -->
      <div class="col-lg-6 bg-white d-flex align-items-center justify-content-center p-4">
        <div class="w-100" style="max-width: 480px;">
          <div class="text-center mb-5">
            <div class="logo-circle mx-auto mb-4">
              <img :src="packageIcon" alt="Logo" class="logo-icon" />
            </div>
            <h2 class="fw-bold mb-2">{{ $t('login.title') }}</h2>
            <p class="text-muted">{{ $t('login.subtitle') }}</p>
          </div>

          <form @submit.prevent="onSubmit">
            <div class="mb-4">
              <FormLabel :label="$t('login.emailLabel')" for-id="login" :required="true" />
              <TextField id="login" v-model="form.login" type="text"
                :placeholder="$t('login.emailPlaceholder')" :required="true" />
              <small v-if="errors.login" class="text-danger d-block mt-1">
                {{ errors.login }}
              </small>
            </div>

            <div class="mb-4">
              <FormLabel :label="$t('login.passwordLabel')" for-id="password" :required="true" />
              <TextField id="password" v-model="form.password" type="password"
                :placeholder="$t('login.passwordPlaceholder')" :minlength="6" :required="true" />
              <small v-if="errors.password" class="text-danger d-block mt-1">
                {{ errors.password }}
              </small>
            </div>

            <div v-if="authStore.error" class="alert alert-danger">
              <i class="fas fa-exclamation-triangle"></i> {{ authStore.error }}
            </div>

            <div class="text-end mb-4">
              <router-link to="/forgot-password" class="text-decoration-none fw-semibold forgot-link">
                 {{ $t('login.forgotPassword') }}
              </router-link>
            </div>

            <PrimaryButton :text="$t('login.signIn')" :loading-text="$t('login.signingIn')"
              :loading="authStore.isLoading" type="submit" class="w-100" />
          </form>
        </div>
      </div>

      <!-- Carousel Section -->
      <div class="col-lg-6 position-relative carousel-section d-none d-lg-block">
        <button class="btn carousel-btn position-absolute top-50 start-0 translate-middle-y ms-4" @click="prevSlide">
          <img :src="leftArrowIcon" alt="Previous" width="24" height="24"/>
        </button>
        <button class="btn carousel-btn position-absolute top-50 end-0 translate-middle-y me-4" @click="nextSlide">
          <img :src="rightArrowIcon" alt="Next" width="24" height="24" />
        </button>

        <transition-group name="slide">
          <div v-for="(slide, idx) in slides" :key="idx" v-show="idx === currentSlide" 
               class="position-absolute w-100 h-100">
            <img :src="slide.img" alt="slide" class="w-100 h-100 object-fit-cover" />
            <div class="overlay position-absolute top-0 start-0 w-100 h-100"></div>
            <div class="position-absolute bottom-0 start-0 text-white p-5 mb-5">
              <h3 class="display-5 fw-bold mb-3">{{ slide.title }}</h3>
              <p class="fs-5" style="max-width: 500px;">{{ slide.description }}</p>
            </div>
          </div>
        </transition-group>

        <div class="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-3">
          <button v-for="(slide, idx) in slides" :key="`dot-${idx}`"
            class="btn p-0 indicator-dot" :class="{ active: idx === currentSlide }" 
            @click="goToSlide(idx)">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../../stores/auth.js';
import FormLabel from '../../../components/shared/FormLabel.vue';
import TextField from '../../../components/shared/TextField.vue';
import PrimaryButton from '../../../components/shared/PrimaryButton.vue';
import BaseDropdown from '../../../components/shared/BaseDropdown.vue';
import { setLocale } from '@/i18n/index';
import packageIcon from '../../../assets/login/package.svg';
import leftArrowIcon from '../../../assets/login/left-arrow.svg';
import rightArrowIcon from '../../../assets/login/right-arrow.svg';

const router = useRouter();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const currentLanguage = ref(locale.value);
const currentSlide = ref(0);
let slideInterval = null;

const slides = [
  { img: new URL('../../../assets/login/slide1.jpg', import.meta.url).href, title: 'Secure Packaging', description: 'Professional packaging services to ensure your items arrive safely' },
  { img: new URL('../../../assets/login/slide2.jpg', import.meta.url).href, title: 'Professional Couriers', description: 'Experienced delivery team dedicated to excellence' },
  { img: new URL('../../../assets/login/slide3.jpg', import.meta.url).href, title: 'Safe Delivery', description: 'Track your packages in real-time with our advanced system' },
  { img: new URL('../../../assets/login/slide4.PNG', import.meta.url).href, title: 'Fast & Reliable', description: 'Quick delivery guaranteed with our efficient network' }
];

const form = reactive({ login: '', password: '' });
const errors = reactive({ login: '', password: '' });

const isRTL = computed(() => currentLanguage.value === 'ar');
const currentLanguageLabel = computed(() => currentLanguage.value === 'ar' ? 'العربية' : 'English');

onMounted(() => {
  // Language is already set from i18n/index.js, just sync with component
  currentLanguage.value = locale.value;
  
  slideInterval = setInterval(() => nextSlide(), 5000);
});

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval);
});

const changeLanguage = (lang, close) => {
  currentLanguage.value = lang;
  setLocale(lang);
  close();
  window.location.reload();
};

const nextSlide = () => currentSlide.value = (currentSlide.value + 1) % slides.length;
const prevSlide = () => currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
const goToSlide = (idx) => {
  currentSlide.value = idx;
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => nextSlide(), 5000);
};

async function onSubmit() {
  errors.login = '';
  errors.password = '';
  authStore.clearError();

  if (!form.login) {
    errors.login = t('login.validation.emailRequired');
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
    await authStore.login({ login: form.login, password: form.password });
    
    // Get user's preferred language
    const userLang = authStore.user?.language?.toLowerCase() === 'arabic' || 
                     authStore.user?.language === 'ar' ? 'ar' : 'en';
    
    // Save and apply user language
    setLocale(userLang);
    
    // Reload if language changed
    if (userLang !== currentLanguage.value) {
      window.location.reload();
      return;
    }
    
    router.push(authStore.user?.default_page || '/user');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  min-height: 100vh;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(var(--primary-color-rgb), 0.3);
  animation: pulse 2s infinite;
}

.logo-icon {
  width: 40px;
  filter: brightness(0) invert(1);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.forgot-link {
  color: var(--primary-color);
}

.forgot-link:hover {
  color: var(--primary-hover);
}

.carousel-section {
  overflow: hidden;
}

.overlay {
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.7), rgba(var(--primary-color-rgb), 0.7));
}

.carousel-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 20;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1) !important;
}

.carousel-btn img {
  filter: brightness(0) invert(1);
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  transition: all 0.3s;
}

.indicator-dot.active {
  width: 32px;
  border-radius: 6px;
  background: white;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.8s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
</style>