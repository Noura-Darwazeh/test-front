<template>
  <div class="orders-page-container bg-light">
    <!-- Time Period Selector -->
    <div class="mb-3">
      <div class="btn-group" role="group" aria-label="Time period filter">
        <button
          type="button"
          class="btn"
          :class="selectedTimePeriod === 'all' ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTimePeriod = 'all'"
        >
          {{ $t('orders.stats.allTime') }}
        </button>
        <button
          type="button"
          class="btn"
          :class="selectedTimePeriod === 'today' ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTimePeriod = 'today'"
        >
          {{ $t('orders.stats.today') }}
        </button>
        <button
          type="button"
          class="btn"
          :class="selectedTimePeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTimePeriod = 'month'"
        >
          {{ $t('orders.stats.thisMonth') }}
        </button>
        <button
          type="button"
          class="btn"
          :class="selectedTimePeriod === 'year' ? 'btn-primary' : 'btn-outline-primary'"
          @click="selectedTimePeriod = 'year'"
        >
          {{ $t('orders.stats.thisYear') }}
        </button>
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
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <DataTable
          :columns="filteredColumns"
          :data="paginatedOrders"
          :actionsLabel="$t('orders.actions')"
        >
          <template #actions="{ row }">
            <ActionsDropdown
              :row="row"
              :editLabel="$t('orders.actions.edit')"
              :detailsLabel="$t('orders.actions.view')"
              :deleteLabel="$t('orders.actions.delete')"
              @edit="editOrder"
              @details="viewOrderDetails"
              @delete="handleDeleteOrder"
            />
          </template>
        </DataTable>
        <div class="px-3 pt-1 pb-2 bg-light">
          <Pagination
            :totalItems="filteredOrders.length"
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            @update:currentPage="(page) => (currentPage = page)"
          />
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

    <!-- Trashed Orders Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('orders.trashed.title')"
      :emptyMessage="$t('orders.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="ordersStore.trashedOrders"
      :showDeleteButton="true"
      :deleteLabel="$t('orders.actions.deletePermanently')"
      @close="closeTrashedModal"
      @restore="handleRestoreOrder"
      @delete="handlePermanentDeleteOrder"
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import StatCard from "../../../components/shared/StatCard.vue";
import OrdersHeader from "../components/ordersHeader.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import OrderWizard from "../components/OrderWizard.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useOrderFormFields } from "../components/orderFormFields.js";
import { useOrdersStore } from "../store/ordersStore.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const { orderFields } = useOrderFormFields();
const ordersStore = useOrdersStore();

// Simple price formatter
const formatPrice = (value, currencySymbol = "$") => {
  if (!value || isNaN(value)) return `${currencySymbol}0.00`;
  return `${currencySymbol}${Number(value).toFixed(2)}`;
};

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isWizardOpen = ref(false);
const isFormModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref({});

// Dropdown data for order creation
const customers = ref([]);
const companies = ref([]);
const currencies = ref([]);
const linePrices = ref([]);
const discounts = ref([]);
const branches = ref([]);
const companyPrices = ref([]);

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
      count: formatPrice(stats.total_profit || 0),
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
  return orderColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

// Simple filtering - using store data
const filteredOrders = computed(() => {
  let result = ordersStore.orders;
  result = filterByGroups(result, selectedGroups.value, "status");
  result = filterData(result, searchText.value);
  return result;
});

const paginatedOrders = computed(() => {
  return paginateData(
    filteredOrders.value,
    currentPage.value,
    itemsPerPage.value
  );
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

const openTrashedModal = async () => {
  await ordersStore.fetchTrashedOrders();
  isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
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

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.orders-page-container {
  max-width: 100%;
}

.btn-group .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}
</style>
