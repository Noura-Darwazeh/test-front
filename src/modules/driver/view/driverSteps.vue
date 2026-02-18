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
            :showAddButton="false"
            :addButtonText="$t('workPlan.addNew')" 
            :showTrashedButton="false" 
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
                        <DataTable 
                            :columns="filteredColumns" 
                            :data="paginatedTableData"
                            :actionsLabel="$t('workPlan.actions')" 
                            v-model="selectedRows"
                            :showCheckbox="false">
                            <template #actions="{ row }">
                                <ActionsDropdown 
                                    :row="row" 
                                    :detailsLabel="$t('workPlan.details')"
                                    :showEdit="false"
                                    :showDelete="false"
                                    :showDetails="true"
                                    @details="openDetailsModal"
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
                    <OrderItemProgress 
                        v-for="orderItem in workPlanOrderItems" 
                        :key="orderItem.id"
                        :orderItem="orderItem"
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
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import WorkPlansHeader from "../components/workPlansHeader.vue";
import WorkPlanCalendar from "../components/calender.vue";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { useWorkPlansStore } from "../stores/workPlansStore.js";
import { useDriverStore } from "../../drivers/stores/driversStore.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const { authStore } = useAuthDefaults();
const workPlansStore = useWorkPlansStore();
const driverStore = useDriverStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isDetailsModalOpen = ref(false);
const selectedworkPlan = ref({});
const activeTab = ref('calendar');
const selectedRows = ref([]);
const workPlanOrderItems = ref([]);
const loadingDetails = ref(false);

// الدرايفر الحالي
const currentDriverId = computed(() => authStore.user?.id);

const workPlans = computed(() => workPlansStore.workPlans);

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
    return workPlanColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

const filteredTableData = computed(() => {
    let result = workPlans.value;
    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedTableData = computed(() => filteredTableData.value);

const currentPagination = computed(() => workPlansStore.workPlansPagination);

onMounted(async () => {
    try {
        await driverStore.fetchDrivers();
        await workPlansStore.fetchWorkPlans({
            page: 1,
            perPage: itemsPerPage.value,
            drivers: driverStore.drivers,
            driverId: currentDriverId.value,
        });
    } catch (error) {
        console.error("Failed to load initial data:", error);
    }
});

watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    try {
        await workPlansStore.fetchWorkPlans({
            page: newPage,
            perPage: itemsPerPage.value,
            drivers: driverStore.drivers,
            driverId: currentDriverId.value,
        });
    } catch (err) {
        console.error("Failed to load page:", err);
    }
});

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
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
            drivers: driverStore.drivers,
            driverId: currentDriverId.value,
        });
    } catch (error) {
        console.error("Failed to switch tabs:", error);
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        await workPlansStore.fetchWorkPlans({
            page: currentPage.value,
            perPage: itemsPerPage.value,
            drivers: driverStore.drivers,
            driverId: currentDriverId.value,
        });
    } catch (error) {
        console.error("Failed to refresh work plans:", error);
    }
};

const openDetailsModal = async (workPlan) => {
    selectedworkPlan.value = { ...workPlan };
    isDetailsModalOpen.value = true;
    await fetchWorkPlanDetails(workPlan.id);
};

const fetchWorkPlanDetails = async (workPlanId) => {
    loadingDetails.value = true;
    workPlanOrderItems.value = [];
    try {
        const response = await apiServices.get(`/work_plans/${workPlanId}`);
        const data = response.data.data;
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

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedworkPlan.value = {};
    workPlanOrderItems.value = [];
};

// دالة وهمية عشان الكاليندر ما يتعطل
const openEditModal = () => {};
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