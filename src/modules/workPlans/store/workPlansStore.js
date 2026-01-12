import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useWorkPlansStore = defineStore("workPlans", () => {
  const workPlans = ref([]);
  const trashedWorkPlans = ref([]);
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

  const normalizeWorkPlan = (plan) => {
    const companyInfo = extractIdName(plan.company_id ?? plan.company);
    const companyId = companyInfo.id;
    const companyName =
      plan.company_name ||
      companyInfo.name ||
      (companyId ? `Company ${companyId}` : "");

    const driverInfo = extractIdName(plan.driver_id ?? plan.driver);
    const driverName = plan.driver_name || driverInfo.name || "";

    return {
      id: plan.id,
      name: plan.name || "",
      company_id: companyId,
      company_name: companyName,
      date: plan.date || plan.plan_date || "",
      driver_id: driverInfo.id,
      driver_name: driverName,
      orders: plan.orders || plan.order_items || [],
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      deleted_at: plan.deleted_at,
    };
  };

  const fetchWorkPlans = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getWorkPlans();
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      workPlans.value = data.map(normalizeWorkPlan);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch work plans";
      console.error("Error fetching work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedWorkPlans = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedWorkPlans();
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      trashedWorkPlans.value = data.map(normalizeWorkPlan);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed work plans";
      console.error("Error fetching trashed work plans:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addWorkPlan = async (workPlanData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createWorkPlan(workPlanData);
      const newPlan = normalizeWorkPlan(response.data.data || response.data);
      workPlans.value.push(newPlan);
      return newPlan;
    } catch (err) {
      error.value = err.message || "Failed to add work plan";
      console.error("Error adding work plan:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateWorkPlan = async (planId, workPlanData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateWorkPlan(planId, workPlanData);
      const updated = normalizeWorkPlan(response.data.data || response.data);
      const index = workPlans.value.findIndex((p) => p.id === planId);
      if (index > -1) {
        workPlans.value[index] = updated;
      }
      return workPlans.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update work plan";
      console.error("Error updating work plan:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteWorkPlan = async (planId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteWorkPlan(planId, force);

      if (force) {
        trashedWorkPlans.value = trashedWorkPlans.value.filter(
          (plan) => plan.id !== planId
        );
      } else {
        const index = workPlans.value.findIndex((p) => p.id === planId);
        if (index > -1) {
          const plan = workPlans.value.splice(index, 1)[0];
          trashedWorkPlans.value.push(plan);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete work plan";
      console.error("Error deleting work plan:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreWorkPlan = async (planId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreWorkPlan(planId);

      const index = trashedWorkPlans.value.findIndex((p) => p.id === planId);
      if (index > -1) {
        const plan = trashedWorkPlans.value.splice(index, 1)[0];
        workPlans.value.push(plan);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore work plan";
      console.error("Error restoring work plan:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteWorkPlans = async (planIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteWorkPlans(planIds, force);

      if (force) {
        trashedWorkPlans.value = trashedWorkPlans.value.filter(
          (plan) => !planIds.includes(plan.id)
        );
      } else {
        const deleted = workPlans.value.filter((plan) =>
          planIds.includes(plan.id)
        );
        workPlans.value = workPlans.value.filter(
          (plan) => !planIds.includes(plan.id)
        );
        trashedWorkPlans.value.push(...deleted);
      }
    } catch (err) {
      error.value = err.message || "Failed to bulk delete work plans";
      console.error("Error bulk deleting work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreWorkPlans = async (planIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreWorkPlans(planIds);

      const restored = trashedWorkPlans.value.filter((plan) =>
        planIds.includes(plan.id)
      );
      trashedWorkPlans.value = trashedWorkPlans.value.filter(
        (plan) => !planIds.includes(plan.id)
      );
      workPlans.value.push(...restored);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore work plans";
      console.error("Error bulk restoring work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    workPlans,
    trashedWorkPlans,
    loading,
    trashedLoading,
    error,
    // Actions
    fetchWorkPlans,
    fetchTrashedWorkPlans,
    addWorkPlan,
    updateWorkPlan,
    deleteWorkPlan,
    restoreWorkPlan,
    bulkDeleteWorkPlans,
    bulkRestoreWorkPlans,
  };
});
