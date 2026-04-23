import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useWorkPlansStore = defineStore("workPlans", () => {
  const workPlans = ref([]);
  const calendarWorkPlans = ref([]);
  const workPlansDone = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Pagination state
  const workPlansPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });
  
  const workPlansDonePagination = ref({
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

    if (plan.workplanorder && Array.isArray(plan.workplanorder)) {
      orders = plan.workplanorder.map(workplanOrder => {
        const orderItemId = workplanOrder.order_item?.id || workplanOrder.order_item_id;
        const orderItemName = workplanOrder.order_item?.name || `Order Item #${orderItemId}`;

        const orderCode = orderItemName.split(' - ')[0].trim();

        return {
          id: workplanOrder.id,
          order_item_id: orderItemId,
          order: orderCode,
          items: orderItemId
        };
      });

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

    if (!driverName && driverId && allDrivers.length > 0) {
      const driver = allDrivers.find(d => d.id === driverId);
      if (driver) {
        driverName = driver.name || driver.driver_name || '';
      }
    }

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

      if (response.data.meta) {
        workPlansPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      return response.data;












    } catch (err) {
      error.value = err.message || "Failed to fetch work plans";
      console.error("Error fetching work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Loads every page from the API so calendar (and filters) see all plans, not just one page. */
  const fetchAllWorkPlans = async ({ drivers = [], perPage = 100 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      let page = 1;
      let lastPage = 1;
      const allRaw = [];

      do {
        const response = await apiServices.getWorkPlans({ page, perPage, cancelKey: `work_plans:all:page:${page}` });
        const chunk = Array.isArray(response.data.data) ? response.data.data : [];
        allRaw.push(...chunk);
        lastPage = response.data.meta?.last_page ?? 1;
        page += 1;
      } while (page <= lastPage);

      workPlans.value = allRaw.map((plan) => normalizeWorkPlan(plan, drivers));

      workPlansPagination.value = {
        currentPage: 1,
        perPage,
        total: allRaw.length,
        lastPage: lastPage || 1,
      };

      return { data: workPlans.value };
    } catch (err) {
      error.value = err.message || "Failed to fetch work plans";
      console.error("Error fetching all work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchWorkPlansCalendar = async ({ drivers = [] } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getWorkPlansCalendar();
      // The API returns { date, success, workplans: { data: [...] } }
      const rawData = response.data.workplans?.data || [];
      
      // Normalize each plan from the calendar API
      calendarWorkPlans.value = rawData.map(plan => normalizeWorkPlan(plan, drivers));
      
      return calendarWorkPlans.value;
    } catch (err) {
      error.value = err.message || "Failed to fetch calendar work plans";
      console.error("Error fetching calendar work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchWorkPlansDone = async ({ page = 1, perPage = 10, drivers = [] } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getWorkPlansDone({ page, perPage });
      // The API returns { success: true, workplans: { data: [...], meta: {...} } }
      const workplansData = response.data.workplans || {};
      const rawData = workplansData.data || [];
      
      workPlansDone.value = rawData.map(plan => normalizeWorkPlan(plan, drivers));
      
      if (workplansData.meta) {
        workPlansDonePagination.value = {
          currentPage: workplansData.meta.current_page,
          perPage: workplansData.meta.per_page,
          total: workplansData.meta.total,
          lastPage: workplansData.meta.last_page,
        };
      }
      
      return workPlansDone.value;
    } catch (err) {
      error.value = err.message || "Failed to fetch done work plans";
      console.error("Error fetching done work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addWorkPlan = async (workPlanData, drivers = []) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiServices.createWorkPlan(workPlanData);
      const newPlan = normalizeWorkPlan(response.data.data || response.data, drivers);

      workPlans.value.push(newPlan);
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

    try {
      const response = await apiServices.updateWorkPlan(planId, workPlanData);

      const updated = normalizeWorkPlan(response.data.data || response.data, drivers);

      const index = workPlans.value.findIndex((p) => p.id === planId);
      if (index > -1) {
        workPlans.value[index] = updated;
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

  const deleteWorkPlan = async (planId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteWorkPlan(planId, true);
      workPlans.value = workPlans.value.filter((plan) => plan.id !== planId);
    } catch (err) {
      error.value = err.message || "Failed to delete work plan";
      console.error("Error deleting work plan:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteWorkPlans = async (planIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteWorkPlans(planIds, true);
      workPlans.value = workPlans.value.filter(
        (plan) => !planIds.includes(plan.id)
      );
    } catch (err) {
      error.value = err.message || "Failed to bulk delete work plans";
      console.error("Error bulk deleting work plans:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    workPlans,
    calendarWorkPlans,
    workPlansDone,
    loading,
    error,
    workPlansPagination,
    workPlansDonePagination,
    // Actions
    fetchWorkPlans,
    fetchAllWorkPlans,
    fetchWorkPlansCalendar,
    fetchWorkPlansDone,
    addWorkPlan,
    updateWorkPlan,
    deleteWorkPlan,
    bulkDeleteWorkPlans,
  };
});