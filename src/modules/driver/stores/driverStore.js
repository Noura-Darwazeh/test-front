import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useDriverStore = defineStore("driver", () => {
  // State
  const drivers = ref([]);
  const trashedDrivers = ref([]);
  const loading = ref(false);
  const error = ref(null);

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
  const fetchDrivers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getDrivers();

      // Transform API response to match frontend format
      drivers.value = response.data.data.map((driver) => ({
        id: driver.id,
        name: driver.user?.name || "",
        username: driver.user?.username || "",
        email: driver.user?.email || "",
        phone_number: driver.user?.phone_number || "",
        role: driver.user?.role || "Driver",
        region_id: driver.user?.region_id || null,
        status: driver.status || "available",
        type: driver.type || "delivery driver",
        branch_id: driver.branch_id,
        branch_name: `Branch ${driver.branch_id}`, // You may need to fetch branch details separately
        vehicle_number: driver.vehicle_number || "",
        company_id: driver.company_id,
        company_name: `Company ${driver.company_id}`, // You may need to fetch company details separately
        location: driver.location,
        latitude: driver.latitude,
        longitude: driver.longitude,
        image: driver.user?.image || "path/test",
        created_by: driver.created_by,
        created_at: driver.created_at,
        updated_at: driver.updated_at,
      }));

      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch drivers";
      console.error("Error fetching drivers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addDriver = async (driverData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format
      const apiData = {
        name: driverData.name,
        username: driverData.username,
        email: driverData.email || "",
        password: driverData.password,
        phone_number: driverData.phone_number,
        role: "Driver",
        company_id: parseInt(driverData.company_name) || null,
        language: "english",
        shared_line: 0,
        branch_id: parseInt(driverData.branch_name),
        status: driverData.status || "available",
        type: driverData.type,
        vehicle_number: driverData.vehicle_number,
        latitude: driverData.latitude || 32.0,
        longitude: driverData.longitude || 35.0,
        image: driverData.imagePreview || null,
      };

      const response = await apiServices.createDriver(apiData);

      // Transform response to match frontend format
      const newDriver = {
        id: response.data.data.id,
        name: response.data.data.user?.name || "",
        username: response.data.data.user?.username || "",
        email: response.data.data.user?.email || "",
        phone_number: response.data.data.user?.phone_number || "",
        role: "Driver",
        status: response.data.data.status,
        type: response.data.data.type,
        branch_id: response.data.data.branch_id,
        branch_name: `Branch ${response.data.data.branch_id}`,
        vehicle_number: response.data.data.vehicle_number,
        company_id: response.data.data.company_id,
        company_name: `Company ${response.data.data.company_id}`,
        image: response.data.data.user?.image || "path/test",
      };

      drivers.value.push(newDriver);
      return newDriver;
    } catch (err) {
      error.value = err.message || "Failed to add driver";
      console.error("Error adding driver:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDriver = async (driverId, driverData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format
      const apiData = {
        name: driverData.name,
        username: driverData.username,
        email: driverData.email || "",
        phone_number: driverData.phone_number,
        company_id: parseInt(driverData.company_name) || null,
        branch_id: parseInt(driverData.branch_name),
        status: driverData.status,
        type: driverData.type,
        vehicle_number: driverData.vehicle_number,
        image: driverData.imagePreview || null,
      };

      // Only include password if it's provided
      if (driverData.password && driverData.password.trim() !== "") {
        apiData.password = driverData.password;
      }

      const response = await apiServices.updateDriver(driverId, apiData);

      // Update local state
      const index = drivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        drivers.value[index] = {
          ...drivers.value[index],
          name: response.data.data.user?.name || driverData.name,
          username: response.data.data.user?.username || driverData.username,
          email: response.data.data.user?.email || driverData.email,
          phone_number:
            response.data.data.user?.phone_number || driverData.phone_number,
          status: response.data.data.status,
          type: response.data.data.type,
          branch_id: response.data.data.branch_id,
          branch_name: `Branch ${response.data.data.branch_id}`,
          vehicle_number: response.data.data.vehicle_number,
          company_id: response.data.data.company_id,
          company_name: `Company ${response.data.data.company_id}`,
          image: response.data.data.user?.image || driverData.imagePreview,
        };
      }
      return drivers.value[index];
    } catch (err) {
      error.value = err.message || "Failed to update driver";
      console.error("Error updating driver:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDriver = async (driverId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteDriver(driverId);

      // Move to trashed
      const index = drivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        const driver = drivers.value.splice(index, 1)[0];
        trashedDrivers.value.push(driver);
      }
    } catch (err) {
      error.value = err.message || "Failed to delete driver";
      console.error("Error deleting driver:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreDriver = async (driverId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreDriver(driverId);

      // Restore to active drivers
      const index = trashedDrivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        const driver = trashedDrivers.value.splice(index, 1)[0];
        drivers.value.push(driver);
      }
    } catch (err) {
      error.value = err.message || "Failed to restore driver";
      console.error("Error restoring driver:", err);
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
    error,
    // Getters
    activeDrivers,
    busyDrivers,
    offlineDrivers,
    // Actions
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    restoreDriver,
  };
});