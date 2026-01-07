import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiServices from "@/services/apiServices.js";

export const useOrdersStore = defineStore("orders", () => {
  // State
  const orders = ref([]);
  const trashedOrders = ref([]);
  const statistics = ref({
    total_orders: 0,
    total_profit: 0,
    orders_by_status: [],
    today: { orders: 0 },
    month: { orders: 0 },
    year: { orders: 0 },
  });
  const loading = ref(false);
  const trashedLoading = ref(false);
  const statisticsLoading = ref(false);
  const error = ref(null);

  // Getters
  const ordersByStatus = computed(() => {
    const grouped = {};
    orders.value.forEach((order) => {
      const status = order.status || "unknown";
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(order);
    });
    return grouped;
  });

  const ordersByCustomer = computed(() => {
    const grouped = {};
    orders.value.forEach((order) => {
      const customerName = order.customer?.name || "Unknown";
      if (!grouped[customerName]) {
        grouped[customerName] = [];
      }
      grouped[customerName].push(order);
    });
    return grouped;
  });

  // Helper function to transform order from API format to frontend format
  const transformOrder = (order) => ({
    id: order.id,
    from_company_id: order.from_company_id,
    is_extra_price_for_customer: order.is_extra_price_for_customer,
    customer_id: order.customer?.id || null,
    customer_name: order.customer?.name || "",
    company_id: order.company?.id || null,
    company_name: order.company?.name || "",
    price: order.price,
    total_price: order.total_price,
    currency_id: order.currency?.id || null,
    currency_symbol: order.currency?.symbol || "",
    case: order.case,
    type: order.type,
    package: order.package,
    lineprice_id: order.line_price?.id || null,
    lineprice_name: order.line_price?.name || "",
    lineprice_price: order.line_price?.price || "",
    discount: order.discount,
    created_by: order.created_by,
    created_at: order.created_at,
    updated_at: order.updated_at,
    order_code: order.order_code,
    status: order.status,
    order_items: order.order_items || [],
  });

  // Actions
  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getOrders();

      // Transform API response to match frontend format
      orders.value = response.data.data.map(transformOrder);

      console.log(`✅ Successfully loaded ${orders.value.length} orders`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch orders";
      console.error("❌ Error fetching orders:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOrderById = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getOrderById(orderId);

      // Transform single order from API format
      const transformedOrder = transformOrder(response.data.data);

      console.log(`✅ Successfully loaded order ${orderId}`);
      return transformedOrder;
    } catch (err) {
      error.value = err.message || "Failed to fetch order";
      console.error("❌ Error fetching order:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addOrder = async (orderData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - matching backend requirements
      const apiData = {
        from_company_id: orderData.from_company_id,
        to_id: orderData.to_id,
        price: orderData.price,
        currency_id: orderData.currency_id,
        lineprice_id: orderData.lineprice_id,
        discount_id: orderData.discount_id || null,
        company_item_price_id: orderData.company_item_price_id,
        case: orderData.case,
        type: orderData.type,
        package: orderData.package,
        parent_order_id: orderData.parent_order_id || null,
        company_id: orderData.company_id,
        is_delivery_price_from_customer: orderData.is_delivery_price_from_customer || 0,
        order_items: orderData.order_items || [],
      };

      console.log("📤 Sending order data to API:", apiData);

      const response = await apiServices.createOrder(apiData);

      console.log("✅ API Response:", response.data);

      // Transform response to match frontend format
      const newOrder = {
        id: response.data.data.id,
        from_company_id: response.data.data.from_company_id,
        is_extra_price_for_customer: response.data.data.is_extra_price_for_customer,
        customer_id: response.data.data.customer?.id || null,
        customer_name: response.data.data.customer?.name || "",
        company_id: response.data.data.company?.id || null,
        company_name: response.data.data.company?.name || "",
        price: response.data.data.price,
        total_price: response.data.data.total_price,
        currency_id: response.data.data.currency?.id || null,
        currency_symbol: response.data.data.currency?.symbol || "",
        case: response.data.data.case,
        type: response.data.data.type,
        package: response.data.data.package,
        lineprice_id: response.data.data.line_price?.id || null,
        lineprice_name: response.data.data.line_price?.name || "",
        lineprice_price: response.data.data.line_price?.price || "",
        discount: response.data.data.discount,
        created_by: response.data.data.created_by,
        created_at: response.data.data.created_at,
        updated_at: response.data.data.updated_at,
        order_code: response.data.data.order_code,
        status: response.data.data.status,
        order_items: response.data.data.order_items || [],
      };

      orders.value.push(newOrder);
      console.log("✅ Order added successfully to store");
      return newOrder;
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
        console.error("❌ Validation error:", error.value);
      } else {
        error.value = err.message || "Failed to add order";
        console.error("❌ Error adding order:", error.value);
      }

      console.error("Error details:", err.response?.data || err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform frontend data to API format - ONLY send provided fields
      const apiData = {};

      if (orderData.from_company_id !== undefined) apiData.from_company_id = orderData.from_company_id;
      if (orderData.customer_id !== undefined) apiData.customer_id = orderData.customer_id;
      if (orderData.price !== undefined) apiData.price = orderData.price;
      if (orderData.currency_id !== undefined) apiData.currency_id = orderData.currency_id;
      if (orderData.lineprice_id !== undefined) apiData.lineprice_id = orderData.lineprice_id;
      if (orderData.discount_id !== undefined) apiData.discount_id = orderData.discount_id;
      if (orderData.type !== undefined) apiData.type = orderData.type;
      if (orderData.package !== undefined) apiData.package = orderData.package;
      if (orderData.case !== undefined) apiData.case = orderData.case;
      if (orderData.is_extra_price_for_customer !== undefined) {
        apiData.is_extra_price_for_customer = orderData.is_extra_price_for_customer;
      }
      if (orderData.order_items !== undefined) apiData.order_items = orderData.order_items;

      console.log("📤 Updating order:", apiData);

      const response = await apiServices.updateOrder(orderId, apiData);

      console.log("✅ API Response:", response.data);

      // Update local state with response data
      const index = orders.value.findIndex((o) => o.id === orderId);
      if (index > -1) {
        orders.value[index] = {
          id: response.data.data.id,
          from_company_id: response.data.data.from_company_id,
          is_extra_price_for_customer: response.data.data.is_extra_price_for_customer,
          customer_id: response.data.data.customer?.id || orders.value[index].customer_id,
          customer_name: response.data.data.customer?.name || orders.value[index].customer_name,
          company_id: response.data.data.company?.id || orders.value[index].company_id,
          company_name: response.data.data.company?.name || orders.value[index].company_name,
          price: response.data.data.price,
          total_price: response.data.data.total_price,
          currency_id: response.data.data.currency?.id || orders.value[index].currency_id,
          currency_symbol: response.data.data.currency?.symbol || orders.value[index].currency_symbol,
          case: response.data.data.case,
          type: response.data.data.type,
          package: response.data.data.package,
          lineprice_id: response.data.data.line_price?.id || orders.value[index].lineprice_id,
          lineprice_name: response.data.data.line_price?.name || orders.value[index].lineprice_name,
          lineprice_price: response.data.data.line_price?.price || orders.value[index].lineprice_price,
          discount: response.data.data.discount,
          created_by: response.data.data.created_by,
          created_at: response.data.data.created_at,
          updated_at: response.data.data.updated_at,
          order_code: response.data.data.order_code,
          status: response.data.data.status,
          order_items: response.data.data.order_items || orders.value[index].order_items,
        };
        console.log("✅ Order updated successfully");
      }
      return orders.value[index];
    } catch (err) {
      if (err.response?.data?.success === false) {
        error.value = err.response.data.error || err.response.data.message || "Validation failed";
      } else {
        error.value = err.message || "Failed to update order";
      }
      console.error("❌ Error updating order:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteOrder(orderId);

      const index = orders.value.findIndex((o) => o.id === orderId);
      if (index > -1) {
        const order = orders.value.splice(index, 1)[0];
        trashedOrders.value.push(order);
      }
      console.log("✅ Order deleted successfully");
    } catch (err) {
      error.value = err.message || "Failed to delete order";
      console.error("❌ Error deleting order:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedOrders = async () => {
    trashedLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getTrashedOrders();

      // Transform API response to match frontend format
      trashedOrders.value = response.data.data.map(transformOrder);

      console.log(`✅ Successfully loaded ${trashedOrders.value.length} trashed orders`);
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch trashed orders";
      console.error("❌ Error fetching trashed orders:", err);
      throw err;
    } finally {
      trashedLoading.value = false;
    }
  };

  const restoreOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreOrder(orderId);

      const index = trashedOrders.value.findIndex((o) => o.id === orderId);
      if (index > -1) {
        const order = trashedOrders.value.splice(index, 1)[0];
        orders.value.push(order);
      }
      console.log("✅ Order restored successfully");
    } catch (err) {
      error.value = err.message || "Failed to restore order";
      console.error("❌ Error restoring order:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkDeleteOrders = async (orderIds, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkDeleteOrders(orderIds, force);

      if (force) {
        // Permanent delete - remove from trashedOrders
        trashedOrders.value = trashedOrders.value.filter(
          (order) => !orderIds.includes(order.id)
        );
      } else {
        // Soft delete - move from orders to trashedOrders
        const deletedOrders = orders.value.filter((order) =>
          orderIds.includes(order.id)
        );
        orders.value = orders.value.filter(
          (order) => !orderIds.includes(order.id)
        );
        trashedOrders.value.push(...deletedOrders);
      }

      console.log(`✅ Successfully bulk deleted ${orderIds.length} orders`);
    } catch (err) {
      error.value = err.message || "Failed to bulk delete orders";
      console.error("❌ Error bulk deleting orders:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const bulkRestoreOrders = async (orderIds) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.bulkRestoreOrders(orderIds);

      // Move orders from trashedOrders to orders
      const restoredOrders = trashedOrders.value.filter((order) =>
        orderIds.includes(order.id)
      );
      trashedOrders.value = trashedOrders.value.filter(
        (order) => !orderIds.includes(order.id)
      );
      orders.value.push(...restoredOrders);

      console.log(`✅ Successfully bulk restored ${orderIds.length} orders`);
    } catch (err) {
      error.value = err.message || "Failed to bulk restore orders";
      console.error("❌ Error bulk restoring orders:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchStatistics = async () => {
    statisticsLoading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getOrderStatistics();

      statistics.value = {
        total_orders: response.data.total_orders || 0,
        total_profit: response.data.total_profit || 0,
        orders_by_status: response.data.orders_by_status || [],
        today: response.data.today || { orders: 0 },
        month: response.data.month || { orders: 0 },
        year: response.data.year || { orders: 0 },
      };

      console.log("✅ Successfully loaded order statistics");
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch order statistics";
      console.error("❌ Error fetching order statistics:", err);
      throw err;
    } finally {
      statisticsLoading.value = false;
    }
  };

  return {
    // State
    orders,
    trashedOrders,
    statistics,
    loading,
    trashedLoading,
    statisticsLoading,
    error,
    // Getters
    ordersByStatus,
    ordersByCustomer,
    // Actions
    fetchOrders,
    fetchOrderById,
    fetchTrashedOrders,
    fetchStatistics,
    addOrder,
    updateOrder,
    deleteOrder,
    restoreOrder,
    bulkDeleteOrders,
    bulkRestoreOrders,
  };
});
