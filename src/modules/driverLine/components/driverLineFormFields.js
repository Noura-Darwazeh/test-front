import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";

export function useDriverLineFormFields({ drivers, lineWorks } = {}) {
  const { t } = useI18n();

  const driverLineFields = computed(() => {
    const driverList = unref(drivers) || [];
    const lineWorkList = unref(lineWorks) || [];

    const driverOptions = driverList
      .map((driver) => ({
        value: String(driver.id ?? driver.value ?? ""),
        label: driver.name || driver.username || driver.label || "",
      }))
      .filter((option) => option.value && option.label);

    const lineWorkOptions = lineWorkList
      .map((lineWork) => ({
        value: String(lineWork.id ?? lineWork.value ?? ""),
        label: lineWork.name || lineWork.label || "",
      }))
      .filter((option) => option.value && option.label);

    const validDriverIds = new Set(driverOptions.map((option) => option.value));
    const validLineWorkIds = new Set(
      lineWorkOptions.map((option) => option.value)
    );

    return [
      {
        name: "driver_id",
        label: t("driverLine.form.driver"),
        type: "select",
        placeholder: t("driverLine.form.driverPlaceholder"),
        required: true,
        options: driverOptions,
        validation: {
          required: true,
          message: t("driverLine.validation.driverRequired"),
        },
        validate: (value) => {
          if (!value) {
            return t("driverLine.validation.driverRequired");
          }
          if (!validDriverIds.has(String(value))) {
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
        options: lineWorkOptions,
        validation: {
          required: true,
          message: t("driverLine.validation.lineWorkRequired"),
        },
        validate: (value) => {
          if (!value) {
            return t("driverLine.validation.lineWorkRequired");
          }
          if (!validLineWorkIds.has(String(value))) {
            return t("driverLine.validation.invalidLineWork");
          }
          return null;
        },
      },
    ];
  });

  return {
    driverLineFields,
  };
}
