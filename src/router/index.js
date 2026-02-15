import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import apiServices from "../services/apiServices.js";

import user from "../modules/user/view/user.vue";
import driver from "../modules/drivers/view/drivers.vue";
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
import driverSteps from "../modules/driver/view/driverSteps.vue";

import userIcon from "@/assets/sidebar/userIcon.svg";
import driverIcon from "@/assets/sidebar/driverIcon.svg";
import customerIcon from "@/assets/sidebar/customerIcon.svg";
import companyIcon from "@/assets/sidebar/companyIcon.svg";
import branchIcon from "@/assets/sidebar/branchIcon.svg";
import linesIcon from "@/assets/sidebar/linesIcon.svg";
import priceIcon from "@/assets/sidebar/priceIcon.svg";
import regionsIcon from "@/assets/sidebar/regionsIcon.svg";
import orderIcon from "@/assets/order/order.svg";
import statisticsIcon from "@/assets/sidebar/statistics.svg";
import discountIcon from "@/assets/discount/discount.svg";
import currencyIcon from "@/assets/currency/currency.svg";
import itemPriceIcon from "@/assets/itemprice/price.svg";
import driverlineIcon from "@/assets/driverline/driverline.svg";
import mapGlobeIcon from "@/assets/map/mapGlobe.svg";
import planIcon from "@/assets/sidebar/planIcon.svg";
import invoiceIcon from "@/assets/sidebar/invoiceIcon.svg";
import permissionIcon from "@/assets/sidebar/permission.svg";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: (to) => {
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
        icon: userIcon,
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
        icon: driverIcon,
        order: 2,
        roles: ["SuperAdmin", "Admin"],
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
        icon: customerIcon,
        order: 4,
        roles: ["SuperAdmin", "Admin"],
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
        icon: companyIcon,
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
        icon: branchIcon,
        order: 16,
        roles: ["SuperAdmin", "Admin"],
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
        icon: linesIcon,
        order: 12,
        roles: ["SuperAdmin", "Admin"],
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
        icon: linesIcon,
        order: 11,
        roles: ["SuperAdmin", "Admin"],
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
        icon: priceIcon,
        order: 13,
        roles: ["SuperAdmin", "Admin"],
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
        icon: regionsIcon,
        order: 17,
        roles: ["SuperAdmin", "Admin"],
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
        icon: orderIcon,
        order: 5,
        roles: ["SuperAdmin", "Admin"],
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
        icon: statisticsIcon,
        order: 6,
        roles: ["SuperAdmin", "Admin"],
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
        icon: discountIcon,
        order: 15,
        roles: ["SuperAdmin", "Admin"],
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
        icon: currencyIcon,
        order: 18,
        roles: ["SuperAdmin", "Admin"],
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
        icon: itemPriceIcon,
        order: 14,
        roles: ["SuperAdmin", "Admin"],
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
        icon: driverlineIcon,
        order: 10,
        roles: ["SuperAdmin", "Admin"],
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
        icon: mapGlobeIcon,
        order: 19,
        roles: ["SuperAdmin", "Admin"],
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
        icon: planIcon,
        order: 7,
        roles: ["SuperAdmin", "Admin", "Driver"],
      },
    },
    {
      path: "/driver-steps",
      name: "DriverSteps",
      component: driverSteps,
      meta: {
        titleKey: "driverSteps.title",
        requireAuth: true,
        showInSidebar: true,
        icon: planIcon,
        order: 21,
        roles: ["SuperAdmin", "Admin", "Driver"],
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
        icon: priceIcon,
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
        icon: invoiceIcon,
        order: 9,
        roles: ["SuperAdmin", "Admin"],
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
        icon: permissionIcon,
        order: 20,
        roles: ["SuperAdmin", "Admin"],
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
  ],
});

router.beforeEach((to, from, next) => {
  apiServices.cancelAllRequests();

  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  if (to.meta.requireAuth && !isAuthenticated) {
    return next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    const defaultPage = authStore.user?.default_page || 
                        authStore.getDefaultPageByRole(userRole);
    return next(defaultPage);
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!authStore.hasAnyRole(to.meta.roles)) {
            const defaultPage = authStore.getDefaultPageByRole(userRole);


      if (defaultPage === to.path) {
        return next("/work-plans");
      }

      return next(defaultPage);
    }
  }

  next();
});

export default router;