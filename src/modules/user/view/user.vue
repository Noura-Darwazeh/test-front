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
      :showAddButton="isSuperAdmin"
      :addButtonText="$t('user.addNew')"
      @add-click="openModal"
      @refresh-click="handleRefresh"
    />

    <div class="card border-0">
      <!-- Tabs -->
      <div class="card-header bg-white border-bottom">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'active' }"
              @click="switchTab('active')"
            >
              {{ $t("user.activeUsers") }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link trashed-tab"
              :class="{ active: activeTab === 'trashed' }"
              @click="switchTab('trashed')"
            >
              {{ $t("user.trashed.title") }}
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-0">
        <!-- Bulk Actions Bar -->
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="user"
          :actions="bulkActions"
          :loading="bulkActionLoading"
          @action="handleBulkAction"
        />

        <!-- Loading State -->
        <div v-if="currentLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t("common.loading") }}</span>
          </div>
          <p class="mt-2">{{ $t("common.loading") }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="usersStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ usersStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            :actionsLabel="$t('user.actions')"
            v-model="selectedRows"
          >
            <template #actions="{ row }">
              <!-- Active Users Actions -->
              <ActionsDropdown
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('user.edit')"
                :detailsLabel="$t('user.details')"
                :deleteLabel="$t('user.delete')"
                :showDelete="true"
                @edit="openEditModal"
                @details="openDetailsModal"
                @delete="handleDeleteUser"
              />
              <!-- Trashed Users Actions -->
              <PrimaryButton
                v-else
                :text="$t('user.trashed.restore')"
                bgColor="var(--color-success)"
                class="d-inline-flex align-items-center"
                @click="handleRestoreUser(row)"
              />
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="currentPagination.total"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              :totalPages="currentPagination.lastPage"
              @update:currentPage="(page) => (currentPage = page)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for Add/Edit User -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('user.edit') : $t('user.addNew')"
      :fields="userFields"
      :showImageUpload="true"
      :imageRequired="false"
      :imageUploadLabel="$t('user.form.uploadImage')"
      @close="closeModal"
      @submit="handleSubmitUser"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('user.details')"
      :data="selectedUser"
      :fields="detailsFields"
      @close="closeDetailsModal"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :isOpen="isDeleteModalOpen"
      :title="$t('user.confirmDeleteTitle')"
      :message="$t('user.confirmDelete')"
      :confirmText="$t('user.delete')"
      :cancelText="$t('common.cancel')"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />

    <!-- Bulk Action Confirmation Modal -->
    <ConfirmationModal
      :isOpen="isBulkConfirmOpen"
      :title="$t('common.bulkDeleteConfirmTitle')"
      :message="bulkConfirmMessage"
      :confirmText="$t('common.confirm')"
      :cancelText="$t('common.cancel')"
      @confirm="executeBulkAction"
      @close="cancelBulkAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import usersHeader from "../components/usersHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import PrimaryButton from "../../../components/shared/PrimaryButton.vue";
import { useUsersManagementStore } from "../store/usersManagement.js";
import { VALIDATION_LIMITS } from "../constants/userConstants.js";
import apiServices from "@/services/apiServices.js";
import { useAuthStore } from "@/stores/auth.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

const { t } = useI18n();
const usersStore = useUsersManagementStore();
const authStore = useAuthStore();

// ✅ API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35";

// ✅ Helper function to get full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};
const { companyId, companyOption, currencyId } = useAuthDefaults();
const isSuperAdmin = computed(
  () => (authStore.userRole || "").toLowerCase() === "superadmin",
);

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditMode = ref(false);
const selectedUser = ref({});
const userToDelete = ref(null);
const activeTab = ref("active");
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Dynamic data from API
const regions = ref([]);
const currencies = ref([]);
const companies = ref([]);
const dataLoading = ref(false);

const roles = ref([
  { value: "Admin", label: "Admin" },
  { value: "Employee", label: "Employee" },
  { value: "Supervisor", label: "Supervisor" },
]);

const resolveIdValue = (value) => {
  if (Array.isArray(value)) {
    return value[0] === null || value[0] === undefined ? "" : String(value[0]);
  }
  if (value && typeof value === "object") {
    return value.id === null || value.id === undefined ? "" : String(value.id);
  }
  return value === null || value === undefined ? "" : String(value);
};

const normalizeUserForEdit = (user) => ({
  ...user,
  company_id: resolveIdValue(user.company_id ?? user.company),
  region_id: resolveIdValue(user.region_id ?? user.region),
  currency_id: resolveIdValue(user.currency_id ?? user.currency),
});

// Get users from store, excluding logged-in user and SuperAdmin users
const users = computed(() => {
  return usersStore.users.filter((user) => {
    if (user.id === authStore.user?.id) return false;

    // Exclude SuperAdmin users (case-insensitive)
    // Handle role as array or string
    const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
    if (userRole?.toLowerCase() === "superadmin") return false;

    return true;
  });
});
const trashedUsers = computed(() => usersStore.trashedUsers);

// Fetch dropdown data (regions, currencies, companies)
const fetchDropdownData = async () => {
  dataLoading.value = true;
  try {
    const [regionsResponse, currenciesResponse, companiesResponse] =
      await Promise.all([
        apiServices.getRegions(),
        apiServices.getCurrencies(),
        apiServices.getCompanies(),
      ]);

    regions.value = regionsResponse.data.data.map((region) => ({
      value: String(region.id),
      label: region.name,
    }));

    currencies.value = currenciesResponse.data.data.map((currency) => ({
      value: String(currency.id),
      label: `${currency.code} (${currency.symbol})`,
    }));

    companies.value = companiesResponse.data.data.map((company) => ({
      value: String(company.id),
      label: company.name,
    }));

    console.log("✅ Regions, currencies, and companies loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load dropdown data:", error);
  } finally {
    dataLoading.value = false;
  }
};

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([
      usersStore.fetchUsers({ page: 1, perPage: itemsPerPage.value }),
      fetchDropdownData(),
    ]);
    console.log("✅ All data loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// Watch for page changes to fetch new data from server
watch(currentPage, async (newPage) => {
  if (skipNextPageWatch.value) {
    skipNextPageWatch.value = false;
    return;
  }
  try {
    if (activeTab.value === "trashed") {
      await usersStore.fetchTrashedUsers({
        page: newPage,
        perPage: itemsPerPage.value,
      });
    } else {
      await usersStore.fetchUsers({
        page: newPage,
        perPage: itemsPerPage.value,
      });
    }
  } catch (err) {
    console.error("Failed to load page:", err);
  }
});

// Get the correct pagination metadata based on active tab
const currentPagination = computed(() => {
  return activeTab.value === "active"
    ? usersStore.usersPagination
    : usersStore.trashedPagination;
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
    defaultValue: isEditMode.value ? selectedUser.value.name : "",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.NAME_MAX_LENGTH)
        return t("user.validation.nameMax");
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
    defaultValue: isEditMode.value ? selectedUser.value.username : "",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.USERNAME_MAX_LENGTH)
        return t("user.validation.usernameMax");
      if (!isEditMode.value) {
        const exists = users.value.some((u) => u.username === value);
        if (exists) return t("user.validation.usernameExists");
      }
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
    defaultValue: isEditMode.value ? selectedUser.value.email : "",
    validate: (value) => {
      if (value && value.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH)
        return t("user.validation.emailMax");
      return null;
    },
  },
  {
    name: "password",
    label: t("user.form.password"),
    type: "password",
    required: !isEditMode.value,
    minlength: VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
    placeholder: isEditMode.value
      ? "Leave empty to keep current password"
      : t("user.form.passwordPlaceholder"),
    colClass: "col-md-6",
    defaultValue: "",
  },
  {
    name: "phone_number",
    label: t("user.form.phoneNumber"),
    type: "tel",
    required: true,
    placeholder: t("user.form.phoneNumberPlaceholder"),
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedUser.value.phone_number : "",
    validate: (value) => {
      if (value.length > VALIDATION_LIMITS.PHONE_MAX_LENGTH)
        return t("user.validation.phoneMax");
      return null;
    },
  },
  {
    name: "role",
    label: t("user.form.role"),
    type: "select",
    required: true,
    options: roles.value.map((role) => ({
      value: role.value,
      label: role.label,
    })),
    colClass: "col-md-6",
    defaultValue: isEditMode.value
      ? selectedUser.value.role
        ? selectedUser.value.role[0]
        : selectedUser.value.role
      : "",
  },
  {
    name: "company_id",
    label: t("user.form.company"),
    type: "select",
    required: false,
    options: isSuperAdmin.value
      ? companies.value
      : companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }],
    placeholder: t("user.form.companyPlaceholder"),
    colClass: "col-md-6",
    defaultValue: isEditMode.value
      ? selectedUser.value.company_id || companyId.value
      : isSuperAdmin.value
        ? ""
        : companyId.value,
    locked: !isSuperAdmin.value,
    hidden: !isSuperAdmin.value,
  },
  {
    name: "region_id",
    label: t("user.form.region"),
    type: "select",
    required: false,
    options: [{ value: "", label: t("user.form.noRegion") }, ...regions.value],
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedUser.value.region_id : "",
  },
  {
    name: "currency_id",
    label: t("user.form.currency"),
    type: "select",
    required: false,
    options: [
      { value: "", label: t("user.form.noCurrency") },
      ...currencies.value,
    ],
    colClass: "col-md-6",
    defaultValue: isEditMode.value
      ? selectedUser.value.currency_id
      : currencyId.value,
  },
]);

// Details Fields
const detailsFields = computed(() => [
  { key: "id", label: t("user.id"), colClass: "col-md-6" },
  { key: "name", label: t("user.fullName"), colClass: "col-md-6" },
  { key: "username", label: t("user.username"), colClass: "col-md-6" },
  { key: "email", label: t("user.email"), colClass: "col-md-6" },
  { key: "phone_number", label: t("user.phoneNumber"), colClass: "col-md-6" },
  {
    key: "role",
    label: t("user.userRole"),
    translationKey: "roles",
    colClass: "col-md-6",
  },
  { key: "company_name", label: t("user.company"), colClass: "col-md-12" },
]);

const userColumns = computed(() => [
  { key: "id", label: t("user.id"), sortable: true },
  { key: "name", label: t("user.fullName"), sortable: true },
  { key: "username", label: t("user.username"), sortable: true },
  { key: "email", label: t("user.email"), sortable: false },
  { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
  { key: "role", label: t("user.userRole"), sortable: true },
  { key: "company_name", label: t("user.company"), sortable: false },
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

// Tab switching function
const switchTab = async (tab) => {
  activeTab.value = tab;
  skipNextPageWatch.value = true;
  currentPage.value = 1;
  selectedRows.value = [];
  if (tab === "trashed") {
    try {
      await usersStore.fetchTrashedUsers({
        page: 1,
        perPage: itemsPerPage.value,
      });
    } catch (error) {
      console.error("❌ Failed to load trashed users:", error);
    }
  } else {
    try {
      await usersStore.fetchUsers({ page: 1, perPage: itemsPerPage.value });
    } catch (error) {
      console.error("❌ Failed to load users:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await usersStore.fetchTrashedUsers({
        page: currentPage.value,
        perPage: itemsPerPage.value,
      });
    } else {
      await usersStore.fetchUsers({
        page: currentPage.value,
        perPage: itemsPerPage.value,
      });
    }
  } catch (error) {
    console.error("❌ Failed to refresh users:", error);
  }
};

// Bulk actions configuration
const bulkActions = computed(() => {
  if (activeTab.value === "active") {
    return [
      {
        id: "delete",
        label: t("user.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  } else {
    return [
      {
        id: "restore",
        label: t("user.bulkRestore"),
        bgColor: "var(--color-success)",
      },
    ];
  }
});

// Bulk confirmation message
const bulkConfirmMessage = computed(() => {
  if (!pendingBulkAction.value) return "";

  const entity =
    selectedRows.value.length === 1
      ? t("user.entitySingular")
      : t("user.entityPlural");

  if (pendingBulkAction.value === "delete") {
    return t("common.bulkDeleteConfirmMessage", {
      count: selectedRows.value.length,
      entity,
    });
  }
  return "";
});

// Current loading state based on active tab
const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? usersStore.loading
    : usersStore.trashedLoading;
});

// Current data based on active tab
const currentData = computed(() => {
  return activeTab.value === "active" ? users.value : trashedUsers.value;
});

// Filtered columns based on active tab
const filteredColumns = computed(() => {
  const columns =
    activeTab.value === "active" ? userColumns.value : trashedColumns.value;
  if (activeTab.value === "active") {
    return columns.filter((col) => visibleColumns.value.includes(col.key));
  }
  return columns;
});

// Filtered data based on active tab
const currentFilteredData = computed(() => {
  let result = currentData.value;
  if (activeTab.value === "active") {
    result = filterByGroups(result, selectedGroups.value, "role");
  }
  result = filterData(result, searchText.value);
  return result;
});

// Server already returns paginated data, apply local filters for search/grouping
const paginatedData = computed(() => {
  return currentFilteredData.value;
});

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

// Add Modal
const openModal = () => {
  isEditMode.value = false;
  selectedUser.value = {};
  isModalOpen.value = true;
};

// Edit Modal
const openEditModal = (user) => {
  isEditMode.value = true;
  selectedUser.value = { ...user };

  // ✅ إضافة المسار الكامل للصورة
  if (selectedUser.value.image) {
    selectedUser.value.imagePreview = getFullImageUrl(selectedUser.value.image);
  }

  isModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (user) => {
  selectedUser.value = { ...user };

  // ✅ إضافة المسار الكامل للصورة
  if (selectedUser.value.image) {
    selectedUser.value.image = getFullImageUrl(selectedUser.value.image);
  }

  isDetailsModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedUser.value = {};
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedUser.value = {};
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  userToDelete.value = null;
};

const handleSubmitUser = async (userData) => {
  try {
    // Validate image size
    if (
      userData.image &&
      userData.image instanceof File &&
      userData.image.size > VALIDATION_LIMITS.IMAGE_MAX_SIZE
    ) {
      console.error("❌ Image size exceeds limit");
      alert("Image size should not exceed 200KB");
      return;
    }
    const selectedRole = Array.isArray(selectedUser.value.role)
      ? selectedUser.value.role[0]
      : selectedUser.value.role;
    const normalizedRole = Array.isArray(userData.role)
      ? userData.role[0]
      : userData.role;

    if (isEditMode.value) {
      // Update existing user
      const updatedData = {};

      // Only include fields that have changed
      if (userData.name !== selectedUser.value.name) {
        updatedData.name = userData.name;
      }
      if (userData.username !== selectedUser.value.username) {
        updatedData.username = userData.username;
      }
      if (userData.email !== selectedUser.value.email) {
        updatedData.email = userData.email || "";
      }
      if (userData.phone_number !== selectedUser.value.phone_number) {
        updatedData.phone_number = userData.phone_number;
      }
      if (normalizedRole !== selectedRole) {
        updatedData.role = normalizedRole;
      }
      if (userData.company_id !== selectedUser.value.company_id) {
        updatedData.company_id = userData.company_id || null;
      }
      if (userData.region_id !== selectedUser.value.region_id) {
        updatedData.region_id = userData.region_id || null;
      }
      if (userData.currency_id !== selectedUser.value.currency_id) {
        updatedData.currency_id = userData.currency_id || null;
      }
      if (userData.password) {
        updatedData.password = userData.password;
      }

      // Add image file if it exists (not base64)
      if (userData.image && userData.image instanceof File) {
        updatedData.image = userData.image;
      }

      await usersStore.updateUser(selectedUser.value.id, updatedData);
      console.log("✅ User updated successfully!");
      closeModal();
    } else {
      // Add new user
      const newUser = {
        name: userData.name,
        username: userData.username,
        password: userData.password,
        phone_number: userData.phone_number,
        role: normalizedRole,
        company_id: userData.company_id || null, // ✅ Always send, null if empty
        region_id: userData.region_id || null, // ✅ Always send, null if empty
        currency_id: userData.currency_id || null, // ✅ Always send, null if empty
      };

      // Add optional email field only if provided
      if (userData.email) newUser.email = userData.email;

      // Add image file if it exists (not base64)
      if (userData.image && userData.image instanceof File) {
        newUser.image = userData.image;
      }

      await usersStore.addUser(newUser);
      console.log("✅ User added successfully!");
      closeModal();
    }
  } catch (error) {
    console.error("❌ Failed to save user:", error);
    alert(error.message || "Failed to save user. Please try again.");
  }
};

const handleRestoreUser = async (user) => {
  try {
    await usersStore.restoreUser(user.id);
    console.log("✅ User restored successfully!");
    await usersStore.fetchTrashedUsers();
  } catch (error) {
    console.error("❌ Failed to restore user:", error);
  }
};

const handleDeleteUser = (user) => {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    if (userToDelete.value) {
      await usersStore.deleteUser(userToDelete.value.id);
      console.log("✅ User deleted successfully!");
      userToDelete.value = null;
    }
  } catch (error) {
    console.error("❌ Failed to delete user:", error);
  }
};

// Bulk action handler
const handleBulkAction = ({ actionId }) => {
  pendingBulkAction.value = actionId;

  if (actionId === "delete") {
    isBulkConfirmOpen.value = true;
  } else {
    executeBulkAction();
  }
};

const executeBulkAction = async () => {
  bulkActionLoading.value = true;

  try {
    if (pendingBulkAction.value === "delete") {
      await usersStore.bulkDeleteUsers(selectedRows.value);
      console.log(
        `✅ ${selectedRows.value.length} users deleted successfully!`,
      );
    } else if (pendingBulkAction.value === "restore") {
      await usersStore.bulkRestoreUsers(selectedRows.value);
      console.log(
        `✅ ${selectedRows.value.length} users restored successfully!`,
      );
      await usersStore.fetchTrashedUsers();
    }

    selectedRows.value = [];
  } catch (error) {
    console.error(
      `❌ Failed to execute bulk ${pendingBulkAction.value}:`,
      error,
    );
  } finally {
    bulkActionLoading.value = false;
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
  }
};

const cancelBulkAction = () => {
  isBulkConfirmOpen.value = false;
  pendingBulkAction.value = null;
};
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>
