<template>
  <div class="powerbi-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="powerbi-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading report...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="powerbi-error alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Power BI embed container -->
    <div
      v-show="!loading && !error"
      ref="embedContainer"
      class="powerbi-embed-container"
      :style="{ height: height }"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as pbi from 'powerbi-client';

const props = defineProps({
  embedConfig: {
    type: Object,
    default: null,
    // Expected shape:
    // {
    //   reportId: string,
    //   embedUrl: string,
    //   accessToken: string,
    //   type: 'report' | 'dashboard'  (default: 'report')
    // }
  },
  height: {
    type: String,
    default: '600px',
  },
});

const emit = defineEmits(['loaded', 'error']);

const embedContainer = ref(null);
const loading = ref(false);
const error = ref(null);

let reportInstance = null;
const powerbi = new pbi.service.Service(
  pbi.factories.hpmFactory,
  pbi.factories.wpmpFactory,
  pbi.factories.routerFactory
);

const embedReport = () => {
  if (!props.embedConfig || !embedContainer.value) return;

  const { reportId, embedUrl, accessToken, type = 'report' } = props.embedConfig;

  if (!reportId || !embedUrl || !accessToken) {
    error.value = 'Missing Power BI embed configuration. Please contact your administrator.';
    return;
  }

  loading.value = true;
  error.value = null;

  // Clean up previous instance if any
  if (reportInstance) {
    powerbi.reset(embedContainer.value);
    reportInstance = null;
  }

  const config = {
    type,
    id: reportId,
    embedUrl,
    accessToken,
    tokenType: pbi.models.TokenType.Embed,
    settings: {
      panes: {
        filters: { expanded: false, visible: false },
        pageNavigation: { visible: true },
      },
      background: pbi.models.BackgroundType.Transparent,
    },
  };

  try {
    reportInstance = powerbi.embed(embedContainer.value, config);

    reportInstance.on('loaded', () => {
      loading.value = false;
      emit('loaded');
    });

    reportInstance.on('error', (event) => {
      loading.value = false;
      error.value = 'Failed to load the report. Please try again.';
      emit('error', event.detail);
      console.error('Power BI error:', event.detail);
    });
  } catch (err) {
    loading.value = false;
    error.value = 'Failed to initialize Power BI embed.';
    console.error('Power BI embed error:', err);
  }
};

watch(() => props.embedConfig, (newConfig) => {
  if (newConfig) embedReport();
}, { deep: true });

onMounted(() => {
  if (props.embedConfig) embedReport();
});

onBeforeUnmount(() => {
  if (reportInstance && embedContainer.value) {
    powerbi.reset(embedContainer.value);
    reportInstance = null;
  }
});
</script>

<style scoped>
.powerbi-wrapper {
  width: 100%;
}

.powerbi-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.powerbi-embed-container {
  width: 100%;
  border: none;
}

.powerbi-embed-container iframe {
  border: none;
}
</style>
