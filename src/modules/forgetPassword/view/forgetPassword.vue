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
                        <h3 class="mb-0">Forgot Password?</h3>
                        <p class="text-muted">Enter your email and we'll send you a link to reset your password.</p>
                    </div>

                    <form @submit.prevent="onSubmit" class="needs-validation" novalidate>
                        <!-- Email Field -->
                        <div class="mb-3">
                            <FormLabel label="Email Address" for-id="email" :required="true" />
                            <TextField id="email" v-model="email" type="email" placeholder="you@example.com"
                                :required="true" />
                            <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
                        </div>

                        <!-- API Error Message -->
                        <div v-if="apiError" class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            {{ apiError }}
                        </div>

                        <!-- Submit Button -->
                        <div class="mb-3">
                            <PrimaryButton text="Send Reset Link" loading-text="Sending..." :loading="submitting"
                                type="submit" />
                        </div>

                        <!-- Success Message -->
                        <div v-if="sent" class="alert alert-success mt-3" role="alert">
                            <i class="fas fa-check-circle me-2"></i>
                            {{ successMessage }}
                        </div>

                        <!-- Back to login -->
                        <div class="mt-3 text-center">
                            <router-link to="/login" class="text-decoration-none"
                                style="color:var(--primary-color);font-size:14px">
                                Remember your password? Sign In
                            </router-link>
                        </div>
                    </form>
                </div>
            </div>

            <!-- RIGHT: -->
            <div class="col-12 col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
                style="background: var(--primary-color); color: #fff; min-height:600px; padding: 40px;">
                <div class="text-center">
                    <h2 class="mb-3">Reset Your Password</h2>
                    <p class="mb-0">A secure and simple way to regain access to your account.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'
import api from '@/services/api.js'
import { setItem } from '@/utils/shared/storageUtils.js'

const router = useRouter()
const email = ref('')
const submitting = ref(false)
const sent = ref(false)
const errors = reactive({ email: '' })
const apiError = ref('')
const successMessage = ref('Check your email for the password reset link.')

async function onSubmit() {
    // Clear previous errors
    errors.email = ''
    apiError.value = ''

    // Validate email
    if (!email.value || !email.value.trim()) {
        errors.email = 'Email is required'
        return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
        errors.email = 'Please enter a valid email address'
        return
    }

    submitting.value = true

    try {
        // Call the forgot password API
        const response = await api.post('/forgotpassword', {
            email: email.value.trim()
        })

        console.log('✅ Forgot password API response:', response.data)

        // Check if successful
        if (response.data.success === true) {
            // Extract token from response if available
            const token = response.data.token || response.data.data?.token

            // Save email and token to localStorage
            setItem('reset_email', email.value.trim())
            if (token) {
                setItem('reset_token', token)
                console.log('💾 Token and email saved to localStorage')
            } else {
                console.log('💾 Email saved to localStorage (token will come from URL)')
            }

            // Update success message with API response
            successMessage.value = response.data.message || 'Check your email for the password reset link.'

            // Show success message
            sent.value = true

            // Optional: Redirect after 5 seconds
            setTimeout(() => {
                // router.push('/login')
            }, 5000)
        } else {
            throw new Error(response.data.message || 'Failed to send reset link')
        }
    } catch (error) {
        console.error('❌ Forgot password error:', error)
        
        // Handle different error scenarios
        if (error.response?.data?.message) {
            apiError.value = error.response.data.message
        } else if (error.response?.status === 404) {
            apiError.value = 'Email not found in our system'
        } else if (error.response?.status === 422) {
            apiError.value = 'Please enter a valid email address'
        } else {
            apiError.value = error.message || 'Failed to send reset link. Please try again.'
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