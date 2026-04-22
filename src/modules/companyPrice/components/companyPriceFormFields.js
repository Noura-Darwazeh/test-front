import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

export function useCompanyPriceFormFields() {
  const { t } = useI18n();
  const { companyId, companyOption } = useAuthDefaults();

  const companyPriceFields = computed(() => [
    {
      name: "calculation_type_option",
      label: t("companyPrice.form.calculationTypeOption", "Pricing Method"),
      type: "select",
      defaultValue: "volume_weight",
      required: true,
      options: [
        { value: "volume_weight", label: "volume&weight" },
        { value: "per_order_volume", label: "volume order" },
        { value: "per_item_volume", label: "volume item" },
      ],
      colClass: "col-12",
      validation: {
        required: true,
        message: t("common.validation.requiredField", { field: "Pricing Method" }),
      },
    },
    {
      name: "currency_id",
      label: t("companyPrice.form.currency", "Currency"),
      type: "select",
      placeholder: t("companyPrice.form.currencyPlaceholder", "Select Currency"),
      required: true,
      options: [], // Will be populated dynamically in view
      validation: {
        required: true,
        message: t("common.validation.requiredField", { field: "Currency" }),
      },
    },
    {
      name: "itemType",
      label: t("companyPrice.form.itemType"),
      type: "select",
      placeholder: t("companyPrice.form.itemTypePlaceholder"),
      required: true,
      hidden: (formData) => formData.calculation_type_option !== "volume_weight",
      options: [
        {
          value: "small_size & light_weight",
          label: t("companyPrice.itemTypes.smallLight"),
        },
        {
          value: "small_size & heavy_weight",
          label: t("companyPrice.itemTypes.smallHeavy"),
        },
        {
          value: "big_size & light_weight",
          label: t("companyPrice.itemTypes.bigLight"),
        },
        {
          value: "big_size & heavy_weight",
          label: t("companyPrice.itemTypes.bigHeavy"),
        },
      ],
      validation: {
        required: true,
        message: t("companyPrice.validation.itemTypeRequired"),
      },
    },
    {
      name: "price",
      label: t("companyPrice.form.price"),
      type: "number",
      placeholder: t("companyPrice.form.pricePlaceholder"),
      required: true,
      hidden: (formData) => formData.calculation_type_option !== "volume_weight",
      validation: {
        required: true,
        min: 0.01,
        message: t("companyPrice.validation.priceRequired"),
      },
    },
    {
      name: "volume",
      label: t("companyPrice.form.volume", "Volume"),
      type: "number",
      placeholder: t("companyPrice.form.volumePlaceholder", "Enter volume"),
      required: true,
      hidden: (formData) => formData.calculation_type_option !== "per_order_volume" && formData.calculation_type_option !== "per_item_volume",
      validation: {
        required: true,
        min: 0.01,
        message: t("common.validation.requiredField", { field: "Volume" }),
      },
    },
    {
      name: "price_volume",
      label: t("companyPrice.form.priceVolume", "Price"),
      type: "number",
      placeholder: t("companyPrice.form.pricePlaceholder", "Enter price"),
      required: true,
      hidden: (formData) => formData.calculation_type_option !== "per_order_volume" && formData.calculation_type_option !== "per_item_volume",
      validation: {
        required: true,
        min: 0.01,
        message: t("companyPrice.validation.priceRequired"),
      },
    },
    {
      name: "company_id",
      label: t("companyPrice.form.company"),
      type: "select",
      placeholder: t("companyPrice.form.companyPlaceholder"),
      required: true,
      options: companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }],
      defaultValue: companyId.value,
      locked: true,
      hidden: true,
      validation: {
        required: true,
        message: t("companyPrice.validation.companyRequired"),
      },
    },
  ]);

  return {
    companyPriceFields,
  };
}
