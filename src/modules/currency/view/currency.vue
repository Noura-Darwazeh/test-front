<template>
  <div class="currency-page-container bg-light">
    <!-- Currency Header -->
    <CurrencyHeader
      v-model="searchText"
      :searchPlaceholder="$t('currency.searchPlaceholder')"
      :data="currenciesWithLocalizedName"
      :columns="currencyColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="canAdd"
      :addButtonText="$t('currency.addNew')"
      @add-click="openAddModal"
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
              {{ $t('common.active') }}
            </button>
          </li>
          <li v-if="canDelete" class="nav-item">
            <button
              class="nav-link trashed-tab"
              :class="{ active: activeTab === 'trashed' }"
              @click="switchTab('trashed')"
            >
              {{ $t('currency.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <!-- Bulk Actions Bar - Only for SuperAdmin -->
        <BulkActionsBar
          v-if="canDelete"
          :selectedCount="selectedRows.length"
          entityName="currency"
          :actions="bulkActions"
          :loading="bulkActionLoading"
          @action="handleBulkAction"
        />

        <!-- Loading State -->
        <div v-if="currentLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="currenciesStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ currenciesStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            v-model="selectedRows"
            :showCheckbox="canDelete"
          >
            <template #actions="{ row }">
              <Actions
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('currency.actions.edit')"
                :detailsLabel="$t('currency.actions.details')"
                :deleteLabel="$t('currency.actions.delete')"
                :showEdit="canEdit"
                :showDetails="true"
                :showDelete="canDelete"
                :confirmDelete="true"
                @edit="openEditModal"
                @details="openDetailsModal"
                @delete="handleDeleteCurrency"
              />
              <Actions
                v-else
                :row="row"
                :restoreLabel="$t('currency.trashed.restore')"
                :deleteLabel="$t('currency.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="canDelete"
                :confirmDelete="true"
                @restore="handleRestoreCurrency"
                @delete="handlePermanentDeleteCurrency"
              />
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Form Modal for Add/Edit Currency -->
    <FormModal
      :isOpen="isFormModalOpen"
      :title="isEditMode ? $t('currency.edit') : $t('currency.addNew')"
      :fields="currencyFields"
      :showImageUpload="false"
      :serverErrors="formErrors"
      @close="closeFormModal"
      @submit="handleSubmitCurrency"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('currency.details')"
      :data="selectedCurrency"
      :fields="detailsFields"
      @close="closeDetailsModal"
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

    <!-- Success Modal -->
    <SuccessModal 
      :isOpen="isSuccessModalOpen" 
      :title="$t('common.success')"
      :message="successMessage"
      @close="closeSuccessModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import CurrencyHeader from "../components/currencyHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import Actions from "../../../components/shared/Actions.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCurrencyFormFields } from "../components/currencyFormFields.js";
import { useCurrenciesManagementStore } from "../store/currenciesManagement.js";
import { useAuthStore } from "@/stores/auth.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t, locale } = useI18n();
const currenciesStore = useCurrenciesManagementStore();
const authStore = useAuthStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

// Permissions
const isSuperAdmin = computed(() => authStore.hasRole('SuperAdmin'));
const canAdd = computed(() => isSuperAdmin.value);
const canEdit = computed(() => isSuperAdmin.value);
const canDelete = computed(() => isSuperAdmin.value);

const searchText = ref("");
const itemsPerPage = 1000;
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCurrency = ref({});
const formErrors = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Get currencies from store
const currencies = computed(() => currenciesStore.currencies);
const trashedCurrencies = computed(() => currenciesStore.trashedCurrencies);

// Use currency fields with refs
const { currencyFields } = useCurrencyFormFields(isEditMode, selectedCurrency);

// Fetch currencies on component mount
onMounted(async () => {
  try {
    await currenciesStore.fetchCurrencies({ page: 1, perPage: itemsPerPage });
  } catch (error) {
    if (applyServerErrors(error)) {
      return;
    }
    console.error("❌ Failed to load currencies:", error);
  }
});


// Table columns
const currencyColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "name", label: t("currency.table.name"), sortable: true },
  { key: "symbol", label: t("currency.table.symbol"), sortable: true },
  { key: "key", label: t("currency.table.key"), sortable: true },
]);

const trashedColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "name", label: t("currency.table.name") },
  { key: "symbol", label: t("currency.table.symbol") },
  { key: "key", label: t("currency.table.key") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  if (activeTab.value === "active") {
    return currencyColumns.value.filter((col) =>
      visibleColumns.value.includes(col.key)
    );
  }
  return trashedColumns.value;
});

// Details fields
const detailsFields = computed(() => [
  { key: 'id', label: t('currency.details.id'), colClass: 'col-md-6' },
  { key: 'key', label: t('currency.details.key'), colClass: 'col-md-6' },
  { key: 'nameenglish', label: t('currency.details.nameEnglish'), colClass: 'col-md-6' },
  { key: 'namearabic', label: t('currency.details.nameArabic'), colClass: 'col-md-6' },
  { key: 'symbol', label: t('currency.details.symbol'), colClass: 'col-md-6' },
  { key: 'is_active', label: t('currency.details.status'), colClass: 'col-md-6' },
]);

// Add localized name to currencies
const currenciesWithLocalizedName = computed(() => {
  return currencies.value.map((currency) => ({
    ...currency,
    name:
      locale.value === "ar"
        ? currency.namearabic || currency.name
        : currency.nameenglish || currency.name,
  }));
});

const trashedCurrenciesWithLocalizedName = computed(() => {
  return trashedCurrencies.value.map((currency) => ({
    ...currency,
    name:
      locale.value === "ar"
        ? currency.namearabic || currency.name
        : currency.nameenglish || currency.name,
  }));
});

const currentData = computed(() => {
  return activeTab.value === "active"
    ? currenciesWithLocalizedName.value
    : trashedCurrenciesWithLocalizedName.value;
});

const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? currenciesStore.loading
    : currenciesStore.trashedLoading;
});

const currentFilteredData = computed(() => {
  let result = currentData.value;
  result = filterData(result, searchText.value);
  return result;
});

// Server already returns paginated data
const paginatedData = computed(() => {
  return currentFilteredData.value;
});


const bulkActions = computed(() => {
  if (activeTab.value === "active") {
    return [
      {
        id: "delete",
        label: t("currency.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("currency.bulkRestore"),
      bgColor: "var(--color-success)",
    },
    {
      id: "permanentDelete",
      label: t("common.permanentDelete"),
      bgColor: "var(--color-danger)",
    },
  ];
});

const bulkConfirmMessage = computed(() => {
  if (!pendingBulkAction.value) return "";

  const count = selectedRows.value.length;
  const entity =
    count === 1 ? t("currency.entitySingular") : t("currency.entityPlural");

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

const applyServerErrors = (error) => {
  const normalized = normalizeServerErrors(error);
  formErrors.value = normalized;
  return Object.keys(normalized).length > 0;
};

const clearFormErrors = () => {
  formErrors.value = {};
};

// Action methods
const openAddModal = () => {
  clearFormErrors();
  isEditMode.value = false;
  selectedCurrency.value = {};
  isFormModalOpen.value = true;
};

const openEditModal = (currency) => {
  clearFormErrors();
  isEditMode.value = true;
  selectedCurrency.value = { ...currency };
  isFormModalOpen.value = true;
};

const openDetailsModal = (currency) => {
  selectedCurrency.value = { ...currency };
  isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
  isEditMode.value = false;
  selectedCurrency.value = {};
  clearFormErrors();
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedCurrency.value = {};
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await currenciesStore.fetchTrashedCurrencies({ page: 1, perPage: itemsPerPage });
    } catch (error) {
      console.error("❌ Failed to load trashed currencies:", error);
    }
  } else {
    try {
      await currenciesStore.fetchCurrencies({ page: 1, perPage: itemsPerPage });
    } catch (error) {
      console.error("❌ Failed to load currencies:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await currenciesStore.fetchTrashedCurrencies({ page: 1, perPage: itemsPerPage });
    } else {
      await currenciesStore.fetchCurrencies({ page: 1, perPage: itemsPerPage });
    }
  } catch (error) {
    console.error("❌ Failed to refresh currencies:", error);
  }
};

const handleSubmitCurrency = async (currencyData) => {
  try {
    if (isEditMode.value) {
      console.log('📝 Component: Editing currency:', selectedCurrency.value.id);
      console.log('📦 Component: Form data:', currencyData);

      const updateData = {};
      
      if (currencyData.key && currencyData.key !== selectedCurrency.value.key) {
        updateData.key = currencyData.key.toUpperCase();
      }
      
      if (currencyData.nameenglish && currencyData.nameenglish !== selectedCurrency.value.nameenglish) {
        updateData.nameenglish = currencyData.nameenglish;
      }
      
      if (currencyData.namearabic && currencyData.namearabic !== selectedCurrency.value.namearabic) {
        updateData.namearabic = currencyData.namearabic;
      }
      
      if (currencyData.symbol && currencyData.symbol !== selectedCurrency.value.symbol) {
        updateData.symbol = currencyData.symbol;
      }

      if (Object.keys(updateData).length === 0) {
        closeFormModal();
        return;
      }


      await currenciesStore.updateCurrency(selectedCurrency.value.id, updateData);
      console.log("✅ Component: Currency updated successfully!");
      showSuccess(t('currency.updateSuccess'));
      
    } else {
      console.log('📝 Component: Adding new currency');
      
      const existingCurrency = currencies.value.find(
        (c) => c.key && c.key.toLowerCase() === currencyData.key.toLowerCase()
      );
      if (existingCurrency) {
        alert(t("currency.validation.keyExists"));
        return;
      }

      const newCurrency = {
        key: currencyData.key.toUpperCase(),
        nameenglish: currencyData.nameenglish,
        namearabic: currencyData.namearabic,
        symbol: currencyData.symbol,
      };


      await currenciesStore.addCurrency(newCurrency);
      console.log("✅ Component: Currency added successfully!");
      showSuccess(t('currency.addSuccess'));
    }
    closeFormModal();
  } catch (error) {
    console.error("❌ Component: Failed to save currency:", error);
    alert(error.message || "Failed to save currency");
  }
};

const handleRestoreCurrency = async (currency) => {
  try {
    await currenciesStore.restoreCurrency(currency.id);
    console.log("✅ Currency restored successfully!");
    showSuccess(t('currency.restoreSuccess'));
  } catch (error) {
    console.error("❌ Failed to restore currency:", error);
    alert(error.message || "Failed to restore currency");
  }
};

const handleDeleteCurrency = async (currency) => {
  try {
    await currenciesStore.deleteCurrency(currency.id);
    console.log("✅ Currency deleted successfully!");
    showSuccess(t('currency.deleteSuccess'));
  } catch (error) {
    console.error("❌ Failed to delete currency:", error);
    alert(error.message || "Failed to delete currency");
  }
};

const handlePermanentDeleteCurrency = async (currency) => {
  try {
    await currenciesStore.deleteCurrency(currency.id, true);
    console.log("✅ Currency permanently deleted successfully!");
    showSuccess(t('currency.permanentDeleteSuccess'));
  } catch (error) {
    console.error("❌ Failed to permanently delete currency:", error);
    alert(error.message || "Failed to delete currency");
  }
};

const handleBulkAction = ({ actionId }) => {
  pendingBulkAction.value = actionId;
  isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
  if (!pendingBulkAction.value) return;
  bulkActionLoading.value = true;
  isBulkConfirmOpen.value = false;
  const count = selectedRows.value.length;

  try {
    if (pendingBulkAction.value === "delete") {
      await currenciesStore.bulkDeleteCurrencies(selectedRows.value, false);
      console.log("✅ Currencies soft deleted successfully");
      showSuccess(t('currency.bulkDeleteSuccess', { count }));
    } else if (pendingBulkAction.value === "permanentDelete") {
      await currenciesStore.bulkDeleteCurrencies(selectedRows.value, true);
      console.log("✅ Currencies permanently deleted successfully");
      showSuccess(t('currency.bulkDeleteSuccess', { count }));
    } else if (pendingBulkAction.value === "restore") {
      await currenciesStore.bulkRestoreCurrencies(selectedRows.value);
      console.log("✅ Currencies restored successfully");
      showSuccess(t('currency.bulkRestoreSuccess', { count }));
    }
    selectedRows.value = [];
    pendingBulkAction.value = null;
  } catch (error) {
    console.error("❌ Failed to bulk action currencies:", error);
  } finally {
    bulkActionLoading.value = false;
  }
};

const cancelBulkAction = () => {
  isBulkConfirmOpen.value = false;
  pendingBulkAction.value = null;
};

</script>

<style scoped>
.currency-page-container {
  max-width: 100%;
}
</style>