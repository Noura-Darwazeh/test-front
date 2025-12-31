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
              @edit="editOrder"
              @details="viewOrderDetails"
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
      :trashedItems="trashedOrders"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreOrder"
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
import { ref, computed, watch } from "vue";
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

const { t } = useI18n();
const { orderFields } = useOrderFormFields();

// Simple price formatter
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "$0.00";
  return `$${Number(value).toFixed(2)}`;
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

// Simple local data - following the backend API schema
const orders = ref([
  {
    id: 1,
    to_id: 1,
    customer_id: 1,
    customer_name: "John Doe",
    price: 150.0,
    currency_id: 1,
    currency_code: "USD",
    lineprice_id: 1,
    discount_id: 1,
    discount_percentage: 15.5,
    company_item_price_id: 1,
    type: "delivery",
    package: "one",
    case: "Full",
    parent_order_id: null,
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    branch_customer_company_id: 1,
    branch_delivery_company_id: 1,
    order_items: [
      {
        id: 1,
        name: "Electronics Package",
        quantity: 1,
        items: [
          { name: "Laptop", quantity: 1 },
          { name: "Mouse", quantity: 1 },
        ],
      },
    ],
    status: "pending",
    created_at: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    to_id: 2,
    customer_id: 2,
    customer_name: "Sara Mohammed",
    price: 75.5,
    currency_id: 1,
    currency_code: "USD",
    lineprice_id: 2,
    discount_id: null,
    discount_percentage: 0,
    company_item_price_id: 2,
    type: "delivery",
    package: "multi",
    case: "Full",
    parent_order_id: null,
    company_id: 1,
    company_name: "Tech Solutions Ltd",
    branch_customer_company_id: 2,
    branch_delivery_company_id: 1,
    order_items: [
      {
        id: 1,
        name: "Documents",
        quantity: 5,
        items: [
          { name: "Contract", quantity: 2 },
          { name: "Invoice", quantity: 3 },
        ],
      },
      {
        id: 2,
        name: "Books",
        quantity: 3,
        items: [{ name: "Manual", quantity: 3 }],
      },
    ],
    status: "on_way",
    created_at: "2024-01-14 09:15:00",
  },
  {
    id: 3,
    to_id: 3,
    customer_id: 3,
    customer_name: "Ahmad Khalil",
    price: 200.0,
    currency_id: 2,
    currency_code: "EUR",
    lineprice_id: 1,
    discount_id: 2,
    discount_percentage: 10.0,
    company_item_price_id: 4,
    type: "return",
    package: "one",
    case: "Fast",
    parent_order_id: 1,
    company_id: 2,
    company_name: "Fast Delivery Co",
    branch_customer_company_id: 3,
    branch_delivery_company_id: 2,
    order_items: [
      {
        id: 1,
        name: "Returned Item",
        quantity: 1,
        items: [{ name: "Defective Product", quantity: 1 }],
      },
    ],
    status: "delivered",
    created_at: "2024-01-13 14:20:00",
  },
]);

const trashedOrders = ref([
  {
    id: 101,
    to_id: 1,
    customer_id: 1,
    customer_name: "Deleted Customer",
    price: 50.0,
    currency_id: 1,
    currency_code: "USD",
    type: "delivery",
    package: "one",
    case: "Part",
    status: "cancelled",
    created_at: "2024-01-10 12:00:00",
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
  { key: "customer_name", label: t("orders.table.customer"), sortable: true },
  { key: "company_name", label: t("orders.table.company"), sortable: true },
  { key: "type", label: t("orders.table.type"), sortable: true },
  { key: "package", label: t("orders.table.package"), sortable: true },
  { key: "case", label: t("orders.table.case"), sortable: true },
  {
    key: "price",
    label: t("orders.table.price"),
    sortable: true,
    formatter: (value, row) => formatPrice(value, row.currency_code),
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
    formatter: (value, row) => formatPrice(value, row.currency_code),
  },
  { key: "created_at", label: t("orders.table.createdAt") },
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
  isWizardOpen.value = true;
};

const closeModal = () => {
  isWizardOpen.value = false;
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
    ...orderData,
    customer_name: "New Customer",
    company_name: "Default Company",
    currency_code: "USD",
    status: "pending",
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
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

const handleEditOrder = (orderData) => {
  console.log("Editing order:", orderData);

  // Find company name from company_id
  const companies = [
    { id: 1, name: "Tech Solutions Ltd" },
    { id: 2, name: "Fast Delivery Co" },
    { id: 3, name: "Global Logistics Inc" },
  ];

  const company = companies.find((c) => c.id === parseInt(orderData.company_id));

  // Find customer name from customer_id
  const customers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Sara Mohammed" },
    { id: 3, name: "Ahmad Khalil" },
  ];

  const customer = customers.find((c) => c.id === parseInt(orderData.customer_id));

  // Find currency code from currency_id
  const currencyMap = {
    1: "USD",
    2: "EUR",
    3: "GBP",
  };

  const index = orders.value.findIndex((o) => o.id === selectedOrder.value.id);
  if (index > -1) {
    orders.value[index] = {
      ...orders.value[index],
      to_id: parseInt(orderData.to_id),
      customer_id: parseInt(orderData.customer_id),
      customer_name: customer?.name || orders.value[index].customer_name,
      price: parseFloat(orderData.price),
      currency_id: parseInt(orderData.currency_id),
      currency_code: currencyMap[parseInt(orderData.currency_id)] || "USD",
      lineprice_id: parseInt(orderData.lineprice_id),
      discount_id: orderData.discount_id ? parseInt(orderData.discount_id) : null,
      company_item_price_id: parseInt(orderData.company_item_price_id),
      type: orderData.type,
      package: orderData.package,
      case: orderData.case,
      parent_order_id: orderData.parent_order_id ? parseInt(orderData.parent_order_id) : null,
      company_id: parseInt(orderData.company_id),
      company_name: company?.name || orders.value[index].company_name,
      branch_customer_company_id: parseInt(orderData.branch_customer_company_id),
      branch_delivery_company_id: parseInt(orderData.branch_delivery_company_id),
    };
    console.log("Order updated successfully!");
  }

  closeFormModal();
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
    translator: (value) => formatPrice(selectedOrder.value.price, selectedOrder.value.currency_code)
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
</style>
