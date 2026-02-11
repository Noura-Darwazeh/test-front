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
      options: [],
    },
    {
      name: "customer_id",
      label: t("orders.form.customerId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [],
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
      options: [],
    },
    {
      name: "discount_id",
      label: t("orders.form.discountId"),
      type: "select",
      required: false,
      colClass: "col-md-6",
      options: [],
    },
    {
      name: "company_item_price_id",
      label: t("orders.form.companyItemPriceId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [],
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
      disabled: (formData) =>
        formData.type === "return" || formData.type === "exchange",
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
      options: [],
      conditionalRequired: (formData) =>
        formData.type === "return" || formData.type === "exchange",
    },
    {
      name: "is_delivery_price_from_customer",
      label: t("orders.form.deliveryPriceFromCustomer"),
      type: "checkbox",
      required: false,
      colClass: "col-md-6",
      defaultValue: 0,
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
      options: [],
    },
    {
      name: "branch_delivery_company_id",
      label: t("orders.form.branchDeliveryCompanyId"),
      type: "select",
      required: true,
      colClass: "col-md-6",
      options: [],
    },
  ]);

  return {
    orderFields,
  };
}
