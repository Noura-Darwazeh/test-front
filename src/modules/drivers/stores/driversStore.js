import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useDriverStore = defineStore("driver", () => {
  // State
  const drivers = ref([]);
  const trashedDrivers = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const driversPagination = ref({
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
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return { id: fallbackId, name: fallbackName };
      const asNumber = Number(trimmed);
      if (!Number.isNaN(asNumber)) {
        return { id: trimmed, name: fallbackName };
      }
      return { id: fallbackId, name: trimmed };
    }
    return { id: value, name: fallbackName };
  };

  const normalizeDriver = (driver) => {
    const companyInfo = extractIdName(driver.company ?? driver.company_id);
    const branchInfo = extractIdName(driver.branch ?? driver.branch_id);
    const companyId = companyInfo.id;
    const branchId = branchInfo.id;

    return {
      id: driver.id,
      name: driver.user?.name || driver.name || "",
      username:
        driver.user?.username || driver.user?.same17 || driver.username || "",
      email: driver.user?.email || driver.email || "",
      phone_number: driver.user?.phone_number || driver.phone_number || "",
      role: driver.user?.role || driver.role || "Driver",
      region_id: driver.user?.region_id ?? driver.region_id ?? null,
      status: driver.status || "available",
      type: driver.type || "delivery driver",
      branch_id: branchId ?? null,
      branch_name:
        driver.branch?.name ||
        driver.branch_name ||
        branchInfo.name ||
        (branchId ? `Branch ${branchId}` : ""),
      vehicle_number: driver.vehicle_number || "",
      company_id: companyId ?? null,
      company_name:
        driver.company?.name ||
        driver.company_name ||
        companyInfo.name ||
        (companyId ? `Company ${companyId}` : ""),
      location: driver.location,
      latitude: driver.latitude,
      longitude: driver.longitude,
      image: driver.user?.image || driver.image || "path/test",
      created_by: driver.created_by,
      created_at: driver.created_at,
      updated_at: driver.updated_at,
      is_active: driver.is_active ?? 1,
    };
  };

  // Getters
  const activeDrivers = computed(() =>
    drivers.value.filter((driver) => driver.status === "available")
  );

  const busyDrivers = computed(() =>
    drivers.value.filter((driver) => driver.status === "busy")
  );

  const offlineDrivers = computed(() =>
    drivers.value.filter((driver) => driver.status === "offline")
  );

  // Actions
  const fetchDrivers = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getDrivers({ page, perPage, filters });

      // Transform API response to match frontend format
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      drivers.value = list.map(normalizeDriver);

      // Update pagination metadata from response
      if (payload?.meta) {
        driversPagination.value = {
          currentPage: payload.meta.current_page,
          perPage: payload.meta.per_page,
          total: payload.meta.total,
          lastPage: payload.meta.last_page,
        };
      }

      return payload;
    } catch (err) {
      error.value = err.message || "Failed to fetch drivers";
      console.error("❌ Error fetching drivers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addDriver = async (driverData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate company_id is required
      if (!driverData.company_id) {
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
        name: driverData.name,
        username: driverData.username,
        password: driverData.password,
        phone_number: driverData.phone_number,
        role: "Driver",
        company_id: parseInt(driverData.company_id),
        language: "english",
        shared_line: 0,
        branch_id: parseInt(driverData.branch_id),
        status: driverData.status || "available",
        type: driverData.type,
        vehicle_number: driverData.vehicle_number,
        latitude: driverData.latitude || 32.0,
        longitude: driverData.longitude || 35.0,
        image: driverData.image && driverData.image instanceof File ? driverData.image : null,
      };

      const emailValue = typeof driverData.email === "string"
        ? driverData.email.trim()
        : driverData.email;
      if (emailValue) {
        apiData.email = emailValue;
      }

      const response = await apiServices.createDriver(apiData);


      // Transform response to match frontend format
      const newDriver = normalizeDriver(response.data.data);

      drivers.value.push(newDriver);
      return newDriver;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add driver";
        console.error("❌ Error adding driver:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDriver = async (driverId, driverData) => {
  loading.value = true;
  error.value = null;
  try {
    // Transform frontend data to API format - ONLY send provided fields
    const apiData = {};

    // Add only provided fields
    if (driverData.name) apiData.name = driverData.name;
    if (driverData.username) apiData.username = driverData.username;
    if (driverData.email !== undefined && driverData.email !== null) {
      const emailValue = typeof driverData.email === "string"
        ? driverData.email.trim()
        : driverData.email;
      if (emailValue !== "") {
        apiData.email = emailValue;
      }
    }
    if (driverData.phone_number) apiData.phone_number = driverData.phone_number;
    if (driverData.status) apiData.status = driverData.status;
    if (driverData.type) apiData.type = driverData.type;
    if (driverData.vehicle_number) apiData.vehicle_number = driverData.vehicle_number;
    
    if (driverData.company_id) {
      apiData.company_id = parseInt(driverData.company_id);
    }
    if (driverData.branch_id) {
      apiData.branch_id = parseInt(driverData.branch_id);
    }

    // Only include password if it's provided
    if (driverData.password && driverData.password.trim() !== "") {
      apiData.password = driverData.password;
    }

    // Only include image if it's provided
    if (driverData.image && driverData.image instanceof File) {
      apiData.image = driverData.image;
    }

    const response = await apiServices.updateDriver(driverId, apiData);


    // Update local state with response data
    const index = drivers.value.findIndex((d) => d.id === driverId);
    if (index > -1) {
      drivers.value[index] = normalizeDriver({
        ...drivers.value[index],
        ...response.data.data,
      });
    }
    return drivers.value[index];
  } catch (err) {
    if (err.response?.data?.success === false) {
      error.value = err.response.data.error || err.response.data.message || "Validation failed";
    } else {
      error.value = err.message || "Failed to update driver";
    }
    console.error("❌ Error updating driver:", err);
    throw err;
  } finally {
    loading.value = false;
  }
};
  

  const deleteDriver = async (driverId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteDriver(driverId, force);

      if (force) {
        drivers.value = drivers.value.filter((driver) => driver.id !== driverId);
        trashedDrivers.value = trashedDrivers.value.filter(
          (driver) => driver.id !== driverId
        );
      } else {
        const index = drivers.value.findIndex((d) => d.id === driverId);
        if (index > -1) {
          const driver = drivers.value.splice(index, 1)[0];
          trashedDrivers.value.push(driver);
        }
      }
    } catch (err) {
      error.value = err.message || "Failed to delete driver";
      console.error("??O Error deleting driver:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedDrivers = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedDrivers({ page, perPage, filters });

      // Transform API response to match frontend format
      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      trashedDrivers.value = list.map(normalizeDriver);

      // Update pagination metadata from response
      if (payload?.meta) {
        trashedPagination.value = {
          currentPage: payload.meta.current_page,
          perPage: payload.meta.per_page,
          total: payload.meta.total,
          lastPage: payload.meta.last_page,
        };
      }

      return payload;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed drivers";
      console.error("❌ Error fetching trashed drivers:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const restoreDriver = async (driverId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreDriver(driverId);

      const index = trashedDrivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        const driver = trashedDrivers.value.splice(index, 1)[0];
        drivers.value.push(driver);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore driver";
      console.error("❌ Error restoring driver:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteDrivers = async (driverIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteDrivers(driverIds, force);

      if (force) {
        // Permanent delete - remove from trashedDrivers
        trashedDrivers.value = trashedDrivers.value.filter(
          (driver) => !driverIds.includes(driver.id)
        );
      } else {
        // Soft delete - move from drivers to trashedDrivers
        const deletedDrivers = drivers.value.filter((driver) =>
          driverIds.includes(driver.id)
        );
        drivers.value = drivers.value.filter(
          (driver) => !driverIds.includes(driver.id)
        );
        trashedDrivers.value.push(...deletedDrivers);
      }

    } catch (err) {
      error.value = err.message || "Failed to bulk delete drivers";
      console.error("❌ Error bulk deleting drivers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreDrivers = async (driverIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreDrivers(driverIds);

      // Move drivers from trashedDrivers to drivers
      const restoredDrivers = trashedDrivers.value.filter((driver) =>
        driverIds.includes(driver.id)
      );
      trashedDrivers.value = trashedDrivers.value.filter(
        (driver) => !driverIds.includes(driver.id)
      );
      drivers.value.push(...restoredDrivers);

    } catch (err) {
      error.value = err.message || "Failed to bulk restore drivers";
      console.error("❌ Error bulk restoring drivers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    drivers,
    trashedDrivers,
    loading,
    trashedLoading,
    error,
    driversPagination,
    trashedPagination,
    // Getters
    activeDrivers,
    busyDrivers,
    offlineDrivers,
    // Actions
    fetchDrivers,
    fetchTrashedDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    restoreDriver,
    bulkDeleteDrivers,
    bulkRestoreDrivers,
  };
});
