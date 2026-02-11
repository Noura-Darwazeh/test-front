<template>
  <div class="statistics-page-container bg-light">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h5 class="mb-0">{{ $t("statistics.title") }}</h5>
    </div>

    <div class="card border-0">
      <div class="card-header bg-white border-bottom">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'orders' }"
              @click="activeTab = 'orders'"
            >
              {{ $t("statistics.tabs.orders") }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'drivers' }"
              @click="activeTab = 'drivers'"
            >
              {{ $t("statistics.tabs.drivers") }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'customers' }"
              @click="activeTab = 'customers'"
            >
              {{ $t("statistics.tabs.customers") }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'lineWork' }"
              @click="activeTab = 'lineWork'"
            >
              {{ $t("statistics.tabs.lineWork") }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'lines' }"
              @click="activeTab = 'lines'"
            >
              {{ $t("statistics.tabs.lines") }}
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <div v-if="activeTab === 'orders'">
          <div v-if="loading.orders" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else-if="orderCards.length">
            <div class="row g-3">
              <div
                v-for="stat in orderCards"
                :key="stat.key"
                class="col-lg-4 col-md-6"
              >
                <StatCard
                  :value="stat.count"
                  :label="stat.label"
                  :icon="stat.icon"
                  :iconClass="stat.iconClass"
                  :clickable="true"
                  @click="() => handleOrderCardClick(stat)"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted">
            {{ $t("common.noDataAvailable") }}
          </div>

          <div class="mt-4">
            <OrdersTableCard
              v-model:selectedRows="selectedRows"
              :activeTab="'active'"
              :showTabs="false"
              :showBulkActions="false"
              :showActions="true"
              :showCheckbox="false"
              :showExpandable="false"
              :actionsVariant="'goToOrder'"
              :actionsLabel="$t('statistics.goToOrder')"
              :actionButtonLabel="$t('statistics.goToOrder')"
              :currentLoading="currentLoading"
              :errorMessage="ordersStore.error"
              :bulkActions="[]"
              :bulkActionLoading="false"
              :filteredColumns="filteredColumns"
              :paginatedData="paginatedData"
              :isOrderExpandable="isOrderExpandable"
              :currentPagination="currentPagination"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              :formatPrice="formatPrice"
              @update:currentPage="(page) => (currentPage = page)"
              @go-to-order="goToOrder"
            />
          </div>
        </div>

        <div v-if="activeTab === 'drivers'">
          <div v-if="loading.drivers" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="driverStatsMessage" class="alert alert-info">
              {{ driverStatsMessage }}
            </div>
            <div v-if="driverCards.length" class="row g-3 mb-3">
              <div
                v-for="stat in driverCards"
                :key="stat.key"
                class="col-lg-3 col-md-6"
              >
                <StatCard
                  :value="stat.count"
                  :label="stat.label"
                  :icon="stat.icon"
                  :iconClass="stat.iconClass"
                />
              </div>
            </div>
            <div v-if="driverDeliveryTime" class="card border-0 shadow-sm">
              <div class="card-body">
                <h6 class="mb-3">{{ $t("statistics.labels.deliveryTime") }}</h6>
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">{{ $t("statistics.labels.minimumHours") }}</span>
                    <span class="fw-semibold">{{ driverDeliveryTime.minimum_hours ?? 0 }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">{{ $t("statistics.labels.maximumHours") }}</span>
                    <span class="fw-semibold">{{ driverDeliveryTime.maximum_hours ?? 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="!driverStatsMessage && !driverCards.length && !driverDeliveryTime"
              class="text-center py-4 text-muted"
            >
              {{ $t("common.noDataAvailable") }}
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'customers'">
          <div v-if="loading.customers" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="customerCards.length" class="row g-3 mb-3">
              <div
                v-for="stat in customerCards"
                :key="stat.key"
                class="col-lg-4 col-md-6"
              >
                <StatCard
                  :value="stat.count"
                  :label="stat.label"
                  :icon="stat.icon"
                  :iconClass="stat.iconClass"
                />
              </div>
            </div>
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h6 class="mb-3">{{ $t("statistics.labels.bestCustomers") }}</h6>
                <div v-if="bestCustomers.length">
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="(item, index) in bestCustomers"
                      :key="index"
                      class="list-group-item px-0"
                    >
                      {{ formatBestCustomer(item) }}
                    </li>
                  </ul>
                </div>
                <div v-else class="text-muted">
                  {{ $t("common.noDataAvailable") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'lineWork'">
          <div v-if="loading.lineWork" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="lineWorkCards.length" class="row g-3 mb-3">
              <div
                v-for="stat in lineWorkCards"
                :key="stat.key"
                class="col-lg-4 col-md-6"
              >
                <StatCard
                  :value="stat.count"
                  :label="stat.label"
                  :icon="stat.icon"
                  :iconClass="stat.iconClass"
                />
              </div>
            </div>
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h6 class="mb-3">{{ $t("statistics.labels.lineWorkDrivers") }}</h6>
                <div v-if="lineWorkDrivers.length" class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{{ $t("statistics.labels.lineWorkName") }}</th>
                        <th class="text-end">{{ $t("statistics.labels.driversCount") }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in lineWorkDrivers" :key="item.line_work_id">
                        <td>{{ item.line_work_name || item.line_work_id }}</td>
                        <td class="text-end">{{ item.drivers_count ?? 0 }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-muted">
                  {{ $t("common.noDataAvailable") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'lines'">
          <div v-if="loading.lines" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="lineCards.length" class="row g-3 mb-3">
              <div
                v-for="stat in lineCards"
                :key="stat.key"
                class="col-lg-4 col-md-6"
              >
                <StatCard
                  :value="stat.count"
                  :label="stat.label"
                  :icon="stat.icon"
                  :iconClass="stat.iconClass"
                />
              </div>
            </div>
            <div class="row g-3">
              <div class="col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <h6 class="mb-3">{{ $t("statistics.labels.mostUsedLines") }}</h6>
                    <div v-if="mostUsedLines.length">
                      <ul class="list-group list-group-flush">
                        <li
                          v-for="item in mostUsedLines"
                          :key="item.line_id"
                          class="list-group-item d-flex justify-content-between px-0"
                        >
                          <span>{{ item.line_name || item.line_id }}</span>
                          <span class="fw-semibold">{{ item.usage_count ?? 0 }}</span>
                        </li>
                      </ul>
                    </div>
                    <div v-else class="text-muted">
                      {{ $t("common.noDataAvailable") }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <h6 class="mb-3">{{ $t("statistics.labels.linesByRegion") }}</h6>
                    <div v-if="linesByRegion.length" class="table-responsive">
                      <table class="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>{{ $t("statistics.labels.regionName") }}</th>
                            <th class="text-end">{{ $t("statistics.labels.linesCount") }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in linesByRegion" :key="item.region_id">
                            <td>{{ item.region_name || item.region_id }}</td>
                            <td class="text-end">{{ item.lines_count ?? 0 }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-else class="text-muted">
                      {{ $t("common.noDataAvailable") }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import StatCard from "@/components/shared/StatCard.vue";
import apiServices from "@/services/apiServices.js";
import { useOrdersStore } from "@/modules/orders/store/ordersStore.js";
import OrdersTableCard from "@/modules/orders/components/OrdersTableCard.vue";
import { createOrderColumns } from "@/modules/orders/components/ordersTableConfig.js";
import {
  buildProcessedOrders,
  normalizeOrderStatus,
} from "@/modules/orders/components/ordersProcessing.js";

const { t } = useI18n();
const ordersStore = useOrdersStore();
const router = useRouter();

const activeTab = ref("orders");
const driversStats = ref(null);
const customersStats = ref(null);
const lineWorkStats = ref(null);
const linesStats = ref(null);

const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedRows = ref([]);

const loading = ref({
  orders: false,
  drivers: false,
  customers: false,
  lineWork: false,
  lines: false,
});

const formatPrice = (value, currencySymbol = "$") => {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue) || value === null || value === undefined || value === "") {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${numericValue.toFixed(2)}`;
};

const fetchOrdersStats = async () => {
  loading.value.orders = true;
  try {
    await ordersStore.fetchStatistics();
  } catch (error) {
    console.error("Failed to load order statistics:", error);
  } finally {
    loading.value.orders = false;
  }
};

const fetchDriversStats = async () => {
  loading.value.drivers = true;
  try {
    const response = await apiServices.getDriverStatistics();
    driversStats.value = response.data || null;
  } catch (error) {
    driversStats.value = null;
    console.error("Failed to load driver statistics:", error);
  } finally {
    loading.value.drivers = false;
  }
};

const fetchCustomersStats = async () => {
  loading.value.customers = true;
  try {
    const response = await apiServices.getCustomerStatistics();
    customersStats.value = response.data || null;
  } catch (error) {
    customersStats.value = null;
    console.error("Failed to load customer statistics:", error);
  } finally {
    loading.value.customers = false;
  }
};

const fetchLineWorkStats = async () => {
  loading.value.lineWork = true;
  try {
    const response = await apiServices.getLineWorkStatistics();
    lineWorkStats.value = response.data || null;
  } catch (error) {
    lineWorkStats.value = null;
    console.error("Failed to load line work statistics:", error);
  } finally {
    loading.value.lineWork = false;
  }
};

const fetchLinesStats = async () => {
  loading.value.lines = true;
  try {
    const response = await apiServices.getLineStatistics();
    linesStats.value = response.data || null;
  } catch (error) {
    linesStats.value = null;
    console.error("Failed to load lines statistics:", error);
  } finally {
    loading.value.lines = false;
  }
};

const fetchOrdersList = async () => {
  try {
    await ordersStore.fetchOrders({ page: 1, perPage: itemsPerPage.value });
  } catch (error) {
    console.error("Failed to load orders:", error);
  }
};

const orderCards = computed(() => {
  const stats = ordersStore.statistics || {};
  const statusList = Array.isArray(stats.orders_by_status)
    ? stats.orders_by_status
    : [];

  const normalizeStatus = (status) =>
    status === "in_progress" ? "inprocess" : status;

  const getStatusCount = (status) => {
    const normalized = normalizeStatus(status);
    const match = statusList.find(
      (item) =>
        normalizeStatus(item.status) === normalized ||
        normalizeStatus(item.key) === normalized
    );
    return match?.count ?? 0;
  };

  return [
    {
      key: "total",
      count: stats.total_orders ?? 0,
      label: t("orders.stats.total"),
      icon: "fas fa-box",
      iconClass: "stat-icon-blue",
      filterStatus: "all",
    },
    {
      key: "totalProfit",
      count: stats.total_profit ?? 0,
      label: t("orders.stats.totalProfit"),
      icon: "fas fa-dollar-sign",
      iconClass: "stat-icon-green",
      filterStatus: "all",
    },
    {
      key: "pending",
      count: getStatusCount("pending"),
      label: t("orders.stats.pending"),
      icon: "fas fa-clock",
      iconClass: "stat-icon-orange",
      filterStatus: "pending",
    },
    {
      key: "inProgress",
      count: getStatusCount("inprocess"),
      label: t("orders.stats.inProgress"),
      icon: "fas fa-spinner",
      iconClass: "stat-icon-purple",
      filterStatus: "inprocess",
    },
    {
      key: "done",
      count: getStatusCount("done"),
      label: t("orders.stats.done"),
      icon: "fas fa-check-circle",
      iconClass: "stat-icon-green",
      filterStatus: "done",
    },
    {
      key: "failed",
      count: getStatusCount("failed"),
      label: t("orders.stats.failed"),
      icon: "fas fa-times-circle",
      iconClass: "stat-icon-red",
      filterStatus: "failed",
    },
  ];
});

const driverStatsMessage = computed(() => {
  if (!driversStats.value) return "";
  return driversStats.value.message || "";
});

const driverCards = computed(() => {
  const drivers = driversStats.value?.drivers;
  if (!drivers) return [];

  return [
    {
      key: "totalDrivers",
      count: drivers.total ?? 0,
      label: t("statistics.labels.totalDrivers"),
      icon: "fas fa-users",
      iconClass: "stat-icon-blue",
    },
    {
      key: "availableDrivers",
      count: drivers.available ?? 0,
      label: t("statistics.labels.availableDrivers"),
      icon: "fas fa-check-circle",
      iconClass: "stat-icon-green",
    },
    {
      key: "busyDrivers",
      count: drivers.busy ?? 0,
      label: t("statistics.labels.busyDrivers"),
      icon: "fas fa-clock",
      iconClass: "stat-icon-orange",
    },
    {
      key: "holidayDrivers",
      count: drivers.in_holiday ?? 0,
      label: t("statistics.labels.holidayDrivers"),
      icon: "fas fa-bed",
      iconClass: "stat-icon-purple",
    },
  ];
});

const driverDeliveryTime = computed(() => {
  return driversStats.value?.delivery_time || null;
});

const customerCards = computed(() => {
  const total = customersStats.value?.total_customers;
  if (total === undefined || total === null) return [];
  return [
    {
      key: "totalCustomers",
      count: total,
      label: t("statistics.labels.totalCustomers"),
      icon: "fas fa-users",
      iconClass: "stat-icon-blue",
    },
  ];
});

const bestCustomers = computed(() => {
  const list = customersStats.value?.best_customers;
  return Array.isArray(list) ? list : [];
});

const lineWorkCards = computed(() => {
  const total = lineWorkStats.value?.total_line_works;
  if (total === undefined || total === null) return [];
  return [
    {
      key: "totalLineWorks",
      count: total,
      label: t("statistics.labels.totalLineWorks"),
      icon: "fas fa-route",
      iconClass: "stat-icon-blue",
    },
  ];
});

const lineWorkDrivers = computed(() => {
  const list = lineWorkStats.value?.all_line_works_with_drivers;
  return Array.isArray(list) ? list : [];
});

const lineCards = computed(() => {
  const total = linesStats.value?.total_lines;
  if (total === undefined || total === null) return [];
  return [
    {
      key: "totalLines",
      count: total,
      label: t("statistics.labels.totalLines"),
      icon: "fas fa-route",
      iconClass: "stat-icon-blue",
    },
  ];
});

const mostUsedLines = computed(() => {
  const list = linesStats.value?.most_used_lines;
  return Array.isArray(list) ? list : [];
});

const linesByRegion = computed(() => {
  const list = linesStats.value?.lines_by_region;
  return Array.isArray(list) ? list : [];
});

const orderColumns = computed(() => createOrderColumns({ t, formatPrice }));
const statsVisibleColumns = [
  "id",
  "customer_name",
  "type",
  "status",
  "total_price",
  "created_at",
];

const filteredColumns = computed(() =>
  orderColumns.value.filter((col) => statsVisibleColumns.includes(col.key))
);

const processedOrders = computed(() => buildProcessedOrders(ordersStore.orders));

const isOrderExpandable = () => false;

const currentLoading = computed(() => ordersStore.loading);

const currentFilteredData = computed(() => {
  let result = processedOrders.value;

  if (selectedGroups.value.length > 0) {
    const normalizedGroups = selectedGroups.value.map(normalizeOrderStatus);
    result = result.filter((order) =>
      normalizedGroups.includes(normalizeOrderStatus(order.status))
    );
  }

  return result;
});

const paginatedData = computed(() => currentFilteredData.value);

const currentPagination = computed(() => ordersStore.ordersPagination);

const handleOrderCardClick = (stat) => {
  if (!stat) return;
  activeTab.value = "orders";
  selectedGroups.value = stat.filterStatus && stat.filterStatus !== "all"
    ? [stat.filterStatus]
    : [];
  currentPage.value = 1;
};

const goToOrder = (order) => {
  if (!order?.id) return;
  router.push({ path: "/orders", query: { orderId: order.id } });
};

const formatBestCustomer = (item) => {
  if (item === null || item === undefined) return "-";
  if (typeof item === "string" || typeof item === "number") return String(item);
  const name =
    item.name ||
    item.customer_name ||
    item.customer?.name ||
    item.company_name ||
    item.username ||
    "";
  const total =
    item.total ||
    item.total_orders ||
    item.orders_count ||
    item.count ||
    "";
  if (name && total !== "") return `${name} (${total})`;
  return name || JSON.stringify(item);
};

onMounted(async () => {
  await Promise.allSettled([
    fetchOrdersStats(),
    fetchDriversStats(),
    fetchCustomersStats(),
    fetchLineWorkStats(),
    fetchLinesStats(),
  ]);
  await fetchOrdersList();
});

watch(currentPage, async (newPage) => {
  try {
    await ordersStore.fetchOrders({ page: newPage, perPage: itemsPerPage.value });
  } catch (error) {
    console.error("Failed to load page:", error);
  }
});

watch(selectedGroups, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.statistics-page-container {
  max-width: 100%;
}
</style>
