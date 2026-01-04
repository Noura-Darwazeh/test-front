import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api.js";

export const useDriverLineStore = defineStore("driverLine", () => {
  // State
  const driverLines = ref([]);
  const trashedDriverLines = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchDriverLines = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get("/driverlines");

      // Transform API response to match frontend format
      driverLines.value = response.data.data.map((line) => ({
        id: line.id,
        driver_id: Array.isArray(line.driver_id) ? line.driver_id[0] : line.driver_id,
        driver_name: Array.isArray(line.driver_id) ? line.driver_id[1] : "",
        line_work_id: Array.isArray(line.line_work_id) ? line.line_work_id[0] : line.line_work_id,
        line_work_name: Array.isArray(line.line_work_id) ? line.line_work_id[1] : "",
        created_by: Array.isArray(line.created_by) ? line.created_by[1] : "",
        created_at: line.created_at,
        updated_at: line.updated_at,
      }));

      console.log(`✅ Successfully loaded ${driverLines.value.length} driver lines`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch driver lines";
      console.error("❌ Error fetching driver lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addDriverLine = async (driverLineData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate required fields
      if (!driverLineData.driver_id || !driverLineData.line_work_id) {
        const validationError = new Error("Driver and Line Work are required");
        validationError.response = {
          data: {
            success: false,
            error: "Driver and Line Work fields are required."
          }
        };
        throw validationError;
      }

      // Transform frontend data to API format
      const apiData = {
        driver_id: parseInt(driverLineData.driver_id),
        line_work_id: parseInt(driverLineData.line_work_id),
      };

      console.log("📤 Sending driver line data to API:", apiData);

      const response = await api.post("/driverlines", apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newDriverLine = {
        id: response.data.data.id,
        driver_id: Array.isArray(response.data.data.driver_id) 
          ? response.data.data.driver_id[0] 
          : response.data.data.driver_id,
        driver_name: Array.isArray(response.data.data.driver_id) 
          ? response.data.data.driver_id[1] 
          : "",
        line_work_id: Array.isArray(response.data.data.line_work_id) 
          ? response.data.data.line_work_id[0] 
          : response.data.data.line_work_id,
        line_work_name: Array.isArray(response.data.data.line_work_id) 
          ? response.data.data.line_work_id[1] 
          : "",
        created_by: Array.isArray(response.data.data.created_by) 
          ? response.data.data.created_by[1] 
          : "",
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      };

      driverLines.value.push(newDriverLine);
      console.log("✅ Driver line added successfully to store");
      return newDriverLine;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add driver line";
        console.error("❌ Error adding driver line:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDriverLine = async (driverLineId, driverLineData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (driverLineData.driver_id) {
        apiData.driver_id = parseInt(driverLineData.driver_id);
      }
      if (driverLineData.line_work_id) {
        apiData.line_work_id = parseInt(driverLineData.line_work_id);
      }

      console.log("📤 Updating driver line:", apiData);

      const response = await api.post(`/driverlines/${driverLineId}`, apiData, {
        headers: {
          'X-HTTP-Method-Override': 'PATCH'
        }
      });

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = driverLines.value.findIndex((dl) => dl.id === driverLineId);
      if (index > -1) {
        driverLines.value[index] = {
          id: response.data.data.id,
          driver_id: Array.isArray(response.data.data.driver_id) 
            ? response.data.data.driver_id[0] 
            : response.data.data.driver_id,
          driver_name: Array.isArray(response.data.data.driver_id) 
            ? response.data.data.driver_id[1] 
            : driverLines.value[index].driver_name,
          line_work_id: Array.isArray(response.data.data.line_work_id) 
            ? response.data.data.line_work_id[0] 
            : response.data.data.line_work_id,
          line_work_name: Array.isArray(response.data.data.line_work_id) 
            ? response.data.data.line_work_id[1] 
            : driverLines.value[index].line_work_name,
          created_by: Array.isArray(response.data.data.created_by) 
            ? response.data.data.created_by[1] 
            : driverLines.value[index].created_by,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
        };
        console.log("✅ Driver line updated successfully");
      }
      return driverLines.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update driver line";
      }
      console.error("❌ Error updating driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDriverLine = async (driverLineId) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/driverlines/${driverLineId}`);

      const index = driverLines.value.findIndex((dl) => dl.id === driverLineId);
      if (index > -1) {
        const driverLine = driverLines.value.splice(index, 1)[0];
        trashedDriverLines.value.push(driverLine);
      }
      console.log("✅ Driver line deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete driver line";
      console.error("❌ Error deleting driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreDriverLine = async (driverLineId) => {
    loading.value = true;
    error.value = null;
    try {
      await api.post(`/restore/driverlines/${driverLineId}`);

      const index = trashedDriverLines.value.findIndex((dl) => dl.id === driverLineId);
      if (index > -1) {
        const driverLine = trashedDriverLines.value.splice(index, 1)[0];
        driverLines.value.push(driverLine);
      }
      console.log("✅ Driver line restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore driver line";
      console.error("❌ Error restoring driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    driverLines,
    trashedDriverLines,
    loading,
    error,
    // Actions
    fetchDriverLines,
    addDriverLine,
    updateDriverLine,
    deleteDriverLine,
    restoreDriverLine,
  };
});