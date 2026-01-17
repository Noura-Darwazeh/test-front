import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useLineWorkStore = defineStore("lineWork", () => {
  const lineWorks = ref([]);
  const trashedLineWorks = ref([]);
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

  const normalizeLineWork = (lineWork) => {
    const companyInfo = extractIdName(lineWork.company_id ?? lineWork.company);
    const companyId = companyInfo.id;
    const companyName =
      lineWork.company?.name ||
      lineWork.company_name ||
      companyInfo.name ||
      (companyId ? `Company ${companyId}` : "");

    return {
      id: lineWork.id,
      name: lineWork.name || "",
      company_id: companyId,
      company: companyName,
      created_by: lineWork.created_by,
      created_at: lineWork.created_at,
      updated_at: lineWork.updated_at,
      deleted_at: lineWork.deleted_at,
    };
  };

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

  const fetchLineWorks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getLineWorks();
      const rawData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      lineWorks.value = rawData.map(normalizeLineWork);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch line works";
      console.error("Error fetching line works:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedLineWorks = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedLineWorks();
      const rawData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      trashedLineWorks.value = rawData.map(normalizeLineWork);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed line works";
      console.error("Error fetching trashed line works:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addLineWork = async (lineWorkData) => {
    loading.value = true;
    error.value = null;
    try {
      if (!lineWorkData.name) {
        const validationError = new Error("Name is required");
        validationError.response = {
          data: {
            success: false,
            error: "The name field is required.",
          },
        };
        throw validationError;
      }

      const companyValue = lineWorkData.company ?? lineWorkData.company_id;
      if (!companyValue) {
        const validationError = new Error("Company is required");
        validationError.response = {
          data: {
            success: false,
            error: "The company id field is required.",
          },
        };
        throw validationError;
      }

      const apiData = {
        name: lineWorkData.name,
        company_id: companyValue,
      };

      const response = await apiServices.createLineWork(apiData);
      const newLineWork = normalizeLineWork(response.data.data || response.data);
      lineWorks.value.push(newLineWork);
      return newLineWork;
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value =
          err.response.data.error ||
          err.response.data.message ||
          "Validation failed";
      } else {
        error.value = err.message || "Failed to add line work";
      }
      console.error("Error adding line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateLineWork = async (lineWorkId, lineWorkData) => {
    loading.value = true;
    error.value = null;
    try {
      const apiData = {};
      if (lineWorkData.name) apiData.name = lineWorkData.name;
      const companyValue = lineWorkData.company ?? lineWorkData.company_id;
      if (companyValue) apiData.company_id = companyValue;

      const response = await apiServices.updateLineWork(lineWorkId, apiData);
      const updated = normalizeLineWork(response.data.data || response.data);

      const index = lineWorks.value.findIndex((l) => l.id === lineWorkId);
      if (index > -1) {
        lineWorks.value[index] = updated;
      }
      return lineWorks.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value =
          err.response.data.error ||
          err.response.data.message ||
          "Validation failed";
      } else {
        error.value = err.message || "Failed to update line work";
      }
      console.error("Error updating line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteLineWork = async (lineWorkId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteLineWork(lineWorkId, force);

      if (force) {
        trashedLineWorks.value = trashedLineWorks.value.filter(
          (lineWork) => lineWork.id !== lineWorkId
        );
      } else {
        const index = lineWorks.value.findIndex((l) => l.id === lineWorkId);
        if (index > -1) {
          const lineWork = lineWorks.value.splice(index, 1)[0];
          trashedLineWorks.value.push(lineWork);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete line work";
      console.error("Error deleting line work:", err);
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
    } catch (err) {
      error.value = err.message || "Failed to restore line work";
      console.error("Error restoring line work:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteLineWorks = async (lineWorkIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteLineWorks(lineWorkIds, force);

      if (force) {
        trashedLineWorks.value = trashedLineWorks.value.filter(
          (lineWork) => !lineWorkIds.includes(lineWork.id)
        );
      } else {
        const deleted = lineWorks.value.filter((lineWork) =>
          lineWorkIds.includes(lineWork.id)
        );
        lineWorks.value = lineWorks.value.filter(
          (lineWork) => !lineWorkIds.includes(lineWork.id)
        );
        trashedLineWorks.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete line works";
      console.error("Error bulk deleting line works:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreLineWorks = async (lineWorkIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreLineWorks(lineWorkIds);

      const restored = trashedLineWorks.value.filter((lineWork) =>
        lineWorkIds.includes(lineWork.id)
      );
      trashedLineWorks.value = trashedLineWorks.value.filter(
        (lineWork) => !lineWorkIds.includes(lineWork.id)
      );
      lineWorks.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore line works";
      console.error("Error bulk restoring line works:", err);
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
    trashedLoading,
    error,
    // Getters
    lineWorksByCompany,
    // Actions
    fetchLineWorks,
    fetchTrashedLineWorks,
    addLineWork,
    updateLineWork,
    deleteLineWork,
    restoreLineWork,
    bulkDeleteLineWorks,
    bulkRestoreLineWorks,
  };
});
