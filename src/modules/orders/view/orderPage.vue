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
            :isExpandable="isOrderExpandable"
          >
            <!-- Expand slot for exchange orders (grouped delivery + return) -->
            <template #expand="{ row }">
              <div class="exchange-details">
                <div class="exchange-header mb-3">
                  <i class="fas fa-exchange-alt me-2 text-warning"></i>
                  <span class="fw-bold">{{ $t('orders.exchange.title') }}</span>
                </div>
                <div class="row">
                  <!-- Delivery Part -->
                  <div class="col-md-6">
                    <div class="exchange-part delivery-part">
                      <div class="part-header">
                        <i class="fas fa-truck me-2"></i>
                        {{ $t('orders.exchange.deliveryPart') }}
                        <span class="badge bg-primary ms-2">#{{ row._deliveryOrder?.id }}</span>
                      </div>
                      <div class="part-body">
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.table.id') }}:</span>
                          <span class="part-value">{{ row._deliveryOrder?.order_code || row._deliveryOrder?.id }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.form.case') }}:</span>
                          <span class="part-value">{{ row._deliveryOrder?.case }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.form.price') }}:</span>
                          <span class="part-value">{{ formatPrice(row._deliveryOrder?.price, row._deliveryOrder?.currency_symbol) }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.table.status') }}:</span>
                          <span class="part-value">{{ row._deliveryOrder?.status }}</span>
                        </div>
                        <div v-if="row._deliveryOrder?.order_items && row._deliveryOrder.order_items.length > 0" class="part-items mt-2">
                          <span class="part-label">{{ $t('orders.wizard.deliveryItems') }}:</span>
                          <ul class="items-list mb-0">
                            <li v-for="item in row._deliveryOrder.order_items" :key="item.id || item.name">
                              {{ item.name }} <span class="text-muted">(x{{ item.quantity }})</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Return Part -->
                  <div class="col-md-6">
                    <div class="exchange-part return-part">
                      <div class="part-header">
                        <i class="fas fa-undo me-2"></i>
                        {{ $t('orders.exchange.returnPart') }}
                        <span class="badge bg-warning ms-2">#{{ row._returnOrder?.id }}</span>
                      </div>
                      <div class="part-body">
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.table.id') }}:</span>
                          <span class="part-value">{{ row._returnOrder?.order_code || row._returnOrder?.id }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.form.case') }}:</span>
                          <span class="part-value">{{ row._returnOrder?.case }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.form.returnPrice') }}:</span>
                          <span class="part-value">{{ formatPrice(row._returnOrder?.price, row._returnOrder?.currency_symbol) }}</span>
                        </div>
                        <div class="part-item">
                          <span class="part-label">{{ $t('orders.table.status') }}:</span>
                          <span class="part-value">{{ row._returnOrder?.status }}</span>
                        </div>
                        <div v-if="row._returnOrder?.order_items && row._returnOrder.order_items.length > 0" class="part-items mt-2">
                          <span class="part-label">{{ $t('orders.wizard.returnItems') }}:</span>
                          <ul class="items-list mb-0">
                            <li v-for="item in row._returnOrder.order_items" :key="item.id || item.name">
                              {{ item.name }} <span class="text-muted">(x{{ item.quantity }})</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Parent Order Reference -->
                <div v-if="row.parent_order_id" class="parent-order-ref mt-3 pt-3 border-top">
                  <i class="fas fa-link me-2 text-muted"></i>
                  <span class="text-muted">{{ $t('orders.exchange.parentOrder') }}:</span>
                  <span class="fw-bold ms-1">#{{ row.parent_order_code || row.parent_order_id }}</span>
                </div>
              </div>
            </template>

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

const resolveCurrencyLabel = (currency) => {
  if (!currency) return "";
  if (Array.isArray(currency)) {
    return currency[1] || (currency[0] ? `Currency ${currency[0]}` : "");
  }
  const name =
    currency.name ||
    currency.nameenglish ||
    currency.namearabic ||
    currency.code ||
    "";
  const symbol = currency.symbol || "";
  if (name && symbol) return `${name} (${symbol})`;
  return name || symbol || (currency.id ? `Currency ${currency.id}` : "");
};

const resolveLinePriceName = (linePrice) => {
  if (Array.isArray(linePrice)) {
    return linePrice[1] || (linePrice[0] ? `Line ${linePrice[0]}` : "");
  }
  return (
    linePrice.line_id?.name ||
    linePrice.line?.name ||
    linePrice.line_name ||
    linePrice.lineName ||
    linePrice.name ||
    ""
  );
};

const resolveLinePriceSymbol = (linePrice) => {
  if (Array.isArray(linePrice)) {
    return "";
  }
  return (
    linePrice.currency_id?.symbol ||
    linePrice.currency?.symbol ||
    linePrice.currency_symbol ||
    linePrice.currency_code ||
    "$"
  );
};

const resolveDiscountLabel = (discount) => {
  if (Array.isArray(discount)) {
    return discount[1] || (discount[0] ? `Discount #${discount[0]}` : "");
  }
  const baseLabel =
    discount.name ||
    discount.type ||
    (discount.value !== undefined &&
    discount.value !== null &&
    discount.value !== ""
      ? String(discount.value)
      : "");
  const percent = discount.discount_percentage ?? discount.percentage;
  const percentLabel =
    percent !== undefined && percent !== null && percent !== ""
      ? `${percent}%`
      : "";
  if (baseLabel && percentLabel) return `${baseLabel} (${percentLabel})`;
  return baseLabel || percentLabel || `Discount #${discount.id}`;
};

const resolveCompanyPriceLabel = (price) => {
  if (Array.isArray(price)) {
    return price[1] || (price[0] ? `Price #${price[0]}` : "");
  }
  const itemType =
    price.itemType || price.item_type || price.itemTypeDisplay || price.name || "";
  const priceValue = price.price ?? price.amount ?? price.cost;
  const currencySymbol =
    price.currency?.symbol ||
    price.currency_id?.symbol ||
    price.currency_symbol ||
    "$";
  const priceLabel =
    priceValue !== undefined && priceValue !== null && priceValue !== ""
      ? formatPrice(priceValue, currencySymbol)
      : "";
  if (itemType && priceLabel) return `${itemType} - ${priceLabel}`;
  return itemType || priceLabel || `Price #${price.id}`;
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
  customers.value.map((customer) => {
    const id = Array.isArray(customer)
      ? customer[0]
      : customer.id ?? customer.customer_id ?? "";
    const label = Array.isArray(customer)
      ? customer[1] || (id ? `Customer ${id}` : "")
      : customer.name ||
        customer.full_name ||
        customer.customer_name ||
        (id ? `Customer ${id}` : "");
    return {
      value: String(id),
      label,
    };
  })
);

const currencyOptions = computed(() =>
  currencies.value.map((currency) => ({
    value: String(Array.isArray(currency) ? currency[0] : currency.id),
    label: resolveCurrencyLabel(currency),
  }))
);

const linePriceOptions = computed(() =>
  linePrices.value.map((linePrice) => {
    const id = Array.isArray(linePrice) ? linePrice[0] : linePrice.id;
    const lineName = resolveLinePriceName(linePrice);
    const currencySymbol = resolveLinePriceSymbol(linePrice);
    const labelPrefix = lineName ? `${lineName} - ` : "";
    return {
      value: String(id),
      label: `${labelPrefix}${formatPrice(linePrice.price, currencySymbol)}`,
    };
  })
);

const discountOptions = computed(() => [
  { value: "", label: t("orders.form.noDiscount") },
  ...discounts.value.map((discount) => ({
    value: String(Array.isArray(discount) ? discount[0] : discount.id),
    label: resolveDiscountLabel(discount),
  })),
]);

const companyPriceOptions = computed(() =>
  companyPrices.value.map((price) => {
    const id = Array.isArray(price) ? price[0] : price.id;
    return {
      value: String(id),
      label: resolveCompanyPriceLabel(price),
    };
  })
);

const parentOrderOptions = computed(() => {
  const options = ordersStore.orders.map((order) => {
    const customer = order.customer_name || "";
    const base = order.order_code
      ? order.order_code
      : order.id
        ? `#${order.id}`
        : "";
    const label = customer && base ? `${base} - ${customer}` : base || customer;
    return {
      value: String(order.id),
      label,
    };
  });

  return [{ value: "", label: t("orders.form.noParentOrder") }, ...options];
});

const branchOptions = computed(() =>
  branches.value.map((branch) => {
    const id = Array.isArray(branch) ? branch[0] : branch.id;
    const label = Array.isArray(branch)
      ? branch[1] || (id ? `Branch ${id}` : "")
      : branch.name || (id ? `Branch ${id}` : "");
    return {
      value: String(id),
      label,
    };
  })
);

// Fetch orders, statistics, and dropdown data on component mount
onMounted(async () => {
  const tasks = [
    { label: "orders", action: () => ordersStore.fetchOrders() },
    { label: "order statistics", action: () => ordersStore.fetchStatistics() },
    { label: "order dropdown data", action: () => fetchDropdownData() },
  ];

  const results = await Promise.allSettled(tasks.map((task) => task.action()));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to load ${tasks[index].label}:`, result.reason);
    }
  });
});

// Fetch all dropdown data required for order creation
const fetchDropdownData = async () => {
  const extractArray = (response) => {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  };

  const logError = (label, reason) => {
    console.error("Failed to load " + label + " dropdown data:", reason);
  };

  const results = await Promise.allSettled([
    apiServices.getCustomers(),
    apiServices.getCurrencies(),
    apiServices.getLinePrices(),
    apiServices.getDiscounts(),
    apiServices.getBranches(),
    apiServices.getCompanyPrices(),
  ]);

  const [
    customersRes,
    currenciesRes,
    linePricesRes,
    discountsRes,
    branchesRes,
    companyPricesRes,
  ] = results;

  if (customersRes.status === "fulfilled") {
    customers.value = extractArray(customersRes.value);
  } else {
    customers.value = [];
    logError("customers", customersRes.reason);
  }

  if (currenciesRes.status === "fulfilled") {
    currencies.value = extractArray(currenciesRes.value);
  } else {
    currencies.value = [];
    logError("currencies", currenciesRes.reason);
  }

  if (linePricesRes.status === "fulfilled") {
    linePrices.value = extractArray(linePricesRes.value);
  } else {
    linePrices.value = [];
    logError("line prices", linePricesRes.reason);
  }

  if (discountsRes.status === "fulfilled") {
    discounts.value = extractArray(discountsRes.value);
  } else {
    discounts.value = [];
    logError("discounts", discountsRes.reason);
  }

  if (branchesRes.status === "fulfilled") {
    branches.value = extractArray(branchesRes.value);
  } else {
    branches.value = [];
    logError("branches", branchesRes.reason);
  }

  if (companyPricesRes.status === "fulfilled") {
    companyPrices.value = extractArray(companyPricesRes.value);
  } else {
    companyPrices.value = [];
    logError("company item prices", companyPricesRes.reason);
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
  {
    key: "type",
    label: t("orders.table.type"),
    sortable: true,
    formatter: (value, row) => {
      // Check for virtual exchange type
      if (row && row._displayType === "exchange") return t("orders.form.typeExchange");
      if (value === "delivery") return t("orders.form.typeDelivery");
      if (value === "return") return t("orders.form.typeReturn");
      return value;
    },
  },
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

// Process orders to group exchange orders (delivery + return with same parent_order_id)
const processedOrders = computed(() => {
  const orders = currentData.value;
  if (!orders || orders.length === 0) return [];

  // Group orders by parent_order_id
  const parentGroups = {};
  const standaloneOrders = [];

  orders.forEach(order => {
    if (order.parent_order_id) {
      const parentId = String(order.parent_order_id);
      if (!parentGroups[parentId]) {
        parentGroups[parentId] = [];
      }
      parentGroups[parentId].push(order);
    } else {
      standaloneOrders.push(order);
    }
  });

  const result = [...standaloneOrders];

  // Process parent groups to detect exchanges
  Object.entries(parentGroups).forEach(([parentId, groupOrders]) => {
    // Check if we have both delivery and return with the same parent
    const deliveryOrder = groupOrders.find(o => o.type === 'delivery');
    const returnOrder = groupOrders.find(o => o.type === 'return');

    if (deliveryOrder && returnOrder) {
      // This is an exchange - create a combined row
      const exchangeRow = {
        ...deliveryOrder,
        _isExchange: true,
        _displayType: 'exchange', // Virtual type for display
        _deliveryOrder: deliveryOrder,
        _returnOrder: returnOrder,
        // Use delivery order's ID as the main ID
        id: deliveryOrder.id,
      };
      result.push(exchangeRow);
    } else {
      // Not an exchange - add orders normally
      groupOrders.forEach(order => result.push(order));
    }
  });

  // Sort by created_at descending (newest first)
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return result;
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
  // Use processedOrders for active tab to handle exchange grouping
  let result = activeTab.value === "active"
    ? processedOrders.value
    : currentData.value;

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

// Check if an order row should be expandable (only grouped exchange orders)
const isOrderExpandable = (row) => {
  return row._isExchange === true;
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
  } else {
    try {
      await ordersStore.fetchOrders();
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await ordersStore.fetchTrashedOrders();
    } else {
      await ordersStore.fetchOrders();
    }
  } catch (err) {
    console.error("Failed to refresh orders:", err);
  }
};

const handleAddOrder = async (orderData) => {
  if (orderData && orderData.exchange) {
    try {
      await ordersStore.addExchangeOrder(
        orderData.parentOrderId,
        orderData.payload
      );
      await ordersStore.fetchOrders();
      await ordersStore.fetchStatistics();
      closeModal();
    } catch (err) {
      console.error("Failed to add exchange order:", err);
    }
    return;
  }

  const ordersToCreate = Array.isArray(orderData)
    ? orderData
    : [orderData];

  try {
    for (const payload of ordersToCreate) {
      await ordersStore.addOrder(payload);
    }
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
        : field.defaultValue ?? "",
    };

    if (
      field.type === "select" &&
      unwrappedField.defaultValue !== "" &&
      unwrappedField.defaultValue !== null &&
      unwrappedField.defaultValue !== undefined
    ) {
      unwrappedField.defaultValue = String(unwrappedField.defaultValue);
    }
    if (
      field.name === "is_delivery_price_from_customer" &&
      (unwrappedField.defaultValue === "" ||
        unwrappedField.defaultValue === null ||
        unwrappedField.defaultValue === undefined)
    ) {
      unwrappedField.defaultValue = 0;
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
    if (field.name === "parent_order_id") {
      unwrappedField.options = parentOrderOptions.value;
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
    translator: (value) => {
      if (value === "delivery") return t("orders.form.typeDelivery");
      if (value === "return") return t("orders.form.typeReturn");
      if (value === "exchange") return t("orders.form.typeExchange");
      return value;
    }
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

/* Exchange details styles */
.exchange-details {
  background-color: #fff8f0;
  border-radius: 8px;
  padding: 1rem;
}

.exchange-header {
  color: #b35900;
  font-size: 1rem;
}

.exchange-part {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.exchange-part .part-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.delivery-part .part-header {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.return-part .part-header {
  background-color: rgba(253, 126, 20, 0.1);
  color: #fd7e14;
}

.exchange-part .part-body {
  padding: 1rem;
}

.part-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.part-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.part-value {
  font-weight: 500;
}

.part-items {
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
}

.items-list {
  padding-left: 1.25rem;
  margin-top: 0.25rem;
}

.items-list li {
  font-size: 0.875rem;
  padding: 0.125rem 0;
}

.parent-order-ref {
  font-size: 0.875rem;
}
</style>


