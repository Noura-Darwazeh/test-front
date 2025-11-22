<template>
  <div class="user-page-container">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <h2 class="page-title mb-1">Users Management</h2>
      <p class="text-muted mb-0">Manage system users and their permissions</p>
    </div>

    <!-- Table Card -->
    <div class="card shadow-sm">
      <!-- Filters Bar -->
      <div class="card-header bg-white border-bottom">
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <MainFilters
              v-model="searchText"
              placeholder="Search users..."
              :data="users"
              groupKey="role"
              v-model:groupModelValue="selectedGroups"
            />
          </div>
          <div class="d-flex align-items-center gap-2">
            <ColumnSelector :columns="userColumns" v-model="visibleColumns" />
          </div>
        </div>
      </div>

      <!-- Table Body -->
      <div class="card-body p-0">
        <DataTable :columns="filteredColumns" :data="paginatedUsers" />
        <Pagination
          :totalItems="filteredUsers.length"
          :itemsPerPage="itemsPerPage"
          :currentPage="currentPage"
          @update:currentPage="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "@/components/shared/DataTable.vue";
import ColumnSelector from "@/components/shared/ColumnSelector.vue";
import MainFilters from "@/components/filters/composed/MainFilters.vue";
import Pagination from "@/components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";

// --------------- Variables and Data ---------------
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
const userColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Full Name", sortable: true },
  { key: "email", label: "Email", sortable: false },
  { key: "image", label: "Image", sortable: false },
  { key: "phone_number", label: "Phone number", sortable: false },
  { key: "role", label: "User Role", sortable: true },
  { key: "land_page", label: "Landing page", sortable: false },
  { key: "lang", label: "Language", sortable: true },
  { key: "shared_line", label: "Shared Line", sortable: true },
];

const visibleColumns = ref([]);

// ----------- Computed values -------------
const filteredColumns = computed(() => {
  return userColumns.filter((col) => visibleColumns.value.includes(col.key));
});

const filteredUsers = computed(() => {
  let result = users;

  // Apply group filtering first
  result = filterByGroups(result, selectedGroups.value, "role");

  // Then apply search filtering
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

// ------------ Watchers ------------
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>
