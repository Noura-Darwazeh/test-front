import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useCompanyPriceFormFields() {
  const { t } = useI18n();

  const companyPriceFields = computed(() => [
    {
      name: "price",
      label: t("companyPrice.form.price"),
      type: "number",
      placeholder: t("companyPrice.form.pricePlaceholder"),
      required: true,
      validation: {
        required: true,
        min: 0.01,
        message: t("companyPrice.validation.priceRequired"),
      },
    },
    {
      name: "itemType",
      label: t("companyPrice.form.itemType"),
      type: "select",
      placeholder: t("companyPrice.form.itemTypePlaceholder"),
      required: true,
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
      name: "company_id",
      label: t("companyPrice.form.company"),
      type: "select",
      placeholder: t("companyPrice.form.companyPlaceholder"),
      required: true,
      options: [
        { value: 1, label: "Tech Solutions Ltd" },
        { value: 2, label: "Fast Delivery Co" },
        { value: 3, label: "Global Logistics Inc" },
      ],
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
