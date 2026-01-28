// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import apiServices from "../services/apiServices.js";

// Import views
import user from "../modules/user/view/user.vue";
import driver from "../modules/driver/view/driver.vue";
import customer from "../modules/customer/view/customer.vue";
import company from "../modules/company/view/company.vue";
import branches from "../modules/branches/view/branches.vue";
import lines from "../modules/lines/view/lines.vue";
import linePrice from "../modules/linePrice/view/linePrice.vue";
import lineWork from "../modules/lineWork/view/lineWork.vue";
import orders from "../modules/orders/view/orderPage.vue";
import discount from "../modules/discount/view/discountPage.vue";
import currency from "../modules/currency/view/currency.vue";
import companyPrice from "../modules/companyPrice/view/companyPrice.vue";
import driverLine from "../modules/driverLine/view/driverLine.vue";
import map from "../modules/map/view/mapPage.vue";
import Login from "../modules/login/view/login.vue";
import forgetPassword from "../modules/forgetPassword/view/forgetPassword.vue";
import resetPassword from "../modules/resetPassword/view/resetPassword.vue";
import regions from "../modules/regions/view/regions.vue";
import workPlans from "../modules/workPlans/view/workPlans.vue";
import Profile from "../modules/profile/view/profile.vue";
import collections from "../modules/payment/view/collections.vue";
import invoices from "../modules/invoices/view/invoices.vue";
import permissions from "../modules/permissions/view/permissions.vue";
import statistics from "../modules/statistics/view/statistics.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: (to) => {
        // Redirect to user's default page or /user
        const authStore = useAuthStore();
        const defaultPage = authStore.user?.default_page || "/user";
        if (authStore.isAuthenticated && defaultPage) {
          return defaultPage;
        }
        return "/user";
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        hiddenLayout: true,
        requiresGuest: true,
      },
    },

    {
      path: "/forgot-password",
      name: "forgetPassword",
      component: forgetPassword,
      meta: {
        hiddenLayout: true,
        requiresGuest: true,
      },
    },
    {
      path: "/reset-password",
      name: "resetPassword",
      component: resetPassword,
      meta: {
        hiddenLayout: true,
        requiresGuest: true,
      },
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: {
        titleKey: "profile.title",
        requireAuth: true,
        showInSidebar: false,
      },
    },
    {
      path: "/user",
      name: "User",
      component: user,
      meta: {
        titleKey: "user.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/userIcon.svg",
        order: 1,
        roles: ["SuperAdmin", "Admin"],
      },
    },
    {
      path: "/driver",
      name: "Driver",
      component: driver,
      meta: {
        titleKey: "driver.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/driverIcon.svg",
        order: 2,
      },
    },
    {
      path: "/customer",
      name: "Customer",
      component: customer,
      meta: {
        titleKey: "customer.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/customerIcon.svg",
        order: 4,
      },
    },
    {
      path: "/company",
      name: "Company",
      component: company,
      meta: {
        titleKey: "company.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/companyIcon.svg",
        order: 3,
        roles: ["SuperAdmin"],
      },
    },
    {
      path: "/branches",
      name: "Branches",
      component: branches,
      meta: {
        titleKey: "branch.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/branchIcon.svg",
        order: 16,
      },
    },
    {
      path: "/lines",
      name: "Lines",
      component: lines,
      meta: {
        titleKey: "lines.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/linesIcon.svg",
        order: 12,
      },
    },
    {
      path: "/line-work",
      name: "LineWork",
      component: lineWork,
      meta: {
        titleKey: "lineWork.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/linesIcon.svg",
        order: 11,
      },
    },
    {
      path: "/line_price",
      name: "linePrice",
      component: linePrice,
      meta: {
        titleKey: "linePrice.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/priceIcon.svg",
        order: 13,
      },
    },
    {
      path: "/regions",
      name: "regions",
      component: regions,
      meta: {
        titleKey: "regions.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/regionsIcon.svg",
        order: 17,
      },
    },
    {
      path: "/orders",
      name: "Orders",
      component: orders,
      meta: {
        titleKey: "orders.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/order/order.svg",
        order: 5,
      },
    },
    {
      path: "/statistics",
      name: "Statistics",
      component: statistics,
      meta: {
        titleKey: "statistics.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/statistics.svg",
        order: 6,
      },
    },
    {
      path: "/discount",
      name: "Discount",
      component: discount,
      meta: {
        titleKey: "discount.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/discount/discount.svg",
        order: 15,
      },
    },
    {
      path: "/currency",
      name: "Currency",
      component: currency,
      meta: {
        titleKey: "currency.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/currency/currency.svg",
        order: 18,
      },
    },
    {
      path: "/company-price",
      name: "CompanyPrice",
      component: companyPrice,
      meta: {
        titleKey: "companyPrice.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/itemprice/price.svg",
        order: 14,
      },
    },
    {
      path: "/driver-line",
      name: "DriverLine",
      component: driverLine,
      meta: {
        titleKey: "driverLine.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/driverline/driverline.svg",
        order: 10,
      },
    },
    {
      path: "/map",
      name: "Map",
      component: map,
      meta: {
        titleKey: "map.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/map/mapGlobe.svg",
        order: 19,
      },
    },
    {
      path: "/work-plans",
      name: "WorkPlans",
      component: workPlans,
      meta: {
        titleKey: "workPlan.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/planIcon.svg",
        order: 7,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: (to) => {
        const authStore = useAuthStore();
        const defaultPage =
          authStore.user?.default_page || authStore.user?.landing_page;
        if (authStore.isAuthenticated && defaultPage) {
          return defaultPage;
        }
        return "/user";
      },
    },

    {
      path: "/collections",
      name: "Collections",
      component: collections,
      meta: {
        titleKey: "collection.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/priceIcon.svg",
        order: 8,
        roles: ["Admin", "Driver"],
      },
    },

    {
      path: "/invoices",
      name: "Invoices",
      component: invoices,
      meta: {
        titleKey: "invoice.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/invoiceIcon.svg",
        order: 9,
      },
    },
    {
      path: "/permissions",
      name: "Permissions",
      component: permissions,
      meta: {
        titleKey: "permissions.title",
        requireAuth: true,
        showInSidebar: true,
        icon: "/src/assets/sidebar/permission.svg",
        order: 20,
        roles: ["SuperAdmin", "Admin"],
      },
    },
  ],
});

// ===== Navigation Guards =====

router.beforeEach((to, from, next) => {
  apiServices.cancelAllRequests();

  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  // Check if route requires authentication
  if (to.meta.requireAuth && !isAuthenticated) {
    console.log("🔒 Route requires authentication, redirecting to login");
    return next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  }

  // Check if route requires guest (logged out) access
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log("✅ Already authenticated, redirecting to default page");
    // Redirect to user's default page
    const defaultPage =
      authStore.user?.default_page || authStore.user?.landing_page || "/user";
    return next(defaultPage);
  }

  // Check role-based access
  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!authStore.hasAnyRole(to.meta.roles)) {
      console.log("❌ Insufficient permissions for this route");
      const defaultPage =
        authStore.user?.default_page || authStore.user?.landing_page;

      // Prevent infinite redirect if default page is the restricted page
      if (defaultPage === to.path) {
        console.warn(
          "⚠️ Default page has role restrictions, redirecting to /driver",
        );
        return next("/driver");
      }

      return next(defaultPage || "/driver");
    }
  }

  // Allow navigation
  next();
});

export default router;
