<template>
  <div class="user-page-container bg-light">
    <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <!-- search and group filter components -->
      <div class="d-flex gap-2 flex-grow-1">
        <MainFilters v-model="searchText" :placeholder="$t('user.searchPlaceholder')" :data="users" groupKey="role"
          v-model:groupModelValue="selectedGroups" />
      </div>
      <!-- columnSelector component -->
      <div class="d-flex gap-2">
        <ColumnSelector :columns="userColumns" v-model="visibleColumns" />

      </div>
    </div>

    <div class="card border-0 ">
      <div class="card-body p-0">
        <DataTable :columns="filteredColumns" :data="paginatedUsers" />
        <div class="px-3 pt-1 pb-2 bg-light">
          <Pagination :totalItems="filteredUsers.length" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
            @update:currentPage="(page) => currentPage = page" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../../components/shared/DataTable.vue";
import ColumnSelector from "../../../../components/shared/ColumnSelector.vue";
import MainFilters from "../../../../components/filters/composed/MainFilters.vue";
import Pagination from "../../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(25);
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
const userColumns = computed(() => [
  { key: "id", label: t("user.id"), sortable: true },
  { key: "name", label: t("user.fullName"), sortable: true },
  { key: "email", label: t("user.email"), sortable: false },
  { key: "image", label: t("user.image"), sortable: false },
  { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
  { key: "role", label: t("user.userRole"), sortable: true },
  { key: "land_page", label: t("user.landingPage"), sortable: false },
  { key: "lang", label: t("user.language"), sortable: true },
  { key: "shared_line", label: t("user.sharedLine"), sortable: true },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return userColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

const filteredUsers = computed(() => {
  let result = users;
  result = filterByGroups(result, selectedGroups.value, "role");
  result = filterData(result, searchText.value);
  return result;
});

const paginatedUsers = computed(() => {
  return paginateData(
    filteredUsers.value,
    currentPage.value,
    itemsPerPage.value
  );
});

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>