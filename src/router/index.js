import { createRouter, createWebHistory } from "vue-router";
import user from "../modules/views/user/view/user.vue";
import driver from "../modules/views/user/view/driver.vue";

import Login from "../modules/views/login/view/login.vue";
import forgetPassword from "../modules/views/forgetPassword/view/forgetPassword.vue";
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
        titleKey: "user.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/userIcon.svg",
      },
    },
    {
      path: "/driver",
      name: "Driver",
      component: driver,
      meta: {
        titleKey: "driver.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/driverIcon.svg",
      },
    },
    {
      path: "/login",
      name: "Login",
      hiddenLayout: true,
      component: Login,
    },
    {
      path: "/forgot-password",
      name: "forgetPassword",
      component: forgetPassword,
    },
  ],
});

export default router;
