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
      :showAddButton="canAddUser"
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
                        :disableRowWhen="disableUserSelection"

          >
            <template #actions="{ row }">
              <!-- Active Users Actions -->
              <ActionsDropdown
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('user.edit')"
                :detailsLabel="$t('user.details')"
                :deleteLabel="$t('user.delete')"
                :showEdit="canEditUser(row)"
                :showDelete="canDeleteUser(row)"
                :showDetails="true"
                @edit="openEditModal"
                @details="openDetailsModal"
                @delete="handleDeleteUser"
              />
              <!-- Trashed Users Actions -->
              <ActionsDropdown
                v-else
                :row="row"
                :restoreLabel="$t('user.trashed.restore')"
                :deleteLabel="$t('user.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showDelete="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreUser"
                
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
      :serverErrors="formErrors"
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

        <SuccessModal 
      :isOpen="isSuccessModalOpen" 
      :title="$t('common.success')"
      :message="successMessage"
      @close="closeSuccessModal" 
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
import { useI18n } from "vue-i18n";
import usersHeader from "../components/usersHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useUsersManagementStore } from "../store/usersManagement.js";
import { VALIDATION_LIMITS } from "../constants/userConstants.js";
import apiServices from "@/services/apiServices.js";
import { useAuthStore } from "@/stores/auth.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";
import SuccessModal from "../../../components/shared/SuccessModal.vue"; 
import { useSuccessModal } from "../../../composables/useSuccessModal.js"; 
const { t } = useI18n();
const usersStore = useUsersManagementStore();
const authStore = useAuthStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal(); // ✅

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

// ✅ Check if user can add users (SuperAdmin or Admin)
const isSuperAdmin = computed(
  () => (authStore.userRole || "").toLowerCase() === "superadmin",
);

const isAdmin = computed(
  () => (authStore.userRole || "").toLowerCase() === "admin",
);

const canAddUser = computed(() => isSuperAdmin.value || isAdmin.value);

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const skipNextPageWatch = ref(false);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditMode = ref(false);
const selectedUser = ref({});
const userToDelete = ref(null);
const activeTab = ref("active");
const selectedRows = ref([]);
const formErrors = ref({});

// Get the correct pagination metadata based on active tab
const currentPagination = computed(() => {
  return activeTab.value === "active"
    ? usersStore.usersPagination
    : usersStore.trashedPagination;
});

const itemsPerPage = computed(() => currentPagination.value.perPage || 10);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Dynamic data from API
const regions = ref([]);
const currencies = ref([]);
const companies = ref([]);
const dataLoading = ref(false);

// ✅ Roles available based on user type
const roles = computed(() => {
  if (isSuperAdmin.value) {
    // SuperAdmin can add all roles
    return [
      { value: "Admin", label: "Admin" },
      { value: "Employee", label: "Employee" },
      { value: "Supervisor", label: "Supervisor" },
    ];
  } else if (isAdmin.value) {
    // Admin can only add Employee and Supervisor
    return [
      { value: "Employee", label: "Employee" },
      { value: "Supervisor", label: "Supervisor" },
    ];
  }
  return [];
});

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
  const shouldFetchCompanies = isSuperAdmin.value;
  try {
    const requests = [
      apiServices.getRegions(),
      apiServices.getCurrencies(),
    ];

    if (shouldFetchCompanies) {
      requests.push(apiServices.getCompanies());
    }

    const results = await Promise.allSettled(requests);
    const [regionsResponse, currenciesResponse, companiesResponse] = results;

    if (regionsResponse.status === "fulfilled") {
      regions.value = regionsResponse.value.data.data.map((region) => ({
        value: String(region.id),
        label: region.name,
      }));
    } else {
      regions.value = [];
      console.error("❌ Failed to load regions:", regionsResponse.reason);
    }

    if (currenciesResponse.status === "fulfilled") {
      currencies.value = currenciesResponse.value.data.data.map((currency) => ({
        value: String(currency.id),
        label: `${currency.code} (${currency.symbol})`,
      }));
    } else {
      currencies.value = [];
      console.error("❌ Failed to load currencies:", currenciesResponse.reason);
    }

    if (shouldFetchCompanies) {
      if (companiesResponse && companiesResponse.status === "fulfilled") {
        companies.value = companiesResponse.value.data.data.map((company) => ({
          value: String(company.id),
          label: company.name,
        }));
      } else {
        companies.value = [];
        console.error("❌ Failed to load companies:", companiesResponse?.reason);
      }
    } else {
      companies.value = [];
    }

  } catch (error) {
    console.error("❌ Failed to load dropdown data:", error);
  } finally {
    dataLoading.value = false;
  }
};

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([fetchUsersPage(1), fetchDropdownData()]);
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
    await fetchUsersPage(newPage);
  } catch (err) {
    console.error("Failed to load page:", err);
  }
});

// ✅ User Form Fields with conditional logic
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
    // defaultValue: isEditMode.value
    //   ? selectedUser.value.role
    //     ? selectedUser.value.role[0]
    //     : selectedUser.value.role
    //   : "",
      defaultValue: isEditMode.value ? selectedUser.value.role : "", 

  },
  {
    name: "company_id",
    label: t("user.form.company"),
    type: "select",
    required: false,
    // ✅ SuperAdmin sees all companies, Admin sees only their company (hidden field)
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
    locked: !isSuperAdmin.value, // ✅ Locked for Admin
    hidden: !isSuperAdmin.value, // ✅ Hidden for Admin
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
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "name", label: t("user.fullName"), sortable: true },
  { key: "username", label: t("user.username"), sortable: true },
  { key: "email", label: t("user.email"), sortable: false },
  { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
  { key: "role", label: t("user.userRole"), sortable: true },
  { key: "company_name", label: t("user.company"), sortable: false },
]);

const trashedColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
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
  try {
    await fetchUsersPage(1);
  } catch (error) {
    console.error("❌ Failed to load users:", error);
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    await fetchUsersPage(currentPage.value);
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
  }
  return [
    {
      id: "restore",
      label: t("user.bulkRestore"),
      bgColor: "var(--color-success)",
    },
 
  ];
});

// Bulk confirmation message
const bulkConfirmMessage = computed(() => {
  if (!pendingBulkAction.value) return "";

  const count = selectedRows.value.length;
  const entity = count === 1 ? t("user.entitySingular") : t("user.entityPlural");

  if (pendingBulkAction.value === "delete") {
    return t("common.bulkDeleteConfirm", { count, entity });
  }
  if (pendingBulkAction.value === "permanentDelete") {
    return t("common.bulkPermanentDeleteConfirm", { count, entity });
  }
  if (pendingBulkAction.value === "restore") {
    return t("common.bulkRestoreConfirm", { count, entity });
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

const buildUserFilters = () => {
  const filters = {};
  const trimmedSearch = searchText.value.trim();
  if (trimmedSearch) {
    filters.search = trimmedSearch;
  }
  if (selectedGroups.value.length > 0) {
    filters.role =
      selectedGroups.value.length === 1
        ? selectedGroups.value[0]
        : selectedGroups.value.join(",");
  }
  return filters;
};

const fetchUsersPage = async (page = 1) => {
  const filters = buildUserFilters();
  if (activeTab.value === "trashed") {
    await usersStore.fetchTrashedUsers({
      page,
      perPage: itemsPerPage.value,
      filters,
    });
  } else {
    await usersStore.fetchUsers({
      page,
      perPage: itemsPerPage.value,
      filters,
    });
  }
};

// Server already returns paginated data; use store results directly
const paginatedData = computed(() => currentData.value);

watch([searchText, selectedGroups], async () => {
  if (currentPage.value !== 1) {
    skipNextPageWatch.value = true;
    currentPage.value = 1;
  }
  try {
    await fetchUsersPage(1);
  } catch (error) {
    console.error("❌ Failed to apply filters:", error);
  }
});

const applyServerErrors = (error) => {
  const normalized = normalizeServerErrors(error);
  formErrors.value = normalized;
  return Object.keys(normalized).length > 0;
};

const clearFormErrors = () => {
  formErrors.value = {};
};

// Add Modal
const openModal = () => {
  clearFormErrors();
  isEditMode.value = false;
  selectedUser.value = {};
  isModalOpen.value = true;
};

// Edit Modal
const openEditModal = (user) => {
  clearFormErrors();
  isEditMode.value = true;
  // selectedUser.value = { ...user };


    const normalizedUser = {
    ...user,
    role: Array.isArray(user.role) ? user.role[0] : user.role
  };
  
  selectedUser.value = normalizedUser;

  if (selectedUser.value.image) {
    selectedUser.value.imagePreview = getFullImageUrl(selectedUser.value.image);
  }

  isModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (user) => {
  selectedUser.value = { ...user };

  if (selectedUser.value.image) {
    selectedUser.value.image = getFullImageUrl(selectedUser.value.image);
  }

  isDetailsModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedUser.value = {};
  clearFormErrors();
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

    // ✅ Validation for Admin: prevent adding Admin role
    if (isAdmin.value && normalizedRole === "Admin") {
      alert(t("user.validation.cannotAddAdmin"));
      return;
    }

    // ✅ Force company_id for Admin users
    if (isAdmin.value && !userData.company_id) {
      userData.company_id = companyId.value;
    }

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
      
      // ✅ Admin cannot change company_id
      if (isSuperAdmin.value && userData.company_id !== selectedUser.value.company_id) {
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
      showSuccess(t('user.updateSuccess'));

      closeModal();
    } else {
      // Add new user
      const newUser = {
        name: userData.name,
        username: userData.username,
        password: userData.password,
        phone_number: userData.phone_number,
        role: normalizedRole,
        company_id: isAdmin.value ? companyId.value : (userData.company_id || null), // ✅ Force Admin's company
        region_id: userData.region_id || null,
        currency_id: userData.currency_id || null,
      };

      // Add optional email field only if provided
      if (userData.email) newUser.email = userData.email;

      // Add image file if it exists (not base64)
      if (userData.image && userData.image instanceof File) {
        newUser.image = userData.image;
      }

      await usersStore.addUser(newUser);
      console.log("✅ User added successfully!");
      showSuccess(t('user.addSuccess'));
      closeModal();
    }
  } catch (error) {
    console.error("❌ Failed to save user:", error);
    if (applyServerErrors(error)) {
      return;
    }
    alert(error.message || "Failed to save user. Please try again.");
  }
};

const handleRestoreUser = async (user) => {
  try {
    await usersStore.restoreUser(user.id);
    console.log("✅ User restored successfully!");
    showSuccess(t('user.restoreSuccess'));
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
      showSuccess(t('user.deleteSuccess'));
      userToDelete.value = null;
    }
  } catch (error) {
    console.error("❌ Failed to delete user:", error);
  }
};

// Bulk action handler
const handleBulkAction = ({ actionId }) => {
  pendingBulkAction.value = actionId;

  if (actionId === "delete" || actionId === "permanentDelete") {
    isBulkConfirmOpen.value = true;
  } else {
    executeBulkAction();
  }
};

import { nextTick } from "vue"; 

const executeBulkAction = async () => {
  bulkActionLoading.value = true;
  const count = selectedRows.value.length;

  try {
    if (pendingBulkAction.value === "delete") {
      await usersStore.bulkDeleteUsers(selectedRows.value, false);
      console.log(`✅ ${count} users deleted successfully!`);
      
      isBulkConfirmOpen.value = false;
      pendingBulkAction.value = null;
      selectedRows.value = [];
      
      await nextTick();
      showSuccess(t('user.bulkDeleteSuccess', { count }));
      
    }  else if (pendingBulkAction.value === "restore") {
      await usersStore.bulkRestoreUsers(selectedRows.value);
      console.log(`✅ ${count} users restored successfully!`);
      
      isBulkConfirmOpen.value = false;
      pendingBulkAction.value = null;
      selectedRows.value = [];
      
      await nextTick();
      showSuccess(t('user.bulkRestoreSuccess', { count }));
      
      await usersStore.fetchTrashedUsers();
    }

  } catch (error) {
    console.error(`❌ Bulk action failed:`, error);
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
  } finally {
    bulkActionLoading.value = false;
  }
};

const cancelBulkAction = () => {
  isBulkConfirmOpen.value = false;
  pendingBulkAction.value = null;
};

const canEditUser = (user) => {

  if (isSuperAdmin.value) return true;
  
  if (isAdmin.value) {
    const userCompanyId = resolveIdValue(user.company_id ?? user.company);
    return userCompanyId === companyId.value;
  }
  
  return false;
};

const canDeleteUser = (user) => {
  if (isSuperAdmin.value) return true;
  
  if (isAdmin.value) {
    const userCompanyId = resolveIdValue(user.company_id ?? user.company);
    return userCompanyId === companyId.value;
  }

  return false;
};

// Disable row selection for users that can't be edited or deleted
const disableUserSelection = (user) => {
  // If user can't edit or delete, disable selection
  return !canEditUser(user) && !canDeleteUser(user);
};
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>
