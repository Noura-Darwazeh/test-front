import { createRouter, createWebHistory } from "vue-router";
import user from "../modules/views/user/view/user.vue";
import Login from '../modules/views/login/view/login.vue'
import forgetPassword from '../modules/views/forgetPassword/view/forgetPassword.vue'
import '../assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/user",
    },
    {
      path: "/user",
      name: "User",
      component: user,
      meta: {
        title: "User Table",
        Artitle: "لوحة المستخدمين",
        hideLayout: true,
        requireAuth: false,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/forgot-password',
      name: 'forgetPassword',
      component: forgetPassword
    }
  ],
});

export default router;
