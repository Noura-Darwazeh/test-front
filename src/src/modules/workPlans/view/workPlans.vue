<template>
    <div class="user-page-container bg-light">
        <WorkPlansHeader v-model="searchText" :searchPlaceholder="$t('workPlan.searchPlaceholder')" :data="workPlans"
            groupKey="company_name" v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('workPlan.filterByCompany')" translationKey="" :columns="workPlanColumns"
            v-model:visibleColumns="visibleColumns" :showAddButton="true" :addButtonText="$t('workPlan.addNew')"
            @add-click="openAddModal" @trashed-click="openTrashedModal" />

        <!-- Tabs Navigation -->
        <div class="card border-0 mb-3">
            <div class="card-body p-0">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'calendar' }"
                            @click="activeTab = 'calendar'">
                            <i class="bi bi-calendar3 me-2"></i> {{ $t('workPlan.tabs.calendar') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'table' }"
                            @click="activeTab = 'table'">
                            <i class="bi bi-table me-2"></i> {{ $t('workPlan.tabs.table') }}
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
            <!-- Calendar Tab -->
            <div v-show="activeTab === 'calendar'" class="tab-pane fade"
                :class="{ 'show active': activeTab === 'calendar' }">
                <WorkPlanCalendar :workPlans="workPlans" @edit-plan="openEditModal" @view-details="openDetailsModal" />
            </div>

            <!-- Table Tab -->
            <div v-show="activeTab === 'table'" class="tab-pane fade" :class="{ 'show active': activeTab === 'table' }">
                <div class="card border-0">
                    <div class="card-body p-0">
                        <DataTable :columns="filteredColumns" :data="paginatedworkPlans"
                            :actionsLabel="$t('workPlan.actions')">
                            <template #actions="{ row }">
                                <ActionsDropdown :row="row" :editLabel="$t('workPlan.edit')"
                                    :detailsLabel="$t('workPlan.details')" @edit="openEditModal"
                                    @details="openDetailsModal" />
                            </template>
                        </DataTable>
                        <div class="px-3 pt-1 pb-2 bg-light">
                            <Pagination :totalItems="filteredworkPlan.length" :itemsPerPage="itemsPerPage"
                                :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit workPlan -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('workPlan.edit') : $t('workPlan.addNew')"
            :fields="workPlanFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitworkPlan" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('workPlan.details')" :data="selectedworkPlan"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed workPlans Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('workPlan.trashed.title')"
            :emptyMessage="$t('workPlan.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedworkPlans"
            @close="closeTrashedModal" @restore="handleRestoreworkPlan" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import WorkPlansHeader from "../components/workPlansHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import WorkPlanCalendar from "../components/calender.vue"

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedworkPlan = ref({});
const activeTab = ref('calendar');

const workPlans = ref([
    {
        id: 1,
        name: "Plan 1 - Nablus Route",
        company_name: "company 1",
        date: "2025-12-20",
        driver_name: "Sami Ahmad",
        orders: [
            { order: "Order #101", items: "Electronics - 5 items" },
            { order: "Order #102", items: "Furniture - 3 items" }
        ]
    },
    {
        id: 2,
        name: "Plan 2 - Ramallah Route",
        company_name: "company 1",
        date: "2025-12-15",
        driver_name: "Ali Hassan",
        orders: [
            { order: "Order #103", items: "Clothing - 10 items" }
        ]
    },
    {
        id: 3,
        name: "Plan 3 - Hebron Route",
        company_name: "company 2",
        date: "2025-12-17",
        driver_name: "Mohammad Khalil",
        orders: [
            { order: "Order #104", items: "Books - 20 items" },
            { order: "Order #105", items: "Food Items - 15 items" },
            { order: "Order #106", items: "Toys - 8 items" }
        ]
    },
]);

const trashedworkPlans = ref([
    {
        id: 5,
        name: "Plan 5 - Deleted Route",
        company_name: "company 1",
        date: "2025-12-11",
        driver_name: "Deleted Driver",
        orders: []
    },
]);

// workPlan Form Fields 
const workPlanFields = computed(() => [
    {
        name: 'name',
        label: t('workPlan.form.name'),
        type: 'text',
        required: true,
        placeholder: t('workPlan.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedworkPlan.value.name : '',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return t('workPlan.validation.nameRequired');
            }
            if (value.length > 255) {
                return t('workPlan.validation.nameMax');
            }
            return null;
        }
    },
    {
        name: 'driver_name',
        label: t('workPlan.form.driverName'),
        type: 'select',
        required: true,
        options: [
            { value: 'driver 1', label: 'Driver 1' },
            { value: 'driver 2', label: 'Driver 2' },
            { value: 'driver 3', label: 'Driver 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedworkPlan.value.driver_name : ''
    },
    {
        name: 'date',
        label: t('workPlan.form.date'),
        type: 'date',
        required: false,
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedworkPlan.value.date : '',
    },
    {
        name: 'company_name',
        label: t('workPlan.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: 'Company 1' },
            { value: 'company 2', label: 'Company 2' },
            { value: 'company 3', label: 'Company 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedworkPlan.value.company_name : ''
    },
    {
        name: 'orders',
        label: t('workPlan.form.orders') || 'Orders',
        type: 'orderRows',
        required: false,
        colClass: 'col-12',
        orderLabel: t('workPlan.form.orderName'),
        phaseLabel: t('workPlan.form.orderItems'),
        orderOptions: [
            { value: 'order 1', label: 'Order #101' },
            { value: 'order 2', label: 'Order #102' },
            { value: 'order 3', label: 'Order #103' },
        ],
        phaseOptions: [
            { value: 'items 1', label: 'Electronics - 5 items' },
            { value: 'items 2', label: 'Furniture - 3 items' },
            { value: 'items 3', label: 'Clothing - 10 items' },
        ],
        defaultValue: isEditMode.value && selectedworkPlan.value.orders
            ? selectedworkPlan.value.orders.map(o => ({ order: o.order, phase: o.items }))
            : [{ order: '', phase: '' }]
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('workPlan.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('workPlan.name'), colClass: 'col-md-6' },
    { key: 'date', label: t('workPlan.date'), colClass: 'col-md-6' },
    { key: 'driver_name', label: t('workPlan.driverName'), colClass: 'col-md-6' },
    { key: 'company_name', label: t('workPlan.companyName'), colClass: 'col-md-6' },
]);

const workPlanColumns = ref([
    { key: "id", label: t("workPlan.id"), sortable: true },
    { key: "name", label: t("workPlan.name"), sortable: true },
    { key: 'date', label: t('workPlan.date'), sortable: true },
    { key: 'driver_name', label: t('workPlan.driverName'), sortable: true },
    { key: 'company_name', label: t('workPlan.companyName') },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("workPlan.id") },
    { key: "name", label: t("workPlan.name") },
    { key: 'date', label: t('workPlan.date'), sortable: true },
    { key: 'company_name', label: t('workPlan.companyName') },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return workPlanColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredworkPlan = computed(() => {
    let result = workPlans.value;
    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedworkPlans = computed(() => {
    return paginateData(
        filteredworkPlan.value,
        currentPage.value,
        itemsPerPage.value
    );
});

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});

// Add Modal
const openAddModal = () => {
    isEditMode.value = false;
    selectedworkPlan.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (workPlan) => {
    isEditMode.value = true;
    selectedworkPlan.value = { ...workPlan };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (workPlan) => {
    selectedworkPlan.value = { ...workPlan };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedworkPlan.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedworkPlan.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitworkPlan = (workPlanData) => {
    // Convert orderRows format back to orders array
    const orders = workPlanData.orders?.map(row => ({
        order: row.order,
        items: row.phase
    })) || [];

    if (isEditMode.value) {
        const index = workPlans.value.findIndex(d => d.id === selectedworkPlan.value.id);
        if (index > -1) {
            workPlans.value[index] = {
                ...workPlans.value[index],
                name: workPlanData.name,
                company_name: workPlanData.company_name,
                driver_name: workPlanData.driver_name,
                date: workPlanData.date,
                orders: orders,
            };
            console.log('Work plan updated successfully!');
        }
    } else {
        const newworkPlan = {
            id: workPlans.value.length + 1,
            name: workPlanData.name,
            company_name: workPlanData.company_name,
            driver_name: workPlanData.driver_name,
            date: workPlanData.date,
            orders: orders,
        };
        workPlans.value.push(newworkPlan);
        console.log('Work plan added successfully!');
    }
};

const handleRestoreworkPlan = (workPlan) => {
    workPlans.value.push(workPlan);
    const index = trashedworkPlans.value.findIndex(d => d.id === workPlan.id);
    if (index > -1) {
        trashedworkPlans.value.splice(index, 1);
    }
    console.log("Work plan restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}

.nav-tabs .nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    color: #6c757d;
    padding: 1rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
    border-bottom-color: var(--primary-color);
    color: var(--primary-color);
}

.nav-tabs .nav-link.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background-color: transparent;
}

/* RTL Support */
[dir="rtl"] .nav-tabs .nav-link i {
    margin-left: 0.5rem;
    margin-right: 0;
}

[dir="rtl"] .nav-tabs .nav-link {
    margin-right: 0;
    margin-left: 0.25rem;
}
</style>