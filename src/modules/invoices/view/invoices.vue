<template>
  <div class="invoices-page-container bg-light">
    <InvoiceHeader 
      v-model="searchText" 
      :searchPlaceholder="$t('invoice.searchPlaceholder')" 
      :data="invoices"
      groupKey="status" 
      v-model:groupModelValue="selectedGroups" 
      :groupLabel="$t('invoice.filterByStatus')"
      translationKey="invoiceStatus" 
      :columns="invoiceColumns" 
      v-model:visibleColumns="visibleColumns"
      :showAddButton="false" 
      @refresh-click="handleRefresh" 
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <BulkActionsBar 
          :selectedCount="selectedRows.length" 
          entityName="invoice" 
          :actions="bulkActions"
          :loading="bulkActionLoading" 
          @action="handleBulkAction" 
        />

        <div v-if="invoicesStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <div v-else-if="invoicesStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ invoicesStore.error }}
        </div>

        <div v-else>
          <DataTable 
            :columns="filteredColumns" 
            :data="currentFilteredData" 
            :actionsLabel="$t('invoice.actions')"
            v-model="selectedRows"
          >
            <template #actions="{ row }">
              <ActionsDropdown 
                :row="row" 
                :detailsLabel="$t('invoice.details')"
                :deleteLabel="$t('invoice.delete')"
                :showEdit="false"
                @details="openDetailsModal" 
                @delete="handleDelete"
              />
              <!-- ✅ زر Export PDF -->
              <PrimaryButton 
                :text="$t('invoice.exportPDF')" 
                :iconBefore="exportIcon"
                bgColor="var(--color-success)"
                @click="exportInvoicePDF(row)"
              />
            </template>
          </DataTable>

          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination 
              :totalItems="invoicesStore.invoicesPagination.total" 
              :itemsPerPage="invoicesStore.invoicesPagination.perPage" 
              :currentPage="invoicesStore.invoicesPagination.currentPage"
              :totalPages="invoicesStore.invoicesPagination.lastPage"
              @update:currentPage="handlePageChange" 
            />
          </div>
        </div>
      </div>
    </div>

    <DetailsModal 
      :isOpen="isDetailsModalOpen" 
      :title="$t('invoice.details')" 
      :data="selectedInvoice"
      :fields="detailsFields" 
      @close="closeDetailsModal" 
    />

    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('invoice.trashedInvoices')"
      :emptyMessage="$t('invoice.noTrashedInvoices')"
      :columns="trashedColumns"
      :trashedItems="invoicesStore.trashedInvoices"
      :showDeleteButton="true"
      entityName="invoice"
      :bulkActions="trashedBulkActions"
      :bulkLoading="bulkActionLoading"
      @close="closeTrashedModal"
      @restore="handleRestore"
      @delete="handlePermanentDelete"
      @bulk-action="handleTrashedBulkAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "@/components/shared/DataTable.vue";
import Pagination from "@/components/shared/Pagination.vue";
import ActionsDropdown from "@/components/shared/Actions.vue";
import DetailsModal from "@/components/shared/DetailsModal.vue";
import BulkActionsBar from "@/components/shared/BulkActionsBar.vue";
import TrashedItemsModal from "@/components/shared/TrashedItemsModal.vue";
import PrimaryButton from "@/components/shared/PrimaryButton.vue";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useInvoicesManagementStore } from "../store/invoicesManagement.js";
import InvoiceHeader from "../components/InvoiceHeader.vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ الاسم الصحيح

const { t, locale } = useI18n();
const invoicesStore = useInvoicesManagementStore();

// State
const searchText = ref("");
const selectedGroups = ref([]);
const isDetailsModalOpen = ref(false);
const selectedInvoice = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isTrashedModalOpen = ref(false);

// Mount
onMounted(async () => {
  try {
    await invoicesStore.fetchInvoices();
  } catch (error) {
    console.error("❌ Failed to load invoices:", error);
  }
});

// Computed
const invoices = computed(() => invoicesStore.invoices);
const isRTL = computed(() => locale.value === "ar");

const invoiceColumns = computed(() => [
  { key: "id", label: t("invoice.id"), sortable: true },
  { key: "invoice_code", label: t("invoice.invoiceCode"), sortable: true },
  { key: "delivery_company_name", label: t("invoice.deliveryCompany"), sortable: false },
  { key: "client_company_name", label: t("invoice.clientCompany"), sortable: false },
  { key: "collection_amount", label: t("invoice.collectionAmount"), sortable: true },
  { key: "due_amount", label: t("invoice.dueAmount"), sortable: true },
  {
    key: "status",
    label: t("invoice.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "invoice" }
  },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("invoice.id") },
  { key: "invoice_code", label: t("invoice.invoiceCode") },
  { key: "delivery_company_name", label: t("invoice.deliveryCompany") },
  { key: "client_company_name", label: t("invoice.clientCompany") },
  {
    key: "status",
    label: t("invoice.status"),
    component: "StatusBadge",
    componentProps: { type: "invoice" }
  },
]);

const visibleColumns = ref(invoiceColumns.value.map(col => col.key));

const detailsFields = computed(() => [
  { key: 'id', label: t('invoice.id'), colClass: 'col-md-6' },
  { key: 'invoice_code', label: t('invoice.invoiceCode'), colClass: 'col-md-6' },
  { key: 'delivery_company_name', label: t('invoice.deliveryCompany'), colClass: 'col-md-6' },
  { key: 'client_company_name', label: t('invoice.clientCompany'), colClass: 'col-md-6' },
  { key: 'collection_amount', label: t('invoice.collectionAmount'), colClass: 'col-md-6' },
  { key: 'due_amount', label: t('invoice.dueAmount'), colClass: 'col-md-6' },
  { 
    key: 'period_start', 
    label: t('invoice.periodStart'), 
    colClass: 'col-md-6',
    translator: (value) => {
      if (!value || value === 'null' || value === null) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
  { 
    key: 'period_end', 
    label: t('invoice.periodEnd'), 
    colClass: 'col-md-6',
    translator: (value) => {
      if (!value || value === 'null' || value === null) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
  { key: 'status', label: t('invoice.status'), translationKey: 'invoiceStatus', colClass: 'col-md-6' },
  {
    key: 'created_at',
    label: t('invoice.createdAt'),
    colClass: 'col-md-6',
    translator: (value) => {
      if (!value || value === 'null' || value === null) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
]);

const filteredColumns = computed(() => {
  return invoiceColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

const currentFilteredData = computed(() => {
  let result = invoices.value;
  result = filterByGroups(result, selectedGroups.value, "status");
  result = filterData(result, searchText.value);
  return result;
});

const bulkActions = computed(() => [
  {
    id: 'delete',
    label: t('common.delete'),
    bgColor: 'var(--color-danger)',
  },
]);

const trashedBulkActions = computed(() => [
  {
    id: 'restore',
    label: t('common.restore'),
    bgColor: 'var(--color-success)',
  },
  {
    id: 'forceDelete',
    label: t('common.permanentDelete'),
    bgColor: 'var(--color-danger)',
  },
]);

// ✅ دالة تصدير PDF - صحيحة
const exportInvoicePDF = (invoice) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const isArabic = isRTL.value;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(t('invoice.title'), 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(t('invoice.invoiceCode') + ': ' + invoice.invoice_code, 105, 30, { align: 'center' });

  // Invoice Details
  const details = [
    [t('invoice.deliveryCompany'), invoice.delivery_company_name],
    [t('invoice.clientCompany'), invoice.client_company_name],
    [t('invoice.collectionAmount'), invoice.collection_amount],
    [t('invoice.dueAmount'), invoice.due_amount],
    [t('invoice.status'), t(`invoiceStatus.${invoice.status}`)],
    [t('invoice.periodStart'), invoice.period_start ? new Date(invoice.period_start).toLocaleDateString() : 'N/A'],
    [t('invoice.periodEnd'), invoice.period_end ? new Date(invoice.period_end).toLocaleDateString() : 'N/A'],
    [t('invoice.createdAt'), new Date(invoice.created_at).toLocaleString()],
  ];

  // ✅ استخدمي autoTable المستورد
  autoTable(doc, {
    startY: 40,
    head: [[t('invoice.field'), t('invoice.value')]],
    body: details,
    theme: 'grid',
    headStyles: { 
      fillColor: [66, 139, 202],
      textColor: 255,
      fontSize: 12,
      halign: isArabic ? 'right' : 'left'
    },
    bodyStyles: {
      fontSize: 10,
      halign: isArabic ? 'right' : 'left'
    },
    styles: {
      font: 'helvetica',
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    margin: { top: 40, right: 15, bottom: 20, left: 15 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      t('invoice.page') + ' ' + i + ' ' + t('invoice.of') + ' ' + pageCount,
      105,
      285,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`Invoice_${invoice.invoice_code}.pdf`);
};



 

// Methods
const handlePageChange = async (page) => {
  selectedRows.value = [];
  try {
    await invoicesStore.fetchInvoices(page);
  } catch (error) {
    console.error("❌ Failed to change page:", error);
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    await invoicesStore.fetchInvoices(invoicesStore.invoicesPagination.currentPage);
  } catch (error) {
    console.error("❌ Failed to refresh invoices:", error);
  }
};

const openDetailsModal = (invoice) => {
  selectedInvoice.value = { ...invoice };
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedInvoice.value = {};
};

const openTrashedModal = async () => {
  try {
    await invoicesStore.fetchTrashedInvoices();
    isTrashedModalOpen.value = true;
  } catch (error) {
    console.error("❌ Failed to fetch trashed invoices:", error);
  }
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
};

const handleDelete = async (invoice) => {
  if (!confirm(t('invoice.deleteConfirm'))) return;

  try {
    await invoicesStore.deleteInvoice(invoice.id, false);
    console.log("✅ Invoice deleted successfully!");
    await invoicesStore.fetchInvoices(invoicesStore.invoicesPagination.currentPage);
  } catch (error) {
    console.error("❌ Failed to delete invoice:", error);
    alert(error.message || "Failed to delete invoice. Please try again.");
  }
};

const handleRestore = async (invoice) => {
  try {
    await invoicesStore.restoreInvoice(invoice.id);
    console.log("✅ Invoice restored successfully!");
    await invoicesStore.fetchTrashedInvoices();
    await invoicesStore.fetchInvoices(invoicesStore.invoicesPagination.currentPage);
  } catch (error) {
    console.error("❌ Failed to restore invoice:", error);
    alert(error.message || "Failed to restore invoice. Please try again.");
  }
};

const handlePermanentDelete = async (invoice) => {
  if (!confirm(t('invoice.permanentDeleteConfirm'))) return;

  try {
    await invoicesStore.deleteInvoice(invoice.id, true);
    console.log("✅ Invoice permanently deleted!");
    await invoicesStore.fetchTrashedInvoices();
  } catch (error) {
    console.error("❌ Failed to permanently delete invoice:", error);
    alert(error.message || "Failed to delete invoice. Please try again.");
  }
};

const handleBulkAction = async ({ actionId }) => {
  if (actionId === 'delete') {
    if (!confirm(t('common.bulkDeleteConfirm', { count: selectedRows.value.length, entity: t('invoice.entityPlural') }))) return;

    bulkActionLoading.value = true;
    try {
      await invoicesStore.bulkDeleteInvoices(selectedRows.value, false);
      console.log("✅ Bulk delete successful!");
      selectedRows.value = [];
      await invoicesStore.fetchInvoices(invoicesStore.invoicesPagination.currentPage);
    } catch (error) {
      console.error("❌ Bulk delete failed:", error);
      alert(error.message || "Failed to delete invoices. Please try again.");
    } finally {
      bulkActionLoading.value = false;
    }
  }
};

const handleTrashedBulkAction = async ({ actionId, selectedIds }) => {
  bulkActionLoading.value = true;
  try {
    if (actionId === 'restore') {
      await invoicesStore.bulkRestoreInvoices(selectedIds);
      console.log("✅ Bulk restore successful!");
    } else if (actionId === 'forceDelete') {
      if (!confirm(t('common.bulkPermanentDeleteConfirm', { count: selectedIds.length, entity: t('invoice.entityPlural') }))) {
        bulkActionLoading.value = false;
        return;
      }
      await invoicesStore.bulkDeleteInvoices(selectedIds, true);
      console.log("✅ Bulk permanent delete successful!");
    }

    await invoicesStore.fetchTrashedInvoices();
    await invoicesStore.fetchInvoices(invoicesStore.invoicesPagination.currentPage);
  } catch (error) {
    console.error("❌ Bulk action failed:", error);
    alert(error.message || "Failed to process invoices. Please try again.");
  } finally {
    bulkActionLoading.value = false;
  }
};
</script>

<style scoped>
.invoices-page-container {
  max-width: 100%;
}
</style>