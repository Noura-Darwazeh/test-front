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
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="currenciesStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
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
          <DataTable :columns="filteredColumns" :data="paginatedCurrencies">
            <template #actions="{ row }">
              <div class="d-flex gap-1 justify-content-center">
                <button
                  @click="deleteCurrency(row.id)"
                  class="btn btn-sm btn-outline-secondary"
                  :title="$t('currency.actions.delete')"
                >
                  {{ $t("currency.actions.delete") }}
                </button>
              </div>
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="filteredCurrencies.length"
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

    <!-- Trashed Currencies Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('currency.trashed.title')"
      :emptyMessage="$t('currency.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedCurrenciesWithLocalizedName"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreCurrency"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import CurrencyHeader from "../components/currencyHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
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
const isTrashedModalOpen = ref(false);

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
  return currencyColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
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

const filteredCurrencies = computed(() => {
  let result = currenciesWithLocalizedName.value;
  result = filterData(result, searchText.value);
  return result;
});

const paginatedCurrencies = computed(() => {
  return paginateData(
    filteredCurrencies.value,
    currentPage.value,
    itemsPerPage.value
  );
});

// Action methods
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
    console.log("✅ Currency restored successfully!");
  } catch (error) {
    console.error("❌ Failed to restore currency:", error);
    alert(error.message || "Failed to restore currency");
  }
};

const deleteCurrency = async (currencyId) => {
  try {
    await currenciesStore.deleteCurrency(currencyId);
    console.log("✅ Currency deleted successfully!");
  } catch (error) {
    console.error("❌ Failed to delete currency:", error);
    alert(error.message || "Failed to delete currency");
  }
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
