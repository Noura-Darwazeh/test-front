import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useLineWorkStore = defineStore("lineWork", () => {
  // State
  const lineWorks = ref([]);
  const trashedLineWorks = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const lineWorksByCompany = computed(() => {
    const grouped = {};
    lineWorks.value.forEach((lineWork) => {
      const companyId = lineWork.company_id;
      if (!grouped[companyId]) {
        grouped[companyId] = [];
      }
      grouped[companyId].push(lineWork);
    });
    return grouped;
  });

  // Actions
  const fetchLineWorks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getLineWorks();

      // Transform API response to match frontend format
      lineWorks.value = response.data.data.map((lineWork) => ({
        id: lineWork.id,
        name: lineWork.name || "",
        company_id: lineWork.company_id,
        company: `Company ${lineWork.company_id}`, // You can map this to actual company names
        created_by: lineWork.created_by,
        created_at: lineWork.created_at,
        updated_at: lineWork.updated_at,
      }));

      console.log(`✅ Successfully loaded ${lineWorks.value.length} line works`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch line works";
      console.error("❌ Error fetching line works:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addLineWork = async (lineWorkData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate required fields
      if (!lineWorkData.name) {
        const validationError = new Error("Name is required");
        validationError.response = {
          data: {
            success: false,
            error: "The name field is required."
          }
        };
        throw validationError;
      }

      if (!lineWorkData.company) {
        const validationError = new Error("Company is required");
        validationError.response = {
          data: {
            success: false,
            error: "The company id field is required."
          }
        };
        throw validationError;
      }

      // Transform frontend data to API format
      const apiData = {
        name: lineWorkData.name,
        company_id: lineWorkData.company, // company select value is the ID
      };

      console.log("📤 Sending line work data to API:", apiData);

      const response = await apiServices.createLineWork(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newLineWork = {
        id: response.data.data.id,
        name: response.data.data.name || "",
        company_id: response.data.data.company_id,
        company: `Company ${response.data.data.company_id}`,
        created_by: response.data.data.created_by,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      };

      lineWorks.value.push(newLineWork);
      console.log("✅ Line work added successfully to store");
      return newLineWork;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add line work";
        console.error("❌ Error adding line work:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateLineWork = async (lineWorkId, lineWorkData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (lineWorkData.name) apiData.name = lineWorkData.name;
      if (lineWorkData.company) apiData.company_id = lineWorkData.company;

      console.log("📤 Updating line work:", apiData);

      const response = await apiServices.updateLineWork(lineWorkId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = lineWorks.value.findIndex((l) => l.id === lineWorkId);
      if (index > -1) {
        lineWorks.value[index] = {
          id: response.data.data.id,
          name: response.data.data.name || lineWorks.value[index].name,
          company_id: response.data.data.company_id,
          company: `Company ${response.data.data.company_id}`,
          created_by: response.data.data.created_by,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
        };
        console.log("✅ Line work updated successfully");
      }
      return lineWorks.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update line work";
      }
      console.error("❌ Error updating line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLineWork = async (lineWorkId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteLineWork(lineWorkId);

      const index = lineWorks.value.findIndex((l) => l.id === lineWorkId);
      if (index > -1) {
        const lineWork = lineWorks.value.splice(index, 1)[0];
        trashedLineWorks.value.push(lineWork);
      }
      console.log("✅ Line work deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete line work";
      console.error("❌ Error deleting line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreLineWork = async (lineWorkId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreLineWork(lineWorkId);

      const index = trashedLineWorks.value.findIndex((l) => l.id === lineWorkId);
      if (index > -1) {
        const lineWork = trashedLineWorks.value.splice(index, 1)[0];
        lineWorks.value.push(lineWork);
      }
      console.log("✅ Line work restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore line work";
      console.error("❌ Error restoring line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    lineWorks,
    trashedLineWorks,
    loading,
    error,
    // Getters
    lineWorksByCompany,
    // Actions
    fetchLineWorks,
    addLineWork,
    updateLineWork,
    deleteLineWork,
    restoreLineWork,
  };
});