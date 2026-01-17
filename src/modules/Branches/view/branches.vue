<template>
    <div class="user-page-container bg-light">
        <BranchesHeader
            v-model="searchText"
            :searchPlaceholder="$t('branch.searchPlaceholder')"
            :data="branches"
            groupKey="company_name"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('branch.filterByCompany')"
            translationKey=""
            :columns="branchColumns"
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('branch.addNew')"
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
                            {{ $t('branch.activeBranches') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('branch.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="branch"
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
                <div v-else-if="branchesStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ branchesStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('branch.actions')"
                        v-model="selectedRows"
                    >
                        <template #actions="{ row }">
                            <!-- Active Branches Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('branch.edit')"
                                :detailsLabel="$t('branch.details')"
                                :deleteLabel="$t('branch.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteBranch"
                            />
                            <!-- Trashed Branches Actions -->
                            <PrimaryButton
                                v-else
                                :text="$t('branch.trashed.restore')"
                                bgColor="var(--color-success)"
                                class="d-inline-flex align-items-center"
                                @click="handleRestorebranch(row)"
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

        <!-- Dynamic Form Modal for Add/Edit branch -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('branch.edit') : $t('branch.addNew')"
            :fields="branchFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitbranch" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('branch.details')" :data="selectedbranch"
            :fields="detailsFields" @close="closeDetailsModal" />

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
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import BranchesHeader from "../components/branchesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useBranchesManagementStore } from "../stores/branchesStore";

const { t } = useI18n();
const branchesStore = useBranchesManagementStore();
const { companyId, companyOption } = useAuthDefaults();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedbranch = ref({});
const activeTab = ref('active');
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Use store data instead of local refs
const branches = computed(() => branchesStore.branches);
const trashedbranches = computed(() => branchesStore.trashedBranches);

// Load branches and companies on component mount
onMounted(async () => {
    try {
        await branchesStore.fetchBranches();
    } catch (error) {
        console.error("Failed to load data:", error);
    }
});

// branch Form Fields 
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

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('branch.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('branch.name'), colClass: 'col-md-6' },
    { key: 'company_name', label: t('branch.company'), colClass: 'col-md-6' },
    { key: 'latitude', label: t('branch.form.latitude'), colClass: 'col-md-6' },
    { key: 'longitude', label: t('branch.form.longitude'), colClass: 'col-md-6' },
]);

// عرض فقط Name و Company في الجدول
const branchColumns = ref([
    { key: "name", label: t("branch.name"), sortable: true },
    { key: "company_name", label: t("branch.company"), sortable: true },
]);

const trashedColumns = computed(() => [
    { key: "name", label: t("branch.name") },
    { key: "company_name", label: t("branch.company") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return branchColumns.value.filter((col) =>
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

// Filter current data
const currentFilteredData = computed(() => {
    let result = currentData.value;
    if (activeTab.value === 'active') {
        result = filterByGroups(result, selectedGroups.value, "company_name");
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
    selectedbranch.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (branch) => {
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
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedbranch.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    currentPage.value = 1;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await branchesStore.fetchTrashedBranches();
        } catch (error) {
            console.error("❌ Failed to fetch trashed branches:", error);
        }
    } else {
        try {
            await branchesStore.fetchBranches();
        } catch (error) {
            console.error("❌ Failed to fetch branches:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await branchesStore.fetchTrashedBranches();
        } else {
            await branchesStore.fetchBranches();
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

    try {
        if (pendingBulkAction.value === 'delete') {
            await branchesStore.bulkDeleteBranches(selectedRows.value, false);
            console.log("✅ Branches soft deleted successfully");
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await branchesStore.bulkDeleteBranches(selectedRows.value, true);
            console.log("✅ Branches permanently deleted successfully");
        } else if (pendingBulkAction.value === 'restore') {
            await branchesStore.bulkRestoreBranches(selectedRows.value);
            console.log("✅ Branches restored successfully");
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
        // تحضير البيانات بالتنسيق الصحيح
        const formattedData = {
            name: branchData.name,
            company_id: companyId.value ? parseInt(companyId.value) : null,
            latitude: branchData.latitude,
            longitude: branchData.longitude
        };

        console.log('📤 Submitting branch data:', formattedData);

        if (isEditMode.value) {
            // Update existing branch using store action
            await branchesStore.updateBranch(selectedbranch.value.id, formattedData);
            console.log('✅ Branch updated successfully!');
        } else {
            // Add new branch using store action
            await branchesStore.addBranch(formattedData);
            console.log('✅ Branch added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Error submitting branch:', error);
        alert(error.message || 'Failed to save branch');
    }
};

const handleRestorebranch = async (branch) => {
    try {
        await branchesStore.restoreBranch(branch.id);
        console.log("✅ Branch restored successfully!");
    } catch (error) {
        console.error('❌ Error restoring branch:', error);
    }
};

const handleDeleteBranch = async (branch) => {
    try {
        await branchesStore.deleteBranch(branch.id);
        console.log("?o. Branch deleted successfully!");
    } catch (error) {
        console.error("??O Error deleting branch:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>
