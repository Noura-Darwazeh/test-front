<template>
  <div class="powerbi-wrapper">
    <!-- Loading state -->
    <Transition name="fade">
      <div v-if="loading" class="powerbi-loading">
        <div class="loading-card">
          <div class="loading-icon">
            <div class="chart-bar bar-1"></div>
            <div class="chart-bar bar-2"></div>
            <div class="chart-bar bar-3"></div>
            <div class="chart-bar bar-4"></div>
          </div>
          <p class="loading-text">Loading report...</p>
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error state -->
    <div v-if="error" class="powerbi-error alert alert-danger">
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
//  const powerbi = new pbi.service.Service(
//    pbi.factories.hpmFactory,
//    pbi.factories.wpmpFactory,
//    pbi.factories.routerFactory
//  );

const embedReport = () => {
  if (!props.embedConfig || !embedContainer.value) return;

  const { reportId, embedUrl, accessToken, type = 'report' } = props.embedConfig;

  if (!reportId || !embedUrl || !accessToken) {
    error.value = 'Missing Power BI embed configuration.';
    return;
  }

  loading.value = true;
  error.value = null;

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
    });
  } catch (err) {
    loading.value = false;
    error.value = 'Failed to initialize Power BI embed.';
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
  position: relative;
}

/* ── Loading ── */
.powerbi-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dee2e6;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Chart bars animation */
.loading-icon {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 50px;
}

.chart-bar {
  width: 12px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #667eea, #764ba2);
  animation: barBounce 1.2s ease-in-out infinite;
}

.bar-1 { height: 30px; animation-delay: 0s; }
.bar-2 { height: 45px; animation-delay: 0.15s; }
.bar-3 { height: 35px; animation-delay: 0.3s; }
.bar-4 { height: 50px; animation-delay: 0.45s; }

@keyframes barBounce {
  0%, 100% { transform: scaleY(1); opacity: 1; }
  50% { transform: scaleY(0.5); opacity: 0.6; }
}

.loading-text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
}

/* Dots */
.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.5); opacity: 0.4; }
}

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.powerbi-embed-container {
  width: 100%;
  border: none;
  border-radius: 0 0 10px 10px;
}
</style>