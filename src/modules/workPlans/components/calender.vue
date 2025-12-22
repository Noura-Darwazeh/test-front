<template>
    <div class="calendar-container">
        <div class="row g-3">
            <!-- Small Calendar -->
            <div class="col-md-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-2">
                        <FullCalendar ref="calendar" :options="calendarOptions" />
                    </div>
                </div>
            </div>

            <!-- Plan Details Card -->
            <div class="col-md-8">
                <div v-if="selectedPlan" class="card border-0 shadow-sm">
                    <div class="card-header border-bottom py-2" 
                         :style="{ backgroundColor: getCompanyColor(selectedPlan.company_name), color: 'white' }">
                        <h6 class="mb-0 d-flex align-items-center gap-2">
                            <i class="bi bi-card-checklist"></i>
                            {{ $t('workPlan.planDetails') }}
                        </h6>
                    </div>
                    
                    <div class="card-body p-3">
                        <div class="row g-2">
                            <!-- Plan Name -->
                            <div class="col-12">
                                <div class="border-bottom pb-2 mb-2">
                                    <small class="text-muted d-block mb-1">{{ $t('workPlan.name') }}</small>
                                    <strong class="d-block">{{ selectedPlan.name }}</strong>
                                </div>
                            </div>

                            <!-- Company -->
                            <div class="col-6">
                                <small class="text-muted d-block mb-1">{{ $t('workPlan.company') }}</small>
                                <span class="badge" 
                                      :style="{ backgroundColor: getCompanyColor(selectedPlan.company_name) }">
                                    {{ selectedPlan.company_name }}
                                </span>
                            </div>

                            <!-- Date Range -->
                            <div class="col-6">
                                <small class="text-muted d-block mb-1">{{ $t('workPlan.duration') }}</small>
                                <small class="d-block">
                                    {{ formatDate(selectedPlan.start_date) }} - {{ formatDate(selectedPlan.end_date) }}
                                </small>
                            </div>

                            <!-- Order Name -->
                            <div class="col-6">
                                <small class="text-muted d-block mb-1">{{ $t('workPlan.orderName') }}</small>
                                <strong class="d-block">{{ selectedPlan.order_name || '-' }}</strong>
                            </div>

                            <!-- Order Type -->
                            <div class="col-6">
                                <small class="text-muted d-block mb-1">{{ $t('workPlan.orderType') }}</small>
                                <strong class="d-block">{{ selectedPlan.order_type || '-' }}</strong>
                            </div>

                            <!-- Description -->
                            <div class="col-12">
                                <small class="text-muted d-block mb-1">{{ $t('workPlan.description') }}</small>
                                <p class="mb-0 small">{{ selectedPlan.description || $t('workPlan.noDescription') }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer bg-light py-2">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary" @click="editPlan">
                                <i class="bi bi-pencil me-1"></i>
                                {{ $t('workPlan.edit') }}
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" @click="closePlanDetails">
                                <i class="bi bi-x-circle me-1"></i>
                                {{ $t('common.close') }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="card border-0 shadow-sm">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-calendar-check text-muted" style="font-size: 3rem;"></i>
                        <p class="text-muted mt-3 mb-0">{{ $t('workPlan.selectDate') }}</p>
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

// Company colors
const companyColors = computed(() => {
    const colors = {};
    const colorPalette = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    
    let colorIndex = 0;
    props.workPlans.forEach(plan => {
        if (!colors[plan.company_name]) {
            colors[plan.company_name] = colorPalette[colorIndex % colorPalette.length];
            colorIndex++;
        }
    });
    
    return colors;
});

// Calendar events
const calendarEvents = computed(() => {
    return props.workPlans.map(plan => ({
        id: plan.id,
        title: plan.name,
        start: plan.start_date,
        end: plan.end_date,
        backgroundColor: getCompanyColor(plan.company_name),
        borderColor: getCompanyColor(plan.company_name),
        extendedProps: {
            description: plan.description,
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

// Get company color
function getCompanyColor(companyName) {
    return companyColors.value[companyName] || '#6c757d';
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
/* Compact Calendar Styling */
.fc {
    font-family: inherit;
    font-size: 0.875rem;
}

.fc .fc-button {
    background-color: var(--bs-primary);
    border-color: var(--bs-primary);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.fc .fc-toolbar-title {
    font-size: 1rem;
    font-weight: 600;
}

.fc .fc-col-header-cell {
    padding: 0.5rem 0.25rem;
    background-color: #f8f9fa;
    font-weight: 600;
    font-size: 0.75rem;
}

.fc .fc-daygrid-day {
    cursor: pointer;
}

.fc .fc-daygrid-day-number {
    padding: 0.25rem;
    font-size: 0.75rem;
}

.fc .fc-daygrid-day.fc-day-today {
    background-color: rgba(13, 110, 253, 0.1) !important;
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

.fc .fc-more-link {
    font-size: 0.7rem;
    color: var(--bs-primary);
}
</style>