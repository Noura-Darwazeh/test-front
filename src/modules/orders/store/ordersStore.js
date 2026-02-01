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

  const normalizeOrderStatus = (status) => {
    if (!status) return status;
    return status === "in_progress" ? "inprocess" : status;
  };

  // Pagination state for orders
  const ordersPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  // Pagination state for trashed orders
  const trashedPagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  // Getters
  const ordersByStatus = computed(() => {
    return groupBy(orders.value, (order) => order.status, "unknown");
  });

  const ordersByCustomer = computed(() => {
    return groupBy(orders.value, (order) => order.customer_name, "Unknown");
  });

  // Helper function to transform order from API format to frontend format
  const transformOrderBase = (order) => ({
    id: order.id,
    from_company_id: order.from_company_id,
    is_extra_price_for_customer: order.is_extra_price_for_customer,
    is_delivery_price_from_customer: order.is_delivery_price_from_customer ?? null,
    customer_id: order.customer?.id || null,
    customer_name: order.customer?.name || "",
    company_id: order.company?.id || null,
    company_name: order.company?.name || "",
    price: order.price,
    total_price: order.total_price,
    delivery_price: order.delivery_price ?? null,
    currency_id: order.currency?.id || null,
    currency_symbol: order.currency?.symbol || "",
    case: order.case,
    type: order.type,
    package: order.package,
    lineprice_id: order.line_price?.id || null,
    lineprice_name: order.line_price?.name || "",
    lineprice_price: order.line_price?.price || "",
    company_item_price_id:
      order.company_item_price_id || order.company_item_price?.id || null,
    discount: order.discount,
    created_by: order.created_by,
    created_at: order.created_at,
    updated_at: order.updated_at,
    order_code: order.order_code,
    status: normalizeOrderStatus(order.status),
    order_items: order.order_items || [],
    parent_order_id: order.parent_order_id || null,
  });

  const transformOrder = (order) => {
    const base = transformOrderBase(order);
    const childOrders = Array.isArray(order?.child_orders)
      ? order.child_orders.map(transformOrderBase)
      : [];
    return {
      ...base,
      child_orders: childOrders,
    };
  };

  const extractOrderData = (response) => {
    return response?.data?.data || response?.data?.order || response?.data;
  };

  const requireOrderData = (response, fallbackMessage) => {
    const data = extractOrderData(response);
    if (!data || typeof data !== "object") {
      throw new Error(fallbackMessage || response?.data?.message || "Unexpected order response");
    }
    return data;
  };

  const pickDefined = (data) => {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );
  };

  const buildCreatePayload = (orderData) => {
    return pickDefined({
      from_company_id: orderData.from_company_id,
      to_id: orderData.to_id,
      price: orderData.price,
      total_price: orderData.total_price,
      delivery_price: orderData.delivery_price,
      currency_id: orderData.currency_id,
      lineprice_id: orderData.lineprice_id,
      discount_id: orderData.discount_id ?? null,
      company_item_price_id: orderData.company_item_price_id,
      case: orderData.case,
      type: orderData.type,
      package: orderData.package,
      parent_order_id: orderData.parent_order_id || null,
      company_id: orderData.company_id,
      order_items: orderData.order_items || [],
      is_delivery_price_from_customer: orderData.is_delivery_price_from_customer,
      is_extra_price_for_customer: orderData.is_extra_price_for_customer,
    });
  };

  const buildUpdatePayload = (orderData) => {
    return pickDefined({
      from_company_id: orderData.from_company_id,
      customer_id: orderData.customer_id,
      price: orderData.price,
      total_price: orderData.total_price,
      delivery_price: orderData.delivery_price,
      currency_id: orderData.currency_id,
      lineprice_id: orderData.lineprice_id,
      discount_id: orderData.discount_id,
      company_item_price_id: orderData.company_item_price_id,
      type: orderData.type,
      package: orderData.package,
      case: orderData.case,
      is_extra_price_for_customer: orderData.is_extra_price_for_customer,
      is_delivery_price_from_customer: orderData.is_delivery_price_from_customer,
      order_items: orderData.order_items,
    });
  };

  const applyPagination = (paginationRef, meta) => {
    if (!meta) return;
    paginationRef.value = {
      currentPage: meta.current_page,
      perPage: meta.per_page,
      total: meta.total,
      lastPage: meta.last_page,
    };
  };

  const groupBy = (items, getKey, fallbackKey) => {
    return items.reduce((grouped, item) => {
      const key = getKey(item) || fallbackKey;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
      return grouped;
    }, {});
  };

  const mapOrders = (data) => {
    return (data || []).map(transformOrder);
  };

  const removeOrdersByIds = (ordersRef, orderIds) => {
    ordersRef.value = ordersRef.value.filter((order) => !orderIds.includes(order.id));
  };

  const moveOrdersByIds = (sourceRef, targetRef, orderIds) => {
    const moved = sourceRef.value.filter((order) => orderIds.includes(order.id));
    sourceRef.value = sourceRef.value.filter((order) => !orderIds.includes(order.id));
    targetRef.value = targetRef.value.concat(moved);
  };

  const replaceOrderById = (ordersRef, updatedOrder) => {
    const index = ordersRef.value.findIndex((order) => order.id === updatedOrder.id);
    if (index === -1) return false;
    ordersRef.value[index] = { ...ordersRef.value[index], ...updatedOrder };
    return true;
  };

  const resolveErrorMessage = (err, fallback) => {
    if (err?.response?.data?.success === false) {
      return err.response.data.error || err.response.data.message || fallback;
    }
    return err?.message || fallback;
  };

  const handleError = (err, fallback, logMessage, logDetails = false) => {
    error.value = resolveErrorMessage(err, fallback);
    console.error(`[ERROR] ${logMessage}:`, error.value);
    if (logDetails && err?.response?.data) {
      console.error("[ERROR] Error details:", err.response.data);
    }
  };

  const fetchOrderCollection = async ({
    page = 1,
    perPage = 10,
    fetcher,
    targetRef,
    paginationRef,
    loadingRef,
    logLabel,
    errorLabel,
  }) => {
    loadingRef.value = true;
    error.value = null;
    try {
      const response = await fetcher({ page, perPage });
      targetRef.value = mapOrders(response.data.data);
      applyPagination(paginationRef, response.data.meta);
      return response.data;
    } catch (err) {
      handleError(err, errorLabel, `Error fetching ${logLabel}`);
      throw err;
    } finally {
      loadingRef.value = false;
    }
  };

  // Actions
  const fetchOrders = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    return fetchOrderCollection({
      page,
      perPage,
      fetcher: (params) => apiServices.getOrders({ ...params, filters }),
      targetRef: orders,
      paginationRef: ordersPagination,
      loadingRef: loading,
      logLabel: "orders",
      errorLabel: "Failed to fetch orders",
    });
  };

  const fetchOrderById = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getOrderById(orderId);

      const responseData = requireOrderData(response);
      const transformedOrder = transformOrder(responseData);

      return transformedOrder;
    } catch (err) {
      handleError(err, "Failed to fetch order", "Error fetching order");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addOrder = async (orderData) => {
    loading.value = true;
    error.value = null;
    try {
      const apiData = buildCreatePayload(orderData);

      const response = await apiServices.createOrder(apiData);

      const responseData = requireOrderData(response);
      if (responseData.id === undefined || responseData.id === null) {
        throw new Error(response?.data?.message || "Order response missing id");
      }

      const newOrder = transformOrder(responseData);

      orders.value.push(newOrder);
      return newOrder;
    } catch (err) {
      handleError(err, "Failed to add order", "Error adding order", true);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addExchangeOrder = async (parentOrderId, exchangeData) => {
    loading.value = true;
    error.value = null;
    try {
      if (!parentOrderId) {
        throw new Error("Parent order ID is required");
      }
      const response = await apiServices.createOrderExchange(
        parentOrderId,
        exchangeData
      );
      return response.data;
    } catch (err) {
      handleError(err, "Failed to create exchange order", "Error creating exchange order", true);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrder = async (orderId, orderData) => {
    loading.value = true;
    error.value = null;
    try {
      const apiData = buildUpdatePayload(orderData);

      const response = await apiServices.updateOrder(orderId, apiData);

      const responseOrder = requireOrderData(response);
      const updatedOrder = transformOrder(responseOrder);
      replaceOrderById(orders, updatedOrder);
      return orders.value.find((order) => order.id === orderId);
    } catch (err) {
      handleError(err, "Failed to update order", "Error updating order");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async (orderId, force = false) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteOrder(orderId, force);

      if (force) {
        removeOrdersByIds(trashedOrders, [orderId]);
      } else {
        moveOrdersByIds(orders, trashedOrders, [orderId]);
      }
    } catch (err) {
      handleError(err, "Failed to delete order", "Error deleting order");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTrashedOrders = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    return fetchOrderCollection({
      page,
      perPage,
      fetcher: (params) => apiServices.getTrashedOrders({ ...params, filters }),
      targetRef: trashedOrders,
      paginationRef: trashedPagination,
      loadingRef: trashedLoading,
      logLabel: "trashed orders",
      errorLabel: "Failed to fetch trashed orders",
    });
  };

  const restoreOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.restoreOrder(orderId);

      moveOrdersByIds(trashedOrders, orders, [orderId]);
    } catch (err) {
      handleError(err, "Failed to restore order", "Error restoring order");
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
        removeOrdersByIds(trashedOrders, orderIds);
      } else {
        moveOrdersByIds(orders, trashedOrders, orderIds);
      }
    } catch (err) {
      handleError(err, "Failed to bulk delete orders", "Error bulk deleting orders");
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

      moveOrdersByIds(trashedOrders, orders, orderIds);
    } catch (err) {
      handleError(err, "Failed to bulk restore orders", "Error bulk restoring orders");
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

      return response.data;
    } catch (err) {
      handleError(err, "Failed to fetch order statistics", "Error fetching order statistics");
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
    // Pagination state
    ordersPagination,
    trashedPagination,
    // Getters
    ordersByStatus,
    ordersByCustomer,
    // Actions
    fetchOrders,
    fetchOrderById,
    fetchTrashedOrders,
    fetchStatistics,
    addOrder,
    addExchangeOrder,
    updateOrder,
    deleteOrder,
    restoreOrder,
    bulkDeleteOrders,
    bulkRestoreOrders,
  };
});



