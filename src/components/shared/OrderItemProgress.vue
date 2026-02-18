<template>
  <div class="order-item-card mb-3">
    <div class="order-item-header p-3 d-flex align-items-center justify-content-between cursor-pointer"
      @click="toggleExpanded">
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

    <!-- Next step actions + history -->
    <Transition name="slide-down">
      <div v-if="isExpanded" class="order-item-progress p-3 pt-0">
        <div v-if="showNextAction" class="next-step-panel mt-3 p-3 rounded border bg-white">
          <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div class="fw-semibold mb-1">
                {{ orderItem.order_item?.name }}
              </div>
              <div class="text-muted small">
                {{ formatDate(latestStep?.date) }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <button v-if="nextAction.type === 'single'" class="btn btn-primary btn-sm next-step-btn"
                :disabled="isSubmitting" @click.stop="submitNextStatus(nextAction.status)">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ t(`workPlan.status.${nextAction.status}`) }}
              </button>

              <template v-else-if="nextAction.type === 'final'">
                <button class="btn btn-success btn-sm next-step-btn" :disabled="isSubmitting"
                  @click.stop="submitNextStatus('done')">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                  {{ t('workPlan.status.done') }}
                </button>
                <button class="btn btn-outline-danger btn-sm next-step-btn" :disabled="isSubmitting"
                  @click.stop="submitNextStatus('failed')">
                  {{ t('workPlan.status.failed') }}
                </button>
              </template>

              <span v-else class="text-muted small">
                {{ t(`workPlan.status.${currentStatus}`) }}
              </span>
            </div>
          </div>

          <div v-if="submitError" class="alert alert-danger py-2 px-3 mt-3 mb-0">
            {{ submitError }}
          </div>
        </div>

        <div class="mt-3">
          <div class="fw-semibold mb-2">{{ t('workPlan.orderItems') }}</div>
          <div v-if="sortedSteps.length === 0" class="text-muted small">
            {{ t('workPlan.noOrderItems') }}
          </div>
          <ul v-else class="steps-history list-unstyled mb-0">
            <li v-for="step in sortedSteps" :key="step.id" class="d-flex align-items-center gap-2 py-2 border-bottom">
              <span :class="getStatusDotClass(step.status)" class="status-dot"></span>
              <span class="fw-semibold">{{ t(`workPlan.status.${step.status}`) }}</span>
              <span class="text-muted small ms-auto">{{ formatDateTime(step.created_at) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apiServices from '@/services/apiServices.js';

const { t, locale } = useI18n();

const props = defineProps({
  orderItem: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["updated"]);

const isExpanded = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");

// ✅ Step definitions in order - INCLUDING FAILED
const stepDefinitions = [
  { status: 'pending' },
  { status: 'start' },
  { status: 'pickup' },
  { status: 'done' },
  { status: 'failed' }
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

const nextAction = computed(() => {
  const status = currentStatus.value;
  if (status === "failed" || status === "done") return { type: "none" };
  if (status === "pending") return { type: "single", status: "start" };
  if (status === "start") return { type: "single", status: "pickup" };
  if (status === "pickup") return { type: "final" };
  return { type: "none" };
});

const submitNextStatus = async (status) => {
  if (!props.orderItem?.id) return;
  submitError.value = "";
  isSubmitting.value = true;
  try {
    const response = await apiServices.createWorkPlanSteps({
      workPlanOrdersId: props.orderItem.id,
      status,
    });

    // backend returns array of steps in response.data.data
    const stepsArray = Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data)
        ? response.data
        : [];

    const stepsForThisOrder = stepsArray.filter(
      (s) => String(s.work_plan_orders_id) === String(props.orderItem.id)
    );

    emit("updated", {
      workPlanOrderId: props.orderItem.id,
      steps: stepsForThisOrder.length > 0 ? stepsForThisOrder : stepsArray,
    });
  } catch (e) {
    submitError.value = e?.message || "Failed to update status";
  } finally {
    isSubmitting.value = false;
  }
};

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

  // ✅ CRITICAL: If failed status exists, show it as current
  const failedStep = getStepByStatus('failed');
  if (failedStep) {
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

  // ✅ If failed exists, show red lines after failed
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

const getStatusDotClass = (status) => {
  const classes = {
    pending: "dot-warning",
    start: "dot-info",
    pickup: "dot-primary",
    done: "dot-success",
    failed: "dot-danger",
  };
  return classes[status] || "dot-secondary";
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

.cursor-pointer {
  cursor: pointer;
}

.next-step-btn {
  border-radius: 999px;
  padding-left: 14px;
  padding-right: 14px;
  font-weight: 700;
}

.steps-history li:last-child {
  border-bottom: 0 !important;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot-warning {
  background: #ffc107;
}

.dot-info {
  background: #0dcaf0;
}

.dot-primary {
  background: #0d6efd;
}

.dot-success {
  background: #198754;
}

.dot-danger {
  background: #dc3545;
}

.dot-secondary {
  background: #6c757d;
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
}
</style>