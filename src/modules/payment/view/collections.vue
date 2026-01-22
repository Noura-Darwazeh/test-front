<template>
  <div class="collections-page-container bg-light">
    <TableHeader 
      v-model="searchText" 
      :searchPlaceholder="$t('collection.searchPlaceholder')" 
      :data="collections"
      groupKey="status" 
      v-model:groupModelValue="selectedGroups" 
      :groupLabel="$t('collection.filterByStatus')"
      translationKey="collectionStatus" 
      :columns="collectionColumns" 
      v-model:visibleColumns="visibleColumns"
      :showAddButton="false" 
      @refresh-click="handleRefresh" 
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Bulk Actions Bar -->
        <BulkActionsBar 
          :selectedCount="selectedRows.length" 
          entityName="collection" 
          :actions="bulkActions"
          :loading="bulkActionLoading" 
          @action="handleBulkAction" 
        />

        <!-- Loading State -->
        <div v-if="collectionsStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="collectionsStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ collectionsStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable 
            :columns="filteredColumns" 
            :data="paginatedData" 
            :actionsLabel="$t('collection.actions')"
            v-model="selectedRows" 
            :disableRowWhen="hasInvoiceId"
          >
            <template #actions="{ row }">
              <ActionsDropdown 
                :row="row" 
                :editLabel="$t('collection.edit')" 
                :detailsLabel="$t('collection.details')"
                :showDelete="false" 
                @edit="openEditModal" 
                @details="openDetailsModal" 
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

    <FormModal 
      :isOpen="isModalOpen" 
      :title="$t('collection.edit')" 
      :fields="collectionFields" 
      :showImageUpload="false"
      @close="closeModal" 
      @submit="handleSubmitCollection" 
    />

    <!-- Details Modal -->
    <DetailsModal 
      :isOpen="isDetailsModalOpen" 
      :title="$t('collection.details')" 
      :data="selectedCollection"
      :fields="detailsFields" 
      @close="closeDetailsModal" 
    />

    <!-- Payment Method Modal -->
    <PaymentMethodModal 
      :isOpen="isPaymentMethodModalOpen" 
      :selectedCount="selectedRows.length" 
      :drivers="drivers"
      :loading="paymentMethodLoading" 
      @close="closePaymentMethodModal" 
      @submit="handlePaymentMethodSubmit" 
    />

    <!-- ✅ Confirmation Modal for Invoice Creation -->
    <ConfirmationModal
      :isOpen="isInvoiceConfirmOpen"
      :title="t('collection.createInvoiceTitle')"
      :message="t('collection.createInvoiceConfirm', { count: selectedRows.length })"
      :confirmText="t('common.create')"
      :cancelText="t('common.cancel')"
      confirmColor="var(--primary-color)"
      @confirm="confirmCreateInvoice"
      @close="closeInvoiceConfirm"
    />
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
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue"; // ✅ أضفنا هاد
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useCollectionsManagementStore } from "../store/collectionsManagement.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const collectionsStore = useCollectionsManagementStore();

// State
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const selectedCollection = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isPaymentMethodModalOpen = ref(false);
const paymentMethodLoading = ref(false);
const isInvoiceConfirmOpen = ref(false); // ✅ للـ confirmation modal

// Data
const drivers = ref([]);

// Status options
const statuses = ref([
  { value: "pending", label: t("collectionStatus.pending") },
  { value: "completed", label: t("collectionStatus.completed") },
  { value: "failed", label: t("collectionStatus.failed") },
]);

// Fetch drivers
const fetchDrivers = async () => {
  try {
    const driversResponse = await apiServices.getDrivers();
    drivers.value = driversResponse.data.data.map(driver => ({
      value: String(driver.id),
      label: driver.name || driver.user?.name || `Driver #${driver.id}`
    }));

    console.log('✅ Drivers loaded:', drivers.value);
  } catch (error) {
    console.error("❌ Failed to load drivers:", error);
  }
};

// Mount
onMounted(async () => {
  try {
    await Promise.all([
      collectionsStore.fetchCollections(),
      fetchDrivers()
    ]);
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// Computed
const collections = computed(() => collectionsStore.collections);

const collectionColumns = computed(() => [
  { key: "id", label: t("collection.id"), sortable: true },
  { key: "invoice_code", label: t("collection.invoiceCode"), sortable: false },
  { key: "driver_name", label: t("collection.driverName"), sortable: false },
  { key: "note", label: t("collection.note"), sortable: false },
  {
    key: "status",
    label: t("collection.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "collection" }
  },
]);

const visibleColumns = ref(collectionColumns.value.map(col => col.key));

const collectionFields = computed(() => [
  {
    name: "status",
    label: t("collection.form.status"),
    type: "select",
    required: true,
    options: statuses.value,
    colClass: "col-md-12",
    defaultValue: selectedCollection.value.status || 'pending',
  },
  {
    name: "note",
    label: t("collection.form.note"),
    type: "text",
    required: false,
    placeholder: t("collection.form.notePlaceholder"),
    colClass: "col-md-12",
    defaultValue: selectedCollection.value.note || '',
  },
]);

const detailsFields = computed(() => [
  { key: 'id', label: t('collection.id'), colClass: 'col-md-6' },
  { key: 'invoice_code', label: t('collection.invoiceCode'), colClass: 'col-md-6' },
  { key: 'driver_name', label: t('collection.driverName'), colClass: 'col-md-6' },
  { key: 'note', label: t('collection.note'), colClass: 'col-md-12' },
  { key: 'status', label: t('collection.status'), translationKey: 'collectionStatus', colClass: 'col-md-6' },
  {
    key: 'created_at',
    label: t('collection.createdAt'),
    colClass: 'col-md-6',
    translator: (value) => {
      if (!value || value === 'null' || value === null) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
  {
    key: 'updated_at',
    label: t('collection.updatedAt'),
    colClass: 'col-md-6',
    translator: (value) => {
      if (!value || value === 'null' || value === null) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
]);

const filteredColumns = computed(() => {
  return collectionColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

const currentFilteredData = computed(() => {
  let result = collections.value;
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

// ✅ نغيّر الـ bulk actions حسب إذا في invoice ولا لا
const bulkActions = computed(() => {
  // ✅ نشوف إذا كل الـ selected rows عندهم invoice_id
  const allHaveInvoice = selectedRows.value.length > 0 && selectedRows.value.every(id => {
    const collection = collections.value.find(c => c.id === id);
    return collection && collection.invoice_id;
  });

  if (allHaveInvoice) {
    // ✅ إذا كلهم عندهم invoice، نعرض "Mark as Paid"
    return [
      {
        id: 'paid',
        label: t('collection.markAsPaid'),
        bgColor: 'var(--color-success)',
      },
    ];
  } else {
    // ✅ إذا ما عندهم invoice، نعرض "Make Invoice"
    return [
      {
        id: 'makeInvoice',
        label: t('collection.makeInvoice'),
        bgColor: 'var(--primary-color)',
      },
    ];
  }
});

// Watchers
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

// Methods
const hasInvoiceId = (row) => {
  return !!row.invoice_id;
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    await collectionsStore.fetchCollections();
  } catch (error) {
    console.error("❌ Failed to refresh collections:", error);
  }
};

const openEditModal = (collection) => {
  selectedCollection.value = { ...collection };
  isModalOpen.value = true;
};

const openDetailsModal = (collection) => {
  selectedCollection.value = { ...collection };
  isDetailsModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedCollection.value = {};
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedCollection.value = {};
};

const handleSubmitCollection = async (collectionData) => {
  try {
    const data = {
      collection_ids: [selectedCollection.value.id],
      status: collectionData.status,
    };

    if (collectionData.note && collectionData.note.trim() !== '') {
      data.note = collectionData.note;
    }

    console.log("📤 Sending update request:", data);

    const response = await apiServices.markCollectionsAsPaid(data);

    console.log("✅ Response:", response.data);

    await collectionsStore.fetchCollections();

    console.log("✅ Collection updated successfully!");
    closeModal();
  } catch (error) {
    console.error("❌ Failed to update collection:", error);
    alert(error.response?.data?.message || error.message || "Failed to update collection. Please try again.");
  }
};

// ✅ نعدّل handleBulkAction عشان يتعامل مع الحالتين
const handleBulkAction = ({ actionId }) => {
  if (actionId === 'paid') {
    // ✅ إذا الـ action هو "Mark as Paid"
    isPaymentMethodModalOpen.value = true;
  } else if (actionId === 'makeInvoice') {
    // ✅ إذا الـ action هو "Make Invoice"
    isInvoiceConfirmOpen.value = true;
  }
};

const closePaymentMethodModal = () => {
  isPaymentMethodModalOpen.value = false;
};

const handlePaymentMethodSubmit = async (paymentMethodData) => {
  paymentMethodLoading.value = true;
  try {
    const collectionData = {
      collection_ids: selectedRows.value,
      status: paymentMethodData.status || 'completed'
    };

    if (paymentMethodData.paid_by_driver_id) {
      collectionData.paid_by_driver_id = paymentMethodData.paid_by_driver_id;
      console.log('✅ Driver ID being sent:', collectionData.paid_by_driver_id);
    }

    console.log("📤 Sending collection data:", collectionData);

    await apiServices.markCollectionsAsPaid(collectionData);

    console.log("✅ Collections marked as paid successfully!");

    await collectionsStore.fetchCollections();

    selectedRows.value = [];
    closePaymentMethodModal();
  } catch (error) {
    console.error("❌ Failed to mark collections as paid:", error);
    alert(error.message || "Failed to process collection. Please try again.");
  } finally {
    paymentMethodLoading.value = false;
  }
};

// ✅ دوال جديدة للـ Invoice Creation
const closeInvoiceConfirm = () => {
  isInvoiceConfirmOpen.value = false;
};

const confirmCreateInvoice = async () => {
  bulkActionLoading.value = true;
  try {
    console.log("📤 Creating invoice for collections:", selectedRows.value);

    const response = await apiServices.createInvoiceFromCollections(selectedRows.value);

    console.log("✅ Invoice created successfully:", response.data);

    // ✅ نحدّث الـ collections
    await collectionsStore.fetchCollections();

    // ✅ ننظف الـ selection
    selectedRows.value = [];

    // ✅ نسكّر الـ modal
    closeInvoiceConfirm();

    // ✅ نعرض رسالة نجاح
    alert(t('collection.invoiceCreatedSuccess'));
  } catch (error) {
    console.error("❌ Failed to create invoice:", error);
    alert(error.response?.data?.message || error.message || "Failed to create invoice. Please try again.");
  } finally {
    bulkActionLoading.value = false;
  }
};
</script>

<style scoped>
.collections-page-container {
  max-width: 100%;
}
</style>