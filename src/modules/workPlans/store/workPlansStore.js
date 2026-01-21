import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useWorkPlansStore = defineStore("workPlans", () => {
  const workPlans = ref([]);
  const trashedWorkPlans = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const workPlansPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });
  const trashedPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const extractIdName = (value) => {
    if (Array.isArray(value)) {
      return { id: value[0], name: value[1] || "" };
    }
    if (value && typeof value === "object") {
      return { id: value.id ?? null, name: value.name || "" };
    }
    return { id: value ?? null, name: "" };
  };

const normalizeWorkPlan = (plan, allDrivers = []) => {
  const companyInfo = extractIdName(plan.company_id ?? plan.company);
  const companyId = companyInfo.id;
  const companyName =
    plan.company_name ||
    companyInfo.name ||
    (companyId ? `Company ${companyId}` : "");

  let date = plan.date || plan.plan_date || "";
  let driverId = null;
  let driverName = "";
  let orders = [];
  
  // ✅ معالجة workplanorder بشكل صحيح
  if (plan.workplanorder && Array.isArray(plan.workplanorder)) {
    orders = plan.workplanorder.map(workplanOrder => {
      const orderItemId = workplanOrder.order_item?.id || workplanOrder.order_item_id;
      const orderItemName = workplanOrder.order_item?.name || `Order Item #${orderItemId}`;
      
      // ✅ استخرجي الـ order_code من اسم الـ item
      const orderCode = orderItemName.split(' - ')[0].trim();
      
      return {
        id: workplanOrder.id,
        order_item_id: orderItemId,
        order: orderCode, // ✅ الـ order code
        items: orderItemId // ID لاستخدامه في الفورم والعرض
      };
    });
    
    // البحث عن أول driver في أي workplanorder
    for (const workplanOrder of plan.workplanorder) {
      if (workplanOrder.steps && workplanOrder.steps.length > 0) {
        const firstStep = workplanOrder.steps[0];
        date = date || firstStep.date;
        driverId = firstStep.driver_id;
        driverName = firstStep.driver_name || "";
        break;
      }
    }
  }

  // 🔥 إذا ما في driver_name ولكن في driver_id، اجلبيه من قائمة السائقين
  if (!driverName && driverId && allDrivers.length > 0) {
    const driver = allDrivers.find(d => d.id === driverId);
    if (driver) {
      driverName = driver.name || driver.driver_name || '';
    }
  }

  console.log("🔄 Normalized work plan:", {
    id: plan.id,
    name: plan.name,
    orders: orders,
    driver_id: driverId,
    driver_name: driverName
  });

  return {
    id: plan.id,
    name: plan.name || "",
    company_id: companyId,
    company_name: companyName,
    date: date,
    driver_id: driverId,
    driver_name: driverName,
    orders: orders.length > 0 ? orders : (plan.orders || plan.order_items || []),
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    deleted_at: plan.deleted_at,
    workplanorder: plan.workplanorder || [],
  };
};



  const fetchWorkPlans = async ({ page = 1, perPage = 10, drivers = [] } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getWorkPlans({ page, perPage });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      workPlans.value = data.map(plan => normalizeWorkPlan(plan, drivers));

      // Update pagination metadata from response
      if (response.data.meta) {
        workPlansPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      console.log("✅ Fetched work plans:", workPlans.value);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch work plans";
      console.error("Error fetching work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedWorkPlans = async ({ page = 1, perPage = 10, drivers = [] } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedWorkPlans({ page, perPage });
      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      trashedWorkPlans.value = data.map(plan => normalizeWorkPlan(plan, drivers));

      // Update pagination metadata from response
      if (response.data.meta) {
        trashedPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed work plans";
      console.error("Error fetching trashed work plans:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const addWorkPlan = async (workPlanData, drivers = []) => {
    loading.value = true;
    error.value = null;
    
    console.log("🚀 Adding work plan - payload:", workPlanData);
    
    try {
      const response = await apiServices.createWorkPlan(workPlanData);
      const newPlan = normalizeWorkPlan(response.data.data || response.data, drivers);
      
      workPlans.value.push(newPlan);
      console.log("✅ Work plan added:", newPlan);
      return newPlan;
    } catch (err) {
      error.value = err.message || "Failed to add work plan";
      console.error("Error adding work plan:", err);
      
      if (err.response) {
        console.error("📋 Server Response Status:", err.response.status);
        console.error("📋 Server Response Data:", err.response.data);
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateWorkPlan = async (planId, workPlanData, drivers = []) => {
    loading.value = true;
    error.value = null;
    
    console.log("🔄 Updating work plan:", planId);
    console.log("📤 Update payload:", workPlanData);
    
    try {
      const response = await apiServices.updateWorkPlan(planId, workPlanData);
      console.log("✅ Update response from API:", response.data);
      
      const updated = normalizeWorkPlan(response.data.data || response.data, drivers);
      
      const index = workPlans.value.findIndex((p) => p.id === planId);
      if (index > -1) {
        workPlans.value[index] = updated;
        console.log("✅ Work plan updated in store:", workPlans.value[index]);
      }
      
      return workPlans.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update work plan";
      console.error("❌ Error updating work plan:", err);
      
      if (err.response) {
        console.error("📋 Server Response Status:", err.response.status);
        console.error("📋 Server Response Data:", err.response.data);
      }
      
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
    workPlansPagination,
    trashedPagination,
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