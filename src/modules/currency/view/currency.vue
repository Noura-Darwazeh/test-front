<template>
  <div class="currency-page-container bg-light">
    <!-- Currency Header -->
    <CurrencyHeader
      v-model="searchText"
      :searchPlaceholder="$t('currency.searchPlaceholder')"
      :data="currenciesWithLocalizedName"
      :columns="currencyColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('currency.addNew')"
      @add-click="openModal"
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
              {{ $t('currency.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <BulkActionsBar
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
          >
            <template #actions="{ row }">
              <Actions
                v-if="activeTab === 'active'"
                :row="row"
                :deleteLabel="$t('currency.actions.delete')"
                :showEdit="false"
                :showDetails="false"
                :confirmDelete="true"
                @delete="handleDeleteCurrency"
              />
              <Actions
                v-else
                :row="row"
                :restoreLabel="$t('currency.trashed.restore')"
                :deleteLabel="$t('currency.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreCurrency"
                @delete="handlePermanentDeleteCurrency"
              />
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="currentFilteredData.length"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              @update:currentPage="(page) => (currentPage = page)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for Currency -->
    <FormModal
      :isOpen="isModalOpen"
      :title="$t('currency.addNew')"
      :fields="currencyFields"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleAddCurrency"
    />

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
import CurrencyHeader from "../components/currencyHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import Actions from "../../../components/shared/Actions.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import { filterData, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCurrencyFormFields } from "../components/currencyFormFields.js";
import { useCurrenciesManagementStore } from "../store/currenciesManagement.js";

const { t, locale } = useI18n();
const { currencyFields } = useCurrencyFormFields();
const currenciesStore = useCurrenciesManagementStore();

const searchText = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Get currencies from store
const currencies = computed(() => currenciesStore.currencies);
const trashedCurrencies = computed(() => currenciesStore.trashedCurrencies);

// Fetch currencies on component mount
onMounted(async () => {
  try {
    await currenciesStore.fetchCurrencies();
    console.log("✅ Currencies loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load currencies:", error);
  }
});

// Table columns
const currencyColumns = computed(() => [
  { key: "id", label: t("currency.table.id"), sortable: true },
  { key: "key", label: t("currency.table.key"), sortable: true },
  { key: "name", label: t("currency.table.name"), sortable: true },
  { key: "symbol", label: t("currency.table.symbol"), sortable: true },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("currency.table.id") },
  { key: "key", label: t("currency.table.key") },
  { key: "name", label: t("currency.table.name") },
  { key: "symbol", label: t("currency.table.symbol") },
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

// Add localized name to currencies
const currenciesWithLocalizedName = computed(() => {
  return currencies.value.map((currency) => ({
    ...currency,
    name: locale.value === "ar" ? currency.namearabic : currency.nameenglish,
  }));
});

const trashedCurrenciesWithLocalizedName = computed(() => {
  return trashedCurrencies.value.map((currency) => ({
    ...currency,
    name: locale.value === "ar" ? currency.namearabic : currency.nameenglish,
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

const paginatedData = computed(() => {
  return paginateData(
    currentFilteredData.value,
    currentPage.value,
    itemsPerPage.value
  );
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

// Action methods
const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await currenciesStore.fetchTrashedCurrencies();
    } catch (error) {
      console.error("Failed to load trashed currencies:", error);
    }
  }
};

const handleAddCurrency = async (currencyData) => {
  try {
    // Check for unique key validation
    const existingCurrency = currencies.value.find(
      (c) => c.key && c.key.toLowerCase() === currencyData.key.toLowerCase()
    );
    if (existingCurrency) {
      alert(t("currency.validation.keyExists"));
      return;
    }

    // Send to backend
    const newCurrency = {
      key: currencyData.key.toUpperCase(),
      nameenglish: currencyData.nameenglish,
      namearabic: currencyData.namearabic,
      symbol: currencyData.symbol,
    };

    await currenciesStore.addCurrency(newCurrency);
    console.log("✅ Currency added successfully!");
    closeModal();
  } catch (error) {
    console.error("❌ Failed to add currency:", error);
    alert(error.message || "Failed to add currency");
  }
};

const handleRestoreCurrency = async (currency) => {
  try {
    await currenciesStore.restoreCurrency(currency.id);
    console.log("Currency restored successfully!");
  } catch (error) {
    console.error("Failed to restore currency:", error);
    alert(error.message || "Failed to restore currency");
  }
};

const handleDeleteCurrency = async (currency) => {
  try {
    await currenciesStore.deleteCurrency(currency.id);
    console.log("Currency deleted successfully!");
  } catch (error) {
    console.error("Failed to delete currency:", error);
    alert(error.message || "Failed to delete currency");
  }
};

const handlePermanentDeleteCurrency = async (currency) => {
  try {
    await currenciesStore.deleteCurrency(currency.id, true);
    console.log("Currency permanently deleted successfully!");
  } catch (error) {
    console.error("Failed to permanently delete currency:", error);
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

  try {
    if (pendingBulkAction.value === "delete") {
      await currenciesStore.bulkDeleteCurrencies(selectedRows.value, false);
    } else if (pendingBulkAction.value === "permanentDelete") {
      await currenciesStore.bulkDeleteCurrencies(selectedRows.value, true);
    } else if (pendingBulkAction.value === "restore") {
      await currenciesStore.bulkRestoreCurrencies(selectedRows.value);
    }
    selectedRows.value = [];
  } catch (error) {
    console.error("Failed to bulk delete currencies:", error);
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

watch([searchText], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.currency-page-container {
  max-width: 100%;
}
</style>

