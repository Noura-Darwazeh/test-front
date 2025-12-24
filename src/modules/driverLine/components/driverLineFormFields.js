import { computed } from "vue";
import { useI18n } from "vue-i18n";

export function useDriverLineFormFields() {
  const { t } = useI18n();

  const driverLineFields = computed(() => [
    {
      name: "driver_id",
      label: t("driverLine.form.driver"),
      type: "select",
      placeholder: t("driverLine.form.driverPlaceholder"),
      required: true,
      options: [
        { value: 1, label: "Ahmed Hassan - Available" },
        { value: 2, label: "Mohammed Ali - Available" },
        { value: 3, label: "Sarah Ibrahim - Busy" },
        { value: 4, label: "Fatima Khalil - Available" },
        { value: 5, label: "Omar Yousef - Available" },
      ],
      validation: {
        required: true,
        message: t("driverLine.validation.driverRequired"),
      },
      validate: (value) => {
        if (!value) {
          return t("driverLine.validation.driverRequired");
        }
        const validDriverIds = [1, 2, 3, 4, 5];
        if (!validDriverIds.includes(parseInt(value))) {
          return t("driverLine.validation.invalidDriver");
        }
        return null;
      },
    },
    {
      name: "line_work_id",
      label: t("driverLine.form.lineWork"),
      type: "select",
      placeholder: t("driverLine.form.lineWorkPlaceholder"),
      required: true,
      options: [
        { value: 1, label: "Jerusalem - Ramallah Line" },
        { value: 2, label: "Nablus - Jenin Line" },
        { value: 3, label: "Hebron - Bethlehem Line" },
        { value: 4, label: "Gaza - Khan Yunis Line" },
        { value: 5, label: "Tulkarm - Qalqilya Line" },
      ],
      validation: {
        required: true,
        message: t("driverLine.validation.lineWorkRequired"),
      },
      validate: (value) => {
        if (!value) {
          return t("driverLine.validation.lineWorkRequired");
        }
        const validLineWorkIds = [1, 2, 3, 4, 5];
        if (!validLineWorkIds.includes(parseInt(value))) {
          return t("driverLine.validation.invalidLineWork");
        }
        return null;
      },
    },
  ]);

  return {
    driverLineFields,
  };
}
