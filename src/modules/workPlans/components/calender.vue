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
                                                <div class="col-md-12 mb-2 mb-md-0">
                                                    <span class="badge bg-secondary me-2">{{ index + 1 }}</span>
                                                    <strong>{{ $t('workPlan.orderName') }}:</strong>
                                                    <span class="text-primary ms-1">{{ order.order || '-' }}</span>
                                                </div>
                                                <!-- <div class="col-md-6">
                                                    <strong>{{ $t('workPlan.orderItems') }}:</strong>
                                                    <span class="text-success ms-1">{{ order.items || '-' }}</span>
                                                </div> -->
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

        <!-- Modal for Multiple Plans Selection -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showPlansModal" class="modal d-block" tabindex="-1" @click.self="closePlansModal">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content shadow-lg border-0 rounded-3">
                            <div class="modal-header bg-light border-bottom">
                                <h5 class="modal-title fw-semibold">
                                    <i class="bi bi-calendar-event me-2"></i>
                                    {{ $t('workPlan.selectPlan') }} ({{ plansForModal.length }})
                                </h5>
                                <button type="button" class="btn-close" @click="closePlansModal"></button>
                            </div>
                            <div class="modal-body p-3" style="max-height: 60vh; overflow-y: auto;">
                                <div v-for="plan in plansForModal" :key="plan.id"
                                    class="plan-option p-3 mb-2 border rounded-3 cursor-pointer"
                                    @click="selectPlanFromModal(plan)">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 class="mb-1 fw-semibold">{{ plan.name }}</h6>
                                            <small class="text-muted">
                                                <i class="bi bi-person-badge me-1"></i>
                                                {{ plan.driver_name || '-' }}
                                            </small>
                                        </div>
                                        <div>
                                            <span v-if="plan.orders && plan.orders.length > 0" class="badge bg-primary">
                                                {{ plan.orders.length }} {{ plan.orders.length === 1 ?
                                                $t('workPlan.order') : $t('workPlan.orders') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
            <Transition name="backdrop">
                <div v-if="showPlansModal" class="modal-backdrop" @click="closePlansModal"></div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
const showPlansModal = ref(false);
const plansForModal = ref([]);

onMounted(() => {
    nextTick(() => {
        if (calendar.value) {
            const calendarApi = calendar.value.getApi();
            calendarApi.removeAllEvents();
            calendarApi.addEventSource({
                events: calendarEvents.value
            });
        }
    });
});

const calendarEvents = computed(() => {
    // Group plans by date
    const plansByDate = {};

    props.workPlans
        .filter(plan => plan.date && plan.date.trim() !== '')
        .forEach(plan => {
            let date = plan.date;
            if (date.includes('T')) {
                date = date.split('T')[0];
            }

            if (!plansByDate[date]) {
                plansByDate[date] = [];
            }
            plansByDate[date].push(plan);
        });

    // Create events
    const events = [];
    Object.entries(plansByDate).forEach(([date, plans]) => {
        const totalPlans = plans.length;
        const firstPlan = plans[0];
        const orderCount = firstPlan.orders && firstPlan.orders.length > 0 ? firstPlan.orders.length : 0;

        // Truncate name to first 12 characters for display
        let displayName = firstPlan.name.length > 12 ? firstPlan.name.substring(0, 12) + '...' : firstPlan.name;

        // Show order count if any
        let title = displayName;
        if (orderCount > 0) {
            title = `${displayName} (${orderCount})`;
        }

        // Add first plan event
        events.push({
            id: firstPlan.id,
            title: title,
            start: date,
            backgroundColor: "var(--primary-color",
            borderColor: "var(--primary-color)",
            textColor: '#fff',
            classNames: ['work-plan-event'],
            extendedProps: {
                ...firstPlan,
                fullName: firstPlan.name,
                orderCount: orderCount,
                plansOnThisDate: totalPlans,
                allPlansForDate: plans,
                hasMultiplePlans: totalPlans > 1,
                sortOrder: 1,
                isMainPlan: true
            }
        });

        // Add "+N" button if there are more plans
        if (totalPlans > 1) {
            events.push({
                id: `more-${date}`,
                title: `+${totalPlans - 1}`,
                start: date,
                backgroundColor: "transparent",
                borderColor: "transparent",
                textColor: '#6c757d',
                classNames: ['more-plans-button'],
                extendedProps: {
                    isMoreButton: true,
                    allPlansForDate: plans,
                    date: date,
                    totalPlans: totalPlans,
                    sortOrder: 2,
                }
            });
        }
    });

    return events;
});

// Calendar options
const calendarOptions = ref({
    eventOrder: 'extendedProps.sortOrder',

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
    height: 600,
    eventClick: handleEventClick,
    dayMaxEvents: false,
    moreLinkText: (num) => `+${num}`,
    firstDay: 0,
    eventDisplay: 'block',
    displayEventTime: false,
    displayEventEnd: false,
    eventDidMount: function (info) {
        const props = info.event.extendedProps;

        // Skip tooltip for "+N" button
        if (props.isMoreButton) {
            return;
        }

        // Add tooltip on hover for main plans
        const tooltip = document.createElement('div');
        tooltip.className = 'event-tooltip';

        if (props.hasMultiplePlans) {
            // Show info that there are multiple plans
            tooltip.innerHTML = `
                <div class="tooltip-content">
                    <strong>${props.fullName}</strong>
                    ${props.driver_name ? `<div class="mt-1 small text-muted"><i class="bi bi-person-badge me-1"></i>${props.driver_name}</div>` : ''}
                    ${props.orderCount > 0 ?
                    `<div class="mt-1 small"><i class="bi bi-box-seam me-1"></i>${props.orderCount} ${props.orderCount === 1 ? t('workPlan.order') : t('workPlan.orders')}</div>`
                    : ''}
                    <div class="mt-2 pt-2" style="border-top: 1px solid rgba(255, 255, 255, 0.2);">
                        <small class="text-muted"><i class="bi bi-calendar-plus me-1"></i>${props.plansOnThisDate} ${t('workPlan.totalPlans')}</small>
                    </div>
                </div>
            `;
        } else {
            // Show single plan details
            tooltip.innerHTML = `
                <div class="tooltip-content">
                    <strong>${props.fullName}</strong>
                    ${props.driver_name ? `<div class="mt-1 small text-muted"><i class="bi bi-person-badge me-1"></i>${props.driver_name}</div>` : ''}
                    ${props.orderCount > 0 ?
                    `<div class="mt-1 small"><i class="bi bi-box-seam me-1"></i>${props.orderCount} ${props.orderCount === 1 ? t('workPlan.order') : t('workPlan.orders')}</div>`
                    : ''}
                </div>
            `;
        }

        info.el.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            const rect = info.el.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;

            // Adjust if tooltip goes off screen
            const tooltipRect = tooltip.getBoundingClientRect();
            if (tooltipRect.left < 10) {
                tooltip.style.left = '10px';
            }
            if (tooltipRect.right > window.innerWidth - 10) {
                tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
            }

            tooltip.classList.add('show');
        });

        info.el.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(tooltip)) {
                    document.body.removeChild(tooltip);
                }
            }, 200);
        });
    }
});

// Handle event click
function handleEventClick(info) {
    const props = info.event.extendedProps;

    // If it's the "+N" button - show modal with all plans
    if (props.isMoreButton) {
        plansForModal.value = props.allPlansForDate;
        showPlansModal.value = true;
        return;
    }

    // If it's a main plan with multiple plans - show details of clicked plan
    if (props.isMainPlan) {
        selectedPlan.value = props;
    }
}

// Select plan from modal
function selectPlanFromModal(plan) {
    selectedPlan.value = plan;
    closePlansModal();
}

// Close modal
function closePlansModal() {
    showPlansModal.value = false;
    plansForModal.value = [];
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
watch(calendarEvents, (newEvents) => {
    if (calendar.value) {
        const calendarApi = calendar.value.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource({
            events: newEvents
        });
    }
}, { deep: true });
</script>

<style scoped>
.calendar-container {
    animation: fadeIn 0.3s ease-in;
}

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
    font-size: 0.8rem;
    padding: 6px 8px;
    border: none !important;
    border-radius: 6px;
    margin: 3px 0;
    font-weight: 500;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis;
    line-height: 1.3;
    display: block !important;
}

.fc-event:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    transition: all 0.2s ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

/* Style for the +N button */
.fc-event.more-plans-button {
    background-color: red !important;
    border-color: red !important;
    font-size: 0.75rem;
    padding: 4px 8px;
    text-align: center;
    font-weight: 600;
    margin-top: 2px !important;
    cursor: pointer !important;
}

.fc-event.more-plans-button:hover {
    background-color: red !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Style for main work plan events */
.fc-event.work-plan-event {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
}

.fc-daygrid-event-harness {
    margin-bottom: 0 !important;
}

.fc-daygrid-day-events {
    margin-top: 3px !important;
    min-height: 24px;
}

.fc .fc-daygrid-day {
    min-height: 100px !important;
}

.fc .fc-daygrid-day-frame {
    min-height: 100px !important;
    position: relative;
}

.fc-daygrid-day-bottom {
    margin-top: 0 !important;
}

/* Tooltip Styles */
:deep(.event-tooltip) {
    position: fixed;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    max-width: 300px;
    min-width: 200px;
}

:deep(.event-tooltip.show) {
    opacity: 1;
}

:deep(.event-tooltip::before) {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.95);
}

:deep(.tooltip-content) {
    line-height: 1.5;
}

:deep(.tooltip-plan) {
    padding: 8px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.tooltip-plan:first-child) {
    padding-top: 0;
    border-top: none;
}

:deep(.tooltip-plan strong) {
    display: block;
    margin-bottom: 4px;
    color: #fff;
}

:deep(.tooltip-plan .small) {
    font-size: 0.75rem;
    opacity: 0.9;
    margin-top: 2px;
}

:deep(.tooltip-plan .text-muted) {
    color: rgba(255, 255, 255, 0.7) !important;
}

/* Modal Styles */
.modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1040;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1050;
    overflow-x: hidden;
    overflow-y: auto;
}

.plan-option {
    transition: all 0.2s ease;
    cursor: pointer;
}

.plan-option:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Modal Transitions */
.modal-enter-active {
    transition: opacity 0.2s ease;
}

.modal-leave-active {
    transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-dialog {
    transition: transform 0.2s ease-out;
}

.modal-leave-active .modal-dialog {
    transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
    transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-dialog {
    transform: scale(0.95);
}

.backdrop-enter-active,
.backdrop-leave-active {
    transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
    opacity: 0;
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