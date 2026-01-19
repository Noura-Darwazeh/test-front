<template>
    <div class="user-page-container bg-light">
        <WorkPlansHeader v-model="searchText" :searchPlaceholder="$t('workPlan.searchPlaceholder')" :data="headerData"
            groupKey="company_name" v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('workPlan.filterByCompany')" translationKey="" :columns="workPlanColumns"
            v-model:visibleColumns="visibleColumns" 
            :showAddButton="canAddWorkPlan && activeTab !== 'trashed'"
            :addButtonText="$t('workPlan.addNew')"
            :showTrashedButton="false" 
            @add-click="openAddModal"
            @refresh-click="handleRefresh" />

        <!-- Tabs Navigation -->
        <div class="card border-0 mb-3">
            <div class="card-body p-0">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'calendar' }"
                            @click="switchTab('calendar')">
                            <i class="bi bi-calendar3 me-2"></i> {{ $t('workPlan.tabs.calendar') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'table' }"
                            @click="switchTab('table')">
                            <i class="bi bi-table me-2"></i> {{ $t('workPlan.tabs.table') }}
                        </button>
                    </li>
                    <li v-if="canAddWorkPlan" class="nav-item">
                        <button class="nav-link trashed-tab" :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')">
                            <i class="bi bi-trash me-2"></i> {{ $t('workPlan.trashed.title') }}
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
                        <DataTable :columns="filteredColumns" :data="paginatedTableData"
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
                            <Pagination :totalItems="currentPagination.total" :itemsPerPage="itemsPerPage"
                                :currentPage="currentPage" :totalPages="currentPagination.lastPage"
                                @update:currentPage="(page) => currentPage = page" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'trashed'" class="tab-pane fade" :class="{ 'show active': activeTab === 'trashed' }">
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
                        <DataTable :columns="filteredColumns" :data="paginatedTableData"
                            :actionsLabel="$t('workPlan.actions')" v-model="selectedRows"
                            :showCheckbox="canAddWorkPlan">
                            <template #actions="{ row }">
                            <ActionsDropdown
                                v-if="canAddWorkPlan"
                                :row="row"
                                :restoreLabel="$t('workPlan.trashed.restore')"
                                :deleteLabel="$t('workPlan.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                @restore="handleRestoreworkPlan"
                                @delete="handlePermanentDeleteWorkPlan" />
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
                            <Pagination :totalItems="currentPagination.total" :itemsPerPage="itemsPerPage"
                                :currentPage="currentPage" :totalPages="currentPagination.lastPage"
                                @update:currentPage="(page) => currentPage = page" />
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
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import WorkPlansHeader from "../components/workPlansHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
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
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
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
const canAddWorkPlan = computed(() => isAdmin.value);

// Get work plans based on user role
const workPlans = computed(() => {
    const allPlans = workPlansStore.workPlans;
    
    if (isSuperAdmin.value) {
        return allPlans;
    }
    
    if (isAdmin.value) {
        if (companyId.value) {
            const filtered = allPlans.filter(plan => {
                const planCompanyId = String(plan.company_id);
                return planCompanyId === String(companyId.value);
            });
            return filtered;
        } else {
            return allPlans;
        }
    }
    
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
        await driverStore.fetchDrivers();
        await workPlansStore.fetchWorkPlans({ page: 1, perPage: itemsPerPage.value, drivers: driverStore.drivers });
        await fetchOrdersWithItems();
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
});

// Watch for page changes to fetch new data from server
watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    try {
        if (activeTab.value === "trashed") {
            await workPlansStore.fetchTrashedWorkPlans({
                page: newPage,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        } else {
            await workPlansStore.fetchWorkPlans({
                page: newPage,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        }
    } catch (err) {
        console.error("Failed to load page:", err);
    }
});

const switchTab = async (tab) => {
    activeTab.value = tab;
    skipNextPageWatch.value = true;
    currentPage.value = 1;
    selectedRows.value = [];

    try {
        if (tab === "trashed") {
            await workPlansStore.fetchTrashedWorkPlans({
                page: 1,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        } else {
            await workPlansStore.fetchWorkPlans({
                page: 1,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        }
    } catch (error) {
        console.error("Failed to switch tabs:", error);
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === "trashed") {
            await workPlansStore.fetchTrashedWorkPlans({
                page: currentPage.value,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        } else {
            await workPlansStore.fetchWorkPlans({
                page: currentPage.value,
                perPage: itemsPerPage.value,
                drivers: driverStore.drivers,
            });
        }
    } catch (error) {
        console.error("Failed to refresh work plans:", error);
    }
};

// ✅ تعديل workPlan Form Fields لدعم التعديل
const workPlanFields = computed(() => {
    const currentOrders = ordersWithItems.value;
    const currentDrivers = driverStore.drivers;
    
    // ✅ استخرج order_item_id من workplanorder عند التعديل
    let defaultOrders = [{ order: '', items: [] }];
    
    if (isEditMode.value && selectedworkPlan.value.workplanorder && selectedworkPlan.value.workplanorder.length > 0) {
        console.log("📝 Editing work plan, workplanorder:", selectedworkPlan.value.workplanorder);
        
        defaultOrders = selectedworkPlan.value.workplanorder.map(wo => {
            const orderItemId = wo.order_item?.id || wo.order_item_id;
            const orderItemName = wo.order_item?.name || `Order Item #${orderItemId}`;
            
            // ✅ ابحثي عن order_code من ordersWithItems
            let orderCode = '';
            const matchingOrder = ordersWithItems.value.find(o => 
                o.order_items && o.order_items.some(item => item.order_item_id === orderItemId)
            );
            
            if (matchingOrder) {
                orderCode = matchingOrder.order_code;
            }
            
            console.log(`📦 Order Item ID: ${orderItemId}, Order Code: ${orderCode}`);
            
            return {
                order: orderCode,
                items: orderItemId ? [orderItemId] : []
            };
        });
        
        console.log("✅ Default orders for edit:", defaultOrders);
    }
    
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
        defaultValue: defaultOrders
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
    const columns =
        activeTab.value === "trashed" ? trashedColumns.value : workPlanColumns.value;
    if (activeTab.value === "trashed") return columns;
    return columns.filter((col) => visibleColumns.value.includes(col.key));
});

const headerData = computed(() => {
    return activeTab.value === "trashed" ? trashedworkPlans.value : workPlans.value;
});

const currentTableData = computed(() => {
    return activeTab.value === "trashed" ? trashedworkPlans.value : workPlans.value;
});

const filteredTableData = computed(() => {
    let result = currentTableData.value;
    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

// Server already returns paginated data
const paginatedTableData = computed(() => {
    return filteredTableData.value;
});

// Get pagination metadata from store
const currentPagination = computed(() =>
    activeTab.value === "trashed"
        ? workPlansStore.trashedPagination
        : workPlansStore.workPlansPagination
);

const bulkActions = computed(() => {
    if (activeTab.value === "trashed") {
        return [
            {
                id: "restore",
                label: t("workPlan.bulkRestore"),
                bgColor: "var(--color-success)",
            },
            {
                id: "permanentDelete",
                label: t("common.permanentDelete"),
                bgColor: "var(--color-danger)",
            },
        ];
    }
    return [
        {
            id: "delete",
            label: t("workPlan.bulkDelete"),
            bgColor: "var(--color-danger)",
        },
    ];
});


const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const count = selectedRows.value.length;
    const entity = count === 1 ? t('workPlan.entitySingular') : t('workPlan.entityPlural');

    if (pendingBulkAction.value === "restore") {
        return t('common.bulkRestoreConfirm', { count, entity });
    }
    if (pendingBulkAction.value === "permanentDelete") {
        return t('common.bulkPermanentDeleteConfirm', { count, entity });
    }
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
        
        let data = [];
        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (Array.isArray(response.data?.data)) {
            data = response.data.data;
        }
        
        ordersWithItems.value = data;
        console.log("✅ Orders with items loaded:", ordersWithItems.value);
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
    console.log("📝 Opening edit modal for work plan:", selectedworkPlan.value);
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



// ✅ تعديل handleSubmitworkPlan لدعم التعديل بشكل صحيح
const handleSubmitworkPlan = async (workPlanData) => {
    if (!canAddWorkPlan.value) {
        console.warn("⚠️ User doesn't have permission to submit work plans");
        return;
    }

    console.log("📤 Form data received:", workPlanData);
    console.log("🔧 Edit mode:", isEditMode.value);

    // Collect all selected item IDs from all orders
    const orderItems = [];
    if (workPlanData.orders && Array.isArray(workPlanData.orders)) {
        workPlanData.orders.forEach(row => {
            if (row.items && Array.isArray(row.items)) {
                row.items.forEach(itemId => {
                    if (itemId && !orderItems.includes(itemId)) {
                        orderItems.push(itemId);
                    }
                });
            } else if (row.items) {
                if (!orderItems.includes(row.items)) {
                    orderItems.push(row.items);
                }
            }
        });
    }

    console.log("📦 Collected order items:", orderItems);

    const payload = {
        name: workPlanData.name,
        driver_id: parseInt(workPlanData.driver_id),
        date: workPlanData.date || null,
        Orderitems: orderItems.map(id => parseInt(id))
    };

    // ✅ فقط أضيفي company_id للإنشاء، مش للتعديل
    if (!isEditMode.value) {
        payload.company_id = parseInt(companyId.value || workPlanData.company_id);
    }

    console.log("📤 Sending work plan payload:", payload);
    console.log("🆔 Work plan ID:", selectedworkPlan.value.id);

    try {
        if (isEditMode.value) {
            await workPlansStore.updateWorkPlan(selectedworkPlan.value.id, payload, driverStore.drivers);
            console.log("✅ Work plan updated successfully!");
        } else {
            await workPlansStore.addWorkPlan(payload, driverStore.drivers);
            console.log("✅ Work plan added successfully!");
        }
        closeFormModal();
    } catch (error) {
        console.error("❌ Failed to save work plan:", error);
        
        if (error.response && error.response.data) {
            console.error("🔴 Server validation errors:", error.response.data);
            
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
        if (pendingBulkAction.value === "delete") {
            await workPlansStore.bulkDeleteWorkPlans(selectedRows.value, false);
        } else if (pendingBulkAction.value === "restore") {
            await workPlansStore.bulkRestoreWorkPlans(selectedRows.value);
        } else if (pendingBulkAction.value === "permanentDelete") {
            await workPlansStore.bulkDeleteWorkPlans(selectedRows.value, true);
        }
        selectedRows.value = [];
        await handleRefresh();
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
