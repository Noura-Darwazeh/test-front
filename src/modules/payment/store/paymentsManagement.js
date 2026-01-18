import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const usePaymentsManagementStore = defineStore("paymentsManagement", () => {
    // State
    const payments = ref([]);
    const trashedPayments = ref([]);
    const loading = ref(false);
    const trashedLoading = ref(false);
    const error = ref(null);

   const normalizePayment = (payment) => {
    // ✅ طباعة دقيقة للـ objects
    console.log("🔍 Raw payment:", JSON.stringify(payment, null, 2));
    
    // ✅ استخراج البيانات مباشرة
    const clientCompany = payment["Clinet company"];
    const deliveryCompany = payment["Delivery company"];
    const driverReceived = payment["Driver received"];
    const driverPaid = payment["Driver paid"];
    const order = payment.Order || payment.order;
    
    // ✅ طباعة كل object لحاله
    console.log("🏢 Client Company:", JSON.stringify(clientCompany, null, 2));
    console.log("🚚 Delivery Company:", JSON.stringify(deliveryCompany, null, 2));
    console.log("👤 Driver Received:", JSON.stringify(driverReceived, null, 2));
    console.log("💰 Driver Paid:", JSON.stringify(driverPaid, null, 2));
    
    const normalized = {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        notes: payment.notes || "N/A",
        currency: payment["currency "] ? payment["currency "].trim() : (payment.currency || "N/A"),

        // Order data
        order_id: order ? order.id : null,
        order_code: order ? order.order_code : "N/A",

        // Client company
        client_company_id: clientCompany ? clientCompany.id : null,
        client_company_name: clientCompany ? clientCompany.name : "N/A",

        // Delivery company
        delivery_company_id: deliveryCompany ? deliveryCompany.id : null,
        delivery_company_name: deliveryCompany ? deliveryCompany.name : "N/A",

        // Driver received
        driver_received_id: driverReceived ? driverReceived.id : null,
        driver_received_name: driverReceived ? driverReceived.name : "N/A",

        // Driver paid
        driver_paid_id: driverPaid ? driverPaid.id : null,
        driver_paid_name: driverPaid ? driverPaid.name : "N/A",
        
        created_at: payment.created_at,
        updated_at: payment.updated_at,
    };
    
    console.log("✅ Final normalized:", JSON.stringify(normalized, null, 2));
    return normalized;
};
      
           
 

    // Getters
    const completedPayments = computed(() =>
        payments.value.filter((payment) => payment.status === "completed")
    );

    const pendingPayments = computed(() =>
        payments.value.filter((payment) => payment.status === "pending")
    );

    // Actions
    const fetchPayments = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getPayments();

            console.log("📦 Raw API Response:", response.data);
            console.log("📦 First payment:", response.data.data[0]);

            payments.value = response.data.data.map(normalizePayment);

            console.log("✅ Normalized Payments:", payments.value);

            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch payments";
            console.error("❌ Error fetching payments:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchTrashedPayments = async () => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getTrashedPayments();
            trashedPayments.value = response.data.data.map(normalizePayment);
            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch trashed payments";
            console.error("❌ Error fetching trashed payments:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    const addPayment = async (paymentData) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.createPayment(paymentData);
            const newPayment = normalizePayment(response.data.data);
            payments.value.push(newPayment);
            return newPayment;
        } catch (err) {
            error.value = err.message || "Failed to add payment";
            console.error("❌ Error adding payment:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updatePayment = async (paymentId, paymentData) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.updatePayment(paymentId, paymentData);
            const index = payments.value.findIndex((p) => p.id === paymentId);
            if (index > -1) {
                payments.value[index] = normalizePayment(response.data.data);
            }
            return payments.value[index];
        } catch (err) {
            error.value = err.message || "Failed to update payment";
            console.error("❌ Error updating payment:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deletePayment = async (paymentId) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.deleteEntity('payments', paymentId, false);
            const index = payments.value.findIndex((p) => p.id === paymentId);
            if (index > -1) {
                payments.value.splice(index, 1);
            }
        } catch (err) {
            error.value = err.message || "Failed to delete payment";
            console.error("❌ Error deleting payment:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const restorePayment = async (paymentId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.restoreEntity('payments', paymentId);
            const index = trashedPayments.value.findIndex((p) => p.id === paymentId);
            if (index > -1) {
                trashedPayments.value.splice(index, 1);
            }
            if (response.data?.data) {
                payments.value.push(normalizePayment(response.data.data));
            }
        } catch (err) {
            error.value = err.message || "Failed to restore payment";
            console.error("❌ Error restoring payment:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkDeletePayments = async (paymentIds) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.bulkDeleteEntities('payment', 'payments', paymentIds, false);
            payments.value = payments.value.filter((p) => !paymentIds.includes(p.id));
        } catch (err) {
            error.value = err.message || "Failed to bulk delete payments";
            console.error("❌ Error bulk deleting payments:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkRestorePayments = async (paymentIds) => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.bulkRestoreEntities('payment', 'payments', paymentIds);
            trashedPayments.value = trashedPayments.value.filter((p) => !paymentIds.includes(p.id));
            if (response.data?.data) {
                payments.value.push(...response.data.data.map(normalizePayment));
            }
        } catch (err) {
            error.value = err.message || "Failed to bulk restore payments";
            console.error("❌ Error bulk restoring payments:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    return {
        // State
        payments,
        trashedPayments,
        loading,
        trashedLoading,
        error,
        // Getters
        completedPayments,
        pendingPayments,
        // Actions
        fetchPayments,
        fetchTrashedPayments,
        addPayment,
        updatePayment,
        deletePayment,
        restorePayment,
        bulkDeletePayments,
        bulkRestorePayments,
    };
});
