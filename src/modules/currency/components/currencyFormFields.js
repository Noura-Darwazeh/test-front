import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useCurrencyFormFields(isEditMode, selectedCurrency) {
  const { t } = useI18n();

  const currencyFields = computed(() => [
    {
      name: "key",
      label: t("currency.form.key"),
      type: "text",
      placeholder: t("currency.form.keyPlaceholder"),
      required: true,
      defaultValue: isEditMode.value ? selectedCurrency.value.key : '',
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
      defaultValue: isEditMode.value ? selectedCurrency.value.nameenglish : '',
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
      defaultValue: isEditMode.value ? selectedCurrency.value.namearabic : '',
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
      defaultValue: isEditMode.value ? selectedCurrency.value.symbol : '',
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