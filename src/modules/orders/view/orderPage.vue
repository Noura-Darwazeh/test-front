<template>
  <div class="orders-page-container bg-light">
    <!-- Time Period Selector -->
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="mb-0 text-muted">{{ $t('orders.stats.timePeriod') }}</h5>
        <div class="btn-group time-period-selector shadow-sm" role="group">
          <button
            type="button"
            class="btn btn-sm"
            :class="selectedTimePeriod === 'all' ? 'btn-primary' : 'btn-light'"
            @click="selectedTimePeriod = 'all'"
          >
            <i class="fas fa-infinity me-2"></i>{{ $t('orders.stats.allTime') }}
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="selectedTimePeriod === 'today' ? 'btn-primary' : 'btn-light'"
            @click="selectedTimePeriod = 'today'"
          >
            <i class="fas fa-calendar-day me-2"></i>{{ $t('orders.stats.today') }}
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="selectedTimePeriod === 'month' ? 'btn-primary' : 'btn-light'"
            @click="selectedTimePeriod = 'month'"
          >
            <i class="fas fa-calendar-alt me-2"></i>{{ $t('orders.stats.thisMonth') }}
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="selectedTimePeriod === 'year' ? 'btn-primary' : 'btn-light'"
            @click="selectedTimePeriod = 'year'"
          >
            <i class="fas fa-calendar me-2"></i>{{ $t('orders.stats.thisYear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div
        class="col-lg-3 col-md-6 mb-3"
        v-for="stat in orderStats"
        :key="stat.key"
      >
        <StatCard
          :value="stat.count"
          :label="$t(`orders.stats.${stat.key}`)"
          :icon="stat.icon"
          :iconClass="stat.iconClass"
          :clickable="true"
          @click="filterByStatus(stat.filterValue)"
        />
      </div>
    </div>

    <!-- Orders Header -->
    <OrdersHeader
      v-model="searchText"
      :searchPlaceholder="$t('orders.searchPlaceholder')"
      :data="ordersStore.orders"
      :groupKey="'status'"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('orders.filterByStatus')"
      :translationKey="'orderStatus'"
      :columns="orderColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('orders.addNew')"
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
              {{ $t('orders.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="orders"
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
        <div v-else-if="ordersStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ ordersStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            :actionsLabel="$t('orders.actionsLabel')"
            v-model="selectedRows"
          >
            <template #actions="{ row }">
              <ActionsDropdown
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('orders.actions.edit')"
                :detailsLabel="$t('orders.actions.view')"
                :deleteLabel="$t('orders.actions.delete')"
                :confirmDelete="true"
                @edit="editOrder"
                @details="viewOrderDetails"
                @delete="handleDeleteOrder"
              />
              <ActionsDropdown
                v-else
                :row="row"
                :restoreLabel="$t('orders.trashed.restore')"
                :deleteLabel="$t('orders.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreOrder"
                @delete="handlePermanentDeleteOrder"
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

    <!-- Order Wizard -->
    <OrderWizard
      :isOpen="isWizardOpen"
      :customers="customers"
      :companies="companies"
      :currencies="currencies"
      :linePrices="linePrices"
      :discounts="discounts"
      :branches="branches"
      :companyPrices="companyPrices"
      :existingOrders="ordersStore.orders"
      @close="closeModal"
      @submit="handleAddOrder"
    />

    <!-- Edit Order Modal -->
    <FormModal
      :isOpen="isFormModalOpen"
      :title="$t('orders.edit')"
      :fields="orderFieldsWithDefaults"
      :showImageUpload="false"
      @close="closeFormModal"
      @submit="handleEditOrder"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('orders.details.title')"
      :data="selectedOrder"
      :fields="detailsFields"
      @close="closeDetailsModal"
    >
      <template #after-details>
        <div v-if="selectedOrder.order_items && selectedOrder.order_items.length > 0" class="mt-4">
          <h6 class="fw-bold text-primary mb-3">{{ $t('orders.details.orderItems') }}</h6>
          <div v-for="item in selectedOrder.order_items" :key="item.id" class="card border-0 shadow-sm mb-3">
            <div class="card-body p-3">
              <h6 class="fw-semibold mb-2">{{ item.name }}</h6>
              <p class="text-muted small mb-2">{{ $t('orders.details.quantity') }}: {{ item.quantity }}</p>
              <div v-if="item.items && item.items.length > 0">
                <p class="fw-semibold small mb-1">{{ $t('orders.details.subItems') }}:</p>
                <ul class="list-unstyled ms-3">
                  <li v-for="(subItem, index) in item.items" :key="index" class="small text-muted">
                    • {{ subItem.name }} ({{ subItem.quantity }})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DetailsModal>

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
import StatCard from "../../../components/shared/StatCard.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import OrdersHeader from "../components/ordersHeader.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import OrderWizard from "../components/OrderWizard.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useOrderFormFields } from "../components/orderFormFields.js";
import { useOrdersStore } from "../store/ordersStore.js";
import apiServices from "@/services/apiServices.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

const { t } = useI18n();
const { orderFields } = useOrderFormFields();
const ordersStore = useOrdersStore();
const { companyOption } = useAuthDefaults();

// Simple price formatter
const formatPrice = (value, currencySymbol = "$") => {
  // Handle null, undefined, empty string, NaN, or non-numeric values
  const numericValue = parseFloat(value);
  if (isNaN(numericValue) || value === null || value === undefined || value === "") {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${numericValue.toFixed(2)}`;
};

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isWizardOpen = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Dropdown data for order creation
const customers = ref([]);
const companies = ref([]);
const currencies = ref([]);
const linePrices = ref([]);
const discounts = ref([]);
const branches = ref([]);
const companyPrices = ref([]);

const customerOptions = computed(() =>
  customers.value.map((customer) => ({
    value: String(customer.id),
    label: customer.name,
  }))
);

const currencyOptions = computed(() =>
  currencies.value.map((currency) => ({
    value: String(currency.id),
    label: `${currency.code} (${currency.symbol})`,
  }))
);

const linePriceOptions = computed(() =>
  linePrices.value.map((linePrice) => {
    const lineName =
      linePrice.line_id?.name ||
      linePrice.line?.name ||
      linePrice.line_name ||
      "";
    const labelPrefix = lineName ? `${lineName} - ` : "";
    return {
      value: String(linePrice.id),
      label: `${labelPrefix}${formatPrice(linePrice.price, linePrice.currency_id?.symbol || "$")}`,
    };
  })
);

const discountOptions = computed(() => [
  { value: "", label: t("orders.form.noDiscount") },
  ...discounts.value.map((discount) => ({
    value: String(discount.id),
    label: discount.name || discount.type || `Discount #${discount.id}`,
  })),
]);

const companyPriceOptions = computed(() =>
  companyPrices.value.map((price) => ({
    value: String(price.id),
    label: price.name || `${price.itemType || ""} ${formatPrice(price.price)}`.trim(),
  }))
);

const branchOptions = computed(() =>
  branches.value.map((branch) => ({
    value: String(branch.id),
    label: branch.name,
  }))
);

// Fetch orders, statistics, and dropdown data on component mount
onMounted(async () => {
  await Promise.all([
    ordersStore.fetchOrders(),
    ordersStore.fetchStatistics(),
    fetchDropdownData(),
  ]);
});

// Fetch all dropdown data required for order creation
const fetchDropdownData = async () => {
  try {
    const [
      customersRes,
      companiesRes,
      currenciesRes,
      linePricesRes,
      discountsRes,
      branchesRes,
      companyPricesRes,
    ] = await Promise.all([
      apiServices.getCustomers(),
      apiServices.getCompanies(),
      apiServices.getCurrencies(),
      apiServices.getLinePrices(),
      apiServices.getDiscounts(),
      apiServices.getBranches(),
      apiServices.getCompanyPrices(),
    ]);

    customers.value = customersRes.data.data || [];
    companies.value = companiesRes.data.data || [];
    currencies.value = currenciesRes.data.data || [];
    linePrices.value = linePricesRes.data.data || [];
    discounts.value = discountsRes.data.data || [];
    branches.value = branchesRes.data.data || [];
    companyPrices.value = companyPricesRes.data.data || [];

    console.log("✅ Successfully loaded all dropdown data for order creation");
  } catch (err) {
    console.error("❌ Error fetching dropdown data:", err);
  }
};

// Time period selection
const selectedTimePeriod = ref("all");

// Order statistics - using API statistics
const orderStats = computed(() => {
  const stats = ordersStore.statistics;

  // Helper to get count for a specific status from orders_by_status array
  const getStatusCount = (status) => {
    const statusData = stats.orders_by_status.find((s) => s.status === status);
    return statusData?.count || 0;
  };

  // Get time-based order count
  const getTimePeriodCount = () => {
    switch (selectedTimePeriod.value) {
      case "today":
        return stats.today?.orders || 0;
      case "month":
        return stats.month?.orders || 0;
      case "year":
        return stats.year?.orders || 0;
      default:
        return stats.total_orders || 0;
    }
  };

  return [
    {
      key: "total",
      count: getTimePeriodCount(),
      icon: "fas fa-box",
      iconClass: "stat-icon-blue",
      filterValue: null,
    },
    {
      key: "totalProfit",
      count: stats.total_profit ?? 0,
      icon: "fas fa-dollar-sign",
      iconClass: "stat-icon-success",
      filterValue: null,
    },
    {
      key: "pending",
      count: getStatusCount("pending"),
      icon: "fas fa-clock",
      iconClass: "stat-icon-warning",
      filterValue: "pending",
    },
    {
      key: "inProgress",
      count: getStatusCount("in_progress"),
      icon: "fas fa-spinner",
      iconClass: "stat-icon-info",
      filterValue: "in_progress",
    },
    {
      key: "done",
      count: getStatusCount("done"),
      icon: "fas fa-check-circle",
      iconClass: "stat-icon-green",
      filterValue: "done",
    },
    {
      key: "failed",
      count: getStatusCount("failed"),
      icon: "fas fa-times-circle",
      iconClass: "stat-icon-red",
      filterValue: "failed",
    },
  ];
});

// Table columns
const orderColumns = computed(() => [
  { key: "id", label: t("orders.table.id"), sortable: true },
  { key: "customer_name", label: t("orders.table.customer"), sortable: true },
  { key: "company_name", label: t("orders.table.company"), sortable: true },
  { key: "type", label: t("orders.table.type"), sortable: true },
  { key: "package", label: t("orders.table.package"), sortable: true },
  { key: "case", label: t("orders.table.case"), sortable: true },
  {
    key: "price",
    label: t("orders.table.price"),
    sortable: true,
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "status",
    label: t("orders.table.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "order" },
  },
  { key: "created_at", label: t("orders.table.createdAt"), sortable: true },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("orders.table.id") },
  { key: "customer_name", label: t("orders.table.customer") },
  { key: "type", label: t("orders.table.type") },
  { key: "package", label: t("orders.table.package") },
  {
    key: "price",
    label: t("orders.table.price"),
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  { key: "created_at", label: t("orders.table.createdAt") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  if (activeTab.value === "active") {
    return orderColumns.value.filter((col) =>
      visibleColumns.value.includes(col.key)
    );
  }
  return trashedColumns.value;
});

const currentData = computed(() => {
  return activeTab.value === "active"
    ? ordersStore.orders
    : ordersStore.trashedOrders;
});

const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? ordersStore.loading
    : ordersStore.trashedLoading;
});

// Filter orders by time period
const filterByTimePeriod = (orders, period) => {
  if (period === "all") return orders;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    switch (period) {
      case "today":
        return orderDate >= today;
      case "month":
        return orderDate >= thisMonthStart;
      case "year":
        return orderDate >= thisYearStart;
      default:
        return true;
    }
  });
};

const currentFilteredData = computed(() => {
  let result = currentData.value;

  // Apply time period filter
  result = filterByTimePeriod(result, selectedTimePeriod.value);

  if (activeTab.value === "active") {
    result = filterByGroups(result, selectedGroups.value, "status");
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
        label: t("orders.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("orders.bulkRestore"),
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
  const entity = count === 1 ? t("orders.entitySingular") : t("orders.entityPlural");

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
const filterByStatus = (status) => {
  if (status) {
    selectedGroups.value = [status];
  } else {
    selectedGroups.value = [];
  }
};

const openModal = () => {
  isWizardOpen.value = true;
};

const closeModal = () => {
  isWizardOpen.value = false;
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await ordersStore.fetchTrashedOrders();
    } catch (err) {
      console.error("Failed to load trashed orders:", err);
    }
  }
};

const handleAddOrder = async (orderData) => {
  try {
    await ordersStore.addOrder(orderData);
    await ordersStore.fetchStatistics(); // Refresh statistics
    closeModal();
  } catch (err) {
    console.error("Failed to add order:", err);
  }
};

const handleDeleteOrder = async (order) => {
  try {
    await ordersStore.deleteOrder(order.id);
    await ordersStore.fetchStatistics(); // Refresh statistics
  } catch (err) {
    console.error("Failed to delete order:", err);
  }
};

const handleRestoreOrder = async (order) => {
  try {
    await ordersStore.restoreOrder(order.id);
    await ordersStore.fetchStatistics(); // Refresh statistics
  } catch (err) {
    console.error("Failed to restore order:", err);
  }
};

const handlePermanentDeleteOrder = async (order) => {
  try {
    await ordersStore.deleteOrder(order.id, true); // force = true for permanent delete
    await ordersStore.fetchStatistics(); // Refresh statistics
  } catch (err) {
    console.error("Failed to permanently delete order:", err);
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
      await ordersStore.bulkDeleteOrders(selectedRows.value, false);
    } else if (pendingBulkAction.value === "permanentDelete") {
      await ordersStore.bulkDeleteOrders(selectedRows.value, true);
    } else if (pendingBulkAction.value === "restore") {
      await ordersStore.bulkRestoreOrders(selectedRows.value);
    }
    await ordersStore.fetchStatistics();
    selectedRows.value = [];
  } catch (err) {
    console.error("Failed to bulk delete orders:", err);
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

const viewOrderDetails = (order) => {
  selectedOrder.value = { ...order };
  isDetailsModalOpen.value = true;
};

const editOrder = (order) => {
  isEditMode.value = true;
  selectedOrder.value = { ...order };
  isFormModalOpen.value = true;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
  isEditMode.value = false;
  selectedOrder.value = {};
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedOrder.value = {};
};

const handleEditOrder = async (orderData) => {
  try {
    await ordersStore.updateOrder(selectedOrder.value.id, orderData);
    await ordersStore.fetchStatistics(); // Refresh statistics
    closeFormModal();
  } catch (err) {
    console.error("Failed to update order:", err);
  }
};

// Update form fields to support edit mode
const orderFieldsWithDefaults = computed(() => {
  return orderFields.value.map((field) => {
    // Unwrap computed options if present
    const unwrappedField = {
      ...field,
      defaultValue: isEditMode.value
        ? selectedOrder.value[field.name]
        : field.defaultValue || "",
    };

    if (
      field.type === "select" &&
      unwrappedField.defaultValue !== "" &&
      unwrappedField.defaultValue !== null &&
      unwrappedField.defaultValue !== undefined
    ) {
      unwrappedField.defaultValue = String(unwrappedField.defaultValue);
    }

    if (field.name === "customer_id") {
      unwrappedField.options = customerOptions.value;
    }
    if (field.name === "to_id") {
      unwrappedField.options = customerOptions.value;
    }
    if (field.name === "currency_id") {
      unwrappedField.options = currencyOptions.value;
    }
    if (field.name === "lineprice_id") {
      unwrappedField.options = linePriceOptions.value;
    }
    if (field.name === "discount_id") {
      unwrappedField.options = discountOptions.value;
    }
    if (field.name === "company_item_price_id") {
      unwrappedField.options = companyPriceOptions.value;
    }
    if (field.name === "company_id") {
      unwrappedField.options = companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }];
      unwrappedField.locked = true;
      unwrappedField.hidden = true;
    }
    if (field.name === "branch_customer_company_id" || field.name === "branch_delivery_company_id") {
      unwrappedField.options = branchOptions.value;
    }

    // If options is a computed ref, unwrap it
    if (field.options && typeof field.options === 'object' && 'value' in field.options) {
      unwrappedField.options = field.options.value;
    }

    return unwrappedField;
  });
});

// Details fields configuration
const detailsFields = computed(() => [
  { key: "id", label: t("orders.table.id"), colClass: "col-md-6" },
  { key: "customer_name", label: t("orders.table.customer"), colClass: "col-md-6" },
  { key: "company_name", label: t("orders.table.company"), colClass: "col-md-6" },
  {
    key: "type",
    label: t("orders.table.type"),
    colClass: "col-md-6",
    translator: (value) => value === "delivery" ? t("orders.form.typeDelivery") : t("orders.form.typeReturn")
  },
  {
    key: "package",
    label: t("orders.table.package"),
    colClass: "col-md-6",
    translator: (value) => value === "one" ? t("orders.form.packageOne") : t("orders.form.packageMulti")
  },
  {
    key: "case",
    label: t("orders.table.case"),
    colClass: "col-md-6"
  },
  {
    key: "price",
    label: t("orders.table.price"),
    colClass: "col-md-6",
    translator: (value) => formatPrice(selectedOrder.value.price, selectedOrder.value.currency_symbol)
  },
  {
    key: "discount_percentage",
    label: t("orders.details.discountPercentage"),
    colClass: "col-md-6",
    translator: (value) => value ? `${value}%` : t("orders.form.noDiscount")
  },
  {
    key: "status",
    label: t("orders.table.status"),
    colClass: "col-md-6",
    translationKey: "orderStatus"
  },
  { key: "created_at", label: t("orders.table.createdAt"), colClass: "col-md-6" },
]);

watch([searchText, selectedGroups, selectedTimePeriod], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.orders-page-container {
  max-width: 100%;
}

/* Ensure all stat cards have equal height */
.row .col-lg-3,
.row .col-md-6 {
  display: flex;
  flex-direction: column;
}

.row .col-lg-3 > *,
.row .col-md-6 > * {
  flex: 1;
  height: 100%;
}

.time-period-selector {
  border-radius: 8px;
  overflow: hidden;
}

.time-period-selector .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
}

.time-period-selector .btn-light {
  background-color: #ffffff;
  color: #6c757d;
}

.time-period-selector .btn-light:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  transform: translateY(-1px);
}

.time-period-selector .btn-primary {
  background-color: #0d6efd;
  color: white;
}

.time-period-selector .btn i {
  opacity: 0.8;
}
</style>

