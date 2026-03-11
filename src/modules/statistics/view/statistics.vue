<template>
  <div class="statistics-page-container bg-light">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h5 class="mb-0">{{ $t("statistics.title") }}</h5>
    </div>

    <div class="card border-0">
      <div class="card-header bg-white border-bottom">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
              {{ $t("statistics.tabs.orders") }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'drivers' }" @click="activeTab = 'drivers'">
              {{ $t("statistics.tabs.drivers") }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'customers' }" @click="activeTab = 'customers'">
              {{ $t("statistics.tabs.customers") }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'lineWork' }" @click="activeTab = 'lineWork'">
              {{ $t("statistics.tabs.lineWork") }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'lines' }" @click="activeTab = 'lines'">
              {{ $t("statistics.tabs.lines") }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link d-flex align-items-center gap-2" :class="{ active: activeTab === 'charts' }" @click="activeTab = 'charts'">
              <i class="fas fa-chart-bar"></i>
              {{ $t("statistics.tabs.charts") }}
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body">

        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'">
          <div v-if="loading.orders" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else-if="orderCards.length">
            <div class="row g-3">
              <div v-for="stat in orderCards" :key="stat.key" class="col-lg-4 col-md-6">
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

        <!-- Drivers Tab -->
        <div v-if="activeTab === 'drivers'">
          <div v-if="loading.drivers" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="driverStatsMessage" class="alert alert-info">{{ driverStatsMessage }}</div>
            <div v-if="driverCards.length" class="row g-3 mb-3">
              <div v-for="stat in driverCards" :key="stat.key" class="col-lg-3 col-md-6">
                <StatCard :value="stat.count" :label="stat.label" :icon="stat.icon" :iconClass="stat.iconClass" />
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
            <div v-if="!driverStatsMessage && !driverCards.length && !driverDeliveryTime" class="text-center py-4 text-muted">
              {{ $t("common.noDataAvailable") }}
            </div>
          </div>
        </div>

        <!-- Customers Tab -->
        <div v-if="activeTab === 'customers'">
          <div v-if="loading.customers" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="customerCards.length" class="row g-3 mb-3">
              <div v-for="stat in customerCards" :key="stat.key" class="col-lg-4 col-md-6">
                <StatCard :value="stat.count" :label="stat.label" :icon="stat.icon" :iconClass="stat.iconClass" />
              </div>
            </div>
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <h6 class="mb-3">{{ $t("statistics.labels.bestCustomers") }}</h6>
                <div v-if="bestCustomers.length">
                  <ul class="list-group list-group-flush">
                    <li v-for="(item, index) in bestCustomers" :key="index" class="list-group-item px-0">
                      {{ formatBestCustomer(item) }}
                    </li>
                  </ul>
                </div>
                <div v-else class="text-muted">{{ $t("common.noDataAvailable") }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- LineWork Tab -->
        <div v-if="activeTab === 'lineWork'">
          <div v-if="loading.lineWork" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="lineWorkCards.length" class="row g-3 mb-3">
              <div v-for="stat in lineWorkCards" :key="stat.key" class="col-lg-4 col-md-6">
                <StatCard :value="stat.count" :label="stat.label" :icon="stat.icon" :iconClass="stat.iconClass" />
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
                <div v-else class="text-muted">{{ $t("common.noDataAvailable") }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lines Tab -->
        <div v-if="activeTab === 'lines'">
          <div v-if="loading.lines" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{ $t("common.loading") }}</span>
            </div>
            <p class="mt-2">{{ $t("common.loading") }}</p>
          </div>
          <div v-else>
            <div v-if="lineCards.length" class="row g-3 mb-3">
              <div v-for="stat in lineCards" :key="stat.key" class="col-lg-4 col-md-6">
                <StatCard :value="stat.count" :label="stat.label" :icon="stat.icon" :iconClass="stat.iconClass" />
              </div>
            </div>
            <div class="row g-3">
              <div class="col-lg-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <h6 class="mb-3">{{ $t("statistics.labels.mostUsedLines") }}</h6>
                    <div v-if="mostUsedLines.length">
                      <ul class="list-group list-group-flush">
                        <li v-for="item in mostUsedLines" :key="item.line_id" class="list-group-item d-flex justify-content-between px-0">
                          <span>{{ item.line_name || item.line_id }}</span>
                          <span class="fw-semibold">{{ item.usage_count ?? 0 }}</span>
                        </li>
                      </ul>
                    </div>
                    <div v-else class="text-muted">{{ $t("common.noDataAvailable") }}</div>
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
                    <div v-else class="text-muted">{{ $t("common.noDataAvailable") }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'charts'">

          <div class="chart-subtabs mb-4">
            <button
              class="chart-subtab-btn"
              :class="{ active: activeChartTab === 'orders' }"
              @click="activeChartTab = 'orders'"
            >
              <div class="subtab-icon subtab-icon--orders">
                <i class="fas fa-box"></i>
              </div>
              <div class="subtab-text">
                <span class="subtab-title">{{ $t("statistics.charts.ordersTab") }}</span>
                <span class="subtab-desc">{{ $t("statistics.charts.ordersTabDesc") }}</span>
              </div>
              <span v-if="activeChartTab === 'orders'" class="subtab-active-dot"></span>
            </button>

            <button
              class="chart-subtab-btn"
              :class="{ active: activeChartTab === 'drivers' }"
              @click="activeChartTab = 'drivers'"
            >
              <div class="subtab-icon subtab-icon--drivers">
                <i class="fas fa-truck"></i>
              </div>
              <div class="subtab-text">
                <span class="subtab-title">{{ $t("statistics.charts.driversTab") }}</span>
                <span class="subtab-desc">{{ $t("statistics.charts.driversTabDesc") }}</span>
              </div>
              <span v-if="activeChartTab === 'drivers'" class="subtab-active-dot subtab-active-dot--drivers"></span>
            </button>
          </div>

          <Transition name="chart-fade" mode="out-in">
            <!-- Orders Chart -->
            <div v-if="activeChartTab === 'orders'" key="orders-chart">
              <div v-if="chartsLoading" class="chart-loading">
                <div class="chart-loading-inner">
                  <div class="spinner-border text-primary mb-3" role="status"></div>
                  <p class="text-muted mb-0">{{ $t("statistics.charts.loadingOrders") }}</p>
                </div>
              </div>
              <div v-else-if="chartsError" class="alert alert-danger d-flex align-items-center gap-2">
                <i class="fas fa-exclamation-triangle"></i>{{ chartsError }}
              </div>
              <div v-else-if="chartsEmbedConfig">
                <div class="chart-toolbar">
                  <div class="d-flex align-items-center gap-3">
                    <div class="chart-toolbar-badge chart-toolbar-badge--orders">
                      <i class="fas fa-circle me-1" style="font-size:8px"></i>
                      {{ $t("statistics.charts.liveData") }}
                    </div>
                    <span class="text-muted small">{{ $t("statistics.charts.ordersReport") }}</span>
                  </div>
                  <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-2" @click="refreshCharts" :disabled="chartsLoading">
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': chartsLoading }"></i>
                    {{ $t("statistics.charts.refresh") }}
                  </button>
                </div>
                <div class="powerbi-wrapper">
                  <PowerBIEmbed :embedConfig="chartsEmbedConfig" height="580px" />
                </div>
              </div>
              <div v-else class="chart-empty">
                <div class="chart-empty-icon chart-empty-icon--orders"><i class="fas fa-chart-bar"></i></div>
                <h6 class="mt-3 mb-1">{{ $t("statistics.charts.noOrdersData") }}</h6>
                <p class="text-muted small mb-3">{{ $t("statistics.charts.noOrdersDesc") }}</p>
                <button class="btn btn-sm btn-outline-primary" @click="refreshCharts">
                  <i class="fas fa-sync-alt me-2"></i>{{ $t("statistics.charts.tryAgain") }}
                </button>
              </div>
            </div>

            <!-- Drivers Chart -->
            <div v-else-if="activeChartTab === 'drivers'" key="drivers-chart">
              <div v-if="driverChartsLoading" class="chart-loading">
                <div class="chart-loading-inner">
                  <div class="spinner-border mb-3" style="color:#11998e" role="status"></div>
                  <p class="text-muted mb-0">{{ $t("statistics.charts.loadingDrivers") }}</p>
                </div>
              </div>
              <div v-else-if="driverChartsError" class="alert alert-danger d-flex align-items-center gap-2">
                <i class="fas fa-exclamation-triangle"></i>{{ driverChartsError }}
              </div>
              <div v-else-if="driverChartsEmbedConfig">
                <div class="chart-toolbar">
                  <div class="d-flex align-items-center gap-3">
                    <div class="chart-toolbar-badge chart-toolbar-badge--drivers">
                      <i class="fas fa-circle me-1" style="font-size:8px"></i>
                      {{ $t("statistics.charts.liveData") }}
                    </div>
                    <span class="text-muted small">{{ $t("statistics.charts.driversReport") }}</span>
                  </div>
                  <button class="btn btn-sm d-flex align-items-center gap-2 refresh-btn--drivers" @click="refreshDriverCharts" :disabled="driverChartsLoading">
                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': driverChartsLoading }"></i>
                    {{ $t("statistics.charts.refresh") }}
                  </button>
                </div>
                <div class="powerbi-wrapper">
                  <PowerBIEmbed :embedConfig="driverChartsEmbedConfig" height="580px" />
                </div>
              </div>
              <div v-else class="chart-empty">
                <div class="chart-empty-icon chart-empty-icon--drivers"><i class="fas fa-truck"></i></div>
                <h6 class="mt-3 mb-1">{{ $t("statistics.charts.noDriversData") }}</h6>
                <p class="text-muted small mb-3">{{ $t("statistics.charts.noDriversDesc") }}</p>
                <button class="btn btn-sm btn-outline-success" @click="refreshDriverCharts">
                  <i class="fas fa-sync-alt me-2"></i>{{ $t("statistics.charts.tryAgain") }}
                </button>
              </div>
            </div>
          </Transition>
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
import PowerBIEmbed from "@/components/shared/PowerBIEmbed.vue";
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
const activeChartTab = ref("orders");
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

const chartsLoading = ref(false);
const chartsError = ref(null);
const chartsEmbedConfig = ref(null);

const driverChartsLoading = ref(false);
const driverChartsError = ref(null);
const driverChartsEmbedConfig = ref(null);

const formatPrice = (value, currencySymbol = "$") => {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue) || value === null || value === undefined || value === "") {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${numericValue.toFixed(2)}`;
};

const fetchOrdersStats = async () => {
  loading.value.orders = true;
  try { await ordersStore.fetchStatistics(); }
  catch (error) { console.error("Failed to load order statistics:", error); }
  finally { loading.value.orders = false; }
};

const fetchDriversStats = async () => {
  loading.value.drivers = true;
  try {
    const response = await apiServices.getDriverStatistics();
    driversStats.value = response.data || null;
  } catch { driversStats.value = null; }
  finally { loading.value.drivers = false; }
};

const fetchCustomersStats = async () => {
  loading.value.customers = true;
  try {
    const response = await apiServices.getCustomerStatistics();
    customersStats.value = response.data || null;
  } catch { customersStats.value = null; }
  finally { loading.value.customers = false; }
};

const fetchLineWorkStats = async () => {
  loading.value.lineWork = true;
  try {
    const response = await apiServices.getLineWorkStatistics();
    lineWorkStats.value = response.data || null;
  } catch { lineWorkStats.value = null; }
  finally { loading.value.lineWork = false; }
};

const fetchLinesStats = async () => {
  loading.value.lines = true;
  try {
    const response = await apiServices.getLineStatistics();
    linesStats.value = response.data || null;
  } catch { linesStats.value = null; }
  finally { loading.value.lines = false; }
};

const fetchCharts = async () => {
  chartsLoading.value = true;
  chartsError.value = null;
  try {
    const response = await apiServices.refreshPowerBIDatasetOrders();
    const data = response.data;
    chartsEmbedConfig.value = { reportId: data.reportId, embedUrl: data.embedUrl, accessToken: data.embedToken, type: "report" };
  } catch (err) {
    chartsError.value = err.message || t("statistics.charts.loadingOrders");
  } finally { chartsLoading.value = false; }
};

const fetchDriverCharts = async () => {
  driverChartsLoading.value = true;
  driverChartsError.value = null;
  try {
    const response = await apiServices.refreshPowerBIDatasetDrivers();
    const data = response.data;
    driverChartsEmbedConfig.value = { reportId: data.reportId, embedUrl: data.embedUrl, accessToken: data.embedToken, type: "report" };
  } catch (err) {
    driverChartsError.value = err.message || t("statistics.charts.loadingDrivers");
  } finally { driverChartsLoading.value = false; }
};

const refreshCharts = () => fetchCharts();
const refreshDriverCharts = () => fetchDriverCharts();

const fetchOrdersList = async () => {
  try { await ordersStore.fetchOrders({ page: 1, perPage: itemsPerPage.value }); }
  catch (error) { console.error("Failed to load orders:", error); }
};

const orderCards = computed(() => {
  const stats = ordersStore.statistics || {};
  const statusList = Array.isArray(stats.orders_by_status) ? stats.orders_by_status : [];
  const normalizeStatus = (status) => status === "in_progress" ? "inprocess" : status;
  const getStatusCount = (status) => {
    const normalized = normalizeStatus(status);
    const match = statusList.find((item) => normalizeStatus(item.status) === normalized || normalizeStatus(item.key) === normalized);
    return match?.count ?? 0;
  };
  return [
    { key: "total", count: stats.total_orders ?? 0, label: t("orders.stats.total"), icon: "fas fa-box", iconClass: "stat-icon-blue", filterStatus: "all" },
    { key: "totalProfit", count: stats.total_profit ?? 0, label: t("orders.stats.totalProfit"), icon: "fas fa-dollar-sign", iconClass: "stat-icon-green", filterStatus: "all" },
    { key: "pending", count: getStatusCount("pending"), label: t("orders.stats.pending"), icon: "fas fa-clock", iconClass: "stat-icon-orange", filterStatus: "pending" },
    { key: "inProgress", count: getStatusCount("inprocess"), label: t("orders.stats.inProgress"), icon: "fas fa-spinner", iconClass: "stat-icon-purple", filterStatus: "inprocess" },
    { key: "done", count: getStatusCount("done"), label: t("orders.stats.done"), icon: "fas fa-check-circle", iconClass: "stat-icon-green", filterStatus: "done" },
    { key: "failed", count: getStatusCount("failed"), label: t("orders.stats.failed"), icon: "fas fa-times-circle", iconClass: "stat-icon-red", filterStatus: "failed" },
  ];
});

const driverStatsMessage = computed(() => driversStats.value?.message || "");
const driverCards = computed(() => {
  const drivers = driversStats.value?.drivers;
  if (!drivers) return [];
  return [
    { key: "totalDrivers", count: drivers.total ?? 0, label: t("statistics.labels.totalDrivers"), icon: "fas fa-users", iconClass: "stat-icon-blue" },
    { key: "availableDrivers", count: drivers.available ?? 0, label: t("statistics.labels.availableDrivers"), icon: "fas fa-check-circle", iconClass: "stat-icon-green" },
    { key: "busyDrivers", count: drivers.busy ?? 0, label: t("statistics.labels.busyDrivers"), icon: "fas fa-clock", iconClass: "stat-icon-orange" },
    { key: "holidayDrivers", count: drivers.in_holiday ?? 0, label: t("statistics.labels.holidayDrivers"), icon: "fas fa-bed", iconClass: "stat-icon-purple" },
  ];
});

const driverDeliveryTime = computed(() => driversStats.value?.delivery_time || null);
const customerCards = computed(() => {
  const total = customersStats.value?.total_customers;
  if (total === undefined || total === null) return [];
  return [{ key: "totalCustomers", count: total, label: t("statistics.labels.totalCustomers"), icon: "fas fa-users", iconClass: "stat-icon-blue" }];
});
const bestCustomers = computed(() => Array.isArray(customersStats.value?.best_customers) ? customersStats.value.best_customers : []);
const lineWorkCards = computed(() => {
  const total = lineWorkStats.value?.total_line_works;
  if (total === undefined || total === null) return [];
  return [{ key: "totalLineWorks", count: total, label: t("statistics.labels.totalLineWorks"), icon: "fas fa-route", iconClass: "stat-icon-blue" }];
});
const lineWorkDrivers = computed(() => Array.isArray(lineWorkStats.value?.all_line_works_with_drivers) ? lineWorkStats.value.all_line_works_with_drivers : []);
const lineCards = computed(() => {
  const total = linesStats.value?.total_lines;
  if (total === undefined || total === null) return [];
  return [{ key: "totalLines", count: total, label: t("statistics.labels.totalLines"), icon: "fas fa-route", iconClass: "stat-icon-blue" }];
});
const mostUsedLines = computed(() => Array.isArray(linesStats.value?.most_used_lines) ? linesStats.value.most_used_lines : []);
const linesByRegion = computed(() => Array.isArray(linesStats.value?.lines_by_region) ? linesStats.value.lines_by_region : []);

const orderColumns = computed(() => createOrderColumns({ t, formatPrice }));
const statsVisibleColumns = ["id", "customer_name", "type", "status", "total_price", "created_at"];
const filteredColumns = computed(() => orderColumns.value.filter((col) => statsVisibleColumns.includes(col.key)));
const processedOrders = computed(() => buildProcessedOrders(ordersStore.orders));
const isOrderExpandable = () => false;
const currentLoading = computed(() => ordersStore.loading);

const currentFilteredData = computed(() => {
  let result = processedOrders.value;
  if (selectedGroups.value.length > 0) {
    const normalizedGroups = selectedGroups.value.map(normalizeOrderStatus);
    result = result.filter((order) => normalizedGroups.includes(normalizeOrderStatus(order.status)));
  }
  return result;
});

const paginatedData = computed(() => currentFilteredData.value);
const currentPagination = computed(() => ordersStore.ordersPagination);

const handleOrderCardClick = (stat) => {
  if (!stat) return;
  activeTab.value = "orders";
  selectedGroups.value = stat.filterStatus && stat.filterStatus !== "all" ? [stat.filterStatus] : [];
  currentPage.value = 1;
};

const goToOrder = (order) => {
  if (!order?.id) return;
  router.push({ path: "/orders", query: { orderId: order.id } });
};

const formatBestCustomer = (item) => {
  if (item === null || item === undefined) return "-";
  if (typeof item === "string" || typeof item === "number") return String(item);
  const name = item.name || item.customer_name || item.customer?.name || item.company_name || item.username || "";
  const total = item.total || item.total_orders || item.orders_count || item.count || "";
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
    fetchCharts(),
    fetchDriverCharts(),
  ]);
  await fetchOrdersList();
});

watch(currentPage, async (newPage) => {
  try { await ordersStore.fetchOrders({ page: newPage, perPage: itemsPerPage.value }); }
  catch (error) { console.error("Failed to load page:", error); }
});

watch(selectedGroups, () => { currentPage.value = 1; });
</script>

<style scoped>
.statistics-page-container { max-width: 100%; }

/* ── Sub-tabs ── */
.chart-subtabs {
  display: flex;
  gap: 12px;
  padding: 6px;
  background: #f8f9fa;
  border-radius: 14px;
  border: 1px solid #e9ecef;
}

.chart-subtab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  text-align: left;
}

.chart-subtab-btn:hover {
  background: #fff;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chart-subtab-btn.active { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.chart-subtab-btn.active:first-child { border-color: #667eea; }
.chart-subtab-btn.active:last-child { border-color: #11998e; }

.subtab-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.chart-subtab-btn.active .subtab-icon { transform: scale(1.08); }
.subtab-icon--orders { background: linear-gradient(135deg, #667eea, #764ba2); }
.subtab-icon--drivers { background: linear-gradient(135deg, #11998e, #38ef7d); }

.subtab-text { display: flex; flex-direction: column; gap: 2px; }
.subtab-title { font-weight: 600; font-size: 0.95rem; color: #212529; line-height: 1.2; }
.subtab-desc { font-size: 0.75rem; color: #6c757d; line-height: 1.2; }

.subtab-active-dot {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: pulse-dot 2s ease-in-out infinite;
}

.subtab-active-dot--drivers { background: #11998e; }

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

/* ── Toolbar ── */
.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px 10px 0 0;
  border: 1px solid #e9ecef;
  border-bottom: none;
}

.chart-toolbar-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.chart-toolbar-badge--orders { background: #ede9fe; color: #5b21b6; }
.chart-toolbar-badge--drivers { background: #d1fae5; color: #065f46; }

.refresh-btn--drivers {
  border: 1.5px solid #11998e;
  color: #11998e;
  background: transparent;
  transition: all 0.2s ease;
}
.refresh-btn--drivers:hover:not(:disabled) { background: #11998e; color: white; }

/* ── PowerBI ── */
.powerbi-wrapper {
  border: 1px solid #e9ecef;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

/* ── Loading ── */
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dee2e6;
}
.chart-loading-inner { text-align: center; }

/* ── Empty ── */
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dee2e6;
}

.chart-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  opacity: 0.5;
}

.chart-empty-icon--orders { background: linear-gradient(135deg, #667eea, #764ba2); }
.chart-empty-icon--drivers { background: linear-gradient(135deg, #11998e, #38ef7d); }

/* ── Mobile ── */
@media (max-width: 576px) {
  .chart-subtabs { flex-direction: column; }
  .chart-subtab-btn { padding: 12px 14px; }
  .subtab-icon { width: 36px; height: 36px; font-size: 0.9rem; }
}
</style>