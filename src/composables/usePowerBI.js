import { ref } from 'vue';
import apiServices from '@/services/apiServices.js';

export function usePowerBI() {
  const embedConfig = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const loadReport = async (reportId) => {
    if (!reportId) return;

    loading.value = true;
    error.value = null;
    embedConfig.value = null;

    try {
      let data;

      if (reportId === 'OrderReport') {
        const response = await apiServices.refreshPowerBIDatasetOrders();
        data = response.data;
      } else if (reportId === 'dax') {
        const response = await apiServices.refreshPowerBIDatasetDrivers();
        data = response.data;}

      embedConfig.value = {
        reportId: data.reportId ,
        embedUrl: data.embedUrl,
        accessToken: data.embedToken,
        type: data.type ?? 'report',
      };
    } catch (err) {
      error.value = err.message || 'Failed to load Power BI report.';
      console.error('Power BI token error:', err);
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    embedConfig.value = null;
    error.value = null;
    loading.value = false;
  };

  return { embedConfig, loading, error, loadReport, reset };
}