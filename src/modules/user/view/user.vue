<template>
  <div class="user-page-container bg-light">
    <usersHeader
      v-model="searchText"
      :searchPlaceholder="$t('user.searchPlaceholder')"
      :data="users"
      groupKey="role"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('user.filterByRole')"
      translationKey="roles"
      :columns="userColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('user.addNew')"
      @add-click="openModal"
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="usersStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="usersStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ usersStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedUsers" />
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="filteredUsers.length"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              @update:currentPage="(page) => (currentPage = page)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for User -->
    <FormModal
      :isOpen="isModalOpen"
      :title="$t('user.addNew')"
      :fields="userFields"
      :showImageUpload="true"
      :imageRequired="false"
      :imageUploadLabel="$t('user.form.uploadImage')"
      @close="closeModal"
      @submit="handleAddUser"
    />

    <!-- Trashed Users Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('user.trashed.title')"
      :emptyMessage="$t('user.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedUsers"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import usersHeader from "../components/usersHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useUsersManagementStore } from "../store/usersManagement.js";
import { VALIDATION_LIMITS } from "../constants/userConstants.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const usersStore = useUsersManagementStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);

// Dynamic data from API
const companies = ref([]);
const companiesLoading = ref(false);
const companiesError = ref(null);

const roles = ref([
  { value: "SuperAdmin", translationKey: "SuperAdmin" },
  { value: "Admin", translationKey: "Admin" },
  { value: "Supervisor", translationKey: "Supervisor" },
  { value: "Employee", translationKey: "Employee" },
]);

// Get users from store
const users = computed(() => usersStore.users);
const trashedUsers = computed(() => usersStore.trashedUsers);

// Fetch companies
const fetchCompanies = async () => {
  companiesLoading.value = true;
  companiesError.value = null;
  try {
    const companiesResponse = await apiServices.getCompanies();
    companies.value = companiesResponse.data.data.map(company => ({
      value: String(company.id),
      label: company.name
    }));
    console.log("Companies loaded successfully");
  } catch (error) {
    companiesError.value = error.message || "Failed to load companies";
    console.error("Failed to load companies:", error);
  } finally {
    companiesLoading.value = false;
  }
};

// Fetch data on component mount
onMounted(async () => {
  try {
    // Fetch users and companies in parallel
    await Promise.all([
      usersStore.fetchUsers(),
      fetchCompanies()
    ]);
    console.log("✅ All data loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// User Form Fields
const userFields = computed(() => [
  {
    name: "name",
    label: t("user.form.name"),
    type: "text",
    required: true,
    placeholder: t("user.form.namePlaceholder"),
    colClass: "col-md-6",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) return t("user.validation.nameMax");
      return null;
    },
  },
  {
    name: "username",
    label: t("user.form.username"),
    type: "text",
    required: true,
    placeholder: t("user.form.usernamePlaceholder"),
    colClass: "col-md-6",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.USERNAME_MAX_LENGTH) return t("user.validation.usernameMax");
      const exists = users.value.some((u) => u.username === value);
      if (exists) return t("user.validation.usernameExists");
      return null;
    },
  },
  {
    name: "email",
    label: t("user.form.email"),
    type: "email",
    required: false,
    placeholder: t("user.form.emailPlaceholder"),
    colClass: "col-md-6",
    validate: (value) => {
      if (value && value.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) return t("user.validation.emailMax");
      return null;
    },
  },
  {
    name: "password",
    label: t("user.form.password"),
    type: "password",
    required: true,
    minlength: VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
    placeholder: t("user.form.passwordPlaceholder"),
    colClass: "col-md-6",
  },
  {
    name: "phone_number",
    label: t("user.form.phoneNumber"),
    type: "tel",
    required: true,
    placeholder: t("user.form.phoneNumberPlaceholder"),
    colClass: "col-md-6",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.PHONE_MAX_LENGTH) return t("user.validation.phoneMax");
      return null;
    },
  },
  {
    name: "role",
    label: t("user.form.role"),
    type: "select",
    required: true,
    options: roles.value.map(role => ({
      value: role.value,
      label: t(`roles.${role.translationKey}`)
    })),
    colClass: "col-md-6",
  },
  {
    name: "company_name",
    label: t("user.form.company"),
    type: "select",
    required: false,
    options: companies.value,
    colClass: "col-md-6",
  },
]);

const userColumns = computed(() => [
  { key: "id", label: t("user.id"), sortable: true },
  { key: "name", label: t("user.fullName"), sortable: true },
  { key: "username", label: t("user.username"), sortable: true },
  { key: "email", label: t("user.email"), sortable: false },
  { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
  { key: "role", label: t("user.userRole"), sortable: true },
  { key: "company_name", label: t("user.company"), sortable: false },
  {
    key: "status",
    label: t("user.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "user" },
  },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("user.id") },
  { key: "name", label: t("user.fullName") },
  { key: "username", label: t("user.username") },
  { key: "email", label: t("user.email") },
  { key: "phone_number", label: t("user.phoneNumber") },
  { key: "role", label: t("user.userRole") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return userColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

const filteredUsers = computed(() => {
  let result = users.value;
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

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const openTrashedModal = () => {
  isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
};

const handleAddUser = async (userData) => {
  try {
    if (userData.image && userData.image.size > VALIDATION_LIMITS.IMAGE_MAX_SIZE) {
      console.log(t("user.validation.imageSize"));
      return;
    }

    const newUser = {
      name: userData.name,
      username: userData.username,
      email: userData.email || "",
      phone_number: userData.phone_number,
      role: userData.role,
      company_id: userData.company_name || null,
      language: "english", // Default language
      shared_line: 1, // Default value
      image: userData.imagePreview || null,
    };

    await usersStore.addUser(newUser);
    console.log("✅ User added successfully!");
    closeModal();
  } catch (error) {
    console.error("❌ Failed to add user:", error);
    alert(error.message || "Failed to add user");
  }
};

const handleRestoreUser = async (user) => {
  try {
    await usersStore.restoreUser(user.id);
    console.log("✅ User restored successfully!");
  } catch (error) {
    console.error("❌ Failed to restore user:", error);
  }
};
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>
