import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

export function useOrderFormFields() {
  const { t } = useI18n();
  const { companyId, companyOption, currencyId } = useAuthDefaults();

  const orderFields = computed(() => [
    {
      name: "to_id",
      label: t("orders.form.toId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "Location 1" },
        { value: 2, label: "Location 2" },
        { value: 3, label: "Location 3" },
      ],
    },
    {
      name: "customer_id",
      label: t("orders.form.customerId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "John Doe" },
        { value: 2, label: "Sara Mohammed" },
        { value: 3, label: "Ahmad Khalil" },
      ],
    },
    {
      name: "price",
      label: t("orders.form.price"),
      type: "number",
      required: true,
      placeholder: t("orders.form.pricePlaceholder"),
      colClass: "col-md-6",
      validate: (value) => {
        if (isNaN(value) || value <= 0)
          return t("orders.validation.priceInvalid");
        return null;
      },
    },
    {
      name: "currency_id",
      label: t("orders.form.currencyId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [],  // Populated dynamically from currencies API
      defaultValue: currencyId.value,
    },
    {
      name: "lineprice_id",
      label: t("orders.form.linepriceId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "Line Price 1" },
        { value: 2, label: "Line Price 2" },
        { value: 3, label: "Line Price 3" },
      ],
    },
    {
      name: "discount_id",
      label: t("orders.form.discountId"),
      type: "select",
      required: false,
      colClass: "col-md-6",
      options: [
        { value: null, label: t("orders.form.noDiscount") },
        { value: 1, label: "Customer Discount 15%" },
        { value: 2, label: "Region Discount 10%" },
        { value: 3, label: "Price Discount 5%" },
      ],
    },
    {
      name: "company_item_price_id",
      label: t("orders.form.companyItemPriceId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "Small & Light - $25.50" },
        { value: 2, label: "Small & Heavy - $45.00" },
        { value: 3, label: "Big & Light - $35.75" },
        { value: 4, label: "Big & Heavy - $120.00" },
      ],
    },
    {
      name: "type",
      label: t("orders.form.type"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: "delivery", label: t("orders.form.typeDelivery") },
        { value: "return", label: t("orders.form.typeReturn") },
      ],
    },
    {
      name: "package",
      label: t("orders.form.package"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: "one", label: t("orders.form.packageOne") },
        { value: "multi", label: t("orders.form.packageMulti") },
      ],
    },
    {
      name: "case",
      label: t("orders.form.case"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: "Full", label: t("orders.form.caseFull") },
        { value: "Part", label: t("orders.form.casePart") },
        { value: "Fast", label: t("orders.form.caseFast") },
      ],
      conditionalOptions: (formData) => {
        if (formData.package === "multi") {
          return [{ value: "Full", label: t("orders.form.caseFull") }];
        }
        return [
          { value: "Full", label: t("orders.form.caseFull") },
          { value: "Part", label: t("orders.form.casePart") },
          { value: "Fast", label: t("orders.form.caseFast") },
        ];
      },
    },
    {
      name: "parent_order_id",
      label: t("orders.form.parentOrderId"),
      type: "select",
      required: false,
      colClass: "col-md-6",
      options: [
        { value: null, label: t("orders.form.noParentOrder") },
        { value: 1, label: "Order #1" },
        { value: 2, label: "Order #2" },
        { value: 3, label: "Order #3" },
      ],
      conditionalRequired: (formData) => formData.type === "return",
    },
    {
      name: "company_id",
      label: t("orders.form.companyId"),
      type: "select",
      required: false, // Will be required for super admin
      colClass: "col-md-6",
      options: companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }],
      defaultValue: companyId.value,
      locked: true,
      hidden: true,
    },
    {
      name: "branch_customer_company_id",
      label: t("orders.form.branchCustomerCompanyId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "Customer Branch 1" },
        { value: 2, label: "Customer Branch 2" },
        { value: 3, label: "Customer Branch 3" },
      ],
    },
    {
      name: "branch_delivery_company_id",
      label: t("orders.form.branchDeliveryCompanyId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [
        { value: 1, label: "Delivery Branch 1" },
        { value: 2, label: "Delivery Branch 2" },
        { value: 3, label: "Delivery Branch 3" },
      ],
    },
  ]);

  return {
    orderFields,
  };
}
