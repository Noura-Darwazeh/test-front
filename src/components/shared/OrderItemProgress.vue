<template>
  <div class="order-card" :class="`status--${currentStatus}`">

    <!-- ─── Header ─── -->
    <div class="order-card__header" @click="toggleExpanded">
      <div class="order-card__info">
        <!-- Status icon -->
        <div class="status-icon" :class="`status-icon--${currentStatus}`">
          <i :class="getStatusIcon(currentStatus)"></i>
        </div>

        <div>
          <div class="order-card__name">{{ orderItem.order_item?.name }}</div>
          <div class="order-card__meta">
            <i class="bi bi-calendar3"></i>
            {{ formatDate(latestStep?.date) }}
          </div>
        </div>
      </div>

      <div class="order-card__actions" @click.stop>
        <!-- Status badge -->
        <span class="status-badge" :class="`status-badge--${currentStatus}`">
          <i :class="getStatusIcon(currentStatus)"></i>
          {{ t(`workPlan.status.${currentStatus}`) }}
        </span>

        <!-- Next Step Button -->
        <template v-if="nextAction.type === 'single'">
          <button
            class="action-btn action-btn--primary"
            :disabled="isSubmitting"
            @click="submitNextStatus(nextAction.status)"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
            <i v-else :class="getStatusIcon(nextAction.status)"></i>
            {{ t(`workPlan.status.${nextAction.status}`) }}
            <i class="bi bi-arrow-right"></i>
          </button>
        </template>

        <template v-else-if="nextAction.type === 'final'">
          <button
            class="action-btn action-btn--success"
            :disabled="isSubmitting"
            @click="submitNextStatus('done')"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-check-circle-fill"></i>
            {{ t('workPlan.status.done') }}
          </button>
          <button
            class="action-btn action-btn--danger"
            :disabled="isSubmitting"
            @click="submitNextStatus('failed')"
          >
            <i class="bi bi-x-circle-fill"></i>
            {{ t('workPlan.status.failed') }}
          </button>
        </template>

        <!-- Expand toggle -->
        <button class="expand-btn" :class="{ 'expand-btn--open': isExpanded }">
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>
    </div>

    <!-- ─── Error ─── -->
    <div v-if="submitError" class="order-card__error">
      <i class="bi bi-exclamation-triangle-fill"></i>
      {{ submitError }}
    </div>

    <!-- ─── Progress Track ─── -->
    <div class="progress-track">
      <div
        v-for="(step, idx) in stepFlow"
        :key="step.status"
        class="progress-step"
        :class="getStepClass(step.status, idx)"
      >
        <div class="progress-step__dot">
          <i :class="getStatusIcon(step.status)"></i>
        </div>
        <div class="progress-step__line" v-if="idx < stepFlow.length - 1"></div>
        <div class="progress-step__label">{{ t(`workPlan.status.${step.status}`) }}</div>
      </div>
    </div>

    <!-- ─── History (expanded) ─── -->
    <Transition name="slide-down">
      <div v-if="isExpanded" class="order-card__history">
        <div class="history-title">
          <i class="bi bi-clock-history"></i>
          {{ t('workPlan.orderItems') }}
        </div>

        <div v-if="sortedSteps.length === 0" class="history-empty">
          <i class="bi bi-inbox"></i>
          {{ t('workPlan.noOrderItems') }}
        </div>

        <div v-else class="history-list">
          <div
            v-for="step in sortedSteps"
            :key="step.id"
            class="history-item"
            :class="`history-item--${step.status}`"
          >
            <div class="history-item__icon">
              <i :class="getStatusIcon(step.status)"></i>
            </div>
            <div class="history-item__content">
              <span class="history-item__status">{{ t(`workPlan.status.${step.status}`) }}</span>
              <span class="history-item__time">{{ formatDateTime(step.created_at) }}</span>
            </div>
          </div>
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
  orderItem: { type: Object, required: true }
});

const emit = defineEmits(['updated']);

const isExpanded   = ref(false);
const isSubmitting = ref(false);
const submitError  = ref('');

// ─── Step flow ──────────────────────────────────────────────────────────────
const stepFlow = [
  { status: 'pending' },
  { status: 'start'   },
  { status: 'pickup'  },
  { status: 'done'    },
];

// ─── Computed ───────────────────────────────────────────────────────────────
const sortedSteps = computed(() => {
  if (!Array.isArray(props.orderItem.steps)) return [];
  return [...props.orderItem.steps].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
});

const latestStep    = computed(() => sortedSteps.value.at(-1) ?? null);
const currentStatus = computed(() => latestStep.value?.status ?? 'pending');

const nextAction = computed(() => {
  switch (currentStatus.value) {
    case 'pending': return { type: 'single', status: 'start'  };
    case 'start'  : return { type: 'single', status: 'pickup' };
    case 'pickup' : return { type: 'final'                    };
    default       : return { type: 'none'                     };
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusIconMap = {
  pending : 'bi bi-hourglass-split',
  start   : 'bi bi-play-circle-fill',
  pickup  : 'bi bi-box-arrow-up',
  done    : 'bi bi-check-circle-fill',
  failed  : 'bi bi-x-circle-fill',
};
const getStatusIcon = (s) => statusIconMap[s] ?? 'bi bi-circle';

const getStepClass = (status, idx) => {
  const hasFailed  = sortedSteps.value.some(s => s.status === 'failed');
  const failedIdx  = stepFlow.findIndex(s => s.status === 'failed');

  if (hasFailed) {
    if (status === 'failed') return 'progress-step--failed progress-step--current';
    if (idx < failedIdx)     return 'progress-step--completed';
    return 'progress-step--upcoming';
  }

  const exists = sortedSteps.value.some(s => s.status === status);
  if (!exists) return 'progress-step--upcoming';
  if (status === currentStatus.value) return 'progress-step--completed progress-step--current';
  return 'progress-step--completed';
};

// ─── API ─────────────────────────────────────────────────────────────────────
const submitNextStatus = async (status) => {
  if (!props.orderItem?.id) return;
  submitError.value = '';
  isSubmitting.value = true;
  try {
    const response = await apiServices.createWorkPlanSteps({
      workPlanOrdersId: props.orderItem.id,
      status,
    });
    const all  = Array.isArray(response?.data?.data) ? response.data.data
               : Array.isArray(response?.data)       ? response.data : [];
    const mine = all.filter(s => String(s.work_plan_orders_id) === String(props.orderItem.id));
    emit('updated', { workPlanOrderId: props.orderItem.id, steps: mine.length ? mine : all });
  } catch (e) {
    submitError.value = e?.message ?? 'Failed to update status';
  } finally {
    isSubmitting.value = false;
  }
};

const toggleExpanded = () => { isExpanded.value = !isExpanded.value; };

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );
};
const formatDateTime = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString(
    locale.value === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
};
</script>

<style scoped>
/* ─── Card ──────────────────────────────────────────────────────────────── */
.order-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #e8eaf0;
  margin-bottom: 0.875rem;
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.order-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

/* left accent stripe */
.order-card.status--pending { border-left: 4px solid #ffc107; }
.order-card.status--start   { border-left: 4px solid #0dcaf0; }
.order-card.status--pickup  { border-left: 4px solid #0d6efd; }
.order-card.status--done    { border-left: 4px solid #198754; }
.order-card.status--failed  { border-left: 4px solid #dc3545; }

/* ─── Header ────────────────────────────────────────────────────────────── */
.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  cursor: pointer;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.order-card__header:hover { background: #fafbfc; }

.order-card__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}
.order-card__name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1a1d23;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.order-card__meta {
  font-size: 0.75rem;
  color: #8a93a2;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ─── Status icon ───────────────────────────────────────────────────────── */
.status-icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.status-icon--pending { background: #fff8e1; color: #f59e0b; }
.status-icon--start   { background: #e0f7fa; color: #0284c7; }
.status-icon--pickup  { background: #e8eeff; color: #3b5bdb; }
.status-icon--done    { background: #e6f4ea; color: #16a34a; }
.status-icon--failed  { background: #fdecea; color: #dc2626; }

/* ─── Actions row ───────────────────────────────────────────────────────── */
.order-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ─── Status badge ──────────────────────────────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.status-badge--pending { background: #fff3cd; color: #856404; }
.status-badge--start   { background: #cff4fc; color: #0a6f84; }
.status-badge--pickup  { background: #dbeafe; color: #1d4ed8; }
.status-badge--done    { background: #d1fae5; color: #065f46; }
.status-badge--failed  { background: #fee2e2; color: #991b1b; }

/* ─── Action buttons ────────────────────────────────────────────────────── */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.action-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.action-btn:not(:disabled):active { transform: translateY(0); }

.action-btn--primary { background: #0d6efd; color: #fff; }
.action-btn--primary:not(:disabled):hover { background: #0b5ed7; }
.action-btn--success { background: #198754; color: #fff; }
.action-btn--success:not(:disabled):hover { background: #146c43; }
.action-btn--danger  { background: transparent; color: #dc3545; border: 1.5px solid #dc3545; }
.action-btn--danger:not(:disabled):hover  { background: #dc3545; color: #fff; }

/* ─── Expand button ─────────────────────────────────────────────────────── */
.expand-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid #e2e6ea;
  background: #f8f9fa;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.expand-btn:hover { border-color: #0d6efd; color: #0d6efd; background: #e8f0ff; }
.expand-btn--open { transform: rotate(180deg); border-color: #0d6efd; color: #0d6efd; }
.expand-btn i { pointer-events: none; font-size: 0.75rem; }

/* ─── Error banner ──────────────────────────────────────────────────────── */
.order-card__error {
  margin: 0 1rem 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fdecea;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ─── Progress track ────────────────────────────────────────────────────── */
.progress-track {
  display: flex;
  align-items: flex-start;
  padding: 0.625rem 1.25rem 0.875rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}
.progress-step__dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem;
  border: 2px solid #dee2e6;
  background: #f8f9fa;
  color: #adb5bd;
  z-index: 1;
  transition: all 0.25s ease;
}
.progress-step__label {
  font-size: 0.63rem;
  font-weight: 500;
  color: #adb5bd;
  margin-top: 5px;
  text-align: center;
  text-transform: capitalize;
}
/* connecting line */
.progress-step__line {
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #dee2e6;
  z-index: 0;
}

/* completed */
.progress-step--completed .progress-step__dot  { background: #0d6efd; border-color: #0d6efd; color: #fff; }
.progress-step--completed .progress-step__label{ color: #0d6efd; font-weight: 600; }
.progress-step--completed .progress-step__line { background: #0d6efd; }

/* current pulse */
.progress-step--current .progress-step__dot { box-shadow: 0 0 0 5px rgba(13,110,253,0.18); transform: scale(1.1); }

/* failed */
.progress-step--failed .progress-step__dot  { background: #dc3545; border-color: #dc3545; color: #fff; }
.progress-step--failed .progress-step__label{ color: #dc3545; font-weight: 600; }
.progress-step--failed.progress-step--current .progress-step__dot { box-shadow: 0 0 0 5px rgba(220,53,69,0.18); }

/* done overrides to green */
.order-card.status--done .progress-step--completed .progress-step__dot  { background: #198754; border-color: #198754; }
.order-card.status--done .progress-step--completed .progress-step__line { background: #198754; }
.order-card.status--done .progress-step--completed .progress-step__label{ color: #198754; }
.order-card.status--done .progress-step--current .progress-step__dot    { box-shadow: 0 0 0 5px rgba(25,135,84,0.18); }

/* ─── History ───────────────────────────────────────────────────────────── */
.order-card__history {
  border-top: 1px solid #f0f1f4;
  padding: 0.875rem 1rem 1rem;
  background: #fafbfc;
}
.history-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.625rem;
  display: flex; align-items: center; gap: 6px;
}
.history-empty {
  text-align: center;
  color: #adb5bd;
  font-size: 0.8rem;
  padding: 0.75rem 0;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.history-list { display: flex; flex-direction: column; gap: 6px; }

.history-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e9ecef;
}
.history-item__icon {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.history-item--pending .history-item__icon { background: #fff8e1; color: #f59e0b; }
.history-item--start   .history-item__icon { background: #e0f7fa; color: #0284c7; }
.history-item--pickup  .history-item__icon { background: #e8eeff; color: #3b5bdb; }
.history-item--done    .history-item__icon { background: #e6f4ea; color: #16a34a; }
.history-item--failed  .history-item__icon { background: #fdecea; color: #dc2626; }

.history-item__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.history-item__status { font-weight: 600; font-size: 0.82rem; color: #1a1d23; text-transform: capitalize; }
.history-item__time   { font-size: 0.72rem; color: #8a93a2; }

.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.28s ease; overflow: hidden; }
.slide-down-enter-from   { max-height: 0; opacity: 0; }
.slide-down-enter-to     { max-height: 600px; opacity: 1; }
.slide-down-leave-from   { max-height: 600px; opacity: 1; }
.slide-down-leave-to     { max-height: 0; opacity: 0; }

@media (max-width: 600px) {
  .order-card__header  { flex-direction: column; align-items: flex-start; }
  .order-card__actions { width: 100%; justify-content: flex-end; }
  .order-card__name    { max-width: 100%; }
  .action-btn          { font-size: 0.75rem; padding: 0.35rem 0.7rem; }
}
</style>