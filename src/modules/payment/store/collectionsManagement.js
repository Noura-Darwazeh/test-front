import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCollectionsManagementStore = defineStore("collectionsManagement", () => {
    // State
    const collections = ref([]);
    const trashedCollections = ref([]);
    const loading = ref(false);
    const trashedLoading = ref(false);
    const error = ref(null);

    const normalizeCollection = (collection) => {

    const driver = collection.received_by_driver;
    
    const invoice = collection.invoice_id;
    
    const normalized = {
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

    return normalized;
};

    const updateCollection = async (collectionId, collectionData) => {
        loading.value = true;
        error.value = null;
        try {

            const data = {
                collection_ids: [collectionId],
                status: collectionData.status,
            };

            if (collectionData.note && collectionData.note.trim() !== '') {
                data.note = collectionData.note;
            }


            const response = await apiServices.markCollectionsAsPaid(data);


            await fetchCollections();

            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to update collection";
            console.error("❌ Error updating collection:", err);
            throw err;
        } finally {
            loading.value = false;
        }
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

    const fetchTrashedCollections = async () => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.getTrashedCollections();
            trashedCollections.value = response.data.data.map(normalizeCollection);
            return response.data;
        } catch (err) {
            error.value = err.message || "Failed to fetch trashed collections";
            console.error("❌ Error fetching trashed collections:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    const deleteCollection = async (collectionId) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.deleteEntity('collections', collectionId, false);
            const index = collections.value.findIndex((c) => c.id === collectionId);
            if (index > -1) {
                collections.value.splice(index, 1);
            }
        } catch (err) {
            error.value = err.message || "Failed to delete collection";
            console.error("❌ Error deleting collection:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const restoreCollection = async (collectionId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiServices.restoreEntity('collections', collectionId);
            const index = trashedCollections.value.findIndex((c) => c.id === collectionId);
            if (index > -1) {
                trashedCollections.value.splice(index, 1);
            }
            if (response.data?.data) {
                collections.value.push(normalizeCollection(response.data.data));
            }
        } catch (err) {
            error.value = err.message || "Failed to restore collection";
            console.error("❌ Error restoring collection:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkDeleteCollections = async (collectionIds) => {
        loading.value = true;
        error.value = null;
        try {
            await apiServices.bulkDeleteCollections(collectionIds, false);
            collections.value = collections.value.filter((c) => !collectionIds.includes(c.id));
        } catch (err) {
            error.value = err.message || "Failed to bulk delete collections";
            console.error("❌ Error bulk deleting collections:", err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const bulkRestoreCollections = async (collectionIds) => {
        trashedLoading.value = true;
        error.value = null;
        try {
            const response = await apiServices.bulkRestoreCollections(collectionIds);
            trashedCollections.value = trashedCollections.value.filter((c) => !collectionIds.includes(c.id));
            if (response.data?.data) {
                collections.value.push(...response.data.data.map(normalizeCollection));
            }
        } catch (err) {
            error.value = err.message || "Failed to bulk restore collections";
            console.error("❌ Error bulk restoring collections:", err);
            throw err;
        } finally {
            trashedLoading.value = false;
        }
    };

    return {
        // State
        collections,
        trashedCollections,
        loading,
        trashedLoading,
        error,
        // Getters
        completedCollections,
        pendingCollections,
        // Actions
        fetchCollections,
        fetchTrashedCollections,
        updateCollection,
        deleteCollection,
        restoreCollection,
        bulkDeleteCollections,
        bulkRestoreCollections,
    };
});