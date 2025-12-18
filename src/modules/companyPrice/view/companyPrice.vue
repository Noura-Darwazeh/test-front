<template>
  <div class="company-price-page-container bg-light">
    <!-- Currency Selector -->
    <div class="card border-0 mb-3">
      <div class="card-body py-2">
        <div class="row align-items-center">
          <div class="col-auto">
            <label class="form-label mb-0 fw-semibold"
              >{{ $t("companyPrice.displayCurrency") }}:</label
            >
          </div>
          <div class="col-auto">
            <select
              v-model="selectedCurrency"
              class="form-select form-select-sm"
              style="width: auto"
            >
              <option
                v-for="currency in availableCurrencies"
                :key="currency.id"
                :value="currency"
              >
                {{ currency.code }} ({{ currency.symbol }})
              </option>
            </select>
          </div>
          <div class="col-auto text-muted">
            <small>{{ $t("companyPrice.currencyNote") }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Company Price Header -->
    <CompanyPriceHeader
      v-model="searchText"
      :searchPlaceholder="$t('companyPrice.searchPlaceholder')"
      :data="companyPrices"
      :groupKey="'itemType'"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('companyPrice.filterByItemType')"
      :translationKey="'companyPriceItemTypes'"
      :columns="companyPriceColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('companyPrice.addNew')"
      @add-click="openModal"
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <DataTable :columns="filteredColumns" :data="paginatedCompanyPrices">
          <template #actions="{ row }">
            <div class="d-flex gap-1 justify-content-center">
              <button
                @click="deleteCompanyPrice(row.id)"
                class="btn btn-sm btn-outline-secondary"
                :title="$t('companyPrice.actions.delete')"
              >
                {{ $t("companyPrice.actions.delete") }}
              </button>
            </div>
          </template>
        </DataTable>
        <div class="px-3 pt-1 pb-2 bg-light">
          <Pagination
            :totalItems="filteredCompanyPrices.length"
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            @update:currentPage="(page) => (currentPage = page)"
          />
        </div>
      </div>
    </div>

    <!-- Form Modal for Company Price -->
    <FormModal
      :isOpen="isModalOpen"
      :title="$t('companyPrice.addNew')"
      :fields="companyPriceFields"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleAddCompanyPrice"
    />

    <!-- Trashed Company Prices Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('companyPrice.trashed.title')"
      :emptyMessage="$t('companyPrice.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedCompanyPrices"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreCompanyPrice"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import CompanyPriceHeader from "../components/companyPriceHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCompanyPriceFormFields } from "../components/companyPriceFormFields.js";

const { t, locale } = useI18n();
const { companyPriceFields } = useCompanyPriceFormFields();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);

// Currency selector for unified display
const selectedCurrency = ref({
  id: 1,
  code: "USD",
  symbol: "$",
});

const availableCurrencies = [
  { id: 1, code: "USD", symbol: "$" },
  { id: 2, code: "EUR", symbol: "€" },
  { id: 3, code: "GBP", symbol: "£" },
  { id: 4, code: "JPY", symbol: "¥" },
  { id: 5, code: "ILS", symbol: "₪" },
  { id: 6, code: "JOD", symbol: "JD" },
];

// Simple local data - unified currency (prices stored in USD, converted for display)
const companyPrices = ref([
  {
    id: 1,
    price: 25.5, // Base price in USD
    itemType: "small_size & light_weight",
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    created_at: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    price: 45.0,
    itemType: "small_size & heavy_weight",
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    created_at: "2024-01-16 09:15:00",
  },
  {
    id: 3,
    price: 35.75,
    itemType: "big_size & light_weight",
    company_id: 2,
    company_name: "Fast Delivery Co",
    created_at: "2024-01-17 14:20:00",
  },
  {
    id: 4,
    price: 120.0,
    itemType: "big_size & heavy_weight",
    company_id: 2,
    company_name: "Fast Delivery Co",
    created_at: "2024-01-18 11:45:00",
  },
]);

const trashedCompanyPrices = ref([
  {
    id: 101,
    price: 28.99,
    itemType: "small_size & light_weight",
    company_id: 3,
    company_name: "Global Logistics Inc",
    created_at: "2024-01-10 12:00:00",
  },
]);

// Simple exchange rates (in real app, fetch from API)
const exchangeRates = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  ILS: 3.7,
  JOD: 0.71,
};

// Add localized item type names and convert prices to selected currency
const companyPricesWithLocalizedData = computed(() => {
  return companyPrices.value.map((item) => {
    const convertedPrice =
      item.price * exchangeRates[selectedCurrency.value.code];
    return {
      ...item,
      itemTypeDisplay: t(
        `companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`
      ),
      priceDisplay: `${selectedCurrency.value.symbol}${convertedPrice.toFixed(
        2
      )}`,
      convertedPrice: convertedPrice,
    };
  });
});

const trashedCompanyPricesWithLocalizedData = computed(() => {
  return trashedCompanyPrices.value.map((item) => {
    const convertedPrice =
      item.price * exchangeRates[selectedCurrency.value.code];
    return {
      ...item,
      itemTypeDisplay: t(
        `companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`
      ),
      priceDisplay: `${selectedCurrency.value.symbol}${convertedPrice.toFixed(
        2
      )}`,
      convertedPrice: convertedPrice,
    };
  });
});

// Table columns
const companyPriceColumns = computed(() => [
  { key: "id", label: t("companyPrice.table.id"), sortable: true },
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
    label: `${t("companyPrice.table.price")} (${selectedCurrency.value.code})`,
    sortable: true,
  },
  {
    key: "created_at",
    label: t("companyPrice.table.createdAt"),
    sortable: true,
  },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("companyPrice.table.id") },
  { key: "company_name", label: t("companyPrice.table.company") },
  { key: "itemTypeDisplay", label: t("companyPrice.table.itemType") },
  {
    key: "priceDisplay",
    label: `${t("companyPrice.table.price")} (${selectedCurrency.value.code})`,
  },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return companyPriceColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

const filteredCompanyPrices = computed(() => {
  let result = companyPricesWithLocalizedData.value;
  result = filterByGroups(result, selectedGroups.value, "itemType");
  result = filterData(result, searchText.value);
  return result;
});

const paginatedCompanyPrices = computed(() => {
  return paginateData(
    filteredCompanyPrices.value,
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

const handleAddCompanyPrice = (priceData) => {
  console.log("New company price added:", priceData);

  // Check for unique itemType + company_id validation
  const existingPrice = companyPrices.value.find(
    (p) =>
      p.itemType === priceData.itemType &&
      p.company_id === parseInt(priceData.company_id)
  );
  if (existingPrice) {
    alert(t("companyPrice.validation.duplicateItemType"));
    return;
  }

  // Get company name
  const companies = [
    { id: 1, name: "Tech Solutions Ltd" },
    { id: 2, name: "Fast Delivery Co" },
    { id: 3, name: "Global Logistics Inc" },
  ];

  const company = companies.find(
    (c) => c.id === parseInt(priceData.company_id)
  );

  // Convert entered price to USD for storage (if entered in different currency)
  const enteredPrice = parseFloat(priceData.price);
  const priceInUSD = enteredPrice / exchangeRates[selectedCurrency.value.code];

  const newCompanyPrice = {
    id: Math.max(...companyPrices.value.map((p) => p.id), 0) + 1,
    price: priceInUSD, // Store in USD
    itemType: priceData.itemType,
    company_id: parseInt(priceData.company_id),
    company_name: company.name,
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
  };

  companyPrices.value.push(newCompanyPrice);
  closeModal();
  console.log("Company price added successfully!");
};

const handleRestoreCompanyPrice = (price) => {
  console.log("Restoring company price:", price);
  // Remove the localized display fields before adding back
  const { itemTypeDisplay, priceDisplay, ...priceWithoutDisplay } = price;
  companyPrices.value.push(priceWithoutDisplay);
  const index = trashedCompanyPrices.value.findIndex((p) => p.id === price.id);
  if (index > -1) {
    trashedCompanyPrices.value.splice(index, 1);
  }
  console.log("Company price has been restored successfully!");
};

const deleteCompanyPrice = (priceId) => {
  const index = companyPrices.value.findIndex((p) => p.id === priceId);
  if (index > -1) {
    const price = companyPrices.value[index];
    // Move to trash
    trashedCompanyPrices.value.push(price);
    // Remove from active prices
    companyPrices.value.splice(index, 1);
    console.log("Company price deleted successfully!");
  }
};

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.company-price-page-container {
  max-width: 100%;
}
</style>
