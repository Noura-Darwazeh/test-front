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
                        <!-- Email Field -->
                        <div class="mb-3">
                            <FormLabel label="Email Address" for-id="email" :required="true" />
                            <TextField id="email" v-model="form.email" type="email" placeholder="you@example.com"
                                :required="true" />
                            <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
                        </div>

                        <!-- Password Field -->
                        <div class="mb-3">
                            <FormLabel label="Password" for-id="password" :required="true" />
                            <TextField id="password" v-model="form.password" type="password" placeholder="••••••••"
                                :minlength="6" :required="true" />
                            <small v-if="errors.password" class="text-danger">{{ errors.password }}</small>

                        </div>

                        <div class="d-flex justify-content-end mb-3">
                            <a href="#" @click.prevent="handleForgotPassword" class="text-decoration-none"
                                style="color:var(--primary-color);font-size:14px">
                                <router-link to="/forgot-password" class="text-decoration-none"
                                    style="color:var(--primary-color);font-size:14px">
                                    Forgot Password?
                                </router-link>
                            </a>
                        </div>

                        <PrimaryButton text="Sign In" loading-text="Sign In..." :loading="submitting" type="submit" />
                    </form>
                </div>
            </div>

            <!-- RIGHT: CAROUSEL -->
            <div class="col-12 col-lg-6 p-0 position-relative d-flex align-items-center d-none d-lg-flex"
                style="min-height:600px">
                <div class="w-100 h-100 position-relative">
                    <div class="carousel slide h-100" ref="carousel" data-bs-ride="carousel" data-bs-interval="1000">
                        <div class="carousel-inner h-100">
                            <div v-for="(slide, idx) in slides" :key="idx"
                                :class="['carousel-item', 'h-100', idx === 0 ? 'active' : '']">
                                <img :src="slide.img" class="d-block w-100 h-100" style="object-fit:cover;"
                                    alt="slide" />
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
import { ref, reactive } from 'vue'
import FormLabel from '../../../components/shared/FormLabel.vue'
import TextField from '../../../components/shared/TextField.vue'
import PrimaryButton from '../../../components/shared/PrimaryButton.vue'
import packageIcon from '../../../assets/login/package.svg'

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
]

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const submitting = ref(false)


function onSubmit() {
    errors.email = ''
    errors.password = ''

    if (!form.email) errors.email = 'Email is required'
    if (!form.password) errors.password = 'Password is required'

    if (errors.email || errors.password) return

    submitting.value = true
    setTimeout(() => {
        submitting.value = false
        // Handle successful login
    }, 1000)
}

function handleForgotPassword() {
    // Handle forgot password
    console.log('Forgot password clicked')
}
</script>

<style scoped>
.carousel-control-prev-icon,
.carousel-control-next-icon {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.icon-white {
    filter: brightness(0) invert(1);
}

@media (max-width: 991px) {
    .carousel .position-absolute {
        left: 12px;
        bottom: 12px
    }
}
</style>