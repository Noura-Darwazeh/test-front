import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useInvoicesManagementStore = defineStore("invoicesManagement", () => {
    // State
    const invoices = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Pagination state
    const invoicesPagination = ref({
        currentPage: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
    });

    const normalizeInvoice = (invoice) => {
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

            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch invoices";
            console.error("❌ Error fetching invoices:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        // State
        invoices,
        loading,
        error,
        invoicesPagination,
        // Getters
        completedInvoices,
        pendingInvoices,
        // Actions
        fetchInvoices,
    };
});
