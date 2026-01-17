<template>
    <div class="user-page-container bg-light">
        <!-- Floating Validation Error Alert -->
        <div v-if="validationError" class="position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
            <div class="alert alert-danger alert-dismissible fade show shadow-lg" role="alert" style="min-width: 400px;">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>{{ $t('common.validationError') }}</strong>
                <p class="mb-0 mt-1">{{ validationError }}</p>
                <button type="button" class="btn-close" @click="clearValidationError"></button>
            </div>
        </div>

        <DriversHeader
            v-model="searchText"
            :searchPlaceholder="$t('driver.searchPlaceholder')"
            :data="drivers"
            groupKey="status"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('driver.filterByStatus')"
            translationKey="statuses"
        :columns="driverColumns"
        v-model:visibleColumns="visibleColumns"
        :showAddButton="true"
        :addButtonText="$t('driver.addNew')"
        @add-click="openAddModal"
        @refresh-click="handleRefresh"
    />

        <div class="card border-0">
            <!-- Tabs -->
            <div class="card-header bg-white border-bottom">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'active' }"
                            @click="switchTab('active')"
                        >
                            {{ $t('driver.activeDrivers') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('driver.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="driver"
                    :actions="bulkActions"
                    :loading="bulkActionLoading"
                    @action="handleBulkAction"
                />

                <!-- Loading State -->
                <div v-if="currentLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <p class="mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="driverStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ driverStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('driver.actions')"
                        v-model="selectedRows"
                    >
                        <template #actions="{ row }">
                            <!-- Active Drivers Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('driver.edit')"
                                :detailsLabel="$t('driver.details')"
                                :deleteLabel="$t('driver.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteDriver"
                            />
                            <!-- Trashed Drivers Actions -->
                            <PrimaryButton
                                v-else
                                :text="$t('driver.trashed.restore')"
                                bgColor="var(--color-success)"
                                class="d-inline-flex align-items-center"
                                @click="handleRestoreDriver(row)"
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination
                            :totalItems="currentFilteredData.length"
                            :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage"
                            @update:currentPage="(page) => currentPage = page"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit Driver -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('driver.edit') : $t('driver.addNew')" 
            :fields="driverFields"
            :showImageUpload="true" 
            :imageRequired="false"
            :imageUploadLabel="$t('driver.form.uploadImage')"
            @close="closeFormModal" 
            @submit="handleSubmitDriver" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('driver.details')" 
            :data="selectedDriver"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        />

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
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import PrimaryButton from "../../../components/shared/PrimaryButton.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import DriversHeader from "../components/driversHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useDriverStore } from "../stores/driverStore.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const driverStore = useDriverStore();
const { companyId, companyOption } = useAuthDefaults();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDriver = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get drivers from store
const drivers = computed(() => driverStore.drivers);
const trashedDrivers = computed(() => driverStore.trashedDrivers);
const branches = ref([]);

const branchOptions = computed(() =>
    branches.value.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }))
);

const fetchBranches = async () => {
    try {
        const response = await apiServices.getBranches();
        branches.value = response.data.data || [];
    } catch (error) {
        console.error("Æ’?O Failed to load branches:", error);
    }
};

// Fetch data on component mount
onMounted(async () => {
    try {
        await Promise.all([
            driverStore.fetchDrivers(),
            fetchBranches(),
        ]);
        console.log("ƒo. Drivers loaded successfully");
    } catch (error) {
        console.error("ƒ?O Failed to load drivers:", error);
    }
});

// Driver Form Fields - FIXED STATUS OPTIONS
const driverFields = computed(() => [
    {
        name: 'name',
        label: t('driver.form.name'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.nameMax');
            return null;
        }
    },
    {
        name: 'username',
        label: t('driver.form.username'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.usernamePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.username : '',
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.usernameMax');
            if (!isEditMode.value) {
                const exists = drivers.value.some(d => d.username === value);
                if (exists) return t('driver.validation.usernameExists');
            }
            return null;
        }
    },
    {
        name: 'email',
        label: t('driver.form.email'),
        type: 'email',
        required: false,
        placeholder: t('driver.form.emailPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.email : '',
        validate: (value) => {
            if (value && value.length > 255) return t('driver.validation.emailMax');
            return null;
        }
    },
    {
        name: 'password',
        label: t('driver.form.password'),
        type: 'password',
        required: !isEditMode.value,
        minlength: 6,
        placeholder: isEditMode.value ? 'Leave empty to keep current password' : t('driver.form.passwordPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: ''
    },
    {
        name: 'phone_number',
        label: t('driver.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('driver.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.phone_number : '',
        validate: (value) => {
            if (value.length > 20) return t('driver.validation.phoneMax');
            return null;
        }
    },
    {
        name: 'type',
        label: t('driver.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'custom driver', label: t('driver.form.driverTypes.customDriver') },
            { value: 'delivery driver', label: t('driver.form.driverTypes.deliveryDriver') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.type : ''
    },
    {
        name: 'vehicle_number',
        label: t('driver.form.vehicleNumber'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.vehicleNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.vehicle_number : ''
    },
    {
        name: 'branch_id',
        label: t('driver.form.branch'),
        type: 'select',
        required: true,
        options: branchOptions.value,
        placeholder: t('driver.form.branchPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedDriver.value.branch_id || '') : ''
    },
    {
        name: 'company_id',
        label: t('driver.form.company'),
        type: 'select',
        required: true,
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-6',
        defaultValue: companyId.value,
        locked: true,
        hidden: true
    },
    {
        name: 'status',
        label: t('driver.form.status'),
        type: 'select',
        required: false,
        options: [
            { value: 'available', label: t('statuses.available') },
            { value: 'busy', label: t('statuses.busy') },
            { value: 'in_holiday', label: t('statuses.in_holiday') }
        ],
        defaultValue: isEditMode.value ? selectedDriver.value.status : 'available',
        colClass: 'col-md-6',
        validate: (value) => {
            const validStatuses = ['available', 'busy', 'in_holiday'];
            if (value && !validStatuses.includes(value)) {
                return t('driver.validation.invalidStatus') || 'Invalid status selected. Valid options: available, busy, in_holiday';
            }
            return null;
        }
    },
    {
        name: 'set_location',
        label: t('driver.form.location'),
        type: 'button',
        required: false,
        text: t('driver.form.setLocation'),
        colClass: 'col-md-6',
        onClick: () => {
            console.log('Setting driver location on map...');
        }
    }
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('driver.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('driver.name'), colClass: 'col-md-6' },
    { key: 'username', label: t('driver.username'), colClass: 'col-md-6' },
    { key: 'email', label: t('driver.email'), colClass: 'col-md-6' },
    { key: 'phone_number', label: t('driver.phoneNumber'), colClass: 'col-md-6' },
    { key: 'status', label: t('driver.status'), translationKey: 'statuses', colClass: 'col-md-6' },
    { key: 'type', label: t('driver.type'), translationKey: 'driverTypes', colClass: 'col-md-6' },
    { key: 'branch_name', label: t('driver.branchName'), colClass: 'col-md-6' },
    { key: 'vehicle_number', label: t('driver.vehicleNumber'), colClass: 'col-md-12' },
]);

const driverColumns = ref([
    { key: "id", label: t("driver.id"), sortable: true },
    { key: "name", label: t("driver.name"), sortable: true },
    { key: "username", label: t("driver.username"), sortable: true },
    {
        key: "status",
        label: t("driver.status"),
        sortable: false,
        component: "StatusBadge",
        componentProps: { type: "driver" },
    },
    { key: "type", label: t("driver.type"), sortable: false },
    { key: "branch_name", label: t("driver.branchName"), sortable: false },
    { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
    { key: "phone_number", label: t("driver.phoneNumber"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("driver.id") },
    { key: "name", label: t("driver.name") },
    { key: "username", label: t("driver.username") },
    { key: "status", label: t("driver.status") },
    { key: "type", label: t("driver.type") },
    { key: "vehicle_number", label: t("driver.vehicleNumber") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return driverColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

// Get current data based on active tab
const currentData = computed(() => {
    return activeTab.value === 'active' ? drivers.value : trashedDrivers.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? driverStore.loading : driverStore.trashedLoading;
});

// Filter current data
const currentFilteredData = computed(() => {
    let result = currentData.value;
    if (activeTab.value === 'active') {
        result = filterByGroups(result, selectedGroups.value, "status");
    }
    result = filterData(result, searchText.value);
    return result;
});

const paginatedData = computed(() => {
    return paginateData(
        currentFilteredData.value,
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
    selectedDriver.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (driver) => {
    isEditMode.value = true;
    selectedDriver.value = { ...driver };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (driver) => {
    selectedDriver.value = { ...driver };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedDriver.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedDriver.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    currentPage.value = 1;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await driverStore.fetchTrashedDrivers();
        } catch (error) {
            console.error("âŒ Failed to fetch trashed drivers:", error);
        }
    } else {
        try {
            await driverStore.fetchDrivers();
        } catch (error) {
            console.error("âŒ Failed to fetch drivers:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await driverStore.fetchTrashedDrivers();
        } else {
            await driverStore.fetchDrivers();
        }
    } catch (error) {
        console.error("âŒ Failed to refresh drivers:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('driver.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('driver.bulkRestore'),
                icon: 'fa-undo',
                bgColor: 'var(--color-success)'
            },
            {
                id: 'permanentDelete',
                label: t('common.permanentDelete'),
                icon: 'fa-trash-alt',
                bgColor: 'var(--color-danger)'
            }
        ];
    }
});

// Bulk confirm message
const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const count = selectedRows.value.length;
    const entityName = count === 1 ? t('driver.entitySingular') : t('driver.entityPlural');

    if (pendingBulkAction.value === 'delete') {
        return t('common.bulkDeleteConfirm', { count, entity: entityName });
    } else if (pendingBulkAction.value === 'permanentDelete') {
        return t('common.bulkPermanentDeleteConfirm', { count, entity: entityName });
    } else if (pendingBulkAction.value === 'restore') {
        return t('common.bulkRestoreConfirm', { count, entity: entityName });
    }
    return '';
});

// Bulk action handler
const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    bulkActionLoading.value = true;
    isBulkConfirmOpen.value = false;

    try {
        if (pendingBulkAction.value === 'delete') {
            await driverStore.bulkDeleteDrivers(selectedRows.value, false);
            console.log("âœ… Drivers soft deleted successfully");
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await driverStore.bulkDeleteDrivers(selectedRows.value, true);
            console.log("âœ… Drivers permanently deleted successfully");
        } else if (pendingBulkAction.value === 'restore') {
            await driverStore.bulkRestoreDrivers(selectedRows.value);
            console.log("âœ… Drivers restored successfully");
        }

        selectedRows.value = [];
        pendingBulkAction.value = null;
    } catch (error) {
        console.error("âŒ Bulk action failed:", error);
    } finally {
        bulkActionLoading.value = false;
    }
};

const cancelBulkAction = () => {
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
};

const handleSubmitDriver = async (driverData) => {
    // Clear previous validation error
    validationError.value = null;
    
    try {
        const payload = {
            ...driverData,
            company_id: companyId.value || driverData.company_id,
        };
        if (isEditMode.value) {
            // Update existing driver
            await driverStore.updateDriver(selectedDriver.value.id, payload);
            console.log('âœ… Driver updated successfully!');
        } else {
            // Add new driver
            await driverStore.addDriver(payload);
            console.log('âœ… Driver added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('âŒ Failed to save driver:', error);
        
        // Check for specific validation errors
        if (error.response?.data?.success === false && error.response?.data?.error) {
            const errorMessage = error.response.data.error;
            
            // Check for username duplicate error
            if (errorMessage.includes('username has already been taken')) {
                validationError.value = t('driver.validation.usernameAlreadyTaken');
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    validationError.value = null;
                }, 5000);
                return; // Keep form open for correction
            }
            
            // Check for phone number duplicate in same company error
            if (errorMessage.includes('already registered as a driver in this company')) {
                validationError.value = t('driver.validation.phoneAlreadyInCompany');
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    validationError.value = null;
                }, 5000);
                return; // Keep form open for correction
            }
        }
        
        // For other errors, show generic alert
        alert(error.message || t('common.saveFailed'));
    }
};

const clearValidationError = () => {
    validationError.value = null;
};

const handleRestoreDriver = async (driver) => {
    try {
        await driverStore.restoreDriver(driver.id);
        console.log("âœ… Driver restored successfully!");
    } catch (error) {
        console.error("âŒ Failed to restore driver:", error);
        alert(error.message || 'Failed to restore driver');
    }
};

const handleDeleteDriver = async (driver) => {
    try {
        await driverStore.deleteDriver(driver.id);
        console.log("?o. Driver deleted successfully!");
    } catch (error) {
        console.error("??O Failed to delete driver:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>

