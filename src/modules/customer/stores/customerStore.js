import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCustomerStore = defineStore("customer", () => {
  // State
  const customers = ref([]);
  const trashedCustomers = ref([]);
  const loading = ref(false);
  const trashedLoading = ref(false);
  const error = ref(null);

  // Pagination state
  const customersPagination = ref({
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

  const formatLocation = (location) => {
    if (!location) return "";
    if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return "";
  };

  const normalizeCustomer = (customer) => {
    const companyInfo = extractIdName(customer.company ?? customer.company_id);
    const companyId = companyInfo.id;
    const companyName =
      customer.company_name ||
      companyInfo.name ||
      (companyId ? `Company ${companyId}` : "");

    return {
      id: customer.id,
      name: customer.name || "",
      phone_number: customer.phone_number || "",
      company_id: companyId,
      company_name: companyName,
      location: formatLocation(customer.location),
      latitude: customer.latitude || null,
      longitude: customer.longitude || null,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
      created_by: customer.created_by,
    };
  };

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
  const fetchCustomers = async ({ page = 1, perPage = 10 } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCustomers({ page, perPage });

      // Transform API response to match frontend format
      customers.value = response.data.data.map(normalizeCustomer);

      // Update pagination metadata from response
      if (response.data.meta) {
        customersPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

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
      const newCustomer = normalizeCustomer(response.data.data);

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
        customers.value[index] = normalizeCustomer({
          ...customers.value[index],
          ...response.data.data,
        });
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

  const deleteCustomer = async (customerId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteCustomer(customerId, force);

      if (force) {
        customers.value = customers.value.filter((c) => c.id !== customerId);
        trashedCustomers.value = trashedCustomers.value.filter(
          (c) => c.id !== customerId
        );
      } else {
        const index = customers.value.findIndex((c) => c.id === customerId);
        if (index > -1) {
          const customer = customers.value.splice(index, 1)[0];
          trashedCustomers.value.push(customer);
        }
      }
      console.log("? Customer deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete customer";
      console.error("? Error deleting customer:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedCustomers = async ({ page = 1, perPage = 10 } = {}) => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedCustomers({ page, perPage });

      // Transform API response to match frontend format
      trashedCustomers.value = response.data.data.map(normalizeCustomer);

      // Update pagination metadata from response
      if (response.data.meta) {
        trashedPagination.value = {
          currentPage: response.data.meta.current_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
          lastPage: response.data.meta.last_page,
        };
      }

      console.log(`✅ Successfully loaded ${trashedCustomers.value.length} trashed customers`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed customers";
      console.error("❌ Error fetching trashed customers:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
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

  const bulkDeleteCustomers = async (customerIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteCustomers(customerIds, force);

      if (force) {
        // Permanent delete - remove from trashedCustomers
        trashedCustomers.value = trashedCustomers.value.filter(
          (customer) => !customerIds.includes(customer.id)
        );
      } else {
        // Soft delete - move from customers to trashedCustomers
        const deletedCustomers = customers.value.filter((customer) =>
          customerIds.includes(customer.id)
        );
        customers.value = customers.value.filter(
          (customer) => !customerIds.includes(customer.id)
        );
        trashedCustomers.value.push(...deletedCustomers);
      }

      console.log(`✅ Successfully bulk deleted ${customerIds.length} customers`);
    } catch (err) {
      error.value = err.message || "Failed to bulk delete customers";
      console.error("❌ Error bulk deleting customers:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreCustomers = async (customerIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreCustomers(customerIds);

      // Move customers from trashedCustomers to customers
      const restoredCustomers = trashedCustomers.value.filter((customer) =>
        customerIds.includes(customer.id)
      );
      trashedCustomers.value = trashedCustomers.value.filter(
        (customer) => !customerIds.includes(customer.id)
      );
      customers.value.push(...restoredCustomers);

      console.log(`✅ Successfully bulk restored ${customerIds.length} customers`);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore customers";
      console.error("❌ Error bulk restoring customers:", err);
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
    trashedLoading,
    error,
    customersPagination,
    trashedPagination,
    // Getters
    customersByCompany,
    // Actions
    fetchCustomers,
    fetchTrashedCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    bulkDeleteCustomers,
    bulkRestoreCustomers,
  };
});
