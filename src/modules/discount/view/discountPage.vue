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
              {{ $t('discount.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="discount"
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
        <div v-else-if="discountStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ discountStore.error }}
        </div>

        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedData" v-model="selectedRows">
            <template #actions="{ row }">
              <Actions
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('discount.edit')"
                :detailsLabel="$t('discount.actions.details')"
                :deleteLabel="$t('discount.actions.delete')"
                :confirmDelete="true"
                @edit="handleEdit"
                @details="handleDetails"
                @delete="handleDeleteDiscount"
              />
              <Actions
                v-else
                :row="row"
                :restoreLabel="$t('discount.trashed.restore')"
                :deleteLabel="$t('discount.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreDiscount"
                @delete="handlePermanentDeleteDiscount"
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

    <!-- Form Modal for Discount -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('discount.edit') : $t('discount.addNew')"
      :fields="discountFieldsWithDefaults"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleAddDiscount"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('discount.details.title')"
      :data="selectedDiscount"
      :fields="detailsFields"
      @close="closeDetailsModal"
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
import DiscountHeader from "../components/discountHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";

import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useDiscountFormFields } from "../components/discountFormFields.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { useDiscountStore } from "../store/discountStore.js";
import { useCustomerStore } from "@/modules/customer/stores/customerStore.js";
import { useRegionsManagementStore } from "@/modules/regions/store/regionsManagement.js";
import { useLinesStore } from "@/modules/lines/stores/linesStore.js";

const { t } = useI18n();
const { companyId } = useAuthDefaults();
const discountStore = useDiscountStore();
const customerStore = useCustomerStore();
const regionsStore = useRegionsManagementStore();
const linesStore = useLinesStore();

const customers = computed(() => customerStore.customers);
const regions = computed(() => regionsStore.regions);
const lines = computed(() => linesStore.lines);

const customerOptions = computed(() =>
  customers.value
    .map((customer) => ({
      value: String(customer.id ?? ""),
      label: customer.name || "",
    }))
    .filter((option) => option.value && option.label)
);

const regionOptions = computed(() =>
  regions.value
    .map((region) => ({
      value: String(region.id ?? ""),
      label: region.name || region.nameenglish || region.namearabic || "",
    }))
    .filter((option) => option.value && option.label)
);

const lineOptions = computed(() =>
  lines.value
    .map((line) => ({
      value: String(line.id ?? ""),
      label: line.name || "",
    }))
    .filter((option) => option.value && option.label)
);

const getValueOptions = (type) => {
  if (type === "Customer") return customerOptions.value;
  if (type === "Region") return regionOptions.value;
  if (type === "Line") return lineOptions.value;
  return [];
};

const { discountFields } = useDiscountFormFields({ getValueOptions });

// Simple price formatters
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "$0.00";
  return `$${Number(value).toFixed(2)}`;
};

const formatPriceWithFallback = (value, fallbackText = "N/A") => {
  if (!value || isNaN(value) || value === 0) return fallbackText;
  return formatPrice(value);
};

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDiscount = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Store data
const discounts = computed(() => discountStore.discounts);
const trashedDiscounts = computed(() => discountStore.trashedDiscounts);

onMounted(async () => {
  try {
    await Promise.all([
      discountStore.fetchDiscounts(),
      customers.value.length ? Promise.resolve() : customerStore.fetchCustomers(),
      regions.value.length ? Promise.resolve() : regionsStore.fetchRegions(),
      lines.value.length ? Promise.resolve() : linesStore.fetchLines(),
    ]);
  } catch (error) {
    console.error("Failed to load discounts:", error);
  }
});

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
  if (activeTab.value === "active") {
    return discountColumns.value.filter((col) =>
      visibleColumns.value.includes(col.key)
    );
  }
  return trashedColumns.value;
});

const currentData = computed(() => {
  return activeTab.value === "active" ? discounts.value : trashedDiscounts.value;
});

const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? discountStore.loading
    : discountStore.trashedLoading;
});

const currentFilteredData = computed(() => {
  let result = currentData.value;
  if (activeTab.value === "active") {
    result = filterByGroups(result, selectedGroups.value, "type");
  }
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
        label: t("discount.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("discount.bulkRestore"),
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
    count === 1 ? t("discount.entitySingular") : t("discount.entityPlural");

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
  isEditMode.value = false;
  selectedDiscount.value = {};
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedDiscount.value = {};
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await discountStore.fetchTrashedDiscounts();
    } catch (error) {
      console.error("Failed to load trashed discounts:", error);
    }
  } else {
    try {
      await discountStore.fetchDiscounts();
    } catch (error) {
      console.error("Failed to load discounts:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await discountStore.fetchTrashedDiscounts();
    } else {
      await discountStore.fetchDiscounts();
    }
  } catch (error) {
    console.error("Failed to refresh discounts:", error);
  }
};

const handleAddDiscount = async (discountData) => {
  const formatDateTime = (dateTimeLocal) => {
    if (!dateTimeLocal) return null;
    return dateTimeLocal.replace("T", " ") + ":00";
  };

  const normalizeValue = (value, type) => {
    if (type === "Price") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : value;
    }
    if (["Customer", "Region", "Line"].includes(type)) {
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
  };

  const resolvedCompanyId = companyId.value
    ? parseInt(companyId.value, 10)
    : discountData.company_id
      ? parseInt(discountData.company_id, 10)
      : null;

  const payload = {
    type: discountData.type,
    discount_percentage: parseFloat(discountData.discount_percentage),
    start_date: formatDateTime(discountData.start_date),
    end_date: formatDateTime(discountData.end_date),
    company_id: resolvedCompanyId,
    value: normalizeValue(discountData.value, discountData.type),
  };

  try {
    if (isEditMode.value) {
      await discountStore.updateDiscount(selectedDiscount.value.id, payload);
      console.log("Discount updated successfully!");
    } else {
      await discountStore.addDiscount(payload);
      console.log("Discount added successfully!");
    }
    closeModal();
  } catch (error) {
    console.error("Failed to submit discount:", error);
  }
};

const handleRestoreDiscount = async (discount) => {
  try {
    await discountStore.restoreDiscount(discount.id);
    console.log("Discount restored successfully!");
  } catch (error) {
    console.error("Failed to restore discount:", error);
  }
};

const handleDeleteDiscount = async (discount) => {
  try {
    await discountStore.deleteDiscount(discount.id);
    console.log("Discount deleted successfully!");
  } catch (error) {
    console.error("Failed to delete discount:", error);
  }
};

const handlePermanentDeleteDiscount = async (discount) => {
  try {
    await discountStore.deleteDiscount(discount.id, true);
    console.log("Discount permanently deleted successfully!");
  } catch (error) {
    console.error("Failed to permanently delete discount:", error);
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
      await discountStore.bulkDeleteDiscounts(selectedRows.value, false);
    } else if (pendingBulkAction.value === "permanentDelete") {
      await discountStore.bulkDeleteDiscounts(selectedRows.value, true);
    } else if (pendingBulkAction.value === "restore") {
      await discountStore.bulkRestoreDiscounts(selectedRows.value);
    }
    selectedRows.value = [];
  } catch (error) {
    console.error("Failed to bulk delete discounts:", error);
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
    defaultValue: isEditMode.value
      ? selectedDiscount.value[field.name]
      : (field.defaultValue ?? '')
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


