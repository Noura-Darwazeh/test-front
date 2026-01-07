import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useLinesStore = defineStore("lines", () => {
  // State
  const lines = ref([]);
  const trashedLines = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Getters
  const linesByRegion = computed(() => {
    const grouped = {};
    lines.value.forEach((line) => {
      const regionId = line.region_id;
      if (!grouped[regionId]) {
        grouped[regionId] = [];
      }
      grouped[regionId].push(line);
    });
    return grouped;
  });

  const linesByCompany = computed(() => {
    const grouped = {};
    lines.value.forEach((line) => {
      const companyId = line.company_id;
      if (!grouped[companyId]) {
        grouped[companyId] = [];
      }
      grouped[companyId].push(line);
    });
    return grouped;
  });

  // Actions
  const fetchLines = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getLines();

      // Transform API response to match frontend format
      lines.value = response.data.data.map((line) => ({
        id: line.id,
        name: line.name || "",
        region_id: line.region_id,
        region: `Region ${line.region_id}`, // You can map this to actual region names
        company_id: line.company_id,
        company: `Company ${line.company_id}`, // You can map this to actual company names
        created_by: line.created_by,
        created_at: line.created_at,
        updated_at: line.updated_at,
      }));

      console.log(`✅ Successfully loaded ${lines.value.length} lines`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch lines";
      console.error("❌ Error fetching lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addLine = async (lineData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate required fields
      if (!lineData.name) {
        const validationError = new Error("Name is required");
        validationError.response = {
          data: {
            success: false,
            error: "The name field is required."
          }
        };
        throw validationError;
      }

      if (!lineData.region) {
        const validationError = new Error("Region is required");
        validationError.response = {
          data: {
            success: false,
            error: "The region id field is required."
          }
        };
        throw validationError;
      }

      if (!lineData.company) {
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
        name: lineData.name,
        region_id: lineData.region, // region select value is the ID
        company_id: lineData.company, // company select value is the ID
      };

      console.log("📤 Sending line data to API:", apiData);

      const response = await apiServices.createLine(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newLine = {
        id: response.data.data.id,
        name: response.data.data.name || "",
        region_id: response.data.data.region_id,
        region: `Region ${response.data.data.region_id}`,
        company_id: response.data.data.company_id,
        company: `Company ${response.data.data.company_id}`,
        created_by: response.data.data.created_by,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      };

      lines.value.push(newLine);
      console.log("✅ Line added successfully to store");
      return newLine;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add line";
        console.error("❌ Error adding line:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateLine = async (lineId, lineData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (lineData.name) apiData.name = lineData.name;
      if (lineData.region) apiData.region_id = lineData.region;
      if (lineData.company) apiData.company_id = lineData.company;

      console.log("📤 Updating line:", apiData);

      const response = await apiServices.updateLine(lineId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = lines.value.findIndex((l) => l.id === lineId);
      if (index > -1) {
        lines.value[index] = {
          id: response.data.data.id,
          name: response.data.data.name || lines.value[index].name,
          region_id: response.data.data.region_id,
          region: `Region ${response.data.data.region_id}`,
          company_id: response.data.data.company_id,
          company: `Company ${response.data.data.company_id}`,
          created_by: response.data.data.created_by,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
        };
        console.log("✅ Line updated successfully");
      }
      return lines.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update line";
      }
      console.error("❌ Error updating line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLine = async (lineId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteLine(lineId);

      const index = lines.value.findIndex((l) => l.id === lineId);
      if (index > -1) {
        const line = lines.value.splice(index, 1)[0];
        trashedLines.value.push(line);
      }
      console.log("✅ Line deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete line";
      console.error("❌ Error deleting line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedLines = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedLines();

      // Transform API response to match frontend format
      trashedLines.value = response.data.data.map((line) => ({
        id: line.id,
        name: line.name || "",
        region_id: line.region_id,
        region: `Region ${line.region_id}`,
        company_id: line.company_id,
        company: `Company ${line.company_id}`,
        created_by: line.created_by,
        created_at: line.created_at,
        updated_at: line.updated_at,
      }));

      console.log(`✅ Successfully loaded ${trashedLines.value.length} trashed lines`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed lines";
      console.error("❌ Error fetching trashed lines:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const restoreLine = async (lineId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreLine(lineId);

      const index = trashedLines.value.findIndex((l) => l.id === lineId);
      if (index > -1) {
        const line = trashedLines.value.splice(index, 1)[0];
        lines.value.push(line);
      }
      console.log("✅ Line restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore line";
      console.error("❌ Error restoring line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteLines = async (lineIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteLines(lineIds, force);

      if (force) {
        // Permanent delete - remove from trashedLines
        trashedLines.value = trashedLines.value.filter(
          (line) => !lineIds.includes(line.id)
        );
      } else {
        // Soft delete - move from lines to trashedLines
        const deletedLines = lines.value.filter((line) =>
          lineIds.includes(line.id)
        );
        lines.value = lines.value.filter(
          (line) => !lineIds.includes(line.id)
        );
        trashedLines.value.push(...deletedLines);
      }

      console.log(`✅ Successfully bulk deleted ${lineIds.length} lines`);
    } catch (err) {
      error.value = err.message || "Failed to bulk delete lines";
      console.error("❌ Error bulk deleting lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreLines = async (lineIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreLines(lineIds);

      // Move lines from trashedLines to lines
      const restoredLines = trashedLines.value.filter((line) =>
        lineIds.includes(line.id)
      );
      trashedLines.value = trashedLines.value.filter(
        (line) => !lineIds.includes(line.id)
      );
      lines.value.push(...restoredLines);

      console.log(`✅ Successfully bulk restored ${lineIds.length} lines`);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore lines";
      console.error("❌ Error bulk restoring lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    lines,
    trashedLines,
    loading,
    trashedLoading,
    error,
    // Getters
    linesByRegion,
    linesByCompany,
    // Actions
    fetchLines,
    fetchTrashedLines,
    addLine,
    updateLine,
    deleteLine,
    restoreLine,
    bulkDeleteLines,
    bulkRestoreLines,
  };
});