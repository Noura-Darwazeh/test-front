import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useDriverLineStore = defineStore("driverLine", () => {
  const driverLines = ref([]);
  const trashedDriverLines = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  const extractIdName = (value) => {
    if (Array.isArray(value)) {
      return { id: value[0], name: value[1] || "" };
    }
    if (value && typeof value === "object") {
      return { id: value.id ?? null, name: value.name || "" };
    }
    return { id: value ?? null, name: "" };
  };

  const normalizeDriverLine = (line) => {
    const driver = extractIdName(line.driver_id ?? line.driver);
    const lineWork = extractIdName(line.line_work_id ?? line.line_work);
    const createdBy = extractIdName(line.created_by);

    return {
      id: line.id,
      driver_id: driver.id,
      driver_name: driver.name,
      line_work_id: lineWork.id,
      line_work_name: lineWork.name,
      created_by: createdBy.name || createdBy.id,
      created_at: line.created_at,
      updated_at: line.updated_at,
      deleted_at: line.deleted_at,
    };
  };

  const fetchDriverLines = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getDriverLines();
      const data = response.data.data || [];
      driverLines.value = data.map(normalizeDriverLine);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch driver lines";
      console.error("Error fetching driver lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedDriverLines = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedDriverLines();
      const data = response.data.data || [];
      trashedDriverLines.value = data.map(normalizeDriverLine);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed driver lines";
      console.error("Error fetching trashed driver lines:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addDriverLine = async (driverLineData) => {
    loading.value = true;
    error.value = null;
    try {
      if (!driverLineData.driver_id || !driverLineData.line_work_id) {
        const validationError = new Error("Driver and Line Work are required");
        validationError.response = {
          data: {
            success: false,
            error: "Driver and Line Work fields are required.",
          },
        };
        throw validationError;
      }

      const apiData = {
        driver_id: parseInt(driverLineData.driver_id, 10),
        line_work_id: parseInt(driverLineData.line_work_id, 10),
      };

      const response = await apiServices.createDriverLine(apiData);
      const newDriverLine = normalizeDriverLine(
        response.data.data || response.data
      );
      driverLines.value.push(newDriverLine);
      return newDriverLine;
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value =
          err.response.data.error ||
          err.response.data.message ||
          "Validation failed";
      } else {
        error.value = err.message || "Failed to add driver line";
      }
      console.error("Error adding driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDriverLine = async (driverLineId, driverLineData) => {
    loading.value = true;
    error.value = null;
    try {
      const apiData = {};
      if (driverLineData.driver_id) {
        apiData.driver_id = parseInt(driverLineData.driver_id, 10);
      }
      if (driverLineData.line_work_id) {
        apiData.line_work_id = parseInt(driverLineData.line_work_id, 10);
      }

      const response = await apiServices.updateDriverLine(
        driverLineId,
        apiData
      );
      const updated = normalizeDriverLine(response.data.data || response.data);

      const index = driverLines.value.findIndex((dl) => dl.id === driverLineId);
      if (index > -1) {
        driverLines.value[index] = updated;
      }
      return driverLines.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value =
          err.response.data.error ||
          err.response.data.message ||
          "Validation failed";
      } else {
        error.value = err.message || "Failed to update driver line";
      }
      console.error("Error updating driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDriverLine = async (driverLineId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteDriverLine(driverLineId, force);

      if (force) {
        trashedDriverLines.value = trashedDriverLines.value.filter(
          (dl) => dl.id !== driverLineId
        );
      } else {
        const index = driverLines.value.findIndex(
          (dl) => dl.id === driverLineId
        );
        if (index > -1) {
          const driverLine = driverLines.value.splice(index, 1)[0];
          trashedDriverLines.value.push(driverLine);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete driver line";
      console.error("Error deleting driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreDriverLine = async (driverLineId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreDriverLine(driverLineId);

      const index = trashedDriverLines.value.findIndex(
        (dl) => dl.id === driverLineId
      );
      if (index > -1) {
        const driverLine = trashedDriverLines.value.splice(index, 1)[0];
        driverLines.value.push(driverLine);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore driver line";
      console.error("Error restoring driver line:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteDriverLines = async (driverLineIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteDriverLines(driverLineIds, force);

      if (force) {
        trashedDriverLines.value = trashedDriverLines.value.filter(
          (dl) => !driverLineIds.includes(dl.id)
        );
      } else {
        const deleted = driverLines.value.filter((dl) =>
          driverLineIds.includes(dl.id)
        );
        driverLines.value = driverLines.value.filter(
          (dl) => !driverLineIds.includes(dl.id)
        );
        trashedDriverLines.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete driver lines";
      console.error("Error bulk deleting driver lines:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreDriverLines = async (driverLineIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreDriverLines(driverLineIds);

      const restored = trashedDriverLines.value.filter((dl) =>
        driverLineIds.includes(dl.id)
      );
      trashedDriverLines.value = trashedDriverLines.value.filter(
        (dl) => !driverLineIds.includes(dl.id)
      );
      driverLines.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore driver lines";
      console.error("Error bulk restoring driver lines:", err);
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
    trashedLoading,
    error,
    // Actions
    fetchDriverLines,
    fetchTrashedDriverLines,
    addDriverLine,
    updateDriverLine,
    deleteDriverLine,
    restoreDriverLine,
    bulkDeleteDriverLines,
    bulkRestoreDriverLines,
  };
});
