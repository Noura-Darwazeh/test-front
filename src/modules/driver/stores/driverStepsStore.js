import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useDriverStepsStore = defineStore("driverSteps", () => {
  // State
  const steps = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination state
  const pagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const extractIdName = (value, fallbackId = null, fallbackName = "") => {
    if (Array.isArray(value)) {
      return { id: value[0] ?? fallbackId, name: value[1] ?? fallbackName };
    }
    if (value && typeof value === "object") {
      return {
        id: value.id ?? fallbackId,
        name: value.name ?? value.label ?? fallbackName,
      };
    }
    if (value === null || value === undefined) {
      return { id: fallbackId, name: fallbackName };
    }
    return { id: value, name: fallbackName };
  };

  const normalizeStep = (step) => {
    const driverInfo = extractIdName(step.driver_id);

    return {
      ...step,
      driver_id: driverInfo.id ?? null,
      driver_name: driverInfo.name || "",
    };
  };

  const extractStepsPayload = (payload) => {
    const dataRoot = payload?.data;
    const stepsArray = Array.isArray(dataRoot)
      ? dataRoot
      : Array.isArray(dataRoot?.data)
        ? dataRoot.data
        : [];

    const metaSource =
      payload?.meta ||
      dataRoot?.meta ||
      (dataRoot && dataRoot.current_page !== undefined ? dataRoot : null);

    return { stepsArray, metaSource };
  };

  const buildPagination = (metaSource, page, perPage, totalFallback) => {
    const resolvedPerPage = metaSource?.per_page ?? perPage;
    const resolvedTotal = metaSource?.total ?? totalFallback;
    const resolvedLastPage =
      metaSource?.last_page ??
      Math.max(1, Math.ceil(resolvedTotal / resolvedPerPage));

    return {
      currentPage: metaSource?.current_page ?? page,
      perPage: resolvedPerPage,
      total: resolvedTotal,
      lastPage: resolvedLastPage,
    };
  };

  // Actions
  const fetchSteps = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getWorkPlanSteps({ page, perPage, filters });

      const { stepsArray, metaSource } = extractStepsPayload(response.data);
      steps.value = stepsArray.map(normalizeStep);
      pagination.value = buildPagination(
        metaSource,
        page,
        perPage,
        stepsArray.length,
      );

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch work plan steps";
      console.error("Error fetching work plan steps:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    steps,
    loading,
    error,
    pagination,
    // Actions
    fetchSteps,
  };
});