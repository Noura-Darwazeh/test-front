<template>
    <div class="user-page-container bg-light">
        <BranchesHeader v-model="searchText" :searchPlaceholder="$t('branch.searchPlaceholder')" :data="branches"
            :columns="displayColumns"
            v-model:visibleColumns="visibleColumns" :showAddButton="true" :addButtonText="$t('branch.addNew')"
            @add-click="openAddModal" @refresh-click="handleRefresh" />

        <div class="card border-0">
            <!-- Tabs -->
            <div class="card-header bg-white border-bottom">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'active' }"
                            @click="switchTab('active')">
                            {{ $t('branch.activeBranches') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link trashed-tab" :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')">
                            {{ $t('branch.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar :selectedCount="selectedRows.length" entityName="branch" :actions="bulkActions"
                    :loading="bulkActionLoading" @action="handleBulkAction" />

                <!-- Loading State -->
                <div v-if="currentLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <p class="mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="branchesStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ branchesStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable :columns="filteredColumns" :data="paginatedData" :actionsLabel="$t('branch.actions')"
                        v-model="selectedRows">
                        <template #actions="{ row }">
                            <!-- Active Branches Actions -->
                            <ActionsDropdown v-if="activeTab === 'active'" :row="row" :editLabel="$t('branch.edit')"
                                :detailsLabel="$t('branch.details')" :deleteLabel="$t('branch.delete')"
                                :confirmDelete="true" @edit="openEditModal" @details="openDetailsModal"
                                @delete="handleDeleteBranch" />
                            <!-- Trashed Branches Actions -->
                            <ActionsDropdown v-else :row="row" :restoreLabel="$t('branch.trashed.restore')"
                                :deleteLabel="$t('branch.trashed.delete')" :showEdit="false" :showDetails="false"
                                :showRestore="true" :confirmDelete="true" @restore="handleRestorebranch"
                                @delete="handlePermanentDeleteBranch" />
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit branch -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('branch.edit') : $t('branch.addNew')"
            :fields="branchFields" :showImageUpload="false" :serverErrors="formErrors"
            @close="closeFormModal" @submit="handleSubmitbranch" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('branch.details')" :data="selectedbranch"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Bulk Action Confirmation Modal -->
        <ConfirmationModal :isOpen="isBulkConfirmOpen" :title="$t('common.bulkDeleteConfirmTitle')"
            :message="bulkConfirmMessage" :confirmText="$t('common.confirm')" :cancelText="$t('common.cancel')"
            @confirm="executeBulkAction" @close="cancelBulkAction" />

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
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import BranchesHeader from "../components/branchesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useBranchesManagementStore } from "../stores/branchesStore";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const branchesStore = useBranchesManagementStore();
const { companyId, companyOption, authStore } = useAuthDefaults();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

// ✅ Check if user is SuperAdmin
const isSuperAdmin = computed(() => authStore.hasRole('SuperAdmin'));

const searchText = ref("");
const itemsPerPage = 1000;
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedbranch = ref({});
const formErrors = ref({});
const activeTab = ref('active');
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Use store data
const branches = computed(() => branchesStore.branches);
const trashedbranches = computed(() => branchesStore.trashedBranches);

// Load branches on component mount
onMounted(async () => {
    try {
        await branchesStore.fetchBranches({ page: 1, perPage: itemsPerPage });
        console.log("✅ Branches loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load data:", error);
    }
});


// Branch Form Fields 
const branchFields = computed(() => [
    {
        name: 'name',
        label: t('branch.form.name'),
        type: 'text',
        required: true,
        placeholder: t('branch.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('branch.validation.nameMax');
            return null;
        }
    },
    {
        name: 'company_id',
        label: t('branch.form.company'),
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
        name: 'latitude',
        label: t('branch.form.latitude'),
        type: 'text',
        required: true,
        placeholder: t('branch.form.latitudePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.latitude : '',
        validate: (value) => {
            const lat = parseFloat(value);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return t('branch.validation.latitudeInvalid');
            }
            return null;
        }
    },
    {
        name: 'longitude',
        label: t('branch.form.longitude'),
        type: 'text',
        required: true,
        placeholder: t('branch.form.longitudePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.longitude : '',
        validate: (value) => {
            const lng = parseFloat(value);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return t('branch.validation.longitudeInvalid');
            }
            return null;
        }
    },
    {
        name: 'locationPicker',
        label: t('branch.form.locationPicker'),
        type: 'locationPicker',
        text: t('common.locateOnMap'),
        latKey: 'latitude',
        lngKey: 'longitude',
        colClass: 'col-12'
    },
]);

// ✅ Details Fields - Hide company for Admin
const detailsFields = computed(() => {
    const fields = [
        { key: 'id', label: t('branch.id'), colClass: 'col-md-6' },
        { key: 'name', label: t('branch.name'), colClass: 'col-md-6' },
    ];

    // Only show company field for SuperAdmin
    if (isSuperAdmin.value) {
        fields.push({ key: 'company_name', label: t('branch.company'), colClass: 'col-md-6' });
    }

    fields.push(
        { key: 'latitude', label: t('branch.form.latitude'), colClass: 'col-md-6' },
        { key: 'longitude', label: t('branch.form.longitude'), colClass: 'col-md-6' }
    );

    return fields;
});

// ✅ Base columns - will be filtered based on role
const baseColumns = ref([
    { key: "name", label: t("branch.name"), sortable: true },
    { key: "company_name", label: t("branch.company"), sortable: true },
]);

// ✅ Columns to display based on user role
const displayColumns = computed(() => {
    if (isSuperAdmin.value) {
        return baseColumns.value;
    }
    // For Admin, exclude company_name column
    return baseColumns.value.filter(col => col.key !== 'company_name');
});

const trashedColumns = computed(() => {
    const columns = [
        { key: "name", label: t("branch.name") },
    ];

    // Only show company for SuperAdmin
    if (isSuperAdmin.value) {
        columns.push({ key: "company_name", label: t("branch.company") });
    }

    return columns;
});

const visibleColumns = ref([]);

// ✅ Initialize visible columns based on role
watch(() => displayColumns.value, (newColumns) => {
    if (visibleColumns.value.length === 0) {
        visibleColumns.value = newColumns.map(col => col.key);
    }
}, { immediate: true });

const filteredColumns = computed(() => {
    return displayColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

// Get current data based on active tab
const currentData = computed(() => {
    return activeTab.value === 'active' ? branches.value : trashedbranches.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? branchesStore.loading : branchesStore.trashedLoading;
});

// ✅ Filter current data
const currentFilteredData = computed(() => {
    let result = currentData.value;
    result = filterData(result, searchText.value);
    return result;
});

const paginatedData = computed(() => {
    return currentFilteredData.value;
});


const applyServerErrors = (error) => {
    const normalized = normalizeServerErrors(error);
    formErrors.value = normalized;
    return Object.keys(normalized).length > 0;
};

const clearFormErrors = () => {
    formErrors.value = {};
};

// Add Modal
const openAddModal = () => {
    clearFormErrors();
    isEditMode.value = false;
    selectedbranch.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (branch) => {
    clearFormErrors();
    isEditMode.value = true;
    selectedbranch.value = { ...branch };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (branch) => {
    selectedbranch.value = { ...branch };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedbranch.value = {};
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedbranch.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await branchesStore.fetchTrashedBranches({ page: 1, perPage: itemsPerPage });
        } catch (error) {
            console.error("❌ Failed to fetch trashed branches:", error);
        }
    } else {
        try {
            await branchesStore.fetchBranches({ page: 1, perPage: itemsPerPage });
        } catch (error) {
            console.error("❌ Failed to fetch branches:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await branchesStore.fetchTrashedBranches({ page: 1, perPage: itemsPerPage });
        } else {
            await branchesStore.fetchBranches({ page: 1, perPage: itemsPerPage });
        }
    } catch (error) {
        console.error("❌ Failed to refresh branches:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('branch.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('branch.bulkRestore'),
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
    const entityName = count === 1 ? t('branch.entitySingular') : t('branch.entityPlural');

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
    const count = selectedRows.value.length;

    try {
        if (pendingBulkAction.value === 'delete') {
            await branchesStore.bulkDeleteBranches(selectedRows.value, false);
            console.log("✅ Branches soft deleted successfully");
            showSuccess(t('branch.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await branchesStore.bulkDeleteBranches(selectedRows.value, true);
            console.log("✅ Branches permanently deleted successfully");
            showSuccess(t('branch.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await branchesStore.bulkRestoreBranches(selectedRows.value);
            console.log("✅ Branches restored successfully");
            showSuccess(t('branch.bulkRestoreSuccess', { count }));
        }

        selectedRows.value = [];
        pendingBulkAction.value = null;
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

const handleSubmitbranch = async (branchData) => {
    try {
        const formattedData = {
            name: branchData.name,
            company_id: companyId.value ? parseInt(companyId.value) : null,
            latitude: branchData.latitude,
            longitude: branchData.longitude
        };

        console.log('📤 Submitting branch data:', formattedData);

        if (isEditMode.value) {
            await branchesStore.updateBranch(selectedbranch.value.id, formattedData);
            console.log('✅ Branch updated successfully!');
            showSuccess(t('branch.updateSuccess'));
        } else {
            await branchesStore.addBranch(formattedData);
            console.log('✅ Branch added successfully!');
            showSuccess(t('branch.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Error submitting branch:', error);
        if (applyServerErrors(error)) {
            return;
        }
        alert(error.message || 'Failed to save branch');
    }
};

const handleRestorebranch = async (branch) => {
    try {
        await branchesStore.restoreBranch(branch.id);
        console.log("✅ Branch restored successfully!");
        showSuccess(t('branch.restoreSuccess'));
    } catch (error) {
        console.error('❌ Error restoring branch:', error);
        alert(error.message || 'Failed to restore branch');
    }
};

const handleDeleteBranch = async (branch) => {
    try {
        await branchesStore.deleteBranch(branch.id);
        console.log("✅ Branch deleted successfully!");
        showSuccess(t('branch.deleteSuccess'));
    } catch (error) {
        console.error("❌ Error deleting branch:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

const handlePermanentDeleteBranch = async (branch) => {
    try {
        await branchesStore.deleteBranch(branch.id, true);
        console.log("✅ Branch permanently deleted successfully!");
        showSuccess(t('branch.permanentDeleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to permanently delete branch:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>