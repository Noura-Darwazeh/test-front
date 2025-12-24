import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useCurrencyFormFields() {
  const { t } = useI18n();

  const currencyFields = computed(() => [
    {
      name: "key",
      label: t("currency.form.key"),
      type: "text",
      placeholder: t("currency.form.keyPlaceholder"),
      required: true,
      validation: {
        required: true,
        message: t("currency.validation.keyRequired"),
      },
    },
    {
      name: "nameenglish",
      label: t("currency.form.nameEnglish"),
      type: "text",
      placeholder: t("currency.form.nameEnglishPlaceholder"),
      required: true,
      validation: {
        required: true,
        message: t("currency.validation.nameEnglishRequired"),
      },
    },
    {
      name: "namearabic",
      label: t("currency.form.nameArabic"),
      type: "text",
      placeholder: t("currency.form.nameArabicPlaceholder"),
      required: true,
      validation: {
        required: true,
        message: t("currency.validation.nameArabicRequired"),
      },
    },
    {
      name: "symbol",
      label: t("currency.form.symbol"),
      type: "text",
      placeholder: t("currency.form.symbolPlaceholder"),
      required: true,
      validation: {
        required: true,
        message: t("currency.validation.symbolRequired"),
      },
    },
  ]);

  return {
    currencyFields,
  };
}
