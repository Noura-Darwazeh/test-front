export const createOrderColumns = ({ t, formatPrice }) => [
  { key: "id", label: t("orders.table.id"), sortable: true },
  { key: "customer_name", label: t("orders.table.customer"), sortable: true },
  { key: "company_name", label: t("orders.table.company"), sortable: true },
  {
    key: "type",
    label: t("orders.table.type"),
    sortable: true,
    formatter: (value, row) => {
      if (row && row._displayType === "exchange") return t("orders.form.typeExchange");
      if (value === "delivery") return t("orders.form.typeDelivery");
      if (value === "return") return t("orders.form.typeReturn");
      return value;
    },
  },
  { key: "package", label: t("orders.table.package"), sortable: true },
  { key: "case", label: t("orders.table.case"), sortable: true },
  {
    key: "price",
    label: t("orders.table.price"),
    sortable: true,
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "delivery_price",
    label: t("orders.table.deliveryPrice"),
    sortable: true,
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "total_price",
    label: t("orders.table.totalPrice"),
    sortable: true,
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "status",
    label: t("orders.table.status"),
    sortable: true,
    component: "StatusBadge",
    componentProps: { type: "order" },
  },
  { key: "created_at", label: t("orders.table.createdAt"), sortable: true },
];

export const createTrashedColumns = ({ t, formatPrice }) => [
  { key: "id", label: t("orders.table.id") },
  { key: "customer_name", label: t("orders.table.customer") },
  { key: "type", label: t("orders.table.type") },
  { key: "package", label: t("orders.table.package") },
  {
    key: "price",
    label: t("orders.table.price"),
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "delivery_price",
    label: t("orders.table.deliveryPrice"),
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  {
    key: "total_price",
    label: t("orders.table.totalPrice"),
    formatter: (value, row) => formatPrice(value, row.currency_symbol),
  },
  { key: "created_at", label: t("orders.table.createdAt") },
];
