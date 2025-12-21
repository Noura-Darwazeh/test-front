<template>
    <div class="calendar-container card border-0">
        <div class="card-body">
            <!-- Calendar Header -->
            <div class="calendar-header d-flex justify-content-between align-items-center mb-4">
                <button class="btn btn-outline-primary" @click="previousMonth">
                    <i class="bi" :class="isRTL ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
                </button>
                <h4 class="mb-0">{{ currentMonthYear }}</h4>
                <button class="btn btn-outline-primary" @click="nextMonth">
                    <i class="bi" :class="isRTL ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
                </button>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid">
                <!-- Weekday Headers -->
                <div v-for="day in weekDays" :key="day" class="calendar-weekday">
                    {{ day }}
                </div>

                <!-- Calendar Days -->
                <div v-for="day in calendarDays" :key="day.date" 
                     class="calendar-day" 
                     :class="{ 
                         'other-month': !day.isCurrentMonth,
                         'today': day.isToday,
                         'has-plans': day.plans.length > 0
                     }">
                    <div class="day-number">{{ day.dayNumber }}</div>
                    
                    <!-- Work Plans for this day -->
                    <div v-if="day.plans.length > 0" class="day-plans">
                        <div v-for="plan in day.plans.slice(0, 2)" :key="plan.id" 
                             class="plan-badge"
                             :style="{ backgroundColor: getCompanyColor(plan.company_name) }"
                             @click="$emit('view-details', plan)">
                            <small>{{ plan.name }}</small>
                        </div>
                        <div v-if="day.plans.length > 2" class="more-plans" @click="showDayPlans(day)">
                            <small>+{{ day.plans.length - 2 }} {{ $t('workPlan.calendar.more') }}</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Legend -->
            <div class="calendar-legend mt-4">
                <div class="d-flex flex-wrap gap-3">
                    <div v-for="(color, company) in companyColors" :key="company" class="legend-item">
                        <span class="legend-color" :style="{ backgroundColor: color }"></span>
                        <span>{{ company }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    workPlans: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['edit-plan', 'view-details']);

const { t, locale } = useI18n();
const currentDate = ref(new Date());

const isRTL = computed(() => locale.value === 'ar');

const weekDays = computed(() => {
    const days = isRTL.value 
        ? [
            t('workPlan.calendar.days.sunday'),
            t('workPlan.calendar.days.saturday'),
            t('workPlan.calendar.days.friday'),
            t('workPlan.calendar.days.thursday'),
            t('workPlan.calendar.days.wednesday'),
            t('workPlan.calendar.days.tuesday'),
            t('workPlan.calendar.days.monday')
        ]
        : [
            t('workPlan.calendar.days.sunday'),
            t('workPlan.calendar.days.monday'),
            t('workPlan.calendar.days.tuesday'),
            t('workPlan.calendar.days.wednesday'),
            t('workPlan.calendar.days.thursday'),
            t('workPlan.calendar.days.friday'),
            t('workPlan.calendar.days.saturday')
        ];
    return days;
});

const currentMonthYear = computed(() => {
    const options = { year: 'numeric', month: 'long' };
    return currentDate.value.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', options);
});

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

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = firstDayOfWeek; i > 0; i--) {
        const date = new Date(year, month - 1, prevLastDate - i + 1);
        days.push({
            date: date.toISOString().split('T')[0],
            dayNumber: prevLastDate - i + 1,
            isCurrentMonth: false,
            isToday: false,
            plans: getPlansForDate(date)
        });
    }
    
    // Current month days
    for (let i = 1; i <= lastDateOfMonth; i++) {
        const date = new Date(year, month, i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            dayNumber: i,
            isCurrentMonth: true,
            isToday: dateStr === today.toISOString().split('T')[0],
            plans: getPlansForDate(date)
        });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date: date.toISOString().split('T')[0],
            dayNumber: i,
            isCurrentMonth: false,
            isToday: false,
            plans: getPlansForDate(date)
        });
    }
    
    return days;
});

const getPlansForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return props.workPlans.filter(plan => {
        if (!plan.start_date || !plan.end_date) return false;
        return dateStr >= plan.start_date && dateStr <= plan.end_date;
    });
};

const getCompanyColor = (companyName) => {
    return companyColors.value[companyName] || '#6c757d';
};

const previousMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
    );
};

const nextMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
    );
};

const showDayPlans = (day) => {
    // يمكن إضافة موديل لعرض كل الخطط لهذا اليوم
    console.log('Show all plans for day:', day);
};
</script>

<style scoped>
.calendar-container {
    background: white;
}

.calendar-header h4 {
    font-weight: 600;
    color: #1e293b;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #e2e8f0;
    border: 1px solid #e2e8f0;
}

.calendar-weekday {
    background-color: #f8fafc;
    padding: 0.75rem;
    text-align: center;
    font-weight: 600;
    color: #475569;
    font-size: 0.875rem;
    border-bottom: 2px solid #e2e8f0;
}

.calendar-day {
    background-color: white;
    min-height: 100px;
    padding: 0.5rem;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s;
}

.calendar-day:hover {
    background-color: #f8fafc;
}

.calendar-day.other-month {
    background-color: #f8fafc;
    opacity: 0.5;
}

.calendar-day.today {
    background-color: #dbeafe;
    border: 2px solid #3b82f6;
}

.calendar-day.has-plans {
    background-color: #fefce8;
}

.day-number {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
}

.calendar-day.other-month .day-number {
    color: #94a3b8;
}

.calendar-day.today .day-number {
    color: #1e40af;
    font-weight: 700;
}

.day-plans {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
}

.plan-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.plan-badge:hover {
    transform: scale(1.02);
    opacity: 0.9;
}

.plan-badge small {
    font-size: 0.75rem;
    font-weight: 500;
}

.more-plans {
    padding: 0.125rem 0.5rem;
    background-color: #64748b;
    color: white;
    border-radius: 0.25rem;
    text-align: center;
    cursor: pointer;
    font-size: 0.75rem;
}

.more-plans:hover {
    background-color: #475569;
}

.calendar-legend {
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.legend-color {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    display: inline-block;
}

/* RTL Support */
[dir="rtl"] .calendar-grid {
    direction: rtl;
}

[dir="rtl"] .legend-item {
    flex-direction: row-reverse;
}

/* Responsive */
@media (max-width: 768px) {
    .calendar-day {
        min-height: 80px;
        padding: 0.25rem;
    }
    
    .day-number {
        font-size: 0.75rem;
    }
    
    .plan-badge small {
        font-size: 0.65rem;
    }
    
    .calendar-weekday {
        font-size: 0.75rem;
        padding: 0.5rem 0.25rem;
    }
}
</style>