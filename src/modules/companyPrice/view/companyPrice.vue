<template>
  <div class="company-price-page-container bg-light">
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
            <Actions
              :row="row"
              :editLabel="$t('companyPrice.edit')"
              :detailsLabel="$t('companyPrice.actions.details')"
              @edit="handleEdit"
              @details="handleDetails"
            />
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
      :title="isEditMode ? $t('companyPrice.edit') : $t('companyPrice.addNew')"
      :fields="companyPriceFieldsWithDefaults"
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
      :trashedItems="trashedCompanyPricesWithLocalizedData"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreCompanyPrice"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('companyPrice.details.title')"
      :data="selectedPrice"
      :fields="detailsFields"
      @close="closeDetailsModal"
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
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCompanyPriceFormFields } from "../components/companyPriceFormFields.js";

const { t } = useI18n();
const { companyPriceFields } = useCompanyPriceFormFields();

// Simple price formatter
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "$0.00";
  return `$${Number(value).toFixed(2)}`;
};

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedPrice = ref({});

// Simple local data
const companyPrices = ref([
  {
    id: 1,
    price: 25.5,
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

// Add localized item type names
const companyPricesWithLocalizedData = computed(() => {
  return companyPrices.value.map((item) => {
    return {
      ...item,
      itemTypeDisplay: t(
        `companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`
      ),
      priceDisplay: formatPrice(item.price),
    };
  });
});

const trashedCompanyPricesWithLocalizedData = computed(() => {
  return trashedCompanyPrices.value.map((item) => {
    return {
      ...item,
      itemTypeDisplay: t(
        `companyPrice.itemTypes.${item.itemType.replace(/\s&\s/g, "&")}`
      ),
      priceDisplay: formatPrice(item.price),
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
    label: t("companyPrice.table.price"),
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
    label: t("companyPrice.table.price"),
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
  isEditMode.value = false;
  selectedPrice.value = {};
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedPrice.value = {};
};

const openTrashedModal = () => {
  isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
};

const handleAddCompanyPrice = (priceData) => {
  console.log("Company price data:", priceData);

  // Get company name
  const companies = [
    { id: 1, name: "Tech Solutions Ltd" },
    { id: 2, name: "Fast Delivery Co" },
    { id: 3, name: "Global Logistics Inc" },
  ];

  const company = companies.find(
    (c) => c.id === parseInt(priceData.company_id)
  );

  const price = parseFloat(priceData.price);

  if (isEditMode.value) {
    // Update existing company price
    const index = companyPrices.value.findIndex(
      (p) => p.id === selectedPrice.value.id
    );
    if (index > -1) {
      // Check for unique itemType + company_id validation (excluding current item)
      const existingPrice = companyPrices.value.find(
        (p) =>
          p.id !== selectedPrice.value.id &&
          p.itemType === priceData.itemType &&
          p.company_id === parseInt(priceData.company_id)
      );
      if (existingPrice) {
        alert(t("companyPrice.validation.duplicateItemType"));
        return;
      }

      companyPrices.value[index] = {
        ...companyPrices.value[index],
        price: price,
        itemType: priceData.itemType,
        company_id: parseInt(priceData.company_id),
        company_name: company.name,
      };
      console.log("Company price updated successfully!");
    }
  } else {
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

    // Add new company price
    const newCompanyPrice = {
      id: Math.max(...companyPrices.value.map((p) => p.id), 0) + 1,
      price: price,
      itemType: priceData.itemType,
      company_id: parseInt(priceData.company_id),
      company_name: company.name,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    companyPrices.value.push(newCompanyPrice);
    console.log("Company price added successfully!");
  }

  closeModal();
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

const handleEdit = (price) => {
  isEditMode.value = true;
  // Use original price data, not the computed version
  const originalPrice = companyPrices.value.find((p) => p.id === price.id);
  selectedPrice.value = { ...originalPrice };
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
  return companyPriceFields.value.map((field) => ({
    ...field,
    defaultValue: isEditMode.value
      ? selectedPrice.value[field.name]
      : field.defaultValue || "",
  }));
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
    key: "itemTypeDisplay",
    label: t("companyPrice.table.itemType"),
    colClass: "col-md-6",
  },
  {
    key: "priceDisplay",
    label: t("companyPrice.table.price"),
    colClass: "col-md-6",
  },
  {
    key: "created_at",
    label: t("companyPrice.table.createdAt"),
    colClass: "col-md-6",
  },
]);

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.company-price-page-container {
  max-width: 100%;
}
</style>
