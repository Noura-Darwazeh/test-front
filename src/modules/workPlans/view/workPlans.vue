<template>
    <div class="user-page-container bg-light">
        <WorkPlansHeader v-model="searchText" :searchPlaceholder="$t('workPlan.searchPlaceholder')" :data="workPlans"
            groupKey="company_name" v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('workPlan.filterByCompany')" translationKey="" :columns="workPlanColumns"
            v-model:visibleColumns="visibleColumns" 
            :showAddButton="canAddWorkPlan"
            :addButtonText="$t('workPlan.addNew')"
            :showTrashedButton="true" 
            @add-click="openAddModal" 
            @trashed-click="openTrashedModal" />

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
                        <BulkActionsBar
                            v-if="canAddWorkPlan"
                            :selectedCount="selectedRows.length"
                            entityName="workPlan"
                            :actions="bulkActions"
                            :loading="bulkActionLoading"
                            @action="handleBulkAction"
                        />
                        <DataTable :columns="filteredColumns" :data="paginatedworkPlans"
                            :actionsLabel="$t('workPlan.actions')" v-model="selectedRows"
                            :showCheckbox="canAddWorkPlan">
                            <template #actions="{ row }">
                            <ActionsDropdown 
                                v-if="canAddWorkPlan"
                                :row="row" 
                                :editLabel="$t('workPlan.edit')"
                                :detailsLabel="$t('workPlan.details')" 
                                :deleteLabel="$t('workPlan.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal" 
                                @details="openDetailsModal"
                                @delete="handleDeleteWorkPlan" />
                            <PrimaryButton
                                v-else
                                :text="$t('workPlan.details')"
                                bgColor="var(--primary-color)"
                                class="d-inline-flex align-items-center"
                                @click="openDetailsModal(row)"
                            />
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
        <TrashedItemsModal 
            v-if="canAddWorkPlan"
            :isOpen="isTrashedModalOpen" 
            :title="$t('workPlan.trashed.title')"
            :emptyMessage="$t('workPlan.trashed.empty')" 
            :columns="trashedColumns" 
            :trashedItems="trashedworkPlans"
            entityName="workPlan" 
            :bulkActions="trashedBulkActions" 
            :bulkLoading="bulkActionLoading"
            @close="closeTrashedModal" 
            @restore="handleRestoreworkPlan" 
            @delete="handlePermanentDeleteWorkPlan"
            @bulk-action="handleTrashedBulkAction" />

        <ConfirmationModal :isOpen="isBulkConfirmOpen" :title="$t('common.bulkDeleteConfirmTitle')"
            :message="bulkConfirmMessage" :confirmText="$t('common.confirm')" :cancelText="$t('common.cancel')"
            @confirm="executeBulkAction" @close="cancelBulkAction" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import WorkPlansHeader from "../components/workPlansHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import WorkPlanCalendar from "../components/calender.vue"
import PrimaryButton from "../../../components/shared/PrimaryButton.vue";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { useWorkPlansStore } from "../store/workPlansStore.js";

const { t } = useI18n();
const { companyName, companyId, companyOption, authStore } = useAuthDefaults();
const workPlansStore = useWorkPlansStore();
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
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// ✅ Permissions
const isSuperAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "superadmin");
const isAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "admin");
const canAddWorkPlan = computed(() => isAdmin.value); // فقط Admin يمكنه الإضافة

// Get work plans based on user role
const workPlans = computed(() => {
    const allPlans = workPlansStore.workPlans;
    
    // SuperAdmin: يرى جميع خطط العمل
    if (isSuperAdmin.value) {
        return allPlans;
    }
    
    // Admin: يرى فقط خطط العمل الخاصة بشركته
    if (isAdmin.value && companyId.value) {
        return allPlans.filter(plan => {
            const planCompanyId = String(plan.company_id);
            return planCompanyId === String(companyId.value);
        });
    }
    
    // Other roles: لا يرى شيء
    return [];
});

const trashedworkPlans = computed(() => workPlansStore.trashedWorkPlans);

onMounted(async () => {
    try {
        await workPlansStore.fetchWorkPlans();
    } catch (error) {
        console.error("Failed to load work plans:", error);
    }
});

// workPlan Form Fields 
const workPlanFields = computed(() => [
    {
        name: 'name',
        label: t('workPlan.form.name'),
        type: 'text',
        required: true,
        placeholder: t('workPlan.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: selectedworkPlan.value.name || '',
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
            { value: 'Sami Ahmad', label: 'Sami Ahmad' },
            { value: 'Ali Hassan', label: 'Ali Hassan' },
            { value: 'Mohammad Khalil', label: 'Mohammad Khalil' },
        ],
        colClass: 'col-md-6',
        defaultValue: selectedworkPlan.value.driver_name || ''
    },
    {
        name: 'date',
        label: t('workPlan.form.date'),
        type: 'date',
        required: false,
        colClass: 'col-md-6',
        defaultValue: selectedworkPlan.value.date || '',
    },
    {
        name: 'company_id',
        label: t('workPlan.form.company'),
        type: 'select',
        required: true,
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-6',
        defaultValue: companyId.value || '',
        locked: true,
        hidden: true
    },
    {
        name: 'orders',
        label: t('workPlan.form.orders'),
        type: 'orderRows',
        required: false,
        colClass: 'col-12',
        orderLabel: t('workPlan.form.orderName'),
        itemsLabel: t('workPlan.form.orderItems'),
        orderOptions: [
            { value: 'Order #101', label: 'Order #101' },
            { value: 'Order #102', label: 'Order #102' },
            { value: 'Order #103', label: 'Order #103' },
            { value: 'Order #104', label: 'Order #104' },
            { value: 'Order #105', label: 'Order #105' },
            { value: 'Order #106', label: 'Order #106' },
        ],
        itemsOptions: [
            { value: 'Electronics - 5 items', label: 'Electronics - 5 items' },
            { value: 'Furniture - 3 items', label: 'Furniture - 3 items' },
            { value: 'Clothing - 10 items', label: 'Clothing - 10 items' },
            { value: 'Books - 20 items', label: 'Books - 20 items' },
            { value: 'Food Items - 15 items', label: 'Food Items - 15 items' },
            { value: 'Toys - 8 items', label: 'Toys - 8 items' },
        ],

        defaultValue: selectedworkPlan.value.orders && selectedworkPlan.value.orders.length > 0
            ? selectedworkPlan.value.orders.map(o => ({
                order: o.order,
                items: o.items
            }))
            : [{ order: '', items: '' }]
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('workPlan.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('workPlan.name'), colClass: 'col-md-6' },
    { key: 'date', label: t('workPlan.date'), colClass: 'col-md-6' },
    { key: 'driver_name', label: t('workPlan.driverName'), colClass: 'col-md-6' },
    { key: 'company_name', label: t('workPlan.companyName'), colClass: 'col-md-6' },
    { key: 'orders', label: t('workPlan.orders'), colClass: 'col-md-12' },

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

const bulkActions = computed(() => [
    {
        id: 'delete',
        label: t('workPlan.bulkDelete'),
        bgColor: 'var(--color-danger)'
    }
]);

const trashedBulkActions = computed(() => [
    {
        id: 'restore',
        label: t('workPlan.bulkRestore'),
        bgColor: 'var(--color-success)'
    },
    {
        id: 'permanentDelete',
        label: t('common.permanentDelete'),
        bgColor: 'var(--color-danger)'
    }
]);

const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const count = selectedRows.value.length;
    const entity = count === 1 ? t('workPlan.entitySingular') : t('workPlan.entityPlural');

    return t('common.bulkDeleteConfirm', { count, entity });
});

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});

// Add Modal
const openAddModal = () => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to add work plans");
        return;
    }
    isEditMode.value = false;
    selectedworkPlan.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (workPlan) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to edit work plans");
        return;
    }
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

const openTrashedModal = async () => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to view trashed work plans");
        return;
    }
    try {
        await workPlansStore.fetchTrashedWorkPlans();
    } catch (error) {
        console.error("Failed to load trashed work plans:", error);
    } finally {
        isTrashedModalOpen.value = true;
    }
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitworkPlan = async (workPlanData) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to submit work plans");
        return;
    }

    const orders = workPlanData.orders?.map(row => ({
        order: row.order,
        items: row.items
    })) || [];

    const payload = {
        ...workPlanData,
        company_id: companyId.value || workPlanData.company_id,
        company_name: companyName.value || workPlanData.company_name,
        orders
    };

    try {
        if (isEditMode.value) {
            await workPlansStore.updateWorkPlan(selectedworkPlan.value.id, payload);
            console.log("Work plan updated successfully!");
        } else {
            await workPlansStore.addWorkPlan(payload);
            console.log("Work plan added successfully!");
        }
        closeFormModal();
    } catch (error) {
        console.error("Failed to save work plan:", error);
    }
};

const handleRestoreworkPlan = async (workPlan) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to restore work plans");
        return;
    }
    try {
        await workPlansStore.restoreWorkPlan(workPlan.id);
        console.log("Work plan restored successfully!");
    } catch (error) {
        console.error("Failed to restore work plan:", error);
    }
};

const handleDeleteWorkPlan = async (workPlan) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to delete work plans");
        return;
    }
    try {
        await workPlansStore.deleteWorkPlan(workPlan.id);
        console.log("Work plan deleted successfully!");
    } catch (error) {
        console.error("Failed to delete work plan:", error);
    }
};

const handlePermanentDeleteWorkPlan = async (workPlan) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to permanently delete work plans");
        return;
    }
    try {
        await workPlansStore.deleteWorkPlan(workPlan.id, true);
        console.log("Work plan permanently deleted successfully!");
    } catch (error) {
        console.error("Failed to permanently delete work plan:", error);
    }
};

const handleBulkAction = ({ actionId }) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission for bulk actions");
        return;
    }
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    if (!pendingBulkAction.value || !canAddWorkPlan.value) return;
    bulkActionLoading.value = true;

    try {
        await workPlansStore.bulkDeleteWorkPlans(selectedRows.value, false);
        selectedRows.value = [];
    } catch (error) {
        console.error("Failed to bulk delete work plans:", error);
    } finally {
        bulkActionLoading.value = false;
        isBulkConfirmOpen.value = false;
        pendingBulkAction.value = null;
    }
};

const cancelBulkAction = () => {
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
};

const handleTrashedBulkAction = async ({ actionId, selectedIds }) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission for trashed bulk actions");
        return;
    }
    if (!selectedIds.length) return;
    bulkActionLoading.value = true;

    try {
        if (actionId === "restore") {
            await workPlansStore.bulkRestoreWorkPlans(selectedIds);
        } else if (actionId === "permanentDelete") {
            await workPlansStore.bulkDeleteWorkPlans(selectedIds, true);
        }
    } catch (error) {
        console.error("Failed to perform bulk action on work plans:", error);
    } finally {
        bulkActionLoading.value = false;
    }
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