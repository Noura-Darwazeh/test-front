import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useOrderFormFields() {
  const { t } = useI18n();

  const orderFields = computed(() => [
    {
      name: "customerName",
      label: t("orders.form.customerName"),
      type: "text",
      required: true,
      placeholder: t("orders.form.customerNamePlaceholder"),
      colClass: "col-md-6",
      validate: (value) => {
        if (value.length > 255) return t("orders.validation.customerNameMax");
        return null;
      },
    },
    {
      name: "customerPhone",
      label: t("orders.form.customerPhone"),
      type: "tel",
      required: true,
      placeholder: t("orders.form.customerPhonePlaceholder"),
      colClass: "col-md-6",
      validate: (value) => {
        if (value.length > 20) return t("orders.validation.phoneMax");
        return null;
      },
    },
    {
      name: "items",
      label: t("orders.form.items"),
      type: "textarea",
      required: true,
      placeholder: t("orders.form.itemsPlaceholder"),
      colClass: "col-12",
    },
    {
      name: "weight",
      label: t("orders.form.weight"),
      type: "number",
      required: true,
      placeholder: t("orders.form.weightPlaceholder"),
      colClass: "col-md-6",
    },
    {
      name: "totalPrice",
      label: t("orders.form.totalPrice"),
      type: "number",
      required: true,
      placeholder: t("orders.form.totalPricePlaceholder"),
      colClass: "col-md-6",
    },
    {
      name: "pickupLocation",
      label: t("orders.form.pickupLocation"),
      type: "text",
      required: true,
      placeholder: t("orders.form.pickupLocationPlaceholder"),
      colClass: "col-md-6",
    },
    {
      name: "deliveryLocation",
      label: t("orders.form.deliveryLocation"),
      type: "text",
      required: true,
      placeholder: t("orders.form.deliveryLocationPlaceholder"),
      colClass: "col-md-6",
    },
    {
      name: "estimatedDelivery",
      label: t("orders.form.estimatedDelivery"),
      type: "date",
      required: false,
      colClass: "col-md-6",
    },
  ]);

  return {
    orderFields,
  };
}
