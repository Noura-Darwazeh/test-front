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
                :loading="exportingInvoiceId === row.id"
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
import html2pdf from "html2pdf.js"; // ✅ استيراد المكتبة

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
const exportingInvoiceId = ref(null); // ✅ لتتبع الفاتورة اللي قيد التصدير

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

// ✅ ====== دالة تصدير PDF الجديدة باستخدام html2pdf ======
const exportInvoicePDF = async (invoice) => {
  exportingInvoiceId.value = invoice.id; // ✅ لتفعيل حالة التحميل

  try {
    const direction = isRTL.value ? 'rtl' : 'ltr';
    const textAlign = isRTL.value ? 'right' : 'left';
    
    // ✅ تنسيق التواريخ
    const formatDate = (dateString) => {
      if (!dateString || dateString === 'null' || dateString === null) return 'N/A';
      return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US');
    };

    // ✅ تنسيق الحالة
    const formatStatus = (status) => {
      return t(`invoiceStatus.${status}`);
    };

    // ✅ إنشاء HTML للفاتورة
    const element = document.createElement('div');
    element.innerHTML = `
      <div dir="${direction}" style="
        font-family: 'Arial', 'Tahoma', sans-serif;
        padding: 30px;
        max-width: 800px;
        margin: 0 auto;
        color: #333;
        line-height: 1.6;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4A90E2; padding-bottom: 20px;">
          <h1 style="
            color: #2C3E50;
            font-size: 32px;
            margin: 0 0 10px 0;
            font-weight: bold;
          ">${t('invoice.title')}</h1>
          <p style="
            color: #7F8C8D;
            font-size: 14px;
            margin: 5px 0;
          ">${t('invoice.invoiceCode')}: <strong>${invoice.invoice_code}</strong></p>
        </div>

        <!-- Company Information -->
        <div style="
          background: #F8F9FA;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        ">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #E9ECEF;
                font-weight: bold;
                color: #495057;
                width: 40%;
              ">${t('invoice.deliveryCompany')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #E9ECEF;
                text-align: ${textAlign};
              ">${invoice.delivery_company_name}</td>
            </tr>
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #E9ECEF;
                font-weight: bold;
                color: #495057;
              ">${t('invoice.clientCompany')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #E9ECEF;
                text-align: ${textAlign};
              ">${invoice.client_company_name}</td>
            </tr>
          </table>
        </div>

        <!-- Financial Information -->
        <div style="
          background: #E8F4F8;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        ">
          <h3 style="
            color: #2C3E50;
            font-size: 18px;
            margin: 0 0 15px 0;
            border-bottom: 2px solid #4A90E2;
            padding-bottom: 10px;
          ">${t('invoice.financialDetails') || 'Financial Details'}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #D1E7F0;
                font-weight: bold;
                color: #495057;
                width: 40%;
              ">${t('invoice.collectionAmount')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #D1E7F0;
                text-align: ${textAlign};
                color: #27AE60;
                font-weight: bold;
              ">${invoice.collection_amount}</td>
            </tr>
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #D1E7F0;
                font-weight: bold;
                color: #495057;
              ">${t('invoice.dueAmount')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #D1E7F0;
                text-align: ${textAlign};
                color: #E74C3C;
                font-weight: bold;
              ">${invoice.due_amount}</td>
            </tr>
          </table>
        </div>

        <!-- Period & Status -->
        <div style="
          background: #FFF9E6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        ">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                font-weight: bold;
                color: #495057;
                width: 40%;
              ">${t('invoice.periodStart')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                text-align: ${textAlign};
              ">${formatDate(invoice.period_start)}</td>
            </tr>
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                font-weight: bold;
                color: #495057;
              ">${t('invoice.periodEnd')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                text-align: ${textAlign};
              ">${formatDate(invoice.period_end)}</td>
            </tr>
            <tr>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                font-weight: bold;
                color: #495057;
              ">${t('invoice.status')}</td>
              <td style="
                padding: 10px;
                border-bottom: 1px solid #FFE5A3;
                text-align: ${textAlign};
              ">
                <span style="
                  background: ${invoice.status === 'completed' ? '#27AE60' : '#F39C12'};
                  color: white;
                  padding: 5px 15px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: bold;
                ">${formatStatus(invoice.status)}</span>
              </td>
            </tr>
            <tr>
              <td style="
                padding: 10px;
                font-weight: bold;
                color: #495057;
              ">${t('invoice.createdAt')}</td>
              <td style="
                padding: 10px;
                text-align: ${textAlign};
                color: #7F8C8D;
                font-size: 13px;
              ">${formatDate(invoice.created_at)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E9ECEF;
          text-align: center;
          color: #95A5A6;
          font-size: 12px;
        ">
          <p style="margin: 5px 0;">${t('invoice.generatedOn') || 'Generated on'}: ${new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')}</p>
          <p style="margin: 5px 0;">${t('invoice.companyName') || 'Your Company Name'}</p>
        </div>
      </div>
    `;

    // ✅ إعدادات التصدير
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Invoice_${invoice.invoice_code}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // ✅ تحويل وتنزيل PDF
    await html2pdf().set(options).from(element).save();
    
    console.log(`✅ PDF exported successfully: Invoice_${invoice.invoice_code}`);
    
  } catch (error) {
    console.error("❌ Error exporting PDF:", error);
    alert(t('invoice.exportError') || "Failed to export PDF. Please try again.");
  } finally {
    exportingInvoiceId.value = null; // ✅ إيقاف حالة التحميل
  }
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