<template>
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative" style="padding:32px;">
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

        <div class="shadow rounded-4 bg-white overflow-hidden" style="max-width: 500px; width: 100%;">
            <!-- FORM SECTION - Centered -->
            <div class="d-flex align-items-center justify-content-center" style="padding: 48px 40px;">
                <div style="max-width: 420px; width: 100%;">
                    <div class="text-center mb-4">
                        <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style="width:64px;height:64px;background:var(--primary-color);color:#fff">
                            <img :src="packageIcon" alt="" width="28" height="28" class="icon-white" />
                        </div>
                        <h3 class="fw-bold mb-2">{{ $t('forgotPassword.title') }}</h3>
                        <p class="text-muted">{{ $t('forgotPassword.subtitle') }}</p>
                    </div>

                    <form @submit.prevent="onSubmit" class="needs-validation" novalidate>
                        <!-- Email Field -->
                        <div class="mb-3">
                            <FormLabel :label="$t('forgotPassword.emailLabel')" for-id="email" :required="true" />
                            <TextField
                                id="email"
                                v-model="email"
                                type="email"
                                :placeholder="$t('forgotPassword.emailPlaceholder')"
                                :required="true"
                                @input="clearErrors"
                            />
                            <div v-if="emailError" class="error-message">
                                {{ emailError }}
                            </div>
                        </div>

                        <!-- Submit Button - Centered -->
                        <div class="d-flex justify-content-center mb-3">
                            <PrimaryButton
                                :text="$t('forgotPassword.sendResetLink')"
                                :loading-text="$t('forgotPassword.sending')"
                                :loading="submitting"
                                type="submit"
                                :disabled="submitting"
                            />
                        </div>

                        <!-- ✅ Success Message -->
                        <div v-if="sent" class="alert alert-success d-flex align-items-start mt-3" role="alert">
                            <i class="fas fa-check-circle me-2 mt-1"></i>
                            <span>{{ successMessage }}</span>
                        </div>

                        <!-- Back to login -->
                        <div class="d-flex justify-content-end mt-3">
                            <router-link to="/login" class="text-decoration-none fw-semibold login-link">
                                {{ $t('forgotPassword.backToLogin') }}
                            </router-link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import BaseDropdown from '../../../components/shared/BaseDropdown.vue'
import packageIcon from '../../../assets/login/package.svg'
import apiServices from '@/services/apiServices.js'
import { setItem } from '@/utils/shared/storageUtils.js'
import { setLocale } from '@/i18n/index'

const router = useRouter()
const { t, locale } = useI18n()

const email = ref('')
const submitting = ref(false)
const sent = ref(false)
const emailError = ref('') 
const successMessage = ref('')

// ===== Language Logic =====
const currentLanguage = ref(locale.value);

const isRTL = computed(() => currentLanguage.value === 'ar');
const currentLanguageLabel = computed(() => {
  return currentLanguage.value === 'ar' ? 'العربية' : 'English';
});

onMounted(() => {
  detectBrowserLanguage();
});

const detectBrowserLanguage = () => {
  const savedLang = localStorage.getItem('lang');
  
  if (!savedLang) {
    const browserLang = navigator.language || navigator.userLanguage;
    
    if (browserLang.startsWith('ar')) {
      currentLanguage.value = 'ar';
      setLocale('ar');
    } else {
      currentLanguage.value = 'en';
      setLocale('en');
    }
  } else {
    currentLanguage.value = savedLang;
  }
};

const changeLanguage = (lang, closeDropdown) => {
  currentLanguage.value = lang;
  setLocale(lang);
  closeDropdown();
  window.location.reload();
};

// ✅ Clear errors when user types
const clearErrors = () => {
    emailError.value = ''
    sent.value = false
}

// ===== Form Logic =====
async function onSubmit() {
    // Clear previous errors
    emailError.value = ''
    sent.value = false

    // Validate email is not empty
    if (!email.value || !email.value.trim()) {
        emailError.value = t('forgotPassword.validation.emailRequired')
        return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
        emailError.value = t('forgotPassword.validation.emailInvalid')
        return
    }

    submitting.value = true

    try {
        const response = await apiServices.forgotPassword(email.value.trim())

        if (response.data.success === true) {
            const token = response.data.token || response.data.data?.token

            setItem('reset_email', email.value.trim())
            if (token) {
                setItem('reset_token', token)
            }

            successMessage.value = response.data.message || t('forgotPassword.successMessage')
            sent.value = true
            emailError.value = '' // ✅ Clear error on success

            // Optional: redirect after delay
            // setTimeout(() => {
            //     router.push('/login')
            // }, 5000)
        } else {
            throw new Error(response.data.message || t('forgotPassword.errors.sendFailed'))
        }
    } catch (error) {
        console.error('❌ Forgot password error:', error)

        // ✅ Handle different error cases - show under input
        if (error.response?.status === 404) {
            emailError.value = t('forgotPassword.errors.emailNotFound')
        } else if (error.response?.status === 422) {
            // ✅ Validation error
            const validationErrors = error.response?.data?.errors
            if (validationErrors?.email) {
                emailError.value = Array.isArray(validationErrors.email) 
                    ? validationErrors.email[0] 
                    : validationErrors.email
            } else {
                emailError.value = error.response?.data?.message || t('forgotPassword.validation.emailInvalid')
            }
        } else if (error.response?.status === 500) {
            // ✅ Server error
            emailError.value = t('forgotPassword.errors.serverError')
        } else if (error.response?.data?.message) {
            // ✅ Any other API error message
            emailError.value = error.response.data.message
        } else {
            // ✅ Generic error
            emailError.value = error.message || t('forgotPassword.errors.sendFailed')
        }
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.icon-white {
    filter: brightness(0) invert(1);
}

.login-link {
  color: var(--primary-color);
}

.login-link:hover {
  color: var(--primary-hover);
}

.error-message {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.error-message::before {
    content: "⚠";
    font-size: 1rem;
}



@media (max-width: 576px) {
    .language-selector-wrapper {
        top: 10px;
        right: 10px;
    }
}
</style>