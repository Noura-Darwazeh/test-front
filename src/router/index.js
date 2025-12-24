import { createRouter, createWebHistory } from "vue-router";
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
import regions from "../modules/regions/view/regions.vue";
import workPlans from "../modules/workPlans/view/workPlans.vue";

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
      path: "/line-work",
      name: "LineWork",
      component: lineWork,
      meta: {
        titleKey: "lineWork.title",
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
      path: "/orders",
      name: "Orders",
      component: orders,
      meta: {
        titleKey: "orders.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/order/order.svg",
      },
    },

    {
      path: "/discount",
      name: "Discount",
      component: discount,
      meta: {
        titleKey: "discount.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/discount/discount.svg",
      },
    },
    {
      path: "/currency",
      name: "Currency",
      component: currency,
      meta: {
        titleKey: "currency.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/currency/currency.svg",
      },
    },
    {
      path: "/company-price",
      name: "CompanyPrice",
      component: companyPrice,
      meta: {
        titleKey: "companyPrice.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/itemprice/price.svg",
      },
    },
    {
      path: "/driver-line",
      name: "DriverLine",
      component: driverLine,
      meta: {
        titleKey: "driverLine.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/driverline/driverline.svg",
      },
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: {
        hiddenLayout: true,
      },
    },
    {
      path: "/map",
      name: "Map",
      component: map,
      meta: {
        titleKey: "map.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/map/mapGlobe.svg",
      },
    },
    {
      path: "/forgot-password",
      name: "forgetPassword",
      component: forgetPassword,
      meta: {
        hiddenLayout: true,
      },
    },

    {
      path: "/work-plans",
      name: "WorkPlans",
      component: workPlans,
      meta: {
        titleKey: "workPlan.title",
        requireAuth: false,
        showInSidebar: true,
        icon: "/src/assets/sidebar/planIcon.svg",
      },
    },
  ],
});

export default router;
