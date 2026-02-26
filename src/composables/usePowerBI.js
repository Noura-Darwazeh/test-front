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
      const response = await apiServices.getPowerBIEmbedToken(reportId);
      const data = response.data?.data ?? response.data;

      embedConfig.value = {
        reportId: data.report_id ?? reportId,
        embedUrl: data.embed_url,
        accessToken: data.access_token,
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

  return {
    embedConfig,
    loading,
    error,
    loadReport,
    reset,
  };
}
