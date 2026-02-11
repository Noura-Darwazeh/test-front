import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCollectionsManagementStore = defineStore("collectionsManagement", () => {
    // State
    const collections = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const normalizeCollection = (collection) => {
        const driver = collection.received_by_driver;
        const invoice = collection.invoice_id;
        
        return {
            id: collection.id,
            status: collection.status,
            note: collection.notes || "N/A", 
            invoice_id: invoice ? invoice.id : null,
            invoice_code: invoice ? invoice.invoice_code : "N/A",
            driver_id: driver ? driver.id : null,
            driver_name: driver ? driver.name : "N/A",
            created_at: collection.created_at,
            updated_at: collection.updated_at,
        };
    };

    // Getters
    const completedCollections = computed(() =>
        collections.value.filter((collection) => collection.status === "completed")
    );

    const pendingCollections = computed(() =>
        collections.value.filter((collection) => collection.status === "pending")
    );

    // Actions
    const fetchCollections = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getCollections();
            collections.value = response.data.data.map(normalizeCollection);
            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch collections";
            console.error("❌ Error fetching collections:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        // State
        collections,
        loading,
        error,
        // Getters
        completedCollections,
        pendingCollections,
        // Actions
        fetchCollections,
    };
});