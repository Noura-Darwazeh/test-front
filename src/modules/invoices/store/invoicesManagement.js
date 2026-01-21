import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useInvoicesManagementStore = defineStore("invoicesManagement", () => {
    // State
    const invoices = ref([]);
    const trashedInvoices = ref([]);
    const loading = ref(false);
    const trashedLoading = ref(false);
    const error = ref(null);

    // Pagination state
    const invoicesPagination = ref({
        currentPage: 1,
        perPage: 5,
        total: 0,
        lastPage: 1,
    });

    const normalizeInvoice = (invoice) => {
        console.log("🔍 Raw invoice:", JSON.stringify(invoice, null, 2));

        const deliveryCompany = invoice.delivery_company;
        const clientCompany = invoice.client_company;

        const normalized = {
            id: invoice.id,
            invoice_code: invoice.invoice_code || "N/A",
            status: invoice.status || "N/A",
            collection_amount: invoice.collection_amount || "0.00",
            due_amount: invoice.due_amount || "0.00",
            period_start: invoice.period_start || null,
            period_end: invoice.period_end || null,

            delivery_company_id: deliveryCompany ? deliveryCompany.id : null,
            delivery_company_name: deliveryCompany ? deliveryCompany.name : "N/A",

            client_company_id: clientCompany ? clientCompany.id : null,
            client_company_name: clientCompany ? clientCompany.name : "N/A",

            created_at: invoice.created_at,
            updated_at: invoice.updated_at,
        };

        console.log("✅ Normalized invoice:", JSON.stringify(normalized, null, 2));
        return normalized;
    };

    // Getters
    const completedInvoices = computed(() =>
        invoices.value.filter((invoice) => invoice.status === "completed")
    );

    const pendingInvoices = computed(() =>
        invoices.value.filter((invoice) => invoice.status === "pending")
    );

    // Actions
    const fetchInvoices = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getInvoices({ page, perPage: invoicesPagination.value.perPage });
            
            invoices.value = response.data.data.map(normalizeInvoice);
            
            // Update pagination
            if (response.data.meta) {
                invoicesPagination.value = {
                    currentPage: response.data.meta.current_page,
                    perPage: response.data.meta.per_page,
                    total: response.data.meta.total,
                    lastPage: response.data.meta.last_page,
                };
            }

            console.log("✅ Normalized Invoices:", invoices.value);
            console.log("📄 Pagination:", invoicesPagination.value);
            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch invoices";
            console.error("❌ Error fetching invoices:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchTrashedInvoices = async () => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getTrashedInvoices();
            trashedInvoices.value = response.data.data.map(normalizeInvoice);
            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch trashed invoices";
            console.error("❌ Error fetching trashed invoices:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    const deleteInvoice = async (invoiceId, force = false) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.deleteEntity('invoices', invoiceId, force);
            const index = invoices.value.findIndex((i) => i.id === invoiceId);
            if (index > -1) {
                invoices.value.splice(index, 1);
            }
        } catch (err) {
            error.value = err.message || "Failed to delete invoice";
            console.error("❌ Error deleting invoice:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const restoreInvoice = async (invoiceId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.restoreEntity('invoices', invoiceId);
            const index = trashedInvoices.value.findIndex((i) => i.id === invoiceId);
            if (index > -1) {
                trashedInvoices.value.splice(index, 1);
            }
            if (response.data?.data) {
                invoices.value.push(normalizeInvoice(response.data.data));
            }
        } catch (err) {
            error.value = err.message || "Failed to restore invoice";
            console.error("❌ Error restoring invoice:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkDeleteInvoices = async (invoiceIds, force = false) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.bulkDeleteEntities('invoice', 'invoices', invoiceIds, force);
            invoices.value = invoices.value.filter((i) => !invoiceIds.includes(i.id));
        } catch (err) {
            error.value = err.message || "Failed to bulk delete invoices";
            console.error("❌ Error bulk deleting invoices:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkRestoreInvoices = async (invoiceIds) => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.bulkRestoreEntities('invoice', 'invoices', invoiceIds);
            trashedInvoices.value = trashedInvoices.value.filter((i) => !invoiceIds.includes(i.id));
            if (response.data?.data) {
                invoices.value.push(...response.data.data.map(normalizeInvoice));
            }
        } catch (err) {
            error.value = err.message || "Failed to bulk restore invoices";
            console.error("❌ Error bulk restoring invoices:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    return {
        // State
        invoices,
        trashedInvoices,
        loading,
        trashedLoading,
        error,
        invoicesPagination,
        // Getters
        completedInvoices,
        pendingInvoices,
        // Actions
        fetchInvoices,
        fetchTrashedInvoices,
        deleteInvoice,
        restoreInvoice,
        bulkDeleteInvoices,
        bulkRestoreInvoices,
    };
});