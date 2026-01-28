export const normalizeOrderStatus = (status) => {
  if (!status) return "";
  return status === "in_progress" ? "inprocess" : status;
};

export const filterByTimePeriod = (orders, period) => {
  if (period === "all") return orders;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    switch (period) {
      case "today":
        return orderDate >= today;
      case "month":
        return orderDate >= thisMonthStart;
      case "year":
        return orderDate >= thisYearStart;
      default:
        return true;
    }
  });
};

export const getChildOrders = (parentOrder, allOrders) => {
  const parentId =
    typeof parentOrder === "object" && parentOrder
      ? parentOrder.id
      : parentOrder;
  if (!parentId) {
    return {
      delivery: null,
      return: null,
      children: [],
      hasDelivery: false,
      hasReturn: false,
      hasExchange: false,
      hasChildren: false,
    };
  }

  const children = [];
  const seen = new Set();
  const addChild = (child) => {
    if (!child) return;
    const childId = child.id ?? child.order_id;
    if (childId === undefined || childId === null) return;
    if (seen.has(childId)) return;
    seen.add(childId);
    children.push(child);
  };

  if (
    parentOrder &&
    Array.isArray(parentOrder.child_orders) &&
    parentOrder.child_orders.length > 0
  ) {
    parentOrder.child_orders.forEach(addChild);
  }

  if (Array.isArray(allOrders) && allOrders.length > 0) {
    allOrders
      .filter((order) => String(order.parent_order_id) === String(parentId))
      .forEach(addChild);
  }

  const deliveryChild = children.find((child) => child.type === "delivery") || null;
  const returnChild = children.find((child) => child.type === "return") || null;

  return {
    delivery: deliveryChild,
    return: returnChild,
    children,
    hasDelivery: !!deliveryChild,
    hasReturn: !!returnChild,
    hasExchange: !!deliveryChild && !!returnChild,
    hasChildren: children.length > 0,
  };
};

export const buildProcessedOrders = (allOrders) => {
  if (!allOrders || allOrders.length === 0) return [];

  const parentOrders = allOrders.filter((order) => !order.parent_order_id);

  const result = parentOrders.map((order) => {
    const childInfo = getChildOrders(order, allOrders);

    if (childInfo.hasExchange) {
      return {
        ...order,
        _hasChildren: true,
        _displayType: "exchange",
        _childOrders: childInfo.children,
        _deliveryOrder: childInfo.delivery,
        _returnOrder: childInfo.return,
      };
    }

    if (childInfo.hasChildren) {
      return {
        ...order,
        _hasChildren: true,
        _displayType: order.type,
        _childOrders: childInfo.children,
        _deliveryOrder: childInfo.delivery,
        _returnOrder: childInfo.return,
      };
    }

    return {
      ...order,
      _hasChildren: false,
      _childOrders: [],
    };
  });

  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return result;
};
