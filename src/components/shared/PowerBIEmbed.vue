<template>
  <div class="powerbi-wrapper">
    <!-- Error state -->
    <div v-if="error" class="powerbi-error alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Power BI embed container -->
    <div
      v-show="!error"
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

const emit = defineEmits(['error']);

const embedContainer = ref(null);
const error = ref(null);

let reportInstance = null;

const embedReport = () => {
  if (!props.embedConfig || !embedContainer.value) return;

  const { reportId, embedUrl, accessToken, type = 'report' } = props.embedConfig;

  if (!reportId || !embedUrl || !accessToken) {
    error.value = 'Missing Power BI embed configuration.';
    return;
  }

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

    reportInstance.on('error', (event) => {
      error.value = 'Failed to load the report. Please try again.';
      emit('error', event.detail);
    });
  } catch (err) {
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

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.powerbi-embed-container {
  width: 100%;
  border: none;
  border-radius: 0 0 10px 10px;
}
</style>