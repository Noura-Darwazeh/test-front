<template>
  <div class="statistics-page">
    <TableHeader
      v-model="searchText"
      :columns="[]"
      :visibleColumns="[]"
      :showAddButton="false"
      :showTrashedButton="false"
      @refresh-click="handleRefresh"
    />

    <div class="mt-3">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <PowerBIEmbed
        v-else-if="embedConfig"
        :embedConfig="embedConfig"
        height="700px"
        @loaded="onReportLoaded"
        @error="onReportError"
      />

      <div v-else class="text-center py-5 text-muted">
        <i class="fas fa-chart-bar fa-3x mb-3"></i>
        <p>{{ $t('statistics.noReport') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TableHeader from "@/components/shared/TableHeader.vue";
import PowerBIEmbed from "@/components/shared/PowerBIEmbed.vue";
import apiServices from "@/services/apiServices.js";

const searchText = ref("");
const loading = ref(false);
const error = ref(null);
const embedConfig = ref(null);

const REPORT_ID = "ebf1eec2-8114-4ae4-9efb-e3fec1f267e1";

const loadReport = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await apiServices.refreshPowerBIDataset();
    const { embedUrl, embedToken, reportId } = res.data;

    embedConfig.value = {
      reportId,
      embedUrl,
      accessToken: embedToken,
      type: "report",
    };
  } catch (err) {
    error.value = err.message || "Failed to load report";
    console.error("❌ Power BI load error:", err);
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async ({ embedUrl, embedToken, reportId }) => {
  embedConfig.value = {
    reportId,
    embedUrl,
    accessToken: embedToken,
    type: "report",
  };
};

const onReportLoaded = () => {
  console.log("✅ Power BI report loaded");
};

const onReportError = (err) => {
  console.error("❌ Power BI report error:", err);
  error.value = "Failed to display report";
};

onMounted(() => {
  loadReport();
});
</script>

<style scoped>
.statistics-page {
  max-width: 100%;
}
</style>