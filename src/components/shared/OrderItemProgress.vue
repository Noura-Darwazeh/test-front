<template>
  <div class="order-item-card mb-3">
    <div 
      class="order-item-header p-3 d-flex align-items-center justify-content-between cursor-pointer"
      @click="toggleExpanded"
    >
      <div class="d-flex align-items-center gap-3">
       
        <div>
          <h6 class="mb-0 fw-semibold">{{ orderItem.order_item?.name }}</h6>
          <small class="text-muted">
            <i class="bi bi-calendar3 me-1"></i>
            {{ formatDate(latestStep?.date) }}
          </small>
        </div>
      </div>
      
      <div class="d-flex align-items-center gap-2">
        <span :class="getStatusBadgeClass(currentStatus)" class="badge">
          {{ t(`workPlan.status.${currentStatus}`) }}
        </span>
        <i :class="isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'" class="bi"></i>
      </div>
    </div>

    <!-- Stepper -->
    <Transition name="slide-down">
      <div v-if="isExpanded" class="order-item-progress p-3 pt-0">
        <div class="progress-stepper">
          <div 
            v-for="(stepDef, index) in stepDefinitions" 
            :key="index"
            class="stepper-item"
            :class="getStepClass(stepDef.status)"
          >
            <div 
              class="stepper-circle-wrapper" 
              :title="getStepTooltip(stepDef.status)"
            >
              <div class="stepper-circle">
                <i :class="getStepIcon(stepDef.status)"></i>
              </div>
              <div class="stepper-label">
                {{ t(`workPlan.status.${stepDef.status}`) }}
              </div>
              <!-- Date Label -->
              <div v-if="hasStep(stepDef.status)" class="stepper-date">
                {{ formatDateTime(getStepByStatus(stepDef.status)?.created_at) }}
              </div>
            </div>
            <div v-if="index < stepDefinitions.length - 1" class="stepper-line" :class="getLineClass(index)"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const props = defineProps({
  orderItem: {
    type: Object,
    required: true
  }
});

const isExpanded = ref(false);

// ✅ Step definitions in order
const stepDefinitions = [
  { status: 'pending' },
  { status: 'start' },
  { status: 'pickup' },
  { status: 'done' }
];

// ✅ Sort steps by created_at to get chronological order
const sortedSteps = computed(() => {
  if (!props.orderItem.steps || !Array.isArray(props.orderItem.steps)) {
    return [];
  }
  return [...props.orderItem.steps].sort((a, b) => {
    return new Date(a.created_at) - new Date(b.created_at);
  });
});

// ✅ Get the latest step (most recent)
const latestStep = computed(() => {
  if (sortedSteps.value.length === 0) return null;
  return sortedSteps.value[sortedSteps.value.length - 1];
});

// ✅ Current status is the status of the latest step
const currentStatus = computed(() => {
  return latestStep.value?.status || 'pending';
});

// ✅ Check if a specific status exists in steps
const hasStep = (status) => {
  return sortedSteps.value.some(step => step.status === status);
};

// ✅ Get step by status
const getStepByStatus = (status) => {
  return sortedSteps.value.find(step => step.status === status);
};

// ✅ Get step class based on status history
const getStepClass = (status) => {
  const stepExists = hasStep(status);
  const step = getStepByStatus(status);
  
  // If failed status exists and this is the failed step or any step after it
  const failedStep = getStepByStatus('failed');
  if (failedStep) {
    const failedIndex = stepDefinitions.findIndex(def => def.status === 'failed');
    const currentIndex = stepDefinitions.findIndex(def => def.status === status);
    
    if (status === 'failed') return 'failed current';
    if (stepExists) return 'completed';
    return 'pending';
  }
  
  // Normal flow without failed
  if (stepExists) {
    if (status === currentStatus.value) {
      return 'completed current';
    }
    return 'completed';
  }
  
  return 'pending';
};

// ✅ Get line class for connection between steps
const getLineClass = (index) => {
  const currentStepStatus = stepDefinitions[index].status;
  const nextStepStatus = stepDefinitions[index + 1]?.status;
  
  // If failed exists, show red lines after failed
  const failedStep = getStepByStatus('failed');
  if (failedStep) {
    const failedIndex = stepDefinitions.findIndex(def => def.status === 'failed');
    if (index >= failedIndex) {
      return 'line-failed';
    }
  }
  
  // Check if both current and next steps are completed
  const currentCompleted = hasStep(currentStepStatus);
  const nextCompleted = hasStep(nextStepStatus);
  
  if (currentCompleted && nextCompleted) {
    return 'line-completed';
  }
  
  return 'line-pending';
};

// ✅ Get history item class
const getHistoryItemClass = (status) => {
  const classes = {
    'pending': 'history-pending',
    'start': 'history-start',
    'pickup': 'history-pickup',
    'done': 'history-done',
    'failed': 'history-failed'
  };
  return classes[status] || '';
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStepTooltip = (status) => {
  const step = getStepByStatus(status);
  if (!step) {
    return t(`workPlan.status.${status}`) + ' - ' + t('workPlan.notCompleted');
  }
  return `${t(`workPlan.status.${status}`)} - ${formatDateTime(step.created_at)}`;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'pending': 'bg-warning text-dark',
    'start': 'bg-info text-white',
    'pickup': 'bg-primary text-white',
    'done': 'bg-success text-white',
    'failed': 'bg-danger text-white'
  };
  return classes[status] || 'bg-secondary';
};

const getStepIcon = (status) => {
  const icons = {
    'pending': 'bi-clock',
    'start': 'bi-play-circle',
    'pickup': 'bi-box-arrow-up',
    'done': 'bi-check-circle-fill',
    'failed': 'bi-x-circle-fill'
  };
  return icons[status] || 'bi-circle';
};
</script>

<style scoped>
.order-item-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-item-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-item-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.order-item-header:hover {
  background: #f8f9fa;
}

.order-item-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #667eea 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

/* Stepper Styles */
.progress-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 1rem;
  position: relative;
}

.stepper-item {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.stepper-circle-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
  cursor: help;
}

.stepper-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
  font-size: 1.25rem;
}

.stepper-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: #6c757d;
  max-width: 80px;
  word-wrap: break-word;
}

.stepper-date {
  font-size: 0.65rem;
  color: #6c757d;
  text-align: center;
  margin-top: 0.25rem;
  white-space: nowrap;
}

.stepper-line {
  flex: 1;
  height: 3px;
  background: #e0e0e0;
  margin: 0 0.5rem;
  transition: background 0.3s ease;
}

/* Pending State */
.stepper-item.pending .stepper-circle {
  border-color: #e0e0e0;
  color: #6c757d;
}

/* Completed State */
.stepper-item.completed .stepper-circle {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.stepper-item.completed .stepper-label {
  color: #28a745;
  font-weight: 700;
}

.stepper-item.completed .stepper-date {
  color: #28a745;
}

/* Current State */
.stepper-item.current .stepper-circle {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
  }
}

/* Failed State */
.stepper-item.failed .stepper-circle {
  border-color: #dc3545;
  background: #dc3545;
  color: white;
}

.stepper-item.failed .stepper-label {
  color: #dc3545;
  font-weight: 700;
}

.stepper-item.failed .stepper-date {
  color: #dc3545;
}

/* Line States */
.stepper-line.line-completed {
  background: #28a745;
}

.stepper-line.line-failed {
  background: #dc3545;
}

.stepper-line.line-pending {
  background: #e0e0e0;
}

/* Steps History */
.steps-history {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.history-item {
  position: relative;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #e0e0e0;
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-marker {
  position: absolute;
  left: -2.5rem;
  top: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e0e0e0;
  font-size: 0.875rem;
  z-index: 2;
}

.history-pending {
  border-left-color: #ffc107;
}

.history-pending .history-marker {
  border-color: #ffc107;
  color: #ffc107;
  background: #fff8e1;
}

.history-start {
  border-left-color: #17a2b8;
}

.history-start .history-marker {
  border-color: #17a2b8;
  color: #17a2b8;
  background: #e0f7fa;
}

.history-pickup {
  border-left-color: #0d6efd;
}

.history-pickup .history-marker {
  border-color: #0d6efd;
  color: #0d6efd;
  background: #e7f1ff;
}

.history-done {
  border-left-color: #28a745;
}

.history-done .history-marker {
  border-color: #28a745;
  color: #28a745;
  background: #e8f5e9;
}

.history-failed {
  border-left-color: #dc3545;
}

.history-failed .history-marker {
  border-color: #dc3545;
  color: #dc3545;
  background: #ffebee;
}

.history-status {
  font-size: 0.875rem;
}

/* Slide Down Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to {
  max-height: 800px;
  opacity: 1;
  transform: translateY(0);
}

.slide-down-leave-from {
  max-height: 800px;
  opacity: 1;
}

.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .progress-stepper {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem;
  }

  .stepper-item {
    width: 100%;
    flex-direction: column;
  }

  .stepper-line {
    width: 3px;
    height: 40px;
    margin: 0.5rem 0;
  }

  .stepper-circle {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stepper-label {
    max-width: none;
  }

  .history-timeline {
    padding-left: 1.5rem;
  }

  .history-marker {
    left: -2rem;
    width: 28px;
    height: 28px;
  }
}
</style>