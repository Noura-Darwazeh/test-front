export const buildStatusFilterData = ({
  orders,
  trashedOrders,
  normalizeOrderStatus,
}) => {
  const knownStatuses = ["pending", "inprocess", "done", "failed"];
  const currentStatuses = [...orders, ...trashedOrders]
    .map((order) => normalizeOrderStatus(order.status))
    .filter(Boolean);
  const statusSet = new Set([...knownStatuses, ...currentStatuses]);
  return Array.from(statusSet).map((status) => ({ status }));
};

export const getTimePeriodOptions = (t) => [
  { value: "all", label: t("orders.stats.allTime"), icon: "fas fa-infinity" },
  { value: "today", label: t("orders.stats.today"), icon: "fas fa-calendar-day" },
  { value: "month", label: t("orders.stats.thisMonth"), icon: "fas fa-calendar-alt" },
  { value: "year", label: t("orders.stats.thisYear"), icon: "fas fa-calendar" },
];

export const getCurrentData = ({ activeTab, orders, trashedOrders }) => {
  return activeTab === "active" ? orders : trashedOrders;
};

export const getCurrentLoading = ({ activeTab, loading, trashedLoading }) => {
  return activeTab === "active" ? loading : trashedLoading;
};

export const getCurrentPagination = ({
  activeTab,
  ordersPagination,
  trashedPagination,
}) => {
  return activeTab === "active" ? ordersPagination : trashedPagination;
};

export const getFilteredColumns = ({
  activeTab,
  orderColumns,
  trashedColumns,
  visibleColumns,
}) => {
  if (activeTab === "active") {
    return orderColumns.filter((col) => visibleColumns.includes(col.key));
  }
  return trashedColumns;
};

export const getBulkActions = (t, activeTab) => {
  if (activeTab === "active") {
    return [
      {
        id: "delete",
        label: t("orders.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("orders.bulkRestore"),
      bgColor: "var(--color-success)",
    },
    {
      id: "permanentDelete",
      label: t("common.permanentDelete"),
      bgColor: "var(--color-danger)",
    },
  ];
};

export const getBulkConfirmMessage = (t, pendingBulkAction, selectedCount) => {
  if (!pendingBulkAction) return "";
  const entity =
    selectedCount === 1 ? t("orders.entitySingular") : t("orders.entityPlural");

  if (pendingBulkAction === "delete") {
    return t("common.bulkDeleteConfirm", { count: selectedCount, entity });
  }
  if (pendingBulkAction === "permanentDelete") {
    return t("common.bulkPermanentDeleteConfirm", { count: selectedCount, entity });
  }
  if (pendingBulkAction === "restore") {
    return t("common.bulkRestoreConfirm", { count: selectedCount, entity });
  }
  return "";
};
