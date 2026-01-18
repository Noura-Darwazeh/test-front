<template>
  <div class="payment-page-container bg-light">
    <TableHeader
      v-model="searchText"
      :searchPlaceholder="$t('payment.searchPlaceholder')"
      :data="payments"
      groupKey="status"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('payment.filterByStatus')"
      translationKey="paymentStatus"
      :columns="paymentColumns"
      v-model:visibleColumns="visibleColumns"
      :addButtonText="$t('payment.addNew')"
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
              {{ $t('payment.activePayments') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link trashed-tab"
              :class="{ active: activeTab === 'trashed' }"
              @click="switchTab('trashed')"
            >
              {{ $t('payment.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>

      <div class="card-body p-0">
        <!-- Bulk Actions Bar -->
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="payment"
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
        <div v-else-if="paymentsStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ paymentsStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            :actionsLabel="$t('payment.actions')"
            v-model="selectedRows"
          >
            <template #actions="{ row }">
              <ActionsDropdown
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('payment.edit')"
                :detailsLabel="$t('payment.details')"
                :deleteLabel="$t('payment.delete')"
                :showDelete="true"
                @edit="openEditModal"
                @details="openDetailsModal"
                @delete="handleDeletePayment"
              />
              <PrimaryButton
                v-else
                :text="$t('payment.trashed.restore')"
                bgColor="var(--color-success)"
                class="d-inline-flex align-items-center"
                @click="handleRestorePayment(row)"
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

    <!-- Form Modal -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('payment.edit') : $t('payment.addNew')"
      :fields="paymentFields"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleSubmitPayment"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('payment.details')"
      :data="selectedPayment"
      :fields="detailsFields"
      @close="closeDetailsModal"
    />

    <!-- Delete Confirmation -->
    <ConfirmationModal
      :isOpen="isDeleteModalOpen"
      :title="$t('payment.confirmDeleteTitle')"
      :message="$t('payment.confirmDelete')"
      :confirmText="$t('payment.delete')"
      :cancelText="$t('common.cancel')"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />

    <!-- Bulk Confirmation -->
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
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import TableHeader from "../../../components/shared/TableHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import PrimaryButton from "../../../components/shared/PrimaryButton.vue";
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
const isDeleteModalOpen = ref(false);
const isEditMode = ref(false);
const selectedPayment = ref({});
const paymentToDelete = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Data
const orders = ref([]);
const currencies = ref([]);

// Status options
const statuses = ref([
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
]);

// Fetch dropdown data
const fetchDropdownData = async () => {
  try {
    const [ordersResponse, currenciesResponse] = await Promise.all([
      apiServices.getOrders(),
      apiServices.getCurrencies()
    ]);

    orders.value = ordersResponse.data.data.map(order => ({
      value: String(order.id),
      label: order.order_code || `Order #${order.id}`
    }));

    currencies.value = currenciesResponse.data.data.map(currency => ({
      value: String(currency.id),
      label: `${currency.code} (${currency.symbol})`
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
const trashedPayments = computed(() => paymentsStore.trashedPayments);

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

const trashedColumns = computed(() => [
  { key: "id", label: t("payment.id") },
  { key: "amount", label: t("payment.amount") },
  { key: "currency", label: t("payment.currency") },
  { key: "order_code", label: t("payment.orderCode") },
  { key: "status", label: t("payment.status") },
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

const currentLoading = computed(() => {
  return activeTab.value === 'active' ? paymentsStore.loading : paymentsStore.trashedLoading;
});

const currentData = computed(() => {
  return activeTab.value === 'active' ? payments.value : trashedPayments.value;
});

const filteredColumns = computed(() => {
  const columns = activeTab.value === 'active' ? paymentColumns.value : trashedColumns.value;
  if (activeTab.value === 'active') {
    return columns.filter((col) => visibleColumns.value.includes(col.key));
  }
  return columns;
});

const currentFilteredData = computed(() => {
  let result = currentData.value;
  if (activeTab.value === 'active') {
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
  if (activeTab.value === 'active') {
    return [
      {
        id: 'delete',
        label: t('payment.bulkDelete'),
        bgColor: 'var(--color-danger)',
      },
    ];
  } else {
    return [
      {
        id: 'restore',
        label: t('payment.bulkRestore'),
        bgColor: 'var(--color-success)',
      },
    ];
  }
});

const bulkConfirmMessage = computed(() => {
  if (!pendingBulkAction.value) return '';

  const entity = selectedRows.value.length === 1
    ? t('payment.entitySingular')
    : t('payment.entityPlural');

  if (pendingBulkAction.value === 'delete') {
    return t('common.bulkDeleteConfirmMessage', {
      count: selectedRows.value.length,
      entity
    });
  }
  return '';
});

// Watchers
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

// Methods
const switchTab = async (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  selectedRows.value = [];
  if (tab === 'trashed') {
    try {
      await paymentsStore.fetchTrashedPayments();
    } catch (error) {
      console.error("❌ Failed to load trashed payments:", error);
    }
  } else {
    try {
      await paymentsStore.fetchPayments();
    } catch (error) {
      console.error("❌ Failed to load payments:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === 'trashed') {
      await paymentsStore.fetchTrashedPayments();
    } else {
      await paymentsStore.fetchPayments();
    }
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

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  paymentToDelete.value = null;
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

const handleRestorePayment = async (payment) => {
  try {
    await paymentsStore.restorePayment(payment.id);
    console.log("✅ Payment restored successfully!");
    await paymentsStore.fetchTrashedPayments();
  } catch (error) {
    console.error("❌ Failed to restore payment:", error);
  }
};

const handleDeletePayment = (payment) => {
  paymentToDelete.value = payment;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  try {
    if (paymentToDelete.value) {
      await paymentsStore.deletePayment(paymentToDelete.value.id);
      console.log("✅ Payment deleted successfully!");
      paymentToDelete.value = null;
    }
  } catch (error) {
    console.error("❌ Failed to delete payment:", error);
  }
};

const handleBulkAction = ({ actionId }) => {
  pendingBulkAction.value = actionId;
  if (actionId === 'delete') {
    isBulkConfirmOpen.value = true;
  } else {
    executeBulkAction();
  }
};

const executeBulkAction = async () => {
  bulkActionLoading.value = true;
  try {
    if (pendingBulkAction.value === 'delete') {
      await paymentsStore.bulkDeletePayments(selectedRows.value);
      console.log(`✅ ${selectedRows.value.length} payments deleted successfully!`);
    } else if (pendingBulkAction.value === 'restore') {
      await paymentsStore.bulkRestorePayments(selectedRows.value);
      console.log(`✅ ${selectedRows.value.length} payments restored successfully!`);
      await paymentsStore.fetchTrashedPayments();
    }
    selectedRows.value = [];
  } catch (error) {
    console.error(`❌ Failed to execute bulk ${pendingBulkAction.value}:`, error);
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
</script>

<style scoped>
.payment-page-container {
  max-width: 100%;
}
</style>