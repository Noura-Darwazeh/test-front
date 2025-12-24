<template>
  <div class="orders-page-container bg-light">
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
      :data="orders"
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
        <DataTable :columns="filteredColumns" :data="paginatedOrders" />
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

    <!-- Form Modal for Order -->
    <FormModal
      :isOpen="isModalOpen"
      :title="$t('orders.addNew')"
      :fields="orderFields"
      @close="closeModal"
      @submit="handleAddOrder"
    />

    <!-- Trashed Orders Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('orders.trashed.title')"
      :emptyMessage="$t('orders.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedOrders"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreOrder"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import StatCard from "../../../components/shared/StatCard.vue";
import OrdersHeader from "../components/ordersHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import StatusBadge from "../../../components/shared/StatusBadge.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useOrderFormFields } from "../components/orderFormFields.js";

const { t } = useI18n();
const { orderFields } = useOrderFormFields();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);

// Simple local data - just like user and driver pages
const orders = ref([
  {
    id: 1,
    customerName: "John Doe",
    customerPhone: "0598549638",
    companyName: "Tech Solutions",
    driverName: "Ahmed Ali",
    status: "pending",
    totalPrice: 150.0,
    pickupLocation: "Jerusalem",
    deliveryLocation: "Ramallah",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    customerName: "Sara Mohammed",
    customerPhone: "0598549639",
    companyName: "Tech Solutions",
    driverName: "Omar Hassan",
    status: "on_way",
    totalPrice: 75.5,
    pickupLocation: "Bethlehem",
    deliveryLocation: "Hebron",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    customerName: "Ahmad Khalil",
    customerPhone: "0598549640",
    companyName: "Fast Delivery",
    driverName: "Layla Ahmad",
    status: "delivered",
    totalPrice: 200.0,
    pickupLocation: "Nablus",
    deliveryLocation: "Jenin",
    createdAt: "2024-01-13",
  },
]);

const trashedOrders = ref([
  {
    id: 101,
    customerName: "Deleted Order 1",
    customerPhone: "0598549999",
    status: "cancelled",
    totalPrice: 50.0,
    pickupLocation: "Ramallah",
    deliveryLocation: "Jerusalem",
    createdAt: "2024-01-10",
  },
]);

// Order statistics - simple computed like user/driver pages
const orderStats = computed(() => [
  {
    key: "total",
    count: filteredOrders.value.length,
    icon: "fas fa-box",
    iconClass: "stat-icon-blue",
    filterValue: null,
  },
  {
    key: "delivered",
    count: filteredOrders.value.filter((o) => o.status === "delivered").length,
    icon: "fas fa-check-circle",
    iconClass: "stat-icon-green",
    filterValue: "delivered",
  },
  {
    key: "onWay",
    count: filteredOrders.value.filter((o) => o.status === "on_way").length,
    icon: "fas fa-truck",
    iconClass: "stat-icon-orange",
    filterValue: "on_way",
  },
  {
    key: "pending",
    count: filteredOrders.value.filter((o) => o.status === "pending").length,
    icon: "fas fa-clock",
    iconClass: "stat-icon-red",
    filterValue: "pending",
  },
]);

// Table columns
const orderColumns = computed(() => [
  { key: "id", label: t("orders.table.id"), sortable: true },
  { key: "customerName", label: t("orders.table.customer"), sortable: true },
  { key: "companyName", label: t("orders.table.company"), sortable: true },
  {
    key: "status",
    label: t("orders.table.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "order" },
  },
  { key: "totalPrice", label: t("orders.table.total"), sortable: true },
  { key: "pickupLocation", label: t("orders.table.pickup"), sortable: true },
  {
    key: "deliveryLocation",
    label: t("orders.table.delivery"),
    sortable: true,
  },
  { key: "driverName", label: t("orders.table.driver"), sortable: true },
  { key: "createdAt", label: t("orders.table.date"), sortable: true },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("orders.table.id") },
  { key: "customerName", label: t("orders.table.customer") },
  { key: "status", label: t("orders.table.status") },
  { key: "totalPrice", label: t("orders.table.total") },
  { key: "createdAt", label: t("orders.table.date") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  return orderColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

// Simple filtering - exactly like user/driver pages
const filteredOrders = computed(() => {
  let result = orders.value;
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

const handleAddOrder = (orderData) => {
  console.log("New order added:", orderData);

  const newOrder = {
    id: orders.value.length + 1,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    companyName: "Current Company",
    driverName: null,
    status: "pending",
    totalPrice: parseFloat(orderData.totalPrice),
    pickupLocation: orderData.pickupLocation,
    deliveryLocation: orderData.deliveryLocation,
    createdAt: new Date().toISOString().split("T")[0],
  };

  orders.value.push(newOrder);
  console.log("Order added successfully!");
};

const handleRestoreOrder = (order) => {
  console.log("Restoring order:", order);
  orders.value.push(order);
  const index = trashedOrders.value.findIndex((o) => o.id === order.id);
  if (index > -1) {
    trashedOrders.value.splice(index, 1);
  }
  console.log("Order has been restored successfully!");
};

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.orders-page-container {
  max-width: 100%;
}
</style>
