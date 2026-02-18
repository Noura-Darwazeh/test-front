<template>
    <div class="user-page-container bg-light">
        <WorkPlansHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('workPlan.searchPlaceholder')" 
            :data="workPlans"
            groupKey="company_name" 
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('workPlan.filterByCompany')" 
            translationKey="" 
            :columns="workPlanColumns"
            v-model:visibleColumns="visibleColumns" 
            :showAddButton="canAddWorkPlan"
            :addButtonText="$t('workPlan.addNew')" 
            :showTrashedButton="false" 
            @add-click="openAddModal"
            @refresh-click="handleRefresh" 
        />

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
                        <button class="nav-link" :class="{ active: activeTab === 'table' }" @click="switchTab('table')">
                            <i class="bi bi-table me-2"></i> {{ $t('workPlan.tabs.table') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'today' }" @click="switchTab('today')">
                            <i class="bi bi-sun me-2"></i> {{ $t('driverSteps.tabs.today') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'ongoing' }" @click="switchTab('ongoing')">
                            <i class="bi bi-play-circle me-2"></i> {{ $t('driverSteps.tabs.ongoing') }}
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

            <!-- Table + Today + Ongoing Tabs -->
            <div
                v-show="['table', 'today', 'ongoing'].includes(activeTab)"
                class="tab-pane fade"
                :class="{ 'show active': ['table', 'today', 'ongoing'].includes(activeTab) }"
            >
                <div class="card border-0">
                    <div class="card-body p-0">
                        <BulkActionsBar 
                            v-if="canAddWorkPlan && selectedRows.some(id => {
                                const plan = paginatedTableData.find(p => p.id === id);
                                return plan && canModifyPlan(plan);
                            })" 
                            :selectedCount="selectedRows.filter(id => {
                                const plan = paginatedTableData.find(p => p.id === id);
                                return plan && canModifyPlan(plan);
                            }).length" 
                            entityName="workPlan"
                            :actions="bulkActions" 
                            :loading="bulkActionLoading" 
                            @action="handleBulkAction" 
                        />
                        <DataTable 
                            :columns="filteredColumns" 
                            :data="paginatedTableData"
                            :actionsLabel="$t('workPlan.actions')" 
                            v-model="selectedRows"
                            :showCheckbox="canAddWorkPlan"
                            :disableRowWhen="(row) => !canModifyPlan(row)">
                            <template #actions="{ row }">
                                <ActionsDropdown 
                                    :row="row" 
                                    :editLabel="$t('workPlan.edit')"
                                    :detailsLabel="$t('workPlan.details')" 
                                    :deleteLabel="$t('workPlan.delete')"
                                    :confirmDelete="true"
                                    :showEdit="canModifyPlan(row)"
                                    :showDelete="canModifyPlan(row)"
                                    :showDetails="true"
                                    @edit="openEditModal" 
                                    @details="openDetailsModal"
                                    @delete="handleDeleteWorkPlan" 
                                />
                            </template>
                        </DataTable>
                        <div class="px-3 pt-1 pb-2 bg-light">
                            <Pagination 
                                :totalItems="currentPagination.total" 
                                :itemsPerPage="itemsPerPage"
                                :currentPage="currentPage" 
                                :totalPages="currentPagination.lastPage"
                                @update:currentPage="(page) => currentPage = page" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit workPlan -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('workPlan.edit') : $t('workPlan.addNew')"
            :fields="workPlanFields" 
            :showImageUpload="false" 
            :serverErrors="formErrors"
            @close="closeFormModal" 
            @submit="handleSubmitworkPlan" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('workPlan.details')" 
            :data="selectedworkPlan"
            :fields="detailsFields" 
            @close="closeDetailsModal"
        >
            <template #after-details>
                <div v-if="workPlanOrderItems.length > 0" class="mt-4">
                    <h6 class="fw-semibold mb-3 d-flex align-items-center gap-2">
                        <i class="bi bi-box-seam"></i>
                        {{ $t('workPlan.orderItems') }} ({{ workPlanOrderItems.length }})
                    </h6>
                    <!-- ✅ showActions is true ONLY when the details modal was opened from the ongoing tab -->
                    <OrderItemProgress 
                        v-for="orderItem in workPlanOrderItems" 
                        :key="orderItem.id"
                        :orderItem="orderItem"
                        :showActions="detailsOpenedFromOngoing"
                        @updated="handleOrderItemStepsUpdated"
                    />
                </div>
                
                <div v-else-if="loadingDetails" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <p class="text-muted mt-2">{{ $t('workPlan.loadingDetails') }}</p>
                </div>
                
                <div v-else class="mt-4 text-center py-4 bg-light rounded">
                    <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mb-0 mt-2">{{ $t('workPlan.noOrderItems') }}</p>
                </div>
            </template>
        </DetailsModal>

        <!-- Bulk Action Confirmation Modal -->
        <ConfirmationModal 
            :isOpen="isBulkConfirmOpen" 
            :title="$t('common.bulkDeleteConfirmTitle')"
            :message="bulkConfirmMessage" 
            :confirmText="$t('common.confirm')" 
            :cancelText="$t('common.cancel')"
            @confirm="executeBulkAction" 
            @close="cancelBulkAction" 
        />

        <!-- Success Modal -->
        <SuccessModal 
            :isOpen="isSuccessModalOpen" 
            :title="$t('common.success')"
            :message="successMessage"
            @close="closeSuccessModal" 
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import OrderItemProgress from "../../../components/shared/OrderItemProgress.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import WorkPlansHeader from "../components/workPlansHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import WorkPlanCalendar from "../components/calender.vue"
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { useWorkPlansStore } from "../stores/workPlansStore.js";
import { useDriverStore } from "../../drivers/stores/driversStore.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const { companyName, companyId, companyOption, authStore } = useAuthDefaults();
const workPlansStore = useWorkPlansStore();
const driverStore = useDriverStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedworkPlan = ref({});
const formErrors = ref({});
const activeTab = ref('calendar');
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const ordersWithItems = ref([]);
const loadingOrders = ref(false);
const workPlanOrderItems = ref([]);
const loadingDetails = ref(false);

// ✅ Track which tab opened the details modal
const detailsOpenedFromOngoing = ref(false);

// ✅ Permissions
const isSuperAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "superadmin");
const isAdmin = computed(() => (authStore.userRole || "").toLowerCase() === "admin");
const isDriver = computed(() => (authStore.userRole || "").toLowerCase() === "driver");

// ✅ Current driver ID
const currentDriverId = computed(() => {
    if (!isDriver.value) return null;
    const u = authStore.user || {};
    return (
        u.driver_id ??
        u.driverId ??
        u.driver?.id ??
        u.driver?.driver_id ??
        u.id ??
        null
    );
});

const currentDriverName = computed(() => {
    if (!isDriver.value) return null;
    const u = authStore.user || {};
    return u.name || u.username || u.login || null;
});

const canAddWorkPlan = computed(() => {
    if (isDriver.value) return false;
    return isAdmin.value || isSuperAdmin.value;
});

const isOwnCompanyPlan = (plan) => {
    if (!companyId.value) return false;
    const planCompanyId = String(plan.company_id);
    return planCompanyId === String(companyId.value);
};

const canModifyPlan = (plan) => {
    if (isDriver.value) return false;
    if (isAdmin.value) return true;
    if (isSuperAdmin.value) {
        return isOwnCompanyPlan(plan);
    }
    return false;
};

const workPlans = computed(() => {
    const allPlans = workPlansStore.workPlans;

    if (isSuperAdmin.value) {
        return allPlans;
    }

    if (isAdmin.value) {
        if (companyId.value) {
            return allPlans.filter(plan => String(plan.company_id) === String(companyId.value));
        }
        return allPlans;
    }

    if (isDriver.value) {
        return allPlans;
    }

    return [];
});

const orderOptions = computed(() => {
    const options = ordersWithItems.value.map(order => ({
        value: order.order_code,
        label: order.order_code
    }));

    if (isEditMode.value && selectedworkPlan.value.workplanorder) {
        selectedworkPlan.value.workplanorder.forEach(wo => {
            const orderItemName = wo.order_item?.name || '';
            const orderCode = orderItemName.split(' - ')[0].trim();
            if (orderCode && !options.find(opt => opt.value === orderCode)) {
                options.push({ value: orderCode, label: orderCode });
            }
        });
    }

    return options;
});

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
        if (!isDriver.value) {
            await driverStore.fetchDrivers();
        }

        await workPlansStore.fetchWorkPlans({
            page: 1,
            perPage: itemsPerPage.value,
            drivers: isDriver.value ? [] : driverStore.drivers,
            driverId: currentDriverId.value,
            driverName: currentDriverName.value,
        });

        fetchOrdersWithItems().catch(() => {});
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
});

watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    if (isDriver.value) {
        return;
    }
    try {
        await workPlansStore.fetchWorkPlans({
            page: newPage,
            perPage: itemsPerPage.value,
            drivers: driverStore.drivers,
            driverId: currentDriverId.value,
            driverName: currentDriverName.value,
        });
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
        await workPlansStore.fetchWorkPlans({
            page: 1,
            perPage: itemsPerPage.value,
            drivers: isDriver.value ? [] : driverStore.drivers,
            driverId: currentDriverId.value,
            driverName: currentDriverName.value,
        });
    } catch (error) {
        console.error("Failed to switch tabs:", error);
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        await workPlansStore.fetchWorkPlans({
            page: isDriver.value ? 1 : currentPage.value,
            perPage: itemsPerPage.value,
            drivers: isDriver.value ? [] : driverStore.drivers,
            driverId: currentDriverId.value,
            driverName: currentDriverName.value,
        });
    } catch (error) {
        console.error("Failed to refresh work plans:", error);
    }
};

const selectedLine = ref('');
const selectedCase = ref('');
const lineOptions = ref([]);

const formData = ref({
    name: '',
    driver_id: '',
    date: ''
});

const workPlanFields = computed(() => {
    let defaultOrders = [{ order: '', items: [] }];

    if (isEditMode.value && selectedworkPlan.value.workplanorder && selectedworkPlan.value.workplanorder.length > 0) {
        const orderItemsMap = new Map();

        selectedworkPlan.value.workplanorder.forEach(wo => {
            const orderItemId = wo.order_item?.id || wo.order_item_id;
            const orderItemName = wo.order_item?.name || '';
            const orderCode = orderItemName.split(' - ')[0].trim();

            if (orderItemId && orderCode) {
                if (!orderItemsMap.has(orderCode)) {
                    orderItemsMap.set(orderCode, []);
                }
                orderItemsMap.get(orderCode).push(orderItemId);
            }
        });

        defaultOrders = [];
        orderItemsMap.forEach((itemIds, orderCode) => {
            defaultOrders.push({ order: orderCode, items: itemIds });
        });

        if (defaultOrders.length === 0) {
            defaultOrders = [{ order: '', items: [] }];
        }
    }

    return [
        {
            name: 'name',
            label: t('workPlan.form.name'),
            type: 'text',
            required: true,
            placeholder: t('workPlan.form.namePlaceholder'),
            colClass: 'col-md-6',
            defaultValue: formData.value.name || selectedworkPlan.value.name || '',
            validate: (value) => {
                if (!value || value.trim().length === 0) return t('workPlan.validation.nameRequired');
                if (value.length > 255) return t('workPlan.validation.nameMax');
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
            defaultValue: formData.value.driver_id || selectedworkPlan.value.driver_id || selectedworkPlan.value.driver?.id || ''
        },
        {
            name: 'date',
            label: t('workPlan.form.date'),
            type: 'date',
            required: false,
            colClass: 'col-md-6',
            defaultValue: formData.value.date || selectedworkPlan.value.date || '',
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
            name: 'line_filter',
            label: t('workPlan.form.filterByLine'),
            type: 'select',
            required: false,
            options: [{ value: '', label: t('common.all') }, ...lineOptions.value],
            colClass: 'col-md-6',
            defaultValue: selectedLine.value,
            onChange: (value, formDataFromModal) => {
                formData.value = {
                    name: formDataFromModal.name || formData.value.name,
                    driver_id: formDataFromModal.driver_id || formData.value.driver_id,
                    date: formDataFromModal.date || formData.value.date
                };
                selectedLine.value = value;
                handleFilterOrders();
            }
        },
        {
            name: 'case_filter',
            label: t('workPlan.form.filterByCase'),
            type: 'select',
            required: false,
            options: [
                { value: '', label: t('common.all') },
                { value: 'Full', label: t('workPlan.cases.full') },
                { value: 'Part', label: t('workPlan.cases.part') },
                { value: 'Fast', label: t('workPlan.cases.fast') }
            ],
            colClass: 'col-md-6',
            defaultValue: selectedCase.value,
            onChange: (value, formDataFromModal) => {
                formData.value = {
                    name: formDataFromModal.name || formData.value.name,
                    driver_id: formDataFromModal.driver_id || formData.value.driver_id,
                    date: formDataFromModal.date || formData.value.date
                };
                selectedCase.value = value;
                handleFilterOrders();
            }
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
            defaultValue: defaultOrders
        }
    ];
});

const getItemsOptionsForOrder = (orderCode) => {
    if (!orderCode) return [];
    const order = ordersWithItems.value.find(o => o.order_code === orderCode);
    if (!order || !order.order_items || order.order_items.length === 0) return [];
    return order.order_items.map(item => ({
        value: item.order_item_id,
        label: item.orderitemname
    }));
};

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

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return workPlanColumns.value.filter(col => visibleColumns.value.includes(col.key));
});

const filteredTableData = computed(() => {
    let result = workPlans.value;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (activeTab.value === 'today') {
        result = result.filter(plan => {
            if (!plan.date) return false;
            return String(plan.date).slice(0, 10) === todayStr;
        });
    }

    if (activeTab.value === 'ongoing') {
        const ongoingStatuses = ['pending', 'start', 'pickup'];
        result = result.filter(plan => {
            if (!Array.isArray(plan.workplanorder)) return false;
            return plan.workplanorder.some(wo => {
                const steps = Array.isArray(wo.steps) ? wo.steps : [];
                if (steps.length === 0) return false;
                const latest = [...steps].sort((a, b) => {
                    return new Date(a.created_at) - new Date(b.created_at);
                })[steps.length - 1];
                return ongoingStatuses.includes(latest.status);
            });
        });
    }

    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedTableData = computed(() => {
    if (!isDriver.value) return filteredTableData.value;
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredTableData.value.slice(start, start + itemsPerPage.value);
});

const currentPagination = computed(() => {
    if (!isDriver.value) return workPlansStore.workPlansPagination;
    const total = filteredTableData.value.length;
    return {
        currentPage: currentPage.value,
        perPage: itemsPerPage.value,
        total,
        lastPage: Math.max(1, Math.ceil(total / Math.max(1, itemsPerPage.value))),
    };
});

const bulkActions = computed(() => [
    {
        id: "delete",
        label: t("workPlan.bulkDelete"),
        bgColor: "var(--color-danger)",
    },
]);

const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';
    const count = selectedRows.value.length;
    const entity = count === 1 ? t('workPlan.entitySingular') : t('workPlan.entityPlural');
    return t('common.bulkPermanentDeleteConfirm', { count, entity });
});

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});

const fetchOrdersWithItems = async (filters = {}) => {
    loadingOrders.value = true;
    try {
        const response = await apiServices.getOrdersWithItems(filters);
        let data = [];
        if (Array.isArray(response.data)) {
            data = response.data;
        } else if (Array.isArray(response.data?.data)) {
            data = response.data.data;
        }
        ordersWithItems.value = data;
        const uniqueLines = [...new Set(data.map(order => order.line_name).filter(Boolean))];
        lineOptions.value = uniqueLines.map(line => ({ value: line, label: line }));
    } catch (error) {
        console.error("❌ Failed to fetch orders with items:", error);
        ordersWithItems.value = [];
    } finally {
        loadingOrders.value = false;
    }
};

const handleFilterOrders = async () => {
    const filters = {};
    if (selectedLine.value) filters.line_name = selectedLine.value;
    if (selectedCase.value) filters.case = selectedCase.value;
    await fetchOrdersWithItems(filters);
};

const openAddModal = async () => {
    if (!canAddWorkPlan.value) return;
    formErrors.value = {};
    isEditMode.value = false;
    selectedworkPlan.value = {};
    selectedLine.value = '';
    selectedCase.value = '';
    formData.value = { name: '', driver_id: '', date: '' };
    await fetchOrdersWithItems();
    isFormModalOpen.value = true;
};

const openEditModal = async (workPlan) => {
    if (!canModifyPlan(workPlan)) {
        alert(t('workPlan.noPermissionToEdit') || "You don't have permission to edit this work plan");
        return;
    }
    formErrors.value = {};
    isEditMode.value = true;
    selectedworkPlan.value = { ...workPlan };
    formData.value = { name: workPlan.name, driver_id: workPlan.driver_id, date: workPlan.date };
    selectedLine.value = '';
    selectedCase.value = '';
    await fetchOrdersWithItems();
    isFormModalOpen.value = true;
};

// ✅ openDetailsModal now saves which tab was active when details was opened
const openDetailsModal = async (workPlan) => {
    selectedworkPlan.value = { ...workPlan };
    // ✅ Only show action buttons if opened from 'ongoing' tab
    detailsOpenedFromOngoing.value = activeTab.value === 'ongoing';
    isDetailsModalOpen.value = true;

    const initialOrderItems = Array.isArray(workPlan?.workplanorder)
        ? workPlan.workplanorder
        : [];
    workPlanOrderItems.value = initialOrderItems;

    const shouldFetch =
        !workPlan?.id ||
        initialOrderItems.length === 0 ||
        initialOrderItems.some((wo) => !Array.isArray(wo?.steps));

    if (shouldFetch) {
        await fetchWorkPlanDetails(workPlan.id);
    }
};

const fetchWorkPlanDetails = async (workPlanId) => {
    loadingDetails.value = true;
    if (!Array.isArray(workPlanOrderItems.value) || workPlanOrderItems.value.length === 0) {
        workPlanOrderItems.value = [];
    }
    try {
        const response = await apiServices.get(`/work_plans/${workPlanId}`);
        const data = response?.data?.data ?? response?.data ?? {};
        if (data.workplanorder && Array.isArray(data.workplanorder)) {
            workPlanOrderItems.value = data.workplanorder;
        }
        selectedworkPlan.value = { ...selectedworkPlan.value, ...data };
    } catch (error) {
        console.error("❌ Failed to fetch work plan details:", error);
    } finally {
        loadingDetails.value = false;
    }
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedworkPlan.value = {};
    selectedLine.value = '';
    selectedCase.value = '';
    formData.value = { name: '', driver_id: '', date: '' };
    formErrors.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedworkPlan.value = {};
    workPlanOrderItems.value = [];
    detailsOpenedFromOngoing.value = false; // ✅ reset on close
};

const handleOrderItemStepsUpdated = ({ workPlanOrderId, steps }) => {
    if (!workPlanOrderId) return;
    const idx = workPlanOrderItems.value.findIndex((wo) => String(wo.id) === String(workPlanOrderId));
    if (idx === -1) return;
    workPlanOrderItems.value[idx] = {
        ...workPlanOrderItems.value[idx],
        steps: Array.isArray(steps) ? steps : workPlanOrderItems.value[idx].steps,
    };
};

const handleSubmitworkPlan = async (workPlanData) => {
    if (!canAddWorkPlan.value) return;

    const orderItems = [];
    if (workPlanData.orders && Array.isArray(workPlanData.orders)) {
        workPlanData.orders.forEach(row => {
            if (row.items && Array.isArray(row.items)) {
                row.items.forEach(itemId => {
                    if (itemId && !orderItems.includes(itemId)) orderItems.push(itemId);
                });
            } else if (row.items) {
                if (!orderItems.includes(row.items)) orderItems.push(row.items);
            }
        });
    }

    const payload = {
        name: workPlanData.name,
        driver_id: parseInt(workPlanData.driver_id),
        date: workPlanData.date || null,
        Orderitems: orderItems.map(id => parseInt(id))
    };

    if (!isEditMode.value) {
        payload.company_id = parseInt(companyId.value || workPlanData.company_id);
    }

    try {
        if (isEditMode.value) {
            await workPlansStore.updateWorkPlan(selectedworkPlan.value.id, payload, driverStore.drivers);
            showSuccess(t('workPlan.updateSuccess'));
        } else {
            await workPlansStore.addWorkPlan(payload, driverStore.drivers);
            showSuccess(t('workPlan.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error("❌ Failed to save work plan:", error);
        if (error.response?.data) {
            if (error.response.data.errors) {
                alert(Object.values(error.response.data.errors).flat().join("\n"));
            } else if (error.response.data.message) {
                alert(error.response.data.message);
            }
        }
    }
};

const handleDeleteWorkPlan = async (workPlan) => {
    if (!canModifyPlan(workPlan)) {
        alert(t('workPlan.noPermissionToDelete') || "You don't have permission to delete this work plan");
        return;
    }
    try {
        await workPlansStore.deleteWorkPlan(workPlan.id);
        showSuccess(t('workPlan.deleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to delete work plan:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

const handleBulkAction = ({ actionId }) => {
    if (!canAddWorkPlan.value) return;

    const validRows = selectedRows.value.filter(id => {
        const plan = paginatedTableData.value.find(p => p.id === id);
        return plan && canModifyPlan(plan);
    });

    if (validRows.length === 0) {
        alert(t('workPlan.noPermissionForBulk') || "You don't have permission to perform bulk actions on selected items");
        return;
    }

    selectedRows.value = validRows;
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    if (!pendingBulkAction.value || !canAddWorkPlan.value) return;
    bulkActionLoading.value = true;
    isBulkConfirmOpen.value = false;
    const count = selectedRows.value.length;

    try {
        await workPlansStore.bulkDeleteWorkPlans(selectedRows.value);
        showSuccess(t('workPlan.bulkDeleteSuccess', { count }));
        selectedRows.value = [];
        pendingBulkAction.value = null;
        await handleRefresh();
    } catch (error) {
        console.error("❌ Bulk action failed:", error);
    } finally {
        bulkActionLoading.value = false;
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
</style>