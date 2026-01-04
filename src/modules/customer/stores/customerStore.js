import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCustomerStore = defineStore("customer", () => {
  // State
  const customers = ref([]);
  const trashedCustomers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const customersByCompany = computed(() => {
    const grouped = {};
    customers.value.forEach((customer) => {
      const company = customer.company_name || "Unknown";
      if (!grouped[company]) {
        grouped[company] = [];
      }
      grouped[company].push(customer);
    });
    return grouped;
  });

  // Actions
  const fetchCustomers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCustomers();

      // Transform API response to match frontend format
      customers.value = response.data.data.map((customer) => ({
        id: customer.id,
        name: customer.name || "",
        phone_number: customer.phone_number || "",
        company_id: customer.company_id,
        company_name: `Company ${customer.company_id}`,
        location: customer.location 
          ? `${customer.location.coordinates[1]}, ${customer.location.coordinates[0]}` 
          : "",
        latitude: customer.latitude || null,
        longitude: customer.longitude || null,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        created_by: customer.created_by,
      }));

      console.log(`✅ Successfully loaded ${customers.value.length} customers`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch customers";
      console.error("❌ Error fetching customers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addCustomer = async (customerData) => {
    loading.value = true;
    error.value = null;
    try {
      // Validate company_id is required
      if (!customerData.company_name) {
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
        name: customerData.name,
        phone_number: customerData.phone_number,
        company_id: parseInt(customerData.company_name),
        latitude: customerData.latitude || 35.2545,
        longitude: customerData.longitude || 32.2654,
      };

      console.log("📤 Sending customer data to API:", apiData);

      const response = await apiServices.createCustomer(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newCustomer = {
        id: response.data.data.id,
        name: response.data.data.name || "",
        phone_number: response.data.data.phone_number || "",
        company_id: response.data.data.company_id,
        company_name: `Company ${response.data.data.company_id}`,
        location: response.data.data.location 
          ? `${response.data.data.location.coordinates[1]}, ${response.data.data.location.coordinates[0]}` 
          : "",
        latitude: response.data.data.latitude,
        longitude: response.data.data.longitude,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
      };

      customers.value.push(newCustomer);
      console.log("✅ Customer added successfully to store");
      return newCustomer;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add customer";
        console.error("❌ Error adding customer:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCustomer = async (customerId, customerData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (customerData.name) apiData.name = customerData.name;
      if (customerData.phone_number) apiData.phone_number = customerData.phone_number;
      
      if (customerData.company_name) {
        apiData.company_id = parseInt(customerData.company_name);
      }

      if (customerData.latitude !== undefined) apiData.latitude = customerData.latitude;
      if (customerData.longitude !== undefined) apiData.longitude = customerData.longitude;

      console.log("📤 Updating customer:", apiData);

      const response = await apiServices.updateCustomer(customerId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = customers.value.findIndex((c) => c.id === customerId);
      if (index > -1) {
        customers.value[index] = {
          id: response.data.data.id,
          name: response.data.data.name || customers.value[index].name,
          phone_number: response.data.data.phone_number || customers.value[index].phone_number,
          company_id: response.data.data.company_id,
          company_name: `Company ${response.data.data.company_id}`,
          location: response.data.data.location 
            ? `${response.data.data.location.coordinates[1]}, ${response.data.data.location.coordinates[0]}` 
            : customers.value[index].location,
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude,
          updated_at: response.data.data.updated_at,
        };
        console.log("✅ Customer updated successfully");
      }
      return customers.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update customer";
      }
      console.error("❌ Error updating customer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCustomer = async (customerId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteCustomer(customerId);

      const index = customers.value.findIndex((c) => c.id === customerId);
      if (index > -1) {
        const customer = customers.value.splice(index, 1)[0];
        trashedCustomers.value.push(customer);
      }
      console.log("✅ Customer deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete customer";
      console.error("❌ Error deleting customer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const restoreCustomer = async (customerId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreCustomer(customerId);

      const index = trashedCustomers.value.findIndex((c) => c.id === customerId);
      if (index > -1) {
        const customer = trashedCustomers.value.splice(index, 1)[0];
        customers.value.push(customer);
      }
      console.log("✅ Customer restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore customer";
      console.error("❌ Error restoring customer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    customers,
    trashedCustomers,
    loading,
    error,
    // Getters
    customersByCompany,
    // Actions
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
  };
});