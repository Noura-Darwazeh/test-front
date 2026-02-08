<template>
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light" style="padding:32px;">
        <div class="row shadow rounded-4 bg-white overflow-hidden g-0" style="max-width:1200px; width:100%">
            <!-- Loading State -->
            <div v-if="isValidatingToken" class="col-12 d-flex align-items-center justify-content-center" style="min-height:600px; padding: 48px 40px;">
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <h5 class="mb-2">{{ $t('resetPassword.validating') }}</h5>
                    <p class="text-muted">{{ $t('resetPassword.validatingMessage') }}</p>
                </div>
            </div>

            <!-- Invalid Token State -->
            <div v-else-if="!isTokenValid" class="col-12 d-flex align-items-center justify-content-center" style="min-height:600px; padding: 48px 40px;">
                <div class="text-center" style="max-width: 420px;">
                    <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style="width:64px;height:64px;background:#dc3545;color:#fff">
                        <i class="fas fa-exclamation-triangle" style="font-size: 28px;"></i>
                    </div>
                    <h3 class="mb-3 text-danger">{{ $t('resetPassword.invalidTitle') }}</h3>
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        {{ apiError }}
                    </div>
                    <p class="text-muted mb-4">
                        {{ $t('resetPassword.expirationMessage') }}
                    </p>
                    <PrimaryButton
                        :text="$t('resetPassword.requestNewLink')"
                        @click="router.push('/forgot-password')"
                        bg-color="var(--primary-color)"
                    />
                    <div class="mt-3">
                        <small class="text-muted">{{ $t('resetPassword.redirectingIn5') }}</small>
                    </div>
                </div>
            </div>

            <!-- Valid Token - Show Reset Form -->
            <template v-else>
                <!-- LEFT: FORM -->
                <div class="col-12 col-lg-6 d-flex align-items-center justify-content-center" style="padding: 48px 40px;">
                    <div style="max-width: 420px; width: 100%;">
                        <div class="text-center mb-4">
                            <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                style="width:64px;height:64px;background:var(--primary-color);color:#fff">
                                <img :src="packageIcon" alt="" width="28" height="28" class="icon-white" />
                            </div>
                            <h3 class="mb-0">{{ $t('resetPassword.title') }}</h3>
                            <p class="text-muted">{{ $t('resetPassword.subtitle') }}</p>
                        </div>

                        <form @submit.prevent="onSubmit" class="needs-validation" novalidate>
                            <!-- New Password Field -->
                            <div class="mb-3">
                                <FormLabel :label="$t('resetPassword.newPasswordLabel')" for-id="password" :required="true" />
                                <TextField
                                    id="password"
                                    v-model="form.password"
                                    type="password"
                                    :placeholder="$t('resetPassword.passwordPlaceholder')"
                                    :minlength="6"
                                    :required="true"
                                />
                                <small v-if="errors.password" class="text-danger">{{ errors.password }}</small>
                                <small v-else class="text-muted d-block mt-1">
                                    {{ $t('resetPassword.validation.passwordMin') }}
                                </small>
                            </div>

                            <!-- Confirm Password Field -->
                            <div class="mb-3">
                                <FormLabel :label="$t('resetPassword.confirmPasswordLabel')" for-id="password_confirmation" :required="true" />
                                <TextField
                                    id="password_confirmation"
                                    v-model="form.password_confirmation"
                                    type="password"
                                    :placeholder="$t('resetPassword.passwordPlaceholder')"
                                    :minlength="6"
                                    :required="true"
                                />
                                <small v-if="errors.password_confirmation" class="text-danger">
                                    {{ errors.password_confirmation }}
                                </small>
                            </div>

                            <!-- API Error Message -->
                            <div v-if="apiError && isTokenValid" class="alert alert-danger" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>
                                {{ apiError }}
                            </div>

                            <!-- Submit Button -->
                            <div class="mb-3">
                                <PrimaryButton
                                    :text="$t('resetPassword.resetButton')"
                                    :loading-text="$t('resetPassword.resetting')"
                                    :loading="submitting"
                                    :disabled="!isFormValid"
                                    type="submit"
                                />
                            </div>

                            <!-- Success Message -->
                            <div v-if="success" class="alert alert-success mt-3" role="alert">
                                <i class="fas fa-check-circle me-2"></i>
                                {{ successMessage }}
                                <br>
                                <small>{{ $t('resetPassword.redirectingToLogin') }}</small>
                            </div>

                            <!-- Back to login -->
                            <div class="mt-3 text-center">
                                <router-link to="/login" class="text-decoration-none"
                                    style="color:var(--primary-color);font-size:14px">
                                    {{ $t('resetPassword.backToLogin') }}
                                </router-link>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- RIGHT: Info Section -->
                <div class="col-12 col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
                    style="background: var(--primary-color); color: #fff; min-height:600px; padding: 40px;">
                    <div class="text-center">
                        <h2 class="mb-3">{{ $t('resetPassword.secureResetTitle') }}</h2>
                        <p class="mb-0">{{ $t('resetPassword.secureResetSubtitle') }}</p>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'
import api from '@/services/api.js'
import { getItem, removeItem } from '@/utils/shared/storageUtils.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const form = reactive({
    password: '',
    password_confirmation: ''
})

const errors = reactive({
    password: '',
    password_confirmation: ''
})

const submitting = ref(false)
const success = ref(false)
const apiError = ref('')
const successMessage = ref(t('resetPassword.successMessage'))
const isValidatingToken = ref(true)
const isTokenValid = ref(false)

// Get token and email from URL or localStorage
const token = ref('')
const email = ref('')

/**
 * Validate the reset token with the API
 */
async function validateResetToken() {
    try {
        isValidatingToken.value = true
        apiError.value = ''

        const response = await api.get('/password/reset/validate', {
            params: {
                token: token.value,
                email: email.value
            }
        })

        if (response.data.success === true) {
            isTokenValid.value = true
        } else {
            throw new Error(response.data.message || 'Invalid token')
        }
    } catch (err) {
        console.error('❌ Token validation failed:', err)
        
        isTokenValid.value = false
        
        // Handle different error scenarios
        if (err.response?.data?.message) {
            apiError.value = err.response.data.message
        } else if (err.response?.status === 400 || err.response?.status === 404) {
            apiError.value = t('resetPassword.errors.expiredLink')
        } else {
            apiError.value = err.message || t('resetPassword.errors.invalidLink')
        }

        // Redirect to forgot password after 5 seconds
        setTimeout(() => {
            router.push('/forgot-password')
        }, 5000)
    } finally {
        isValidatingToken.value = false
    }
}

onMounted(async () => {
    // Try to get token and email from URL query parameters
    token.value = route.query.token || getItem('reset_token', '')
    email.value = route.query.email || getItem('reset_email', '')

    // Validate that we have both token and email
    if (!token.value || !email.value) {
        console.error('❌ Missing token or email')
        apiError.value = t('resetPassword.errors.missingToken')
        isValidatingToken.value = false
        isTokenValid.value = false
        
        // Redirect to forgot password after 3 seconds
        setTimeout(() => {
            router.push('/forgot-password')
        }, 3000)
    } else {
        // Validate the token with the API
        await validateResetToken()
    }
})

// Computed property to check if form is valid
const isFormValid = computed(() => {
    return form.password.length >= 6 && 
           form.password === form.password_confirmation &&
           !errors.password && 
           !errors.password_confirmation
})

// Validate passwords match
const validatePasswords = () => {
    errors.password = ''
    errors.password_confirmation = ''

    if (form.password.length > 0 && form.password.length < 6) {
        errors.password = t('resetPassword.validation.passwordMin')
        return false
    }

    if (form.password_confirmation.length > 0 &&
        form.password !== form.password_confirmation) {
        errors.password_confirmation = t('resetPassword.validation.passwordsNotMatch')
        return false
    }

    return true
}

async function onSubmit() {
    // Clear previous errors
    errors.password = ''
    errors.password_confirmation = ''
    apiError.value = ''

    // Validate form
    if (!form.password || form.password.length < 6) {
        errors.password = t('resetPassword.validation.passwordMin')
        return
    }

    if (!form.password_confirmation) {
        errors.password_confirmation = t('resetPassword.validation.confirmRequired')
        return
    }

    if (form.password !== form.password_confirmation) {
        errors.password_confirmation = t('resetPassword.validation.passwordsNotMatch')
        return
    }

    // Check if we have token and email
    if (!token.value || !email.value) {
        apiError.value = t('resetPassword.errors.missingToken')
        return
    }

    submitting.value = true

    try {
        // Call the reset password API
        const response = await api.post('/reset_password', {
            token: token.value,
            email: email.value,
            password: form.password,
            password_confirmation: form.password_confirmation
        }, {
            params: {
                token: token.value,
                email: email.value
            }
        })

        // Check if successful
        if (response.data.success === true) {
            // Update success message with API response
            successMessage.value = response.data.message || t('resetPassword.successMessage')

            // Show success message
            success.value = true

            // Clear reset data from localStorage
            removeItem('reset_token')
            removeItem('reset_email')

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } else {
            throw new Error(response.data.message || t('resetPassword.errors.resetFailed'))
        }
    } catch (error) {
        console.error('❌ Reset password error:', error)

        // Handle different error scenarios
        if (error.response?.data?.message) {
            apiError.value = error.response.data.message
        } else if (error.response?.status === 400) {
            apiError.value = t('resetPassword.errors.invalidLink')
        } else if (error.response?.status === 422) {
            // Validation errors
            const validationErrors = error.response.data.errors
            if (validationErrors) {
                if (validationErrors.password) {
                    errors.password = validationErrors.password[0]
                }
                if (validationErrors.password_confirmation) {
                    errors.password_confirmation = validationErrors.password_confirmation[0]
                }
            }
            apiError.value = t('resetPassword.errors.validationFailed')
        } else {
            apiError.value = error.message || t('resetPassword.errors.resetFailed')
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

.spinner-border {
    border-width: 0.25rem;
}

@media (max-width: 991px) {
    .col-lg-6.d-none.d-lg-flex {
        display: none !important;
    }
}
</style>