<template>
  <Table 
    :data="users" 
    :columns="userColumns" 
    :searchPlaceholder="$t('user.searchPlaceholder')" 
    groupKey="role"
    :groupLabel="$t('user.filterByRole')"
    translationKey="roles"
  />
</template>

<script setup>
import Table from "./generalTable.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const users = [
  {
    id: 1,
    name: "Test name",
    email: "John@example.com",
    image: "path/test",
    phone_number: "0598549638",
    role: "Admin",
    land_page: "home",
    lang: "en",
    shared_line: 1,
  },
  {
    id: 2,
    name: "ahmad",
    email: "ahmad@example.com",
    image: "path/test",
    phone_number: "0598549638",
    role: "User",
    land_page: "home",
    lang: "en",
    shared_line: 1,
  },
  {
    id: 3,
    name: "sami",
    email: "sami@example.com",
    image: "path/test",
    phone_number: "0598549638",
    role: "Manager",
    land_page: "home",
    lang: "en",
    shared_line: 1,
  },
];

const userColumns = [
  { key: "id", label: t("user.id"), sortable: true },
  { key: "name", label: t("user.fullName"), sortable: true },
  { key: "email", label: t("user.email"), sortable: false },
  { key: "image", label: t("user.image"), sortable: false },
  { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
  { key: "role", label: t("user.userRole"), sortable: true },
  { key: "land_page", label: t("user.landingPage"), sortable: false },
  { key: "lang", label: t("user.language"), sortable: true },
  { key: "shared_line", label: t("user.sharedLine"), sortable: true },
];
</script>