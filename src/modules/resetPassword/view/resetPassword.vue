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
                        <h3 class="mb-0">Reset Your Password</h3>
                        <p class="text-muted">Enter your new password to regain access to your account.</p>
                    </div>

                    <form @submit.prevent="onSubmit" class="needs-validation" novalidate>
                        <!-- New Password Field -->
                        <div class="mb-3">
                            <FormLabel label="New Password" for-id="password" :required="true" />
                            <TextField 
                                id="password" 
                                v-model="form.password" 
                                type="password" 
                                placeholder="••••••••"
                                :minlength="6" 
                                :required="true" 
                            />
                            <small v-if="errors.password" class="text-danger">{{ errors.password }}</small>
                            <small v-else class="text-muted d-block mt-1">
                                Password must be at least 6 characters
                            </small>
                        </div>

                        <!-- Confirm Password Field -->
                        <div class="mb-3">
                            <FormLabel label="Confirm Password" for-id="password_confirmation" :required="true" />
                            <TextField 
                                id="password_confirmation" 
                                v-model="form.password_confirmation" 
                                type="password" 
                                placeholder="••••••••"
                                :minlength="6" 
                                :required="true" 
                            />
                            <small v-if="errors.password_confirmation" class="text-danger">
                                {{ errors.password_confirmation }}
                            </small>
                        </div>

                        <!-- API Error Message -->
                        <div v-if="apiError" class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            {{ apiError }}
                        </div>

                        <!-- Submit Button -->
                        <div class="mb-3">
                            <PrimaryButton 
                                text="Reset Password" 
                                loading-text="Resetting..." 
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
                            <small>Redirecting to login...</small>
                        </div>

                        <!-- Back to login -->
                        <div class="mt-3 text-center">
                            <router-link to="/login" class="text-decoration-none"
                                style="color:var(--primary-color);font-size:14px">
                                Back to Sign In
                            </router-link>
                        </div>
                    </form>
                </div>
            </div>

            <!-- RIGHT: -->
            <div class="col-12 col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
                style="background: var(--primary-color); color: #fff; min-height:600px; padding: 40px;">
                <div class="text-center">
                    <h2 class="mb-3">Secure Password Reset</h2>
                    <p class="mb-0">Create a strong password to protect your account.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'
import api from '@/services/api.js'
import { getItem, removeItem } from '@/utils/shared/storageUtils.js'

const router = useRouter()
const route = useRoute()

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
const successMessage = ref('Password reset successfully!')

// Get token and email from URL or localStorage
const token = ref('')
const email = ref('')

onMounted(() => {
    // Try to get token and email from URL query parameters
    token.value = route.query.token || getItem('reset_token', '')
    email.value = route.query.email || getItem('reset_email', '')

    // Validate that we have both token and email
    if (!token.value || !email.value) {
        console.error('❌ Missing token or email')
        apiError.value = 'Invalid reset link. Please request a new password reset.'
        
        // Redirect to forgot password after 3 seconds
        setTimeout(() => {
            router.push('/forgot-password')
        }, 3000)
    } else {
        console.log('✅ Token and email loaded:', { email: email.value, hasToken: !!token.value })
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
        errors.password = 'Password must be at least 6 characters'
        return false
    }

    if (form.password_confirmation.length > 0 && 
        form.password !== form.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
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
        errors.password = 'Password must be at least 6 characters'
        return
    }

    if (!form.password_confirmation) {
        errors.password_confirmation = 'Please confirm your password'
        return
    }

    if (form.password !== form.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match'
        return
    }

    // Check if we have token and email
    if (!token.value || !email.value) {
        apiError.value = 'Invalid reset link. Please request a new password reset.'
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

        console.log('✅ Reset password API response:', response.data)

        // Check if successful
        if (response.data.success === true) {
            // Update success message with API response
            successMessage.value = response.data.message || 'Password reset successfully!'
            
            // Show success message
            success.value = true

            // Clear reset data from localStorage
            removeItem('reset_token')
            removeItem('reset_email')
            console.log('🗑️ Reset data cleared from localStorage')

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } else {
            throw new Error(response.data.message || 'Failed to reset password')
        }
    } catch (error) {
        console.error('❌ Reset password error:', error)
        
        // Handle different error scenarios
        if (error.response?.data?.message) {
            apiError.value = error.response.data.message
        } else if (error.response?.status === 400) {
            apiError.value = 'Invalid or expired reset link. Please request a new one.'
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
            apiError.value = 'Please check your input and try again.'
        } else {
            apiError.value = error.message || 'Failed to reset password. Please try again.'
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

@media (max-width: 991px) {
    .col-lg-6.d-none.d-lg-flex {
        display: none !important;
    }
}
</style>