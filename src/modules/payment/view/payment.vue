<template>
  <div class="payment-page-container bg-light">
    <TableHeader v-model="searchText" :searchPlaceholder="$t('payment.searchPlaceholder')" :data="payments"
      groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('payment.filterByStatus')"
      translationKey="paymentStatus" :columns="paymentColumns" v-model:visibleColumns="visibleColumns"
      :addButtonText="$t('payment.addNew')" @add-click="openModal" @refresh-click="handleRefresh" />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Bulk Actions Bar - Custom for Payments -->
        <BulkActionsBar :selectedCount="selectedRows.length" entityName="payment" :actions="bulkActions"
          :loading="bulkActionLoading" @action="handleBulkAction" />

        <!-- Loading State -->
        <div v-if="paymentsStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="paymentsStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ paymentsStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedData" :actionsLabel="$t('payment.actions')"
            v-model="selectedRows" :disableRowWhen="isPaymentCompleted">
            <template #actions="{ row }">
              <ActionsDropdown :row="row" :editLabel="$t('payment.edit')" :detailsLabel="$t('payment.details')"
                :showDelete="false" @edit="openEditModal" @details="openDetailsModal" />
            </template>
          </DataTable>

          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination :totalItems="currentFilteredData.length" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
              @update:currentPage="(page) => (currentPage = page)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <FormModal :isOpen="isModalOpen" :title="isEditMode ? $t('payment.edit') : $t('payment.addNew')"
      :fields="paymentFields" :showImageUpload="false" @close="closeModal" @submit="handleSubmitPayment" />

    <!-- Details Modal -->
    <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('payment.details')" :data="selectedPayment"
      :fields="detailsFields" @close="closeDetailsModal" />

    <!-- Payment Method Modal -->
    <PaymentMethodModal :isOpen="isPaymentMethodModalOpen" :selectedCount="selectedRows.length" :drivers="drivers"
      :loading="paymentMethodLoading" @close="closePaymentMethodModal" @submit="handlePaymentMethodSubmit" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import TableHeader from "../../../components/shared/TableHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import PaymentMethodModal from "../components/PaymentMethodModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { usePaymentsManagementStore } from "../store/paymentsManagement.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const paymentsStore = usePaymentsManagementStore();

// State
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedPayment = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isPaymentMethodModalOpen = ref(false);
const paymentMethodLoading = ref(false);

// Data
const orders = ref([]);
const currencies = ref([]);
const drivers = ref([]);

// Status options
const statuses = ref([
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
]);

// Fetch dropdown data
const fetchDropdownData = async () => {
  try {
    const [ordersResponse, currenciesResponse, driversResponse] = await Promise.all([
      apiServices.getOrders(),
      apiServices.getCurrencies(),
      apiServices.getDrivers()
    ]);

    orders.value = ordersResponse.data.data.map(order => ({
      value: String(order.id),
      label: order.order_code || `Order #${order.id}`
    }));

    currencies.value = currenciesResponse.data.data.map(currency => ({
      value: String(currency.id),
      label: `${currency.code} (${currency.symbol})`
    }));

    drivers.value = driversResponse.data.data.map(driver => ({
      value: String(driver.id),
      label: driver.name || `Driver #${driver.id}`
    }));
  } catch (error) {
    console.error("❌ Failed to load dropdown data:", error);
  }
};

// Mount
onMounted(async () => {
  try {
    await Promise.all([
      paymentsStore.fetchPayments(),
      fetchDropdownData()
    ]);
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// Computed
const payments = computed(() => paymentsStore.payments);

const paymentColumns = computed(() => [
  { key: "id", label: t("payment.id"), sortable: true },
  { key: "amount", label: t("payment.amount"), sortable: true },
  { key: "currency", label: t("payment.currency"), sortable: false },
  { key: "order_code", label: t("payment.orderCode"), sortable: false },
  { key: "client_company_name", label: t("payment.clientCompany"), sortable: false },
  { key: "delivery_company_name", label: t("payment.deliveryCompany"), sortable: false },
  { key: "driver_received_name", label: t("payment.driverReceived"), sortable: false },
  { key: "driver_paid_name", label: t("payment.driverPaid"), sortable: false },
  {
    key: "status",
    label: t("payment.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "payment" }
  },
]);

const visibleColumns = ref(paymentColumns.value.map(col => col.key));

const paymentFields = computed(() => [
  {
    name: "amount",
    label: t("payment.form.amount"),
    type: "number",
    required: true,
    step: "0.01",
    placeholder: t("payment.form.amountPlaceholder"),
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedPayment.value.amount : '',
  },
  {
    name: "order_id",
    label: t("payment.form.order"),
    type: "select",
    required: true,
    options: orders.value,
    placeholder: t("payment.form.orderPlaceholder"),
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? String(selectedPayment.value.order_id) : '',
  },
  {
    name: "currency_id",
    label: t("payment.form.currency"),
    type: "select",
    required: true,
    options: currencies.value,
    placeholder: t("payment.form.currencyPlaceholder"),
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? String(selectedPayment.value.currency_id) : '',
  },
  {
    name: "status",
    label: t("payment.form.status"),
    type: "select",
    required: true,
    options: statuses.value,
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedPayment.value.status : 'pending',
  },
]);

const detailsFields = computed(() => [
  { key: 'id', label: t('payment.id'), colClass: 'col-md-6' },
  { key: 'amount', label: t('payment.amount'), colClass: 'col-md-6' },
  { key: 'currency', label: t('payment.currency'), colClass: 'col-md-6' },
  { key: 'order_code', label: t('payment.orderCode'), colClass: 'col-md-6' },
  { key: 'client_company_name', label: t('payment.clientCompany'), colClass: 'col-md-6' },
  { key: 'delivery_company_name', label: t('payment.deliveryCompany'), colClass: 'col-md-6' },
  { key: 'driver_received_name', label: t('payment.driverReceived'), colClass: 'col-md-6' },
  { key: 'driver_paid_name', label: t('payment.driverPaid'), colClass: 'col-md-6' },
  { key: 'notes', label: t('payment.notes'), colClass: 'col-md-12' },
  { key: 'status', label: t('payment.status'), translationKey: 'paymentStatus', colClass: 'col-md-12' },
]);

const filteredColumns = computed(() => {
  return paymentColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

const currentFilteredData = computed(() => {
  let result = payments.value;
  result = filterByGroups(result, selectedGroups.value, "status");
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

const bulkActions = computed(() => [
  {
    id: 'paid',
    label: t('payment.markAsPaid'),
    bgColor: 'var(--color-success)',
  },
]);

// Watchers
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

// Methods
const isPaymentCompleted = (row) => {
  return row.status === 'completed';
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    await paymentsStore.fetchPayments();
  } catch (error) {
    console.error("❌ Failed to refresh payments:", error);
  }
};

const openModal = () => {
  isEditMode.value = false;
  selectedPayment.value = {};
  isModalOpen.value = true;
};

const openEditModal = (payment) => {
  isEditMode.value = true;
  selectedPayment.value = { ...payment };
  isModalOpen.value = true;
};

const openDetailsModal = (payment) => {
  selectedPayment.value = { ...payment };
  isDetailsModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedPayment.value = {};
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedPayment.value = {};
};

const handleSubmitPayment = async (paymentData) => {
  try {
    const data = {
      amount: paymentData.amount,
      order_id: paymentData.order_id,
      currency_id: paymentData.currency_id,
      status: paymentData.status,
    };

    if (isEditMode.value) {
      await paymentsStore.updatePayment(selectedPayment.value.id, data);
      console.log("✅ Payment updated successfully!");
      closeModal();
    } else {
      await paymentsStore.addPayment(data);
      console.log("✅ Payment added successfully!");
      closeModal();
    }
  } catch (error) {
    console.error("❌ Failed to save payment:", error);
    alert(error.message || "Failed to save payment. Please try again.");
  }
};

const handleBulkAction = ({ actionId }) => {
  if (actionId === 'paid') {
    isPaymentMethodModalOpen.value = true;
  }
};

const closePaymentMethodModal = () => {
  isPaymentMethodModalOpen.value = false;
};

const handlePaymentMethodSubmit = async (paymentMethodData) => {
  paymentMethodLoading.value = true;
  try {
    // تحضير البيانات حسب structure الـ API
    const paymentData = {
      payment_ids: selectedRows.value, // array of payment IDs
    };

    // إضافة paid_by_driver_id فقط إذا كان الدفع للسائق
    if (paymentMethodData.paid_by_driver_id) {
      paymentData.paid_by_driver_id = paymentMethodData.paid_by_driver_id;
    }

    console.log("📤 Sending payment data:", paymentData);

    const response = await apiServices.markPaymentsAsPaid(paymentData);

    console.log("✅ Payments marked as paid successfully!");

    // Refresh data
    await paymentsStore.fetchPayments();

    // Clear selection
    selectedRows.value = [];
    closePaymentMethodModal();
  } catch (error) {
    console.error("❌ Failed to mark payments as paid:", error);
    alert(error.message || "Failed to process payment. Please try again.");
  } finally {
    paymentMethodLoading.value = false;
  }
};
</script>

<style scoped>
.payment-page-container {
  max-width: 100%;
}
</style>