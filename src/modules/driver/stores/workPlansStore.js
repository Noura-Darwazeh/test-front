import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useWorkPlansStore = defineStore("workPlans", () => {
  const workPlans = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const workPlansPagination = ref({
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

  const fetchWorkPlans = async ({
    page = 1,
    perPage = 10,
    drivers = [],
    driverId = null,
    driverName = null,
  } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      let allPlans = [];
      let meta = null;

      // If we're filtering by a driver, we need to fetch all pages first
      // because the backend endpoint doesn't accept driverId filters here.
      if (driverId) {
        const requestPerPage = 100;
        let currentPage = 1;
        let lastPage = 1;

        while (currentPage <= lastPage) {
          const resp = await apiServices.getWorkPlans({
            page: currentPage,
            perPage: requestPerPage,
          });

          const chunk = Array.isArray(resp.data?.data) ? resp.data.data : [];
          allPlans.push(...chunk);

          meta = resp.data?.meta ?? meta;
          lastPage = meta?.last_page ?? currentPage;
          currentPage += 1;

          // Safety break if meta is missing/invalid
          if (!Number.isFinite(lastPage) || lastPage < 1) break;
        }
      } else {
        const response = await apiServices.getWorkPlans({ page, perPage });
        meta = response.data?.meta ?? null;
        allPlans = Array.isArray(response.data?.data) ? response.data.data : [];
      }

      let normalized = allPlans.map((plan) => normalizeWorkPlan(plan, drivers));

      // فلتر بس الوورك بلانز الخاصة بالدرايفر الحالي
      if (driverId || driverName) {
        const normalizedDriverName =
          driverName !== null && driverName !== undefined
            ? String(driverName).trim().toLowerCase()
            : "";
        normalized = normalized.filter(plan => {
          if (!plan.workplanorder) return false;
          return plan.workplanorder.some(wo =>
            Array.isArray(wo.steps) &&
            wo.steps.some(step => {
              const idMatch =
                driverId !== null &&
                driverId !== undefined &&
                String(step.driver_id) === String(driverId);
              const nameMatch =
                normalizedDriverName &&
                String(step.driver_name || "")
                  .trim()
                  .toLowerCase() === normalizedDriverName;
              return idMatch || nameMatch;
            })
          );
        });
      }

      workPlans.value = normalized;

      if (driverId) {
        const total = normalized.length;
        workPlansPagination.value = {
          currentPage: page,
          perPage: perPage,
          total,
          lastPage: Math.max(1, Math.ceil(total / Math.max(1, perPage))),
        };
      } else if (meta) {
        workPlansPagination.value = {
          currentPage: meta.current_page,
          perPage: meta.per_page,
          total: meta.total,
          lastPage: meta.last_page,
        };
      }

      return { data: normalized, meta: workPlansPagination.value };
    } catch (err) {
      error.value = err.message || "Failed to fetch work plans";
      console.error("Error fetching work plans:", err);
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
    workPlans,
    loading,
    error,
    workPlansPagination,
    fetchWorkPlans,
    addWorkPlan,
    updateWorkPlan,
    deleteWorkPlan,
    bulkDeleteWorkPlans,
  };
});