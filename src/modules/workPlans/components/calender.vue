<template>
    <div class="calendar-container">
        <div class="row g-2">
            <!-- Calendar -->
            <div class="col-md-5">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-3">
                        <FullCalendar ref="calendar" :options="calendarOptions" />
                    </div>
                </div>
            </div>

            <!-- Plan Details Card -->
            <div class="col-md-7">
                <div v-if="selectedPlan" class="card border-0 shadow-sm animate-slide-in">
                    <div class="card-header border-bottom py-3"
                        :style="{ backgroundColor: 'var(--primary-color)', color: '#fff' }">
                        <h5 class="mb-0 d-flex align-items-center gap-2">
                            <i class="bi bi-card-checklist"></i>
                            {{ $t('workPlan.planDetails') }}
                        </h5>
                    </div>

                    <div class="card-body p-4">
                        <div class="row g-3">
                            <!-- Plan Name -->
                            <div class="col-12">
                                <div class="detail-item p-3 bg-light rounded-3">
                                    <label
                                        class="detail-label text-muted small fw-semibold text-uppercase mb-2 d-block">
                                        <i class="bi bi-pencil-square me-1"></i>
                                        {{ $t('workPlan.name') }}
                                    </label>
                                    <div class="detail-value text-dark fw-medium fs-5">{{ selectedPlan.name }}</div>
                                </div>
                            </div>

                            <!-- Driver Name -->
                            <div class="col-md-6">
                                <div class="detail-item p-3 bg-light rounded-3">
                                    <label
                                        class="detail-label text-muted small fw-semibold text-uppercase mb-2 d-block">
                                        <i class="bi bi-person-badge me-1"></i>
                                        {{ $t('workPlan.driverName') }}
                                    </label>
                                    <div class="detail-value text-dark fw-medium">{{ selectedPlan.driver_name || '-' }}
                                    </div>
                                </div>
                            </div>

                            <!-- Company -->
                            <div class="col-md-6">
                                <div class="detail-item p-3 bg-light rounded-3">
                                    <label
                                        class="detail-label text-muted small fw-semibold text-uppercase mb-2 d-block">
                                        <i class="bi bi-building me-1"></i>
                                        {{ $t('workPlan.companyName') }}
                                    </label>
                                    <span class="badge fs-6 px-3 py-2"
                                        :style="{ backgroundColor: 'var(--primary-color)', color: '#fff' }">
                                        {{ selectedPlan.company_name }}
                                    </span>
                                </div>
                            </div>

                            <!-- Date -->
                            <div class="col-md-12">
                                <div class="detail-item p-3 bg-light rounded-3">
                                    <label
                                        class="detail-label text-muted small fw-semibold text-uppercase mb-2 d-block">
                                        <i class="bi bi-calendar-event me-1"></i>
                                        {{ $t('workPlan.date') }}
                                    </label>
                                    <div class="detail-value text-dark fw-medium">
                                        <i class="bi bi-calendar3 me-2"></i>
                                        {{ formatDate(selectedPlan.date) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Orders Section -->
                            <div class="col-12" v-if="selectedPlan.orders && selectedPlan.orders.length > 0">
                                <div class="detail-item p-3 bg-light rounded-3">
                                    <label
                                        class="detail-label text-muted small fw-semibold text-uppercase mb-3 d-block">
                                        <i class="bi bi-box-seam me-1"></i>
                                        {{ $t('workPlan.orders') }}
                                    </label>
                                    <div class="orders-list">
                                        <div v-for="(order, index) in selectedPlan.orders" :key="index"
                                            class="order-item mb-2 p-3 bg-white rounded border">
                                            <div class="row">
                                                <div class="col-md-6 mb-2 mb-md-0">
                                                    <span class="badge bg-secondary me-2">{{ index + 1 }}</span>
                                                    <strong>{{ $t('workPlan.orderName') }}:</strong>
                                                    <span class="text-primary ms-1">{{ order.order || '-' }}</span>
                                                </div>
                                                <div class="col-md-6">
                                                    <strong>{{ $t('workPlan.orderItems') }}:</strong>
                                                    <span class="text-success ms-1">{{ order.items || '-' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty Orders State -->
                            <div class="col-12" v-else>
                                <div class="detail-item p-3 bg-light rounded-3 text-center">
                                    <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                                    <p class="text-muted mb-0 mt-2">{{ $t('workPlan.noOrders') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer bg-light py-3">
                        <div class="d-flex gap-2">
                            <PrimaryButton :text="$t('workPlan.edit')" bgColor="var(--primary-color)"
                                @click="editPlan" />
                            <PrimaryButton :text="$t('common.close')" bg-color="var(--color-secondary)"
                                @click="closePlanDetails" />
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="card border-0 shadow-sm empty-state-card">
                    <div class="card-body text-center py-5">
                        <div class="empty-state-icon">
                            <i class="bi bi-calendar-check"></i>
                        </div>
                        <h5 class="text-muted mt-4 mb-2">{{ $t('workPlan.selectDate') }}</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar';
import PrimaryButton from '../../../components/shared/PrimaryButton.vue';

const props = defineProps({
    workPlans: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['edit-plan', 'view-details']);

const { t, locale } = useI18n();
const calendar = ref(null);
const selectedPlan = ref(null);

const calendarEvents = computed(() => {
    return props.workPlans.map(plan => ({
        id: plan.id,
        title: plan.name,
        start: plan.date,
        backgroundColor: "var(--primary-color)",
        extendedProps: {
            ...plan
        }
    }));
});

// Calendar options
const calendarOptions = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: locale.value === 'ar' ? arLocale : 'en',
    direction: locale.value === 'ar' ? 'rtl' : 'ltr',
    headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: ''
    },
    buttonText: {
        today: t('workPlan.today') || 'Today',
    },
    height: 400,
    events: calendarEvents.value,
    eventClick: handleEventClick,
    dayMaxEvents: 1,
    moreLinkText: (num) => `+${num}`,
    firstDay: 0,
    eventDisplay: 'block',
});

// Handle event click
function handleEventClick(info) {
    const planId = parseInt(info.event.id);
    selectedPlan.value = props.workPlans.find(p => p.id === planId);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// Close plan details
function closePlanDetails() {
    selectedPlan.value = null;
}

// Edit plan
function editPlan() {
    emit('edit-plan', selectedPlan.value);
}

// Watch for locale changes
watch(() => locale.value, (newLocale) => {
    if (calendar.value) {
        const calendarApi = calendar.value.getApi();
        calendarApi.setOption('locale', newLocale === 'ar' ? arLocale : 'en');
        calendarApi.setOption('direction', newLocale === 'ar' ? 'rtl' : 'ltr');
    }
});

// Watch for workPlans changes
watch(() => props.workPlans, () => {
    calendarOptions.value.events = calendarEvents.value;
}, { deep: true });
</script>

<style scoped>
.calendar-container {
    animation: fadeIn 0.3s ease-in;
}

/* @keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
} */

.animate-slide-in {
    animation: slideIn 0.3s ease-out;
}

.detail-item {
    transition: all 0.2s ease;
}


.order-item {
    transition: all 0.2s ease;
}


.orders-list {
    max-height: 300px;
    overflow-y: auto;
}

.orders-list::-webkit-scrollbar {
    width: 6px;
}

.orders-list::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
}

/* FullCalendar Styling */
.fc .fc-button {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.fc .fc-button:hover {
    background-color: var(--primary-color);
    opacity: 0.9;
}

.fc .fc-toolbar-title {
    font-size: 1.5rem;
    font-weight: 600;
}

.fc .fc-col-header-cell a {
    padding: 0.5rem 0.25rem;
    font-weight: 600;
    font-size: 0.75rem;
    color: var(--primary-color) !important;
}

.fc .fc-daygrid-day-number {
    padding: 0.25rem;
    font-size: 0.75rem;
    color: var(--primary-color) !important;
}

.fc .fc-daygrid-day.fc-day-today {
    background-color: rgba(var(--primary-color-rgb), 0.1) !important;
}

.fc-event {
    cursor: pointer;
    font-size: 0.7rem;
    padding: 2px 4px;
    border: none !important;
    border-radius: 4px;
}

.fc-event:hover {
    opacity: 0.8;
    transform: scale(1.02);
    transition: all 0.2s ease;
}

/* RTL Support */
[dir="rtl"] .order-item:hover {
    transform: translateX(-5px);
}

[dir="rtl"] .bi {
    margin-right: 0;
    margin-left: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {

    .col-md-7,
    .col-md-5 {
        flex: 0 0 100%;
        max-width: 100%;
    }

    .order-item .row {
        flex-direction: column;
    }

    .fc .fc-toolbar {
        flex-direction: column;
        gap: 1rem;
    }
}
</style>