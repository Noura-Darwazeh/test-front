<template>
  <div class="discount-page-container bg-light">
    <!-- Discount Header -->
    <DiscountHeader
      v-model="searchText"
      :searchPlaceholder="$t('discount.searchPlaceholder')"
      :data="discounts"
      :groupKey="'type'"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('discount.filterByType')"
      :translationKey="'discountTypes'"
      :columns="discountColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('discount.addNew')"
      @add-click="openModal"
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <DataTable :columns="filteredColumns" :data="paginatedDiscounts">
          <template #actions="{ row }">
            <Actions
              :row="row"
              :editLabel="$t('discount.edit')"
              :detailsLabel="$t('discount.actions.details')"
              @edit="handleEdit"
              @details="handleDetails"
            />
          </template>
        </DataTable>
        <div class="px-3 pt-1 pb-2 bg-light">
          <Pagination
            :totalItems="filteredDiscounts.length"
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            @update:currentPage="(page) => (currentPage = page)"
          />
        </div>
      </div>
    </div>

    <!-- Form Modal for Discount -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('discount.edit') : $t('discount.addNew')"
      :fields="discountFieldsWithDefaults"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleAddDiscount"
    />

    <!-- Trashed Discounts Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('discount.trashed.title')"
      :emptyMessage="$t('discount.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedDiscounts"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreDiscount"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('discount.details.title')"
      :data="selectedDiscount"
      :fields="detailsFields"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import DiscountHeader from "../components/discountHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";

import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useDiscountFormFields } from "../components/discountFormFields.js";
import { useCurrency } from "@/composables/useCurrency.js";

const { t } = useI18n();
const { discountFields } = useDiscountFormFields();
const { formatPrice, formatPriceWithFallback } = useCurrency();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDiscount = ref({});

// Simple local data - following the backend API schema
const discounts = ref([
  {
    id: 1,
    type: "Customer",
    discount_percentage: 15.5,
    start_date: "2024-01-15 00:00:00",
    end_date: "2024-12-31 23:59:59",
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    value: "customer_123",
    status: "active",
    usage_count: 45,
    created_at: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    type: "Region",
    discount_percentage: 10.0,
    start_date: "2024-02-01 00:00:00",
    end_date: "2024-06-30 23:59:59",
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    value: "region_456",
    status: "active",
    usage_count: 23,
    created_at: "2024-02-01 09:15:00",
  },
  {
    id: 3,
    type: "Price",
    discount_percentage: 5.0,
    start_date: "2024-01-01 00:00:00",
    end_date: "2024-12-31 23:59:59",
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    value: "100.00",
    status: "expired",
    usage_count: 12,
    created_at: "2024-01-01 08:00:00",
  },
  {
    id: 4,
    type: "Line",
    discount_percentage: 8.0,
    start_date: "2024-03-01 00:00:00",
    end_date: null,
    company_id: 2,
    company_name: "Fast Delivery Co",
    value: "line_789",
    status: "stopped",
    usage_count: 7,
    created_at: "2024-03-01 14:20:00",
  },
]);

const trashedDiscounts = ref([
  {
    id: 101,
    type: "Line",
    discount_percentage: 12.0,
    start_date: "2024-01-01 00:00:00",
    end_date: "2024-03-31 23:59:59",
    company_id: 1,
    value: "line_789",
    status: "deleted",
    created_at: "2024-01-01 12:00:00",
  },
]);

// Table columns
const discountColumns = computed(() => [
  { key: "id", label: t("discount.table.id"), sortable: true },
  { key: "type", label: t("discount.table.type"), sortable: true },
  {
    key: "discount_percentage",
    label: t("discount.table.percentage"),
    sortable: true,
    formatter: (value) => `${value}%`,
  },
  {
    key: "value",
    label: t("discount.table.value"),
    sortable: false,
    formatter: (value, row) => {
      // If type is Price, format as currency, otherwise show as text
      if (row.type === "Price" && !isNaN(parseFloat(value))) {
        return formatPrice(parseFloat(value), "USD");
      }
      return value;
    },
  },
  { key: "start_date", label: t("discount.table.startDate"), sortable: true },
  { key: "end_date", label: t("discount.table.endDate"), sortable: true },
  { key: "company_name", label: t("discount.table.company"), sortable: true },
  { key: "usage_count", label: t("discount.table.usageCount"), sortable: true },
  {
    key: "status",
    label: t("discount.table.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "discount" },
  },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("discount.table.id") },
  { key: "type", label: t("discount.table.type") },
  {
    key: "discount_percentage",
    label: t("discount.table.percentage"),
    formatter: (value) => `${value}%`,
  },
  {
    key: "value",
    label: t("discount.table.value"),
    formatter: (value, row) => {
      // If type is Price, format as currency, otherwise show as text
      if (row.type === "Price" && !isNaN(parseFloat(value))) {
        return formatPrice(parseFloat(value), "USD");
      }
      return value;
    },
  },
  { key: "start_date", label: t("discount.table.startDate") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return discountColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

const filteredDiscounts = computed(() => {
  let result = discounts.value;
  result = filterByGroups(result, selectedGroups.value, "type");
  result = filterData(result, searchText.value);
  return result;
});

const paginatedDiscounts = computed(() => {
  return paginateData(
    filteredDiscounts.value,
    currentPage.value,
    itemsPerPage.value
  );
});

// Action methods
const openModal = () => {
  isEditMode.value = false;
  selectedDiscount.value = {};
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedDiscount.value = {};
};

const openTrashedModal = () => {
  isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
};

const handleAddDiscount = (discountData) => {
  console.log("Discount data:", discountData);

  const formatDateTime = (dateTimeLocal) => {
    if (!dateTimeLocal) return null;
    return dateTimeLocal.replace("T", " ") + ":00";
  };

  if (isEditMode.value) {
    // Update existing discount
    const index = discounts.value.findIndex(d => d.id === selectedDiscount.value.id);
    if (index > -1) {
      discounts.value[index] = {
        ...discounts.value[index],
        type: discountData.type,
        discount_percentage: parseFloat(discountData.discount_percentage),
        start_date: formatDateTime(discountData.start_date),
        end_date: formatDateTime(discountData.end_date),
        company_id: parseInt(discountData.company_id),
        value: discountData.value,
      };
      console.log("Discount updated successfully!");
    }
  } else {
    // Add new discount
    const newDiscount = {
      id: discounts.value.length + 1,
      type: discountData.type,
      discount_percentage: parseFloat(discountData.discount_percentage),
      start_date: formatDateTime(discountData.start_date),
      end_date: formatDateTime(discountData.end_date),
      company_id: parseInt(discountData.company_id),
      company_name: "Tech Solutions Ltd",
      value: discountData.value,
      status: "active",
      usage_count: 0,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    discounts.value.push(newDiscount);
    console.log("Discount added successfully!");
  }
};

const handleRestoreDiscount = (discount) => {
  console.log("Restoring discount:", discount);
  discounts.value.push(discount);
  const index = trashedDiscounts.value.findIndex((d) => d.id === discount.id);
  if (index > -1) {
    trashedDiscounts.value.splice(index, 1);
  }
  console.log("Discount has been restored successfully!");
};

const handleEdit = (discount) => {
  isEditMode.value = true;
  selectedDiscount.value = { ...discount };
  isModalOpen.value = true;
};

const handleDetails = (discount) => {
  selectedDiscount.value = { ...discount };
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedDiscount.value = {};
};

// Update form fields to support edit mode
const discountFieldsWithDefaults = computed(() => {
  return discountFields.value.map(field => ({
    ...field,
    defaultValue: isEditMode.value ? selectedDiscount.value[field.name] : field.defaultValue || ''
  }));
});

// Details fields configuration
const detailsFields = computed(() => [
  { key: "id", label: t("discount.table.id"), colClass: "col-md-6" },
  { key: "type", label: t("discount.table.type"), colClass: "col-md-6" },
  {
    key: "discount_percentage",
    label: t("discount.table.percentage"),
    colClass: "col-md-6",
    translator: (value) => `${value}%`
  },
  {
    key: "value",
    label: t("discount.table.value"),
    colClass: "col-md-6",
    translator: (value) => {
      if (selectedDiscount.value.type === "Price" && !isNaN(parseFloat(value))) {
        return formatPrice(parseFloat(value), "USD");
      }
      return value;
    }
  },
  { key: "start_date", label: t("discount.table.startDate"), colClass: "col-md-6" },
  { key: "end_date", label: t("discount.table.endDate"), colClass: "col-md-6" },
  { key: "company_name", label: t("discount.table.company"), colClass: "col-md-6" },
  { key: "usage_count", label: t("discount.table.usageCount"), colClass: "col-md-6" },
  {
    key: "status",
    label: t("discount.table.status"),
    colClass: "col-md-6",
    translationKey: "discountStatus"
  },
]);

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.discount-page-container {
  max-width: 100%;
}
</style>
