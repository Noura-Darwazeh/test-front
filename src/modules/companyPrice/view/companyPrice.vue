<template>
  <div class="company-price-page-container bg-light">
    <!-- Company Price Header -->
    <CompanyPriceHeader
      v-model="searchText"
      :searchPlaceholder="$t('companyPrice.searchPlaceholder')"
      :data="companyPrices"
      :columns="companyPriceColumns"
      v-model:visibleColumns="visibleColumns"
      :showActiveFilter="true"
      :activeFilterValue="activeStatusFilter"
      @update:activeFilterValue="activeStatusFilter = $event"
      :showAddButton="true"
      :addButtonText="$t('companyPrice.addNew')"
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
              {{ $t('common.active') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link trashed-tab"
              :class="{ active: activeTab === 'trashed' }"
              @click="switchTab('trashed')"
            >
              {{ $t('companyPrice.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="companyPrice"
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
        <div v-else-if="companyPriceStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ companyPriceStore.error }}
        </div>

        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedData" v-model="selectedRows"
            :rowClass="(row) => row.is_active === 0 ? 'row-inactive' : ''">
            <template #actions="{ row }">
              <Actions
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('companyPrice.edit')"
                :detailsLabel="$t('companyPrice.actions.details')"
                :deleteLabel="$t('companyPrice.actions.delete')"
                :showActivate="row.is_active === 0"
                :showDeactivate="row.is_active === 1"
                :activateLabel="$t('common.activate')"
                :deactivateLabel="$t('common.deactivate')"
                :confirmDelete="true"
                @edit="handleEdit"
                @details="handleDetails"
                @delete="handleDeleteCompanyPrice"
                @activate="handleActivate"
                @deactivate="handleDeactivate"
              />
              <Actions
                v-else
                :row="row"
                :restoreLabel="$t('companyPrice.trashed.restore')"
                :deleteLabel="$t('companyPrice.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreCompanyPrice"
                @delete="handlePermanentDeleteCompanyPrice"
              />
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Form Modal for Company Price -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('companyPrice.edit') : $t('companyPrice.addNew')"
      :fields="companyPriceFieldsWithDefaults"
      :showImageUpload="false"
      :serverErrors="formErrors"
      @close="closeModal"
      @submit="handleAddCompanyPrice"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('companyPrice.details.title')"
      :data="selectedPrice"
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

    <!-- Error Modal -->
    <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import CompanyPriceHeader from "../components/companyPriceHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import ErrorModal from "../../../components/shared/ErrorModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { useErrorModal } from "../../../composables/useErrorModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCompanyPriceFormFields } from "../components/companyPriceFormFields.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { useCompanyPriceStore } from "../store/companyPriceStore.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";
import { useActiveToggle } from "../../../composables/useActiveToggle.js";
import { useCurrenciesManagementStore } from "../../currency/store/currenciesManagement.js";

const { t } = useI18n();
const { companyPriceFields } = useCompanyPriceFormFields();
const { companyId, currencyId, currencyName } = useAuthDefaults();
const companyPriceStore = useCompanyPriceStore();
const currenciesStore = useCurrenciesManagementStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();

// Simple price formatter
const formatPrice = (value, symbol = "$") => {
  if (!value || isNaN(value)) return `${symbol}0.00`;
  return `${symbol}${Number(value).toFixed(2)}`;
};

const searchText = ref("");
const activeStatusFilter = ref("");
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedPrice = ref({});
const formErrors = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Store data
const companyPrices = computed(() => companyPriceStore.companyPrices);
const trashedCompanyPrices = computed(() => companyPriceStore.trashedCompanyPrices);
const currencies = computed(() => currenciesStore.currencies);

// Active Toggle
const refreshCompanyPrices = () => companyPriceStore.fetchCompanyPrices();
const { handleActivate, handleDeactivate, handleBulkActivate, handleBulkDeactivate } = useActiveToggle("company-item-prices", refreshCompanyPrices, { showSuccess, showError });

onMounted(async () => {
  try {
    await Promise.all([
      companyPriceStore.fetchCompanyPrices(),
      currenciesStore.fetchCurrencies({ perPage: 1000 })
    ]);
    console.log("✅ Company prices and currencies loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// Add localized item type names
const companyPricesWithLocalizedData = computed(() => {
  return companyPrices.value.map((item) => {
    const symbol =
      item.currency_symbol || item.currency_name || currencyName.value || "$";
    return {
      ...item,
      itemTypeDisplay: item.itemType
        ? t(`companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`)
        : "-",
      calculation_typeDisplay: item.calculation_type ? item.calculation_type : "-",
      volumeDisplay: item.volume !== null && item.volume !== "" && item.volume !== undefined ? item.volume : "-",
      price_volumeDisplay: item.price_volume !== null && item.price_volume !== "" && item.price_volume !== undefined 
        ? formatPrice(item.price_volume, symbol) 
        : "-",
      priceDisplay: item.itemType && item.price !== null && item.price !== "" && item.price !== undefined 
        ? formatPrice(item.price, symbol) 
        : "-",
    };
  });
});

const trashedCompanyPricesWithLocalizedData = computed(() => {
  return trashedCompanyPrices.value.map((item) => {
    const symbol =
      item.currency_symbol || item.currency_name || currencyName.value || "$";
    return {
      ...item,
      itemTypeDisplay: item.itemType
        ? t(`companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`)
        : "-",
      calculation_typeDisplay: item.calculation_type ? item.calculation_type : "-",
      volumeDisplay: item.volume !== null && item.volume !== "" && item.volume !== undefined ? item.volume : "-",
      price_volumeDisplay: item.price_volume !== null && item.price_volume !== "" && item.price_volume !== undefined 
        ? formatPrice(item.price_volume, symbol) 
        : "-",
      priceDisplay: item.itemType && item.price !== null && item.price !== "" && item.price !== undefined 
        ? formatPrice(item.price, symbol) 
        : "-",
    };
  });
});

// Table columns
const companyPriceColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  {
    key: "company_name",
    label: t("companyPrice.table.company"),
    sortable: true,
  },
  {
    key: "itemTypeDisplay",
    label: t("companyPrice.table.itemType"),
    sortable: true,
  },
  {
    key: "priceDisplay",
    label: t("companyPrice.table.price"),
    sortable: true,
  },
  {
    key: "calculation_typeDisplay",
    label: t("companyPrice.table.calculationType", "Calculation Type"),
    sortable: true,
  },
  {
    key: "volumeDisplay",
    label: t("companyPrice.table.volume", "Volume"),
    sortable: true,
  },
  {
    key: "price_volumeDisplay",
    label: t("companyPrice.table.priceVolume", "Price Volume"),
    sortable: true,
  },
  {
    key: "created_at",
    label: t("companyPrice.table.createdAt"),
    sortable: true,
  },
  { key: "is_active", label: t("common.status"), sortable: false, component: "StatusBadge", componentProps: { statusMap: { 1: "active", 0: "inactive" } } },
]);

const trashedColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "company_name", label: t("companyPrice.table.company") },
  { key: "itemTypeDisplay", label: t("companyPrice.table.itemType") },
  {
    key: "priceDisplay",
    label: t("companyPrice.table.price"),
  },
  {
    key: "calculation_typeDisplay",
    label: t("companyPrice.table.calculationType", "Calculation Type"),
  },
  {
    key: "volumeDisplay",
    label: t("companyPrice.table.volume", "Volume"),
  },
  {
    key: "price_volumeDisplay",
    label: t("companyPrice.table.priceVolume", "Price Volume"),
  },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  if (activeTab.value === "active") {
    return companyPriceColumns.value.filter((col) =>
      visibleColumns.value.includes(col.key)
    );
  }
  return trashedColumns.value;
});

const currentData = computed(() => {
  return activeTab.value === "active"
    ? companyPricesWithLocalizedData.value
    : trashedCompanyPricesWithLocalizedData.value;
});

const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? companyPriceStore.loading
    : companyPriceStore.trashedLoading;
});

const currentFilteredData = computed(() => {
  let result = currentData.value;
  // Apply is_active filter (client-side)
  if (activeStatusFilter.value !== "" && activeTab.value === "active") {
    const filterVal = Number(activeStatusFilter.value);
    result = result.filter((item) => item.is_active === filterVal);
  }
  result = filterData(result, searchText.value);
  return result;
});

const paginatedData = computed(() => {
  return currentFilteredData.value;
});

const bulkActions = computed(() => {
  if (activeTab.value === "active") {
    return [
      {
        id: 'activate',
        label: t('common.bulkActivate'),
        bgColor: 'var(--color-success)',
      },
      {
        id: 'deactivate',
        label: t('common.bulkDeactivate'),
        bgColor: 'var(--color-warning, #ffc107)',
      },
      {
        id: "delete",
        label: t("companyPrice.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("companyPrice.bulkRestore"),
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
    count === 1
      ? t("companyPrice.entitySingular")
      : t("companyPrice.entityPlural");

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
  
  // Map calculation_type error to calculation_type_option so it shows inline under the dropdown
  if (normalized.calculation_type) {
    normalized.calculation_type_option = normalized.calculation_type;
    delete normalized.calculation_type;
  }
  
  formErrors.value = normalized;
  return Object.keys(normalized).length > 0;
};

const clearFormErrors = () => {
  formErrors.value = {};
};

// Action methods
const openModal = () => {
  clearFormErrors();
  isEditMode.value = false;
  selectedPrice.value = {
    calculation_type_option: "volume_weight"
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedPrice.value = {};
  clearFormErrors();
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await companyPriceStore.fetchTrashedCompanyPrices();
    } catch (error) {
      console.error("❌ Failed to load trashed company prices:", error);
    }
  } else {
    try {
      await companyPriceStore.fetchCompanyPrices();
    } catch (error) {
      console.error("❌ Failed to load company prices:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await companyPriceStore.fetchTrashedCompanyPrices();
    } else {
      await companyPriceStore.fetchCompanyPrices();
    }
  } catch (error) {
    console.error("❌ Failed to refresh company prices:", error);
  }
};

const handleAddCompanyPrice = async (priceData) => {
  const resolvedCompanyId = companyId.value
    ? parseInt(companyId.value, 10)
    : priceData.company_id
      ? parseInt(priceData.company_id, 10)
      : null;
  const resolvedCurrencyId = priceData.currency_id
    ? parseInt(priceData.currency_id, 10)
    : currencyId.value
      ? parseInt(currencyId.value, 10)
      : null;

  try {
    let payload = {
      company_id: resolvedCompanyId,
      currency_id: resolvedCurrencyId,
    };

    if (priceData.calculation_type_option === 'per_order_volume' || priceData.calculation_type_option === 'per_item_volume') {
      payload.volume = parseFloat(priceData.volume || 0);
      payload.price_volume = parseFloat(priceData.price_volume || 0);
      payload.calculation_type = priceData.calculation_type_option;
      payload.price = payload.price_volume;
    } else {
      payload.price = parseFloat(priceData.price || 0);
      payload.itemType = priceData.itemType;
    }

    if (isEditMode.value) {
      await companyPriceStore.updateCompanyPrice(selectedPrice.value.id, payload);
      console.log("✅ Company price updated successfully!");
      showSuccess(t('companyPrice.updateSuccess'));
    } else {
      await companyPriceStore.addCompanyPrice(payload);
      console.log("✅ Company price added successfully!");
      showSuccess(t('companyPrice.addSuccess'));
    }

    closeModal();
  } catch (error) {
    console.error("❌ Failed to submit company price:", error);
    if (applyServerErrors(error)) {
      return;
    }
    showError(error.message || t('common.saveFailed'));
  }
};

const handleRestoreCompanyPrice = async (price) => {
  try {
    await companyPriceStore.restoreCompanyPrice(price.id);
    console.log("✅ Company price restored successfully!");
    showSuccess(t('companyPrice.restoreSuccess'));
  } catch (error) {
    console.error("❌ Failed to restore company price:", error);
    showError(error.message || 'Failed to restore company price');
  }
};

const handleDeleteCompanyPrice = async (price) => {
  try {
    await companyPriceStore.deleteCompanyPrice(price.id);
    console.log("✅ Company price deleted successfully!");
    showSuccess(t('companyPrice.deleteSuccess'));
  } catch (error) {
    console.error("❌ Failed to delete company price:", error);
    showError(error.message || t('common.saveFailed'));
  }
};

const handlePermanentDeleteCompanyPrice = async (price) => {
  try {
    await companyPriceStore.deleteCompanyPrice(price.id, true);
    console.log("✅ Company price permanently deleted successfully!");
    showSuccess(t('companyPrice.permanentDeleteSuccess'));
  } catch (error) {
    console.error("❌ Failed to permanently delete company price:", error);
    showError(error.message || t('common.saveFailed'));
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
      await companyPriceStore.bulkDeleteCompanyPrices(selectedRows.value, false);
      console.log("✅ Company prices soft deleted successfully");
      showSuccess(t('companyPrice.bulkDeleteSuccess', { count }));
    } else if (pendingBulkAction.value === "permanentDelete") {
      await companyPriceStore.bulkDeleteCompanyPrices(selectedRows.value, true);
      console.log("✅ Company prices permanently deleted successfully");
      showSuccess(t('companyPrice.bulkDeleteSuccess', { count }));
    } else if (pendingBulkAction.value === "restore") {
      await companyPriceStore.bulkRestoreCompanyPrices(selectedRows.value);
      console.log("✅ Company prices restored successfully");
      showSuccess(t('companyPrice.bulkRestoreSuccess', { count }));
    } else if (pendingBulkAction.value === 'activate') {
      await handleBulkActivate(selectedRows.value);
    } else if (pendingBulkAction.value === 'deactivate') {
      await handleBulkDeactivate(selectedRows.value);
    }
    selectedRows.value = [];
    pendingBulkAction.value = null;
  } catch (error) {
    console.error("❌ Failed to bulk delete company prices:", error);
  } finally {
    bulkActionLoading.value = false;
  }
};

const cancelBulkAction = () => {
  isBulkConfirmOpen.value = false;
  pendingBulkAction.value = null;
};

const handleEdit = (price) => {
  clearFormErrors();
  isEditMode.value = true;
  // Use original price data, not the computed version
  const originalPrice = companyPrices.value.find((p) => p.id === price.id);
  
  const calcOption = originalPrice.calculation_type === 'per_order_volume' || originalPrice.calculation_type === 'per_item_volume' 
    ? originalPrice.calculation_type 
    : 'volume_weight';

  selectedPrice.value = { 
    ...originalPrice,
    calculation_type_option: calcOption
  };
  isModalOpen.value = true;
};

const handleDetails = (price) => {
  selectedPrice.value = { ...price };
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedPrice.value = {};
};

// Update form fields to support edit mode
const companyPriceFieldsWithDefaults = computed(() => {
  const currencyOptions = currencies.value.map(c => ({
    value: c.id,
    label: c.name || c.symbol || c.id
  }));

  return companyPriceFields.value.map((field) => {
    let newField = {
      ...field,
      defaultValue: isEditMode.value
        ? selectedPrice.value[field.name]
        : (selectedPrice.value[field.name] !== undefined ? selectedPrice.value[field.name] : field.defaultValue || "")
    };
    
    if (newField.name === 'currency_id') {
      newField.options = currencyOptions;
      if (!newField.defaultValue && currencyId.value) {
        newField.defaultValue = currencyId.value;
      }
    }
    
    return newField;
  });
});

// Details fields configuration
const detailsFields = computed(() => [
  { key: "id", label: t("companyPrice.table.id"), colClass: "col-md-6" },
  {
    key: "company_name",
    label: t("companyPrice.table.company"),
    colClass: "col-md-6",
  },
  {
    key: "calculation_typeDisplay",
    label: t("companyPrice.table.calculationType", "Calculation Type"),
    colClass: "col-md-6",
  },
  {
    key: "itemTypeDisplay",
    label: t("companyPrice.table.itemType"),
    colClass: "col-md-6",
  },
  {
    key: "volumeDisplay",
    label: t("companyPrice.table.volume", "Volume"),
    colClass: "col-md-6",
  },
  {
    key: "priceDisplay",
    label: t("companyPrice.table.price"),
    colClass: "col-md-6",
  },
  {
    key: "price_volumeDisplay",
    label: t("companyPrice.table.priceVolume", "Price Volume"),
    colClass: "col-md-6",
  },
  {
    key: "created_at",
    label: t("companyPrice.table.createdAt"),
    colClass: "col-md-6",
  },
]);

</script>

<style scoped>
.company-price-page-container {
  max-width: 100%;
}
</style>