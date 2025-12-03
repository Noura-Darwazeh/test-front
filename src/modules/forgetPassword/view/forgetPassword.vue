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

                        <!-- Submit Button -->
                        <div class="mb-3">
                            <PrimaryButton text="Send Reset Link" loading-text="Sending..." :loading="submitting"
                                type="submit" />
                        </div>

                        <!-- Confirmation Message -->
                        <div v-if="sent" class="alert alert-success mt-3" role="alert">
                            Check your email for the password reset link.
                        </div>

                        <!-- Back to login -->
                        <div class="mt-3 text-center">
                            <a href="/login" class="text-decoration-none"
                                style="color:var(--primary-color);font-size:14px">
                                Remember your password? Sign In
                            </a>
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
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'
const email = ref('')
const submitting = ref(false)
const sent = ref(false)
const errors = reactive({ email: '' })

function onSubmit() {
    if (!email.value) {
        errors.email = 'Email is required'
        return
    }
    submitting.value = true
    setTimeout(() => {
        submitting.value = false
        sent.value = true
    }, 1000)
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
