import { createRouter, createWebHistory } from "vue-router";
import user from "../modules/user/view/user.vue";
import driver from "../modules/driver/view/driver.vue";

import Login from "../modules/login/view/login.vue";
import forgetPassword from "../modules/forgetPassword/view/forgetPassword.vue";
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
      component: Login,
      meta: {
        hiddenLayout: true,
      }
    },
    {
      path: "/forgot-password",
      name: "forgetPassword",
      component: forgetPassword,
      meta: {
        hiddenLayout: true,
      }
    },
  ],
});

export default router;
