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
import { useDriverStore } from "../../driver/stores/driverStore.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const { companyName, companyId, companyOption, authStore } = useAuthDefaults();
const workPlansStore = useWorkPlansStore();
const driverStore = useDriverStore();
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
const ordersWithItems = ref([]);
const loadingOrders = ref(false);

// ✅ Permissions
const isSuperAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "superadmin");
const isAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "admin");
const canAddWorkPlan = computed(() => isAdmin.value); // فقط Admin يمكنه الإضافة

// Get work plans based on user role
const workPlans = computed(() => {
    const allPlans = workPlansStore.workPlans;
    console.log('Work plans from store:', allPlans.length);
    console.log('User role:', authStore.userRole, 'companyId:', companyId.value);
    
    // SuperAdmin: يرى جميع خطط العمل
    if (isSuperAdmin.value) {
        return allPlans;
    }
    
    // Admin: يرى فقط خطط العمل الخاصة بشركته
    if (isAdmin.value) {
        if (companyId.value) {
            const filtered = allPlans.filter(plan => {
                const planCompanyId = String(plan.company_id);
                return planCompanyId === String(companyId.value);
            });
            return filtered;
        } else {
            console.log('Admin user has no companyId, showing all plans');
            // Show all plans if no company assigned
            return allPlans;
        }
    }
    
    // Other roles: لا يرى شيء
    return [];
});

const trashedworkPlans = computed(() => workPlansStore.trashedWorkPlans);

// Computed property for order options
const orderOptions = computed(() => {
    return ordersWithItems.value.map(order => ({
        value: order.order_code,
        label: order.order_code
    }));
});

// Computed property for driver options
const driverOptions = computed(() => {
    const companyDrivers = driverStore.drivers.filter(driver => 
        String(driver.company_id) === String(companyId.value)
    );
    return companyDrivers.map(driver => ({
        value: driver.id,
        label: driver.name || `Driver ${driver.id}`
    }));
});

onMounted(async () => {
    try {
        // 🔥 اجلبي السائقين أولاً
        await driverStore.fetchDrivers();
        
        // 🔥 بعدين اجلبي work plans وامرريلها السائقين
        await workPlansStore.fetchWorkPlans(driverStore.drivers);
        
        await fetchOrdersWithItems();
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
});

// workPlan Form Fields (reactive to ordersWithItems and drivers changes)
const workPlanFields = computed(() => {
    // Access ordersWithItems and drivers to make this computed reactive to their changes
    const currentOrders = ordersWithItems.value;
    const currentDrivers = driverStore.drivers;
    
    return [
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
        name: 'driver_id',
        label: t('workPlan.form.driverName'),
        type: 'select',
        required: true,
        options: driverOptions,
        colClass: 'col-md-6',
        defaultValue: selectedworkPlan.value.driver_id || selectedworkPlan.value.driver?.id || ''
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
        orderOptions: orderOptions,
        getItemsOptions: getItemsOptionsForOrder,

        itemsSize: 5,
        defaultValue: selectedworkPlan.value.orders && selectedworkPlan.value.orders.length > 0
            ? selectedworkPlan.value.orders.map(o => ({
                order: o.order,
                items: Array.isArray(o.items) ? o.items : (o.items ? [o.items] : [])
            }))
            : [{ order: '', items: [] }]
    }];
});

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

// Fetch orders with items from API
const fetchOrdersWithItems = async () => {
    loadingOrders.value = true;
    try {
        const response = await apiServices.getOrdersWithItems();
        console.log("📦 API Response:", response);
        console.log("📦 Response Data:", response.data);
        
        // Handle both direct array response and wrapped response
        let data = [];
        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (Array.isArray(response.data?.data)) {
            data = response.data.data;
        }
        
        ordersWithItems.value = data;
        console.log("✅ Orders with items loaded:", ordersWithItems.value);
        console.log("✅ Order options:", orderOptions.value);
    } catch (error) {
        console.error("❌ Failed to fetch orders with items:", error);
        ordersWithItems.value = [];
    } finally {
        loadingOrders.value = false;
    }
};

// Get items options for a selected order
const getItemsOptionsForOrder = (orderCode) => {
    if (!orderCode) return [];
    
    const order = ordersWithItems.value.find(o => o.order_code === orderCode);
    if (!order || !order.order_items || order.order_items.length === 0) {
        return [];
    }
    
    return order.order_items.map(item => ({
        value: item.order_item_id,
        label: item.orderitemname
    }));
};

// Add Modal
const openAddModal = async () => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to add work plans");
        return;
    }
    isEditMode.value = false;
    selectedworkPlan.value = {};
    await fetchOrdersWithItems();
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = async (workPlan) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to edit work plans");
        return;
    }
    isEditMode.value = true;
    selectedworkPlan.value = { ...workPlan };
    await fetchOrdersWithItems();
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
        await workPlansStore.fetchTrashedWorkPlans(driverStore.drivers);
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

    // Collect all selected item IDs from all orders
    const orderItems = [];
    if (workPlanData.orders && Array.isArray(workPlanData.orders)) {
        workPlanData.orders.forEach(row => {
            if (row.items && Array.isArray(row.items)) {
                // Add all item IDs from this order
                row.items.forEach(itemId => {
                    if (itemId && !orderItems.includes(itemId)) {
                        orderItems.push(itemId);
                    }
                });
            } else if (row.items) {
                // Handle single item (not array)
                if (!orderItems.includes(row.items)) {
                    orderItems.push(row.items);
                }
            }
        });
    }

    // 🔥 اجلبي اسم السائق من driverOptions
    const selectedDriver = driverOptions.value.find(
        d => d.value === parseInt(workPlanData.driver_id)
    );

    const payload = {
        name: workPlanData.name,
        driver_id: parseInt(workPlanData.driver_id),
        driver_name: selectedDriver?.label || '', // 🔥 أضفنا اسم السائق
        company_id: parseInt(companyId.value || workPlanData.company_id),
        date: workPlanData.date,
        Orderitems: orderItems.map(id => parseInt(id)) // Array of item IDs
    };

    console.log("📤 Sending work plan payload:", payload);

    try {
        if (isEditMode.value) {
            await workPlansStore.updateWorkPlan(selectedworkPlan.value.id, payload, driverStore.drivers);
            console.log("✅ Work plan updated successfully!");
        } else {
            // 🔥 امرري السائقين
            await workPlansStore.addWorkPlan(payload, driverStore.drivers);
            console.log("✅ Work plan added successfully!");
        }
        closeFormModal();
    } catch (error) {
        console.error("❌ Failed to save work plan:", error);
        
        // Print detailed server validation errors
        if (error.response && error.response.data) {
            console.error("🔴 Server validation errors:", error.response.data);
            
            // Show user-friendly error message
            if (error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                alert("خطأ في البيانات:\n" + errorMessages.join("\n"));
            } else if (error.response.data.message) {
                alert("خطأ: " + error.response.data.message);
            }
        }
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