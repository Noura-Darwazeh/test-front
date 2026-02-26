import apiServices from "@/services/apiServices.js";
import { useI18n } from "vue-i18n";

/**
 * Composable for toggling active/inactive status on entities.
 *
 * @param {string} entityPlural - The plural entity name for API calls (e.g. "companies", "users")
 * @param {Function} refreshCallback - Function to call after toggling to refresh the data
 * @param {Object} options - Optional callbacks for success/error modals
 * @param {Function} options.showSuccess - Function to show success message
 * @param {Function} options.showError - Function to show error message
 */
export function useActiveToggle(entityPlural, refreshCallback, { showSuccess, showError } = {}) {
  const { t } = useI18n();

  const handleActivate = async (row) => {
    try {
      await apiServices.toggleEntityActive(entityPlural, row.id, 1);
      if (refreshCallback) await refreshCallback();
      if (showSuccess) showSuccess(t("common.activateSuccess"));
    } catch (err) {
      console.error(`Error activating ${entityPlural} item:`, err);
      if (showError) showError(err.response?.data?.message || err.message || t("common.activateSuccess").replace("successfully", "failed"));
    }
  };

  const handleDeactivate = async (row) => {
    try {
      await apiServices.toggleEntityActive(entityPlural, row.id, 0);
      if (refreshCallback) await refreshCallback();
      if (showSuccess) showSuccess(t("common.deactivateSuccess"));
    } catch (err) {
      console.error(`Error deactivating ${entityPlural} item:`, err);
      if (showError) showError(err.response?.data?.message || err.message || t("common.deactivateSuccess").replace("successfully", "failed"));
    }
  };

  const handleBulkActivate = async (ids) => {
    try {
      await Promise.all(
        ids.map((id) => apiServices.toggleEntityActive(entityPlural, id, 1))
      );
      if (refreshCallback) await refreshCallback();
      if (showSuccess) showSuccess(t("common.bulkActivateSuccess", { count: ids.length }));
    } catch (err) {
      console.error(`Error bulk activating ${entityPlural}:`, err);
      if (showError) showError(err.response?.data?.message || err.message || "Bulk activation failed");
    }
  };

  const handleBulkDeactivate = async (ids) => {
    try {
      await Promise.all(
        ids.map((id) => apiServices.toggleEntityActive(entityPlural, id, 0))
      );
      if (refreshCallback) await refreshCallback();
      if (showSuccess) showSuccess(t("common.bulkDeactivateSuccess", { count: ids.length }));
    } catch (err) {
      console.error(`Error bulk deactivating ${entityPlural}:`, err);
      if (showError) showError(err.response?.data?.message || err.message || "Bulk deactivation failed");
    }
  };

  return {
    handleActivate,
    handleDeactivate,
    handleBulkActivate,
    handleBulkDeactivate,
  };
}
