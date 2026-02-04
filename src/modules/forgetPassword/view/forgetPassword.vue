<template>
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light" style="padding:32px;">
        <div class="shadow rounded-4 bg-white overflow-hidden" style="max-width: 500px; width: 100%;">
            <!-- FORM SECTION - Centered -->
            <div class="d-flex align-items-center justify-content-center" style="padding: 48px 40px;">
                <div style="max-width: 420px; width: 100%;">
                    <div class="text-center mb-4">
                        <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style="width:64px;height:64px;background:var(--primary-color);color:#fff">
                            <img :src="packageIcon" alt="" width="28" height="28" class="icon-white" />
                        </div>
                        <h3 class="mb-0">{{ $t('forgotPassword.title') }}</h3>
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
                            />
                            <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
                        </div>

                        <!-- API Error Message -->
                        <div v-if="apiError" class="alert alert-danger" role="alert">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            {{ apiError }}
                        </div>

                        <!-- Submit Button - Centered -->
                        <div class="d-flex justify-content-center mb-3">
                            <PrimaryButton
                                :text="$t('forgotPassword.sendResetLink')"
                                :loading-text="$t('forgotPassword.sending')"
                                :loading="submitting"
                                type="submit"
                            />
                        </div>

                        <!-- Success Message -->
                        <div v-if="sent" class="alert alert-success mt-3" role="alert">
                            <i class="fas fa-check-circle me-2"></i>
                            {{ successMessage }}
                        </div>

                        <!-- Back to login -->
                        <div class="d-flex justify-content-end mt-3">
                            <router-link to="/login" class="text-decoration-none"
                                style="color:var(--primary-color);font-size:14px">
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'
import apiServices from '@/services/apiServices.js'
import { setItem } from '@/utils/shared/storageUtils.js'

const router = useRouter()
const { t } = useI18n()
const email = ref('')
const submitting = ref(false)
const sent = ref(false)
const errors = reactive({ email: '' })
const apiError = ref('')
const successMessage = ref(t('forgotPassword.successMessage'))

async function onSubmit() {
    errors.email = ''
    apiError.value = ''

    if (!email.value || !email.value.trim()) {
        errors.email = t('forgotPassword.validation.emailRequired')
        return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
        errors.email = t('forgotPassword.validation.emailInvalid')
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

            setTimeout(() => {
                // router.push('/login')
            }, 5000)
        } else {
            throw new Error(response.data.message || t('forgotPassword.errors.sendFailed'))
        }
    } catch (error) {
        console.error('❌ Forgot password error:', error)

        if (error.response?.data?.message) {
            apiError.value = error.response.data.message
        } else if (error.response?.status === 404) {
            apiError.value = t('forgotPassword.errors.emailNotFound')
        } else if (error.response?.status === 422) {
            apiError.value = t('forgotPassword.validation.emailInvalid')
        } else {
            apiError.value = error.message || t('forgotPassword.errors.sendFailed')
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
</style>