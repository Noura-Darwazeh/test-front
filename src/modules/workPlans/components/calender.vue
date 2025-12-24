<template>
    <div class="calendar-container">
        <div class="row g-3">
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
                        :style="{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-text)' }">

                        <h5 class="mb-0 d-flex align-items-center gap-2">
                            <i class="bi bi-card-checklist"></i>
                            {{ $t('workPlan.planDetails') }}
                        </h5>
                    </div>

                    <div class="card-body p-4">
                        <div class="row g-3">
                            <!-- Plan Name -->
                            <div class="col-12">
                                <div class="detail-item">
                                    <label class="detail-label">

                                        {{ $t('workPlan.name') }}
                                    </label>
                                    <div class="detail-value">{{ selectedPlan.name }}</div>
                                </div>
                            </div>

                            <!-- Company -->
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label class="detail-label">
                                        {{ $t('workPlan.companyName') }}
                                    </label>
                                    <span class="badge badge-lg m-2 p-2"
                                        :style="{ backgroundColor: 'var(--primary-color)' }">
                                        {{ selectedPlan.company_name }}
                                    </span>
                                </div>
                            </div>
                            <!-- Date -->
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label class="detail-label">
                                        Date
                                    </label>
                                    <div class="detail-value">
                                        {{ formatDate(selectedPlan.date) }}
                                        
                                    </div>
                                </div>
                            </div>

                            <!-- Order Name -->
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label class="detail-label">
                                        {{ $t('workPlan.orderName') }}
                                    </label>
                                    <div class="detail-value">{{ selectedPlan.order_name || '-' }}</div>
                                </div>
                            </div>

                            <!-- Order Type -->
                            <div class="col-md-6">
                                <div class="detail-item">
                                    <label class="detail-label">
                                        {{ $t('workPlan.orderItems') }}
                                    </label>
                                    <div class="detail-value">{{ selectedPlan.order_items || '-' }}</div>
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
                        <!-- <p class="text-muted small mb-0">اضغط على يوم في الروزنامة لعرض تفاصيل الخطة</p> -->
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
        order_name:plan.order_name,
        backgroundColor: "var(--primary-color)",
        extendedProps: {
            company_name: plan.company_name,
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
        today: t('workPlan.calendar.today'),
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
        month: 'short',
        day: 'numeric'
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

<style>
.fc .fc-button {
    background-color: var(--primary-color);
    border-color: var(--text-color);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
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
    background-color: var(--color-text-muted) !important;
}

.fc-event {
    cursor: pointer;
    font-size: 0.7rem;
    padding: 1px 3px;
    border: none !important;
}

.fc-event:hover {
    opacity: 0.8;
}
</style>