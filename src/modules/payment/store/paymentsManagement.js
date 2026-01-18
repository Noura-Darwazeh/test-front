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
    console.log("🔍 Raw payment:", JSON.stringify(payment, null, 2));
    
    const clientCompany = payment["Clinet company"];
    const deliveryCompany = payment["Delivery company"];
    const driverReceived = payment["Driver received"];
    const driverPaid = payment["Driver paid"];
    const order = payment.Order || payment.order;
    
    const normalized = {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        // ✅ دعم كل من "note" و "notes"
        notes: payment.note || payment.notes || "N/A",
        currency: payment["currency "] ? payment["currency "].trim() : (payment.currency || "N/A"),

        order_id: order ? order.id : null,
        order_code: order ? order.order_code : "N/A",

        client_company_id: clientCompany ? clientCompany.id : null,
        client_company_name: clientCompany ? clientCompany.name : "N/A",

        delivery_company_id: deliveryCompany ? deliveryCompany.id : null,
        delivery_company_name: deliveryCompany ? deliveryCompany.name : "N/A",

        driver_received_id: driverReceived ? driverReceived.id : null,
        driver_received_name: driverReceived ? driverReceived.name : "N/A",

        driver_paid_id: driverPaid ? driverPaid.id : null,
        driver_paid_name: driverPaid ? driverPaid.name : "N/A",
        
        created_at: payment.created_at,
        updated_at: payment.updated_at,
    };
    
    console.log("✅ Final normalized:", JSON.stringify(normalized, null, 2));
    return normalized;
};

// ✅ تبسيط دالة updatePayment
const updatePayment = async (paymentId, paymentData) => {
    loading.value = true;
    error.value = null;
    try {
        console.log("🔄 Updating payment:", paymentId, paymentData);
        
        // ✅ تجهيز البيانات للـ API
        const data = {
            payment_ids: [paymentId],
            status: paymentData.status,
        };

        // ✅ استخدام "note" مش "notes"
        if (paymentData.notes && paymentData.notes.trim() !== '') {
            data.note = paymentData.notes;
        }

        // ✅ إضافة amount
        if (paymentData.amount) {
            data.amount = parseFloat(paymentData.amount);
        }
        
        console.log("📤 Sending to API:", data);
        
        const response = await apiServices.markPaymentsAsPaid(data);
        
        console.log("📥 Update response:", response.data);
        
        // ✅ Refresh البيانات بعد التعديل
        await fetchPayments();
        
        return response.data;
    } catch (err) {
        error.value = err.message || "Failed to update payment";
        console.error("❌ Error updating payment:", err);
        throw err;
    } finally {
        loading.value = false;
    }
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
        updatePayment, // ✅ دالة التعديل
        deletePayment,
        restorePayment,
        bulkDeletePayments,
        bulkRestorePayments,
    };
});