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
        username: driver.user?.username || driver.user?.same17 || "",
        email: driver.user?.email || "",
        phone_number: driver.user?.phone_number || "",
        role: driver.user?.role || "Driver",
        region_id: driver.user?.region_id || null,
        status: driver.status || "available",
        type: driver.type || "delivery driver",
        branch_id: driver.branch_id,
        branch_name: `Branch ${driver.branch_id}`,
        vehicle_number: driver.vehicle_number || "",
        company_id: driver.company_id,
        company_name: `Company ${driver.company_id}`,
        location: driver.location,
        latitude: driver.latitude,
        longitude: driver.longitude,
        image: driver.user?.image || "path/test",
        created_by: driver.created_by,
        created_at: driver.created_at,
        updated_at: driver.updated_at,
      }));

      console.log(`✅ Successfully loaded ${drivers.value.length} drivers`);
      return response.data;
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
      if (!driverData.company_name) {
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
        email: driverData.email || "",
        password: driverData.password,
        phone_number: driverData.phone_number,
        role: "Driver",
        company_id: parseInt(driverData.company_name),
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

      console.log("📤 Sending driver data to API:", {
        ...apiData,
        password: "***" // Hide password in logs
      });

      const response = await apiServices.createDriver(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newDriver = {
        id: response.data.data.id,
        name: response.data.data.user?.name || "",
        username: response.data.data.user?.username || response.data.data.user?.same17 || "",
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
        location: response.data.data.location,
        latitude: response.data.data.latitude,
        longitude: response.data.data.longitude,
        image: response.data.data.user?.image || "path/test",
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      };

      drivers.value.push(newDriver);
      console.log("✅ Driver added successfully to store");
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
      // Validate company_id is required
      if (!driverData.company_name) {
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
        email: driverData.email || "",
        phone_number: driverData.phone_number,
        company_id: parseInt(driverData.company_name),
        branch_id: parseInt(driverData.branch_name),
        status: driverData.status,
        type: driverData.type,
        vehicle_number: driverData.vehicle_number,
      };

      // Only include password if it's provided
      if (driverData.password && driverData.password.trim() !== "") {
        apiData.password = driverData.password;
      }

      // Only include image if it's provided
      if (driverData.imagePreview) {
        apiData.image = driverData.imagePreview;
      }

      console.log(" Updating driver:", {
        ...apiData,
        password: apiData.password ? "***" : undefined
      });

      const response = await apiServices.updateDriver(driverId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = drivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        drivers.value[index] = {
          id: response.data.data.id,
          name: response.data.data.user?.name || driverData.name,
          username: response.data.data.user?.username || response.data.data.user?.same17 || driverData.username,
          email: response.data.data.user?.email || driverData.email,
          phone_number: response.data.data.user?.phone_number || driverData.phone_number,
          role: "Driver",
          status: response.data.data.status,
          type: response.data.data.type,
          branch_id: response.data.data.branch_id,
          branch_name: `Branch ${response.data.data.branch_id}`,
          vehicle_number: response.data.data.vehicle_number,
          company_id: response.data.data.company_id,
          company_name: `Company ${response.data.data.company_id}`,
          location: response.data.data.location,
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude,
          image: response.data.data.user?.image || driverData.imagePreview,
          updated_at: response.data.data.updated_at,
        };
        console.log("✅ Driver updated successfully");
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







  const deleteDriver = async (driverId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteDriver(driverId);

      const index = drivers.value.findIndex((d) => d.id === driverId);
      if (index > -1) {
        const driver = drivers.value.splice(index, 1)[0];
        trashedDrivers.value.push(driver);
      }
    } catch (err) {
      error.value = err.message || "Failed to delete driver";
      console.error("❌ Error deleting driver:", err);
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