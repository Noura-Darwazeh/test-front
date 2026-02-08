<template>
  <div class="orders-page-container bg-light">
    <!-- Orders Header -->
    <OrdersHeader
      v-model="searchText"
      :searchPlaceholder="$t('orders.searchPlaceholder')"
      :data="statusFilterData"
      :groupKey="'status'"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('orders.filterByStatus')"
      :translationKey="'orderStatus'"
      :showTimeFilter="true"
      v-model:timeModelValue="selectedTimePeriod"
      :timeOptions="timePeriodOptions"
        :columns="orderColumns"
        v-model:visibleColumns="visibleColumns"
        :showAddButton="true"
        :addButtonText="$t('orders.addNew')"
        @add-click="openModal"
        @refresh-click="handleRefresh"
      />

    <OrdersTableCard
      v-model:selectedRows="selectedRows"
      :activeTab="activeTab"
      :currentLoading="currentLoading"
      :errorMessage="ordersStore.error"
      :bulkActions="bulkActions"
      :bulkActionLoading="bulkActionLoading"
      :filteredColumns="filteredColumns"
      :paginatedData="paginatedData"
      :isOrderExpandable="isOrderExpandable"
      :currentPagination="currentPagination"
      :itemsPerPage="itemsPerPage"
      :currentPage="currentPage"
      :formatPrice="formatPrice"
      @update:currentPage="(page) => (currentPage = page)"
      @switch-tab="switchTab"
      @bulk-action="handleBulkAction"
      @edit="editOrder"
      @details="viewOrderDetails"
      @progress="openProgressModal"
      @delete="handleDeleteOrder"
      @restore="handleRestoreOrder"
      @delete-permanent="handlePermanentDeleteOrder"
    />

    <OrdersModals
      :isWizardOpen="isWizardOpen"
      :existingOrders="ordersStore.orders"
      @close-wizard="closeModal"
      @submit-order="handleAddOrder"
      :isFormModalOpen="isFormModalOpen"
      :orderFields="orderFields"
      :isEditMode="isEditMode"
      :selectedOrder="selectedOrder"
      :formErrors="editFormErrors"
      @close-form="closeFormModal"
      @submit-edit="handleEditOrder"
      :isDetailsModalOpen="isDetailsModalOpen"
      v-model:detailsModalTab="detailsModalTab"
      :selectedOrderExchange="selectedOrderExchange"
      :isProgressModalOpen="isProgressModalOpen"
      :selectedProgressOrder="selectedProgressOrder"
      :formatPrice="formatPrice"
      :getOrderItemTitle="getOrderItemTitle"
      :getOrderItemQuantity="getOrderItemQuantity"
      @close-details="closeDetailsModal"
      @close-progress="closeProgressModal"
      @edit-order="editOrder"
      @details-order="viewOrderDetails"
      @delete-order="handleDeleteOrder"
      :isBulkConfirmOpen="isBulkConfirmOpen"
      :bulkConfirmMessage="bulkConfirmMessage"
      @confirm-bulk="executeBulkAction"
      @close-bulk="cancelBulkAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import OrdersHeader from "../components/ordersHeader.vue";
import OrdersTableCard from "../components/OrdersTableCard.vue";
import OrdersModals from "../components/OrdersModals.vue";
import {
  createOrderColumns,
  createTrashedColumns,
} from "../components/ordersTableConfig.js";
import {
  buildProcessedOrders,
  filterByTimePeriod,
  normalizeOrderStatus,
} from "../components/ordersProcessing.js";
import {
  buildStatusFilterData,
  getBulkActions,
  getBulkConfirmMessage,
  getCurrentData,
  getCurrentLoading,
  getCurrentPagination,
  getFilteredColumns,
  getTimePeriodOptions,
} from "../components/ordersFilters.js";
import { createOrdersActions } from "../components/ordersActions.js";
import { useI18n } from "vue-i18n";
import { useOrderFormFields } from "../components/orderFormFields.js";
import { useOrdersStore } from "../store/ordersStore.js";

const { t } = useI18n();
const { orderFields } = useOrderFormFields();
const ordersStore = useOrdersStore();
const route = useRoute();
const router = useRouter();

// Simple price formatter
const formatPrice = (value, currencySymbol = "$") => {
  // Handle null, undefined, empty string, NaN, or non-numeric values
  const numericValue = parseFloat(value);
  if (isNaN(numericValue) || value === null || value === undefined || value === "") {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${numericValue.toFixed(2)}`;
};

const getOrderItemTitle = (item) => {
  if (!item) return "";
  return (
    item.orderitemname ||
    item.name ||
    item.item_name ||
    (item.id ? `Item #${item.id}` : "")
  );
};

const getOrderItemQuantity = (item) => {
  if (!item) return null;
  const quantity = item.quantity ?? item.qty ?? null;
  if (quantity === "" || quantity === undefined) return null;
  return quantity;
};

const handleOrderIdFromRoute = async (orderIdValue) => {
  const orderId = Array.isArray(orderIdValue) ? orderIdValue[0] : orderIdValue;
  if (!orderId) return;

  let order = ordersStore.orders.find(
    (item) => String(item.id) === String(orderId)
  );

  if (!order) {
    try {
      order = await ordersStore.fetchOrderById(orderId);
    } catch (error) {
      console.error("Failed to load order from route:", error);
      return;
    }
  }

  if (order) {
    viewOrderDetails(order);
    const { orderId: _ignored, ...rest } = route.query;
    router.replace({ query: rest });
  }
};

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false); // Flag to prevent double-fetch on tab switch
const isWizardOpen = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref({});
const selectedOrderExchange = ref({ delivery: null, return: null, hasExchange: false });
const editFormErrors = ref({});
const detailsModalTab = ref('details'); // 'details' or 'exchanged'
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');
const isProgressModalOpen = ref(false);
const selectedProgressOrder = ref(null);

const statusFilterData = computed(() => {
  return buildStatusFilterData({
    orders: ordersStore.orders,
    trashedOrders: ordersStore.trashedOrders,
    normalizeOrderStatus,
  });
});

const selectedTimePeriod = ref("all");

const timePeriodOptions = computed(() => getTimePeriodOptions(t));

// Fetch orders on component mount
onMounted(async () => {
  try {
    await fetchOrdersPage(1);
    await handleOrderIdFromRoute(route.query.orderId);
  } catch (err) {
    console.error("Failed to load orders:", err);
  }
});

// Watch for page changes to fetch new data from server
watch(currentPage, async (newPage) => {
  // Skip if this change was triggered by tab switch (data already fetched)
  if (skipNextPageWatch.value) {
    skipNextPageWatch.value = false;
    return;
  }

  try {
    await fetchOrdersPage(newPage);
  } catch (err) {
    console.error("Failed to load page:", err);
  }
});

watch(
  () => route.query.orderId,
  (orderId) => {
    handleOrderIdFromRoute(orderId);
  }
);

// Table columns
const orderColumns = computed(() => createOrderColumns({ t, formatPrice }));
const trashedColumns = computed(() => createTrashedColumns({ t, formatPrice }));

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return getFilteredColumns({
    activeTab: activeTab.value,
    orderColumns: orderColumns.value,
    trashedColumns: trashedColumns.value,
    visibleColumns: visibleColumns.value,
  });
});

const currentData = computed(() => {
  return getCurrentData({
    activeTab: activeTab.value,
    orders: ordersStore.orders,
    trashedOrders: ordersStore.trashedOrders,
  });
});

const processedOrders = computed(() => buildProcessedOrders(currentData.value));


// Function to check if a row is expandable (has child orders)
const isOrderExpandable = (row) => {
  return row._hasChildren === true;
};

const currentLoading = computed(() => {
  return getCurrentLoading({
    activeTab: activeTab.value,
    loading: ordersStore.loading,
    trashedLoading: ordersStore.trashedLoading,
  });
});

const buildOrderFilters = () => {
  const filters = {};
  const trimmedSearch = searchText.value.trim();
  if (trimmedSearch) {
    filters.search = trimmedSearch;
  }
  if (selectedGroups.value.length > 0) {
    filters.status =
      selectedGroups.value.length === 1
        ? selectedGroups.value[0]
        : selectedGroups.value.join(",");
  }
  return filters;
};

const fetchOrdersPage = async (page = 1) => {
  const filters = buildOrderFilters();
  if (activeTab.value === "trashed") {
    await ordersStore.fetchTrashedOrders({ page, perPage: itemsPerPage.value, filters });
  } else {
    await ordersStore.fetchOrders({ page, perPage: itemsPerPage.value, filters });
  }
};

const currentFilteredData = computed(() => {
  // Use processedOrders for active/progress tabs to handle exchange grouping
  const result =
    activeTab.value === "trashed" ? currentData.value : processedOrders.value;
  return filterByTimePeriod(result, selectedTimePeriod.value);
});

// With server-side pagination, we use the data directly from the store (already paginated by server)
const paginatedData = computed(() => currentFilteredData.value);

// Get the correct pagination metadata based on active tab
const currentPagination = computed(() => {
  return getCurrentPagination({
    activeTab: activeTab.value,
    ordersPagination: ordersStore.ordersPagination,
    trashedPagination: ordersStore.trashedPagination,
  });
});

const bulkActions = computed(() => {
  return getBulkActions(t, activeTab.value);
});

const bulkConfirmMessage = computed(() => {
  return getBulkConfirmMessage(
    t,
    pendingBulkAction.value,
    selectedRows.value.length
  );
});

const {
  openModal,
  closeModal,
  switchTab,
  handleRefresh,
  handleAddOrder,
  handleDeleteOrder,
  handleRestoreOrder,
  handlePermanentDeleteOrder,
  handleBulkAction,
  executeBulkAction,
  cancelBulkAction,
  viewOrderDetails,
  editOrder,
  closeFormModal,
  closeDetailsModal,
  handleEditOrder,
} = createOrdersActions({
  ordersStore,
  itemsPerPage,
  currentPage,
  activeTab,
  selectedRows,
  skipNextPageWatch,
  isWizardOpen,
  isFormModalOpen,
  isDetailsModalOpen,
  isEditMode,
  selectedOrder,
  selectedOrderExchange,
  editFormErrors,
  detailsModalTab,
  pendingBulkAction,
  isBulkConfirmOpen,
  bulkActionLoading,
  currentData,
  fetchOrdersPage,
});

const searchDebounceTimer = ref(null);

const openProgressModal = (order) => {
  selectedProgressOrder.value = { ...order };
  isProgressModalOpen.value = true;
};

const closeProgressModal = () => {
  isProgressModalOpen.value = false;
  selectedProgressOrder.value = null;
};

watch([searchText, selectedGroups], () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
  if (currentPage.value !== 1) {
    skipNextPageWatch.value = true;
    currentPage.value = 1;
  }
  searchDebounceTimer.value = setTimeout(async () => {
    try {
      await fetchOrdersPage(1);
    } catch (error) {
      console.error("Failed to apply filters:", error);
    }
  }, 400);
});


watch(selectedTimePeriod, () => {
  if (currentPage.value !== 1) {
    skipNextPageWatch.value = true;
    currentPage.value = 1;
  }
});

watch(activeTab, (tab) => {
  if (tab === "progress") {
    selectedProgressOrderId.value = "";
  }
});
</script>

<style scoped>
.orders-page-container {
  max-width: 100%;
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

/* Exchange tab styles in details modal */
.exchange-tab-content {
  min-height: 200px;
}

.exchange-orders .exchange-part {
  height: 100%;
}

/* Nav tabs styling in details modal */
.nav-tabs .nav-link {
  cursor: pointer;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6c757d;
  font-weight: 500;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  color: #0d6efd;
}

.nav-tabs .nav-link.active {
  border-bottom-color: #0d6efd;
  color: #0d6efd;
  background-color: transparent;
}

.nav-tabs .nav-link.text-success {
  color: #198754 !important;
}

.nav-tabs .nav-link.text-success.active {
  border-bottom-color: #198754;
}

/* Child orders expandable row styles */
.child-orders-container {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.child-order-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.child-order-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.delivery-card .child-order-header {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.return-card .child-order-header {
  background-color: rgba(253, 126, 20, 0.1);
  color: #fd7e14;
}

.child-order-body {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.child-order-body > div {
  padding: 0.25rem 0;
}

.child-order-actions {
  padding: 0.5rem 1rem;
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}
</style>


