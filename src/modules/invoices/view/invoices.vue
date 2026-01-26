<template>
  <div class="invoices-page-container bg-light">
    <InvoiceHeader v-model="searchText" :searchPlaceholder="$t('invoice.searchPlaceholder')" :data="invoices"
      groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('invoice.filterByStatus')"
      translationKey="invoiceStatus" :columns="invoiceColumns" v-model:visibleColumns="visibleColumns"
      @refresh-click="handleRefresh" @trashed-click="openTrashedModal" :showAddButton="false" />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Bulk Actions Bar -->
        <BulkActionsBar :selectedCount="selectedRows.length" entityName="invoice" :actions="bulkActions"
          :loading="bulkActionLoading" @action="handleBulkAction" />

        <!-- Loading State -->
        <div v-if="invoicesStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('common.loading') }}</span>
          </div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="invoicesStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ invoicesStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedData" :actionsLabel="$t('invoice.actions')"
            v-model="selectedRows">
            <template #actions="{ row }">
              <ActionsDropdown :row="row" :detailsLabel="$t('invoice.details')" :showEdit="false" :showDelete="false"
                @details="openDetailsModal" />
            </template>
          </DataTable>

          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination :totalItems="currentFilteredData.length" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
              @update:currentPage="(page) => (currentPage = page)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('invoice.details')" :data="selectedInvoice"
      :fields="detailsFields" @close="closeDetailsModal" />

    <!-- Trashed Items Modal -->
    <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('invoice.trashedInvoices')"
      :emptyMessage="$t('invoice.noTrashedInvoices')" :columns="trashedColumns"
      :trashedItems="invoicesStore.trashedInvoices" :showDeleteButton="true" entityName="invoice"
      :bulkActions="trashedBulkActions" :bulkLoading="bulkActionLoading" @close="closeTrashedModal"
      @restore="handleRestore" @delete="handlePermanentDelete" @bulk-action="handleTrashedBulkAction" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "@/components/shared/DataTable.vue";
import Pagination from "@/components/shared/Pagination.vue";
import ActionsDropdown from "@/components/shared/Actions.vue";
import DetailsModal from "@/components/shared/DetailsModal.vue";
import BulkActionsBar from "@/components/shared/BulkActionsBar.vue";
import TrashedItemsModal from "@/components/shared/TrashedItemsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useInvoicesManagementStore } from "../store/invoicesManagement.js";
import InvoiceHeader from "../components/InvoiceHeader.vue";
import html2pdf from "html2pdf.js";
import apiServices from "@/services/apiServices.js";
import api from "@/services/api.js";

const { t, locale } = useI18n();
const invoicesStore = useInvoicesManagementStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.100.35";

// State
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const isDetailsModalOpen = ref(false);
const selectedInvoice = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isTrashedModalOpen = ref(false);
const exportingInvoiceId = ref(null);

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

const paginatedData = computed(() => {
  return paginateData(
    currentFilteredData.value,
    currentPage.value,
    itemsPerPage.value
  );
});

const bulkActions = computed(() => {
  const actions = [];

  // Export action - only for single selection
  if (selectedRows.value.length === 1) {
    actions.push({
      id: 'export',
      label: t('invoice.exportPDF'),
      bgColor: 'var(--color-success)',
    });
  }

  // Mark as Paid action - for multiple selections
  if (selectedRows.value.length > 0) {
    actions.push({
      id: 'markAsPaid',
      label: t('invoice.markAsPaid'),
      bgColor: 'var(--primary-color)',
    });
  }

  return actions;
});

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

// Watchers
watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

// Methods
const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    await invoicesStore.fetchInvoices();
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

const handleRestore = async (invoice) => {
  try {
    await invoicesStore.restoreInvoice(invoice.id);
    console.log("✅ Invoice restored successfully!");
    await invoicesStore.fetchTrashedInvoices();
    await invoicesStore.fetchInvoices();
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

const handleBulkAction = ({ actionId }) => {
  if (actionId === 'export') {
    exportSelectedInvoice();
  } else if (actionId === 'markAsPaid') {
    markInvoicesAsPaid();
  }
};

const markInvoicesAsPaid = async () => {
  if (selectedRows.value.length === 0) {
    alert(t('invoice.selectInvoices') || 'Please select at least one invoice');
    return;
  }

  if (!confirm(t('invoice.markAsPaidConfirm', { count: selectedRows.value.length }) ||
    `Are you sure you want to mark ${selectedRows.value.length} invoice(s) as paid?`)) {
    return;
  }

  bulkActionLoading.value = true;

  try {
    const response = await api.patch('/invoices', {
      status: 'completed',
      invoice_ids: selectedRows.value
    });

    if (response.data?.success) {
      console.log("✅ Invoices marked as paid successfully!");
      await invoicesStore.fetchInvoices();
      selectedRows.value = [];
      alert(response.data.message || t('invoice.markedAsPaidSuccess'));
    }
  } catch (error) {
    console.error("❌ Failed to mark invoices as paid:", error);
    alert(error.message || t('invoice.markedAsPaidError') ||
      "Failed to mark invoices as paid. Please try again.");
  } finally {
    bulkActionLoading.value = false;
  }
};

const exportSelectedInvoice = async () => {
  if (selectedRows.value.length !== 1) {
    alert(t('invoice.selectOneInvoice') || 'Please select exactly one invoice');
    return;
  }

  const selectedInvoiceId = selectedRows.value[0];
  const invoice = invoices.value.find(inv => inv.id === selectedInvoiceId);

  if (invoice) {
    await exportInvoicePDF(invoice);
  }
};

const handleTrashedBulkAction = async ({ actionId, selectedIds }) => {
  bulkActionLoading.value = true;
  try {
    if (actionId === 'restore') {
      await invoicesStore.bulkRestoreInvoices(selectedIds);
      console.log("✅ Bulk restore successful!");
    } else if (actionId === 'forceDelete') {
      if (!confirm(t('common.bulkPermanentDeleteConfirm', {
        count: selectedIds.length,
        entity: t('invoice.entityPlural')
      }))) {
        bulkActionLoading.value = false;
        return;
      }
      await invoicesStore.bulkDeleteInvoices(selectedIds, true);
      console.log("✅ Bulk permanent delete successful!");
    }

    await invoicesStore.fetchTrashedInvoices();
    await invoicesStore.fetchInvoices();
  } catch (error) {
    console.error("❌ Bulk action failed:", error);
    alert(error.message || "Failed to process invoices. Please try again.");
  } finally {
    bulkActionLoading.value = false;
  }
};

// ✅ دالة تحميل الصورة وتحويلها لـ Base64
const loadImageAsBase64 = async (imagePath) => {
  if (!imagePath || imagePath.trim() === '') {
    console.log("⚠️ Empty image path provided");
    return null;
  }

  try {
    const imageUrl = imagePath.startsWith('http')
      ? imagePath
      : `${API_BASE_URL}${imagePath}`;

    console.log("📥 Attempting to fetch image:", imageUrl);

    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors',
      headers: { 'Accept': 'image/*' }
    });

    if (!response.ok) {
      console.warn(`⚠️ Image fetch failed: HTTP ${response.status} ${response.statusText}`);
      console.warn(`📍 Failed URL: ${imageUrl}`);
      return null;
    }

    const blob = await response.blob();
    console.log(`✅ Image blob loaded: ${blob.size} bytes, type: ${blob.type}`);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("✅ Image converted to Base64 successfully");
        resolve(reader.result);
      };
      reader.onerror = () => {
        console.error("❌ FileReader failed to convert blob to Base64");
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error("❌ Image loading error:", error.message);
    console.error("📍 Path was:", imagePath);
    return null;
  }
};

// ✅ دالة تصدير الفاتورة كـ PDF
const exportInvoicePDF = async (invoice) => {
  exportingInvoiceId.value = invoice.id;

  try {
    console.log("📥 Fetching invoice data...");
    const response = await apiServices.getEntityById('invoices', invoice.id);

    // ✅ اطبعي الـ response كامل
    console.log("🔍 RAW Response:", response);
    console.log("🔍 Response.data:", response.data);
    console.log("🔍 Response.data.data:", response.data.data);
    console.log("🔍 Delivery company from data.data:", response.data.data?.delivery_company);

    const fullInvoice = response.data.data;

    console.log("📦 Full invoice data:", fullInvoice);
    console.log("🏢 Delivery company:", fullInvoice.delivery_company);
    console.log("🖼️ Logo path:", fullInvoice.delivery_company?.logo);

    // ✅ جربي تطبع كل الـ keys
    if (fullInvoice.delivery_company) {
      console.log("🔑 Delivery company keys:", Object.keys(fullInvoice.delivery_company));
    }

    const companyLogo = fullInvoice.delivery_company?.logo;
    const companyName = fullInvoice.delivery_company?.name || 'INVOICE';

    console.log("🎯 Final logo value:", companyLogo);
    console.log("🎯 Logo type:", typeof companyLogo);
    console.log("🎯 Is logo null?", companyLogo === null);
    console.log("🎯 Is logo undefined?", companyLogo === undefined);

    let companyLogoBase64 = null;

    if (companyLogo && companyLogo.trim() !== '') {
      console.log("🔄 Loading logo from:", companyLogo);
      companyLogoBase64 = await loadImageAsBase64(companyLogo);

      if (companyLogoBase64) {
        console.log("✅ Logo loaded successfully");
      } else {
        console.log("⚠️ Logo loading failed, will use company name");
      }
    } else {
      console.log("ℹ️ No logo path provided, using company name instead");
    }
    const direction = isRTL.value ? 'rtl' : 'ltr';
    const textAlign = isRTL.value ? 'right' : 'left';
    const borderSide = isRTL.value ? 'border-right' : 'border-left';

    const formatDate = (dateString) => {
      if (!dateString || dateString === 'null' || dateString === null) return 'N/A';
      return new Date(dateString).toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let collectionsRows = '';
    if (fullInvoice.collections && fullInvoice.collections.length > 0) {
      fullInvoice.collections.forEach((collection, index) => {
        const orderPrice = parseFloat(collection.total_price) || 0;
        const deliveryPrice = parseFloat(collection.delivery_price) || 0;

        collectionsRows += `
          <tr style="border-bottom: 1px solid #DEE2E6;">
            <td style="padding: 14px; text-align: center; background: #F8F9FA; font-weight: 600; color: #495057;">${index + 1}</td>
            <td style="padding: 14px; text-align: ${textAlign}; font-weight: 500; color: #2C3E50;">${collection.order_code || 'N/A'}</td>
            <td style="padding: 14px; text-align: ${textAlign}; font-weight: 600; color: #27AE60;">${collection.currency || '₪'} ${orderPrice.toFixed(2)}</td>
            <td style="padding: 14px; text-align: ${textAlign}; font-weight: 600; color: #E74C3C;">${collection.currency || '₪'} ${deliveryPrice.toFixed(2)}</td>
          </tr>
        `;
      });
    } else {
      collectionsRows = `<tr><td colspan="4" style="padding: 30px; text-align: center; color: #95A5A6; font-style: italic;">${t('invoice.noCollections') || 'No collections available'}</td></tr>`;
    }

    const element = document.createElement('div');
    element.innerHTML = `
      <div dir="${direction}" style="font-family: 'Arial', 'Tahoma', sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #2C3E50; background: white;">
        <div style="margin-bottom: 40px; border-bottom: 4px solid #4A90E2; padding-bottom: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${companyLogoBase64
        ? `<img src="${companyLogoBase64}" alt="Company Logo" style="max-width: 180px; max-height: 100px; object-fit: contain;" />`
        : `<h1 style="color: #4A90E2; font-size: 42px; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 3px;">${companyName}</h1>`
      }
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px;">
            <div style="text-align: ${textAlign};">
              <h2 style="color: #2C3E50; font-size: 24px; margin: 0 0 10px 0; font-weight: bold; text-transform: uppercase;">${t('invoice.title') || 'INVOICE'}</h2>
              <p style="margin: 5px 0; font-size: 15px; color: #495057;"><strong style="color: #2C3E50;">${t('invoice.invoiceCode') || 'Invoice Code'}:</strong> <span style="color: #E74C3C; font-weight: bold; font-size: 16px;">${fullInvoice.invoice_code}</span></p>
              <p style="margin: 5px 0; font-size: 14px; color: #6C757D;"><strong>${t('invoice.invoiceDate') || 'Date'}:</strong> ${formatDate(fullInvoice.created_at)}</p>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="padding: 16px; text-align: center; font-size: 14px; text-transform: uppercase; width: 10%;">#</th>
              <th style="padding: 16px; text-align: ${textAlign}; font-size: 14px; text-transform: uppercase; width: 30%;">${t('invoice.orderCode') || 'Order Code'}</th>
              <th style="padding: 16px; text-align: ${textAlign}; font-size: 14px; text-transform: uppercase; width: 30%;">${t('invoice.totalPrice') || 'Total Price'}</th>
              <th style="padding: 16px; text-align: ${textAlign}; font-size: 14px; text-transform: uppercase; width: 30%;">${t('invoice.deliveryPrice') || 'Delivery Price'}</th>
            </tr>
          </thead>
          <tbody>${collectionsRows}</tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); color: white;">
              <th style="padding: 16px; text-align: ${textAlign}; font-size: 16px; text-transform: uppercase;" colspan="2">${t('invoice.details') || 'Invoice Details'}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #DEE2E6; background: #F8F9FA;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; width: 35%; ${borderSide}: 4px solid #4A90E2;">${t('invoice.deliveryCompany') || 'Delivery Company'}</td><td style="padding: 14px 20px; color: #2C3E50; font-weight: 500;">${fullInvoice.delivery_company?.name || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid #DEE2E6;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; ${borderSide}: 4px solid #27AE60;">${t('invoice.clientCompany') || 'Client Company'}</td><td style="padding: 14px 20px; color: #2C3E50; font-weight: 500;">${fullInvoice.client_company?.name || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid #DEE2E6; background: #F8F9FA;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; ${borderSide}: 4px solid #F39C12;">${t('invoice.periodStart') || 'Period Start'}</td><td style="padding: 14px 20px; color: #2C3E50; font-weight: 500;">${formatDate(fullInvoice.period_start)}</td></tr>
            <tr style="border-bottom: 1px solid #DEE2E6;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; ${borderSide}: 4px solid #F39C12;">${t('invoice.periodEnd') || 'Period End'}</td><td style="padding: 14px 20px; color: #2C3E50; font-weight: 500;">${formatDate(fullInvoice.period_end)}</td></tr>
            <tr style="border-bottom: 1px solid #DEE2E6; background: #F8F9FA;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; ${borderSide}: 4px solid #27AE60;">${t('invoice.collectionAmount') || 'Collection Amount'}</td><td style="padding: 14px 20px; color: #27AE60; font-weight: bold; font-size: 16px;">${fullInvoice.collection_amount}</td></tr>
            <tr style="border-bottom: 1px solid #DEE2E6;"><td style="padding: 14px 20px; font-weight: 600; color: #495057; ${borderSide}: 4px solid #E74C3C;">${t('invoice.dueAmount') || 'Due Amount'}</td><td style="padding: 14px 20px; color: #E74C3C; font-weight: bold; font-size: 16px;">${fullInvoice.due_amount}</td></tr>
          </tbody>
        </table>

        <div style="margin-top: 50px; padding-top: 20px; border-top: 3px double #4A90E2; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #6C757D; font-size: 13px;"><strong style="color: #495057;">${t('invoice.generatedOn') || 'Generated on'}:</strong> ${new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin: 10px 0 0 0; font-weight: bold; color: #4A90E2; font-size: 15px;">${t('invoice.thankYou') || 'Thank you for your business!'}</p>
          <p style="margin: 5px 0 0 0; color: #95A5A6; font-size: 12px; font-style: italic;">${t('invoice.poweredBy') || 'Powered by'} ${companyName}</p>
        </div>
      </div>
    `;

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Invoice_${fullInvoice.invoice_code}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    console.log("📄 Generating PDF...");
    await html2pdf().set(options).from(element).save();
    console.log(`✅ PDF exported successfully`);

  } catch (error) {
    console.error("❌ Error exporting PDF:", error);
    alert(t('invoice.exportError') || "Failed to export PDF");
  } finally {
    exportingInvoiceId.value = null;
  }
};
</script>

<style scoped>
.invoices-page-container {
  max-width: 100%;
}
</style>