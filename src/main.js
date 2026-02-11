import { createApp } from "vue";
import { createPinia } from "pinia";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/main.css";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./i18n/index";

import "ol/ol.css";

import OpenLayersMap from "vue3-openlayers";

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(OpenLayersMap);
document.documentElement.lang = i18n.global.locale.value;
document.documentElement.dir = i18n.global.locale.value === "ar" ? "rtl" : "ltr";
app.mount("#app");
