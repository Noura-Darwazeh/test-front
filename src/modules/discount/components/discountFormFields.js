import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

export function useDiscountFormFields({ getValueOptions } = {}) {
  const { t } = useI18n();
  const { companyId, companyOption } = useAuthDefaults();
  const resolveValueOptions = (formData) => {
    if (typeof getValueOptions === "function") {
      return getValueOptions(formData?.type) || [];
    }
    return [];
  };

  const getTargetLabel = (type) => {
    if (type === "Customer") return t("discount.form.customer");
    if (type === "Region") return t("discount.form.region");
    if (type === "Line") return t("discount.form.line");
    return t("discount.form.value");
  };

  const getTargetPlaceholder = (type) => {
    if (type === "Customer") return t("discount.form.selectCustomer");
    if (type === "Region") return t("discount.form.selectRegion");
    if (type === "Line") return t("discount.form.selectLine");
    return t("discount.form.valuePlaceholder");
  };

  const discountFields = computed(() => [
    {
      name: "type",
      label: t("discount.form.type"),
      type: "select",
      required: true,
      options: [
        { value: "Customer", label: t("discountTypes.Customer") },
        { value: "Region", label: t("discountTypes.Region") },
        { value: "Line", label: t("discountTypes.Line") },
        { value: "Price", label: t("discountTypes.Price") },
      ],
      colClass: "col-md-6",
      onChange: (value, formData) => {
        if (!formData) return;
        formData.target_id = "";
        formData.value = "";
      },
      validate: (value) => {
        const validTypes = ["Customer", "Region", "Line", "Price"];
        if (!validTypes.includes(value)) {
          return t("discount.validation.typeInvalid");
        }
        return null;
      },
    },
    {
      name: "discount_percentage",
      label: t("discount.form.percentage"),
      type: "number",
      required: true,
      min: 0,
      max: 100,
      step: 0.1,
      placeholder: t("discount.form.percentagePlaceholder"),
      colClass: "col-md-6",
      validate: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 100) {
          return t("discount.validation.percentageRange");
        }
        return null;
      },
    },
    {
      name: "start_date",
      label: t("discount.form.startDate"),
      type: "datetime-local",
      required: true,
      colClass: "col-md-6",
      validate: (value) => {
        if (!value) return t("discount.validation.startDateRequired");
        // Validate date format Y-m-d H:i:s
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (!dateRegex.test(value)) {
          return t("discount.validation.dateFormat");
        }
        return null;
      },
    },
    {
      name: "end_date",
      label: t("discount.form.endDate"),
      type: "datetime-local",
      required: false,
      colClass: "col-md-6",
      validate: (value, formData) => {
        if (!value) return null; // Optional field

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (!dateRegex.test(value)) {
          return t("discount.validation.dateFormat");
        }

        // Validate end_date is after start_date
        if (
          formData.start_date &&
          new Date(value) < new Date(formData.start_date)
        ) {
          return t("discount.validation.endDateAfterStart");
        }
        return null;
      },
    },
    {
      name: "company_id",
      label: t("discount.form.company"),
      type: "select",
      required: true,
      options: companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }],
      colClass: "col-md-6",
      defaultValue: companyId.value,
      locked: true,
      hidden: true,
      validate: (value) => {
        if (!value) return t("discount.validation.companyRequired");
        return null;
      },
    },
    {
      name: "target_id",
      label: (formData) => getTargetLabel(formData?.type),
      type: "select",
      required: (formData) =>
        ["Customer", "Region", "Line"].includes(formData?.type),
      placeholder: (formData) => getTargetPlaceholder(formData?.type),
      options: (formData) => resolveValueOptions(formData),
      colClass: "col-md-6",
      hidden: (formData) =>
        !["Customer", "Region", "Line"].includes(formData?.type),
      validate: (value, formData) => {
        if (!["Customer", "Region", "Line"].includes(formData?.type)) return null;
        if (!value) return t("discount.validation.valueRequired");
        const options = resolveValueOptions(formData);
        const hasMatch = options.some(
          (option) => String(option.value) === String(value)
        );
        if (!hasMatch) {
          return t("discount.validation.valueRequired");
        }
        return null;
      },
    },
    {
      name: "value",
      label: t("discount.form.priceValue"),
      type: "number",
      required: (formData) => formData?.type === "Price",
      placeholder: t("discount.form.valuePlaceholder"),
      min: 0,
      step: 0.01,
      colClass: "col-md-6",
      hidden: (formData) => formData?.type !== "Price",
      validate: (value, formData) => {
        if (formData?.type !== "Price") return null;
        if (!value) return t("discount.validation.valueRequired");
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          return t("discount.validation.valueNumeric");
        }
        return null;
      },
    },
  ]);

  return {
    discountFields,
  };
}
