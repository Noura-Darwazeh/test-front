<template>
  <nav
    class="navbar navbar-light bg-white border-bottom"
    :class="{ rtl: isRTL }"
  >
    <div class="container-fluid px-4">
      <div class="d-flex align-items-center justify-content-between w-100">
        <h5 class="mb-0 fw-semibold text-dark">
          {{ displayTitle }}
        </h5>

        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-link p-0 position-relative" type="button">
            <img
              src="/src/assets/Navbar/Bell.svg"
              alt="Notifications"
              width="20"
              height="20"
            />
            <span
              v-if="notificationCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ notificationCount }}
            </span>
          </button>

          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button class="btn btn-link p-0" type="button">
                <img
                  src="/src/assets/Navbar/Globe.svg"
                  alt="Language"
                  width="20"
                  height="20"
                />
              </button>
            </template>
            <template #menu="{ close }">
              <ul class="list-unstyled mb-0">
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="
                      switchLanguage('EN');
                      close();
                    "
                    >English</a
                  >
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="
                      switchLanguage('AR');
                      close();
                    "
                    >العربية</a
                  >
                </li>
              </ul>
            </template>
          </BaseDropdown>

          <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'">
            <template #trigger>
              <button
                class="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none"
                type="button"
              >
                <img
                  :src="userAvatar"
                  alt="User profile picture"
                  class="rounded-circle"
                  width="36"
                  height="36"
                />
                <span class="d-none d-md-inline text-dark">{{ userName }}</span>
                <img
                  src="/src/assets/Navbar/DropDown.svg"
                  alt="Dropdown"
                  width="16"
                  height="16"
                />
              </button>
            </template>
            <template #menu="{ close }">
              <ul class="list-unstyled mb-0">
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleProfile(close)"
                    >{{ $t("navbar.profile") }}</a
                  >
                </li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleSettings(close)"
                    >{{ $t("navbar.settings") }}</a
                  >
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a
                    class="dropdown-item"
                    href="#"
                    @click.prevent="handleSwitchUser(close)"
                    >{{ $t("navbar.SwitchUser") }}</a
                  >
                </li>
                <li>
                  <a
                    class="dropdown-item text-danger"
                    href="#"
                    @click.prevent="handleLogout(close)"
                    >{{ $t("navbar.logout") }}</a
                  >
                </li>
              </ul>
            </template>
          </BaseDropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/i18n/index";
import BaseDropdown from "@/components/shared/BaseDropdown.vue";

const props = defineProps({
  pageTitle: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const displayTitle = computed(() => {
  if (props.pageTitle) {
    return props.pageTitle;
  }
  return route.meta.titleKey ? t(route.meta.titleKey) : "Dashboard";
});

const currentLanguage = ref("EN");
const notificationCount = ref(3);
const { locale, t } = useI18n();
const isRTL = computed(() => locale.value === "ar");

const userName = ref("John Doe");
const userAvatar = ref("https://via.placeholder.com/36");

const switchLanguage = (lang) => {
  setLocale(lang.toLowerCase());
  currentLanguage.value = lang;
};

const handleProfile = (close) => {
  close();
  console.log("Navigate to profile");
};

const handleSettings = (close) => {
  close();
  console.log("Navigate to settings");
};

const handleSwitchUser = (close) => {
  close();
  console.log("Switch user");
};

const handleLogout = (close) => {
  close();
  console.log("Logout");
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-link {
  color: #6c757d;
  text-decoration: none;
}

.btn-link:hover {
  color: #0d6efd;
}

.btn-link:focus {
  box-shadow: none;
}
</style>
