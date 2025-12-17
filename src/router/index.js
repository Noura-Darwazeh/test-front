import { createRouter, createWebHistory } from "vue-router";
import user from "../modules/user/view/user.vue";
import driver from "../modules/driver/view/driver.vue";
import customer from "../modules/customer/view/customer.vue";
import company from "../modules/company/view/company.vue";
import branches from "../modules/branches/view/branches.vue";
import lines from "../modules/lines/view/lines.vue";
import linePrice from "../modules/linePrice/view/linePrice.vue";
import Login from "../modules/login/view/login.vue";
import forgetPassword from "../modules/forgetPassword/view/forgetPassword.vue";
import regions from "../modules/regions/view/regions.vue";

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
      path: "/customer",
      name: "Customer",
      component: customer,
      meta: {
        titleKey: "customer.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/customerIcon.svg",
      },
    },
    {
      path: "/company",
      name: "Company",
      component: company,
      meta: {
        titleKey: "company.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/companyIcon.svg",
      },
    },
    {
      path: "/branches",
      name: "Branches",
      component: branches,
      meta: {
        titleKey: "branch.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/branchIcon.svg",
      },
    },
    {
      path: "/lines",
      name: "Lines",
      component: lines,
      meta: {
        titleKey: "lines.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/linesIcon.svg",
      },
    },

    {
      path: "/line-price",
      name: "linePrice",
      component: linePrice,
      meta: {
        titleKey: "linePrice.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/priceIcon.svg",
      },
    },

    {
      path: "/regions",
      name: "regions",
      component: regions,
      meta: {
        titleKey: "regions.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/regionsIcon.svg",
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
