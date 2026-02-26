import { getChildOrders } from "./ordersProcessing.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

export const createOrdersActions = ({
  ordersStore,
  itemsPerPage,
  currentPage,
  activeTab,
  selectedRows,
  skipNextPageWatch,
  isWizardOpen,
  isFormModalOpen,
  isDetailsModalOpen,
  isEditMode,
  selectedOrder,
  selectedOrderExchange,
  editFormErrors,
  detailsModalTab,
  pendingBulkAction,
  isBulkConfirmOpen,
  bulkActionLoading,
  currentData,
  fetchOrdersPage,
  showSuccess,
  showError,
  t,
}) => {
  const clearEditFormErrors = () => {
    if (!editFormErrors) return;
    editFormErrors.value = {};
  };

  const applyEditFormErrors = (error) => {
    if (!editFormErrors) return false;
    const normalized = normalizeServerErrors(error);
    editFormErrors.value = normalized;
    return Object.keys(normalized).length > 0;
  };

  const resetExchangeState = () => {
    selectedOrderExchange.value = { delivery: null, return: null, hasExchange: false };
  };

  const openModal = () => {
    isWizardOpen.value = true;
  };

  const closeModal = () => {
    isWizardOpen.value = false;
  };

  const switchTab = async (tab) => {
    activeTab.value = tab;
    selectedRows.value = [];

    try {
      if (typeof fetchOrdersPage === "function") {
        await fetchOrdersPage(1);
      } else if (tab === "trashed") {
        await ordersStore.fetchTrashedOrders({ page: 1, perPage: itemsPerPage.value });
      } else {
        await ordersStore.fetchOrders({ page: 1, perPage: itemsPerPage.value });
      }
      skipNextPageWatch.value = true;
      currentPage.value = 1;
    } catch (err) {
      console.error("Failed to load " + tab + " orders:", err);
    }
  };

  const handleRefresh = async () => {
    selectedRows.value = [];
    try {
      if (typeof fetchOrdersPage === "function") {
        await fetchOrdersPage(currentPage.value);
      } else if (activeTab.value === "trashed") {
        await ordersStore.fetchTrashedOrders({
          page: currentPage.value,
          perPage: itemsPerPage.value,
        });
      } else {
        await ordersStore.fetchOrders({
          page: currentPage.value,
          perPage: itemsPerPage.value,
        });
      }
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    }
  };

  const handleAddOrder = async (orderData) => {
    if (orderData && orderData.exchange) {
      try {
        await ordersStore.addExchangeOrder(
          orderData.parentOrderId,
          orderData.payload
        );
        if (typeof fetchOrdersPage === "function") {
          await fetchOrdersPage(currentPage.value);
        } else {
          await ordersStore.fetchOrders({
            page: currentPage.value,
            perPage: itemsPerPage.value,
          });
        }
        closeModal();
        if (showSuccess && t) showSuccess(t("orders.addSuccess"));
      } catch (err) {
        console.error("Failed to add exchange order:", err);
        if (showError) showError(err.response?.data?.message || err.message || "Failed to add exchange order");
      }
      return;
    }

    const ordersToCreate = Array.isArray(orderData)
      ? orderData
      : [orderData];

    try {
      for (const payload of ordersToCreate) {
        await ordersStore.addOrder(payload);
      }
      closeModal();
      if (showSuccess && t) showSuccess(t("orders.addSuccess"));
    } catch (err) {
      console.error("Failed to add order:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to add order");
    }
  };

  const handleDeleteOrder = async (order) => {
    try {
      await ordersStore.deleteOrder(order.id);
      if (showSuccess && t) showSuccess(t("orders.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete order:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to delete order");
    }
  };

  const handleRestoreOrder = async (order) => {
    try {
      await ordersStore.restoreOrder(order.id);
      if (showSuccess && t) showSuccess(t("orders.restoreSuccess"));
    } catch (err) {
      console.error("Failed to restore order:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to restore order");
    }
  };

  const handlePermanentDeleteOrder = async (order) => {
    try {
      await ordersStore.deleteOrder(order.id, true);
      if (showSuccess && t) showSuccess(t("orders.permanentDeleteSuccess"));
    } catch (err) {
      console.error("Failed to permanently delete order:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to permanently delete order");
    }
  };

  const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
  };

  const executeBulkAction = async () => {
    if (!pendingBulkAction.value) return;
    const action = pendingBulkAction.value;
    const count = selectedRows.value.length;
    bulkActionLoading.value = true;

    try {
      if (action === "delete") {
        await ordersStore.bulkDeleteOrders(selectedRows.value, false);
      } else if (action === "permanentDelete") {
        await ordersStore.bulkDeleteOrders(selectedRows.value, true);
      } else if (action === "restore") {
        await ordersStore.bulkRestoreOrders(selectedRows.value);
      }
      selectedRows.value = [];
      if (showSuccess && t) {
        if (action === "delete" || action === "permanentDelete") {
          showSuccess(t("orders.bulkDeleteSuccess", { count }));
        } else if (action === "restore") {
          showSuccess(t("orders.bulkRestoreSuccess", { count }));
        }
      }
    } catch (err) {
      console.error("Failed to bulk action orders:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to perform bulk action");
    } finally {
      bulkActionLoading.value = false;
      isBulkConfirmOpen.value = false;
      pendingBulkAction.value = null;
    }
  };

  const cancelBulkAction = () => {
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
  };

  const viewOrderDetails = (order) => {
    selectedOrder.value = { ...order };
    selectedOrderExchange.value = getChildOrders(order, currentData.value);
    detailsModalTab.value = "details";
    isDetailsModalOpen.value = true;
  };

  const editOrder = (order) => {
    clearEditFormErrors();
    isEditMode.value = true;
    selectedOrder.value = { ...order };
    isFormModalOpen.value = true;
  };

  const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedOrder.value = {};
    clearEditFormErrors();
  };

  const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedOrder.value = {};
    resetExchangeState();
    detailsModalTab.value = "details";
  };

  const handleEditOrder = async (orderData) => {
    try {
      await ordersStore.updateOrder(selectedOrder.value.id, orderData);
      closeFormModal();
      if (showSuccess && t) showSuccess(t("orders.updateSuccess"));
    } catch (err) {
      if (applyEditFormErrors(err)) {
        return;
      }
      console.error("Failed to update order:", err);
      if (showError) showError(err.response?.data?.message || err.message || "Failed to update order");
    }
  };

  return {
    openModal,
    closeModal,
    switchTab,
    handleRefresh,
    handleAddOrder,
    handleDeleteOrder,
    handleRestoreOrder,
    handlePermanentDeleteOrder,
    handleBulkAction,
    executeBulkAction,
    cancelBulkAction,
    viewOrderDetails,
    editOrder,
    closeFormModal,
    closeDetailsModal,
    handleEditOrder,
  };
};
