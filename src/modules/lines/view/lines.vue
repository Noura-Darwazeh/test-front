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

        <LinesHeader
            v-model="searchText"
            :searchPlaceholder="$t('lines.searchPlaceholder')"
            :data="lines"
            :groupKey="isSuperAdmin ? 'company' : null"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('lines.filterByCompany')"
            translationKey=""
            :columns="displayColumns"
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('lines.addNew')"
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
                            {{ $t('lines.activeLines') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('lines.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="lines"
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
                <div v-else-if="linesStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ linesStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('lines.actions')"
                        v-model="selectedRows"
                    >
                        <template #actions="{ row }">
                            <!-- Active Lines Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('lines.edit')"
                                :detailsLabel="$t('lines.details')"
                                :deleteLabel="$t('lines.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteLine"
                            />
                            <!-- Trashed Lines Actions -->
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('lines.trashed.restore')"
                                :deleteLabel="$t('lines.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestoreLine"
                                @delete="handlePermanentDeleteLine"
                            />
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit lines -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('lines.edit') : $t('lines.addNew')"
            :fields="linesFields" 
            :showImageUpload="false" 
            :serverErrors="formErrors"
            @close="closeFormModal" 
            @submit="handleSubmitLines" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('lines.details')" 
            :data="selectedLine"
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
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import LinesHeader from "../components/linesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useLinesStore } from "../stores/linesStore.js";
import { useRegionsManagementStore } from "@/modules/regions/store/regionsManagement.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const linesStore = useLinesStore();
const regionsStore = useRegionsManagementStore();
const { companyId, companyOption, authStore } = useAuthDefaults();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

// ✅ Check if user is SuperAdmin
const isSuperAdmin = computed(() => authStore.hasRole('SuperAdmin'));

const searchText = ref("");
const selectedGroups = ref([]);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedLine = ref({});
const formErrors = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get lines from store
const lines = computed(() => linesStore.lines);
const trashedLines = computed(() => linesStore.trashedLines);
const regions = computed(() => regionsStore.regions);

const regionOptions = computed(() =>
    regions.value
        .map((region) => ({
            value: String(region.id ?? ""),
            label: region.name || region.label || "",
        }))
        .filter((option) => option.value && option.label)
);

// Fetch data on component mount
onMounted(async () => {
    try {
        await Promise.all([
            linesStore.fetchLines(),
            regionsStore.fetchRegions(),
        ]);
    } catch (error) {
        console.error("❌ Failed to load lines:", error);
    }
});

// Lines Form Fields 
const linesFields = computed(() => [
    {
        name: 'name',
        label: t('lines.form.name'),
        type: 'text',
        required: true,
        placeholder: t('lines.form.namePlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedLine.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('lines.validation.nameMax');
            return null;
        }
    },
    {
        name: 'region',
        label: t('lines.form.region'),
        type: 'select',
        required: true,
        options: regionOptions.value,
        placeholder: t('lines.form.regionPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedLine.value.region_id) : ''
    },
    {
        name: 'company',
        label: t('lines.form.company'),
        type: 'select',
        required: true,
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value
            ? String(selectedLine.value.company_id ?? "")
            : companyId.value,
        locked: true,
        hidden: true
    },
]);

// ✅ Details Fields - Hide company for Admin
const detailsFields = computed(() => {
    const fields = [
        { key: 'id', label: t('lines.id'), colClass: 'col-md-6' },
        { key: 'name', label: t('lines.name'), colClass: 'col-md-6' },
        { key: 'region', label: t('lines.region'), colClass: 'col-md-6' },
    ];
    
    // Only show company field for SuperAdmin
    if (isSuperAdmin.value) {
        fields.push({ key: 'company', label: t('lines.company'), colClass: 'col-md-6' });
    }
    
    fields.push(
        { key: 'created_at', label: t('lines.createdAt'), colClass: 'col-md-6' },
        { key: 'updated_at', label: t('lines.updatedAt'), colClass: 'col-md-6' }
    );
    
    return fields;
});

// ✅ Base columns - will be filtered based on role
const baseColumns = ref([
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("lines.name"), sortable: true },
    { key: "region", label: t("lines.region"), sortable: false },
    { key: "company", label: t("lines.company"), sortable: false },
]);

// ✅ Columns to display based on user role
const displayColumns = computed(() => {
    if (isSuperAdmin.value) {
        return baseColumns.value;
    }
    // For Admin, exclude company column
    return baseColumns.value.filter(col => col.key !== 'company');
});

const trashedColumns = computed(() => {
    const columns = [
        { key: "__index", label: "#", sortable: false, isIndex: true },
        { key: "name", label: t("lines.name") },
        { key: "region", label: t("lines.region") },
    ];
    
    // Only show company for SuperAdmin
    if (isSuperAdmin.value) {
        columns.push({ key: "company", label: t("lines.company") });
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
    return activeTab.value === 'active' ? lines.value : trashedLines.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? linesStore.loading : linesStore.trashedLoading;
});

// Filter current data
const currentFilteredData = computed(() => {
    let result = currentData.value;
    result = filterData(result, searchText.value);
    
    // ✅ Only apply group filter for SuperAdmin
    if (isSuperAdmin.value && selectedGroups.value.length > 0) {
        result = filterByGroups(result, selectedGroups.value, 'company');
    }
    
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
    selectedLine.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (line) => {
    clearFormErrors();
    isEditMode.value = true;
    selectedLine.value = { ...line };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (line) => {
    selectedLine.value = { ...line };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedLine.value = {};
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedLine.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await linesStore.fetchTrashedLines();
        } catch (error) {
            console.error("❌ Failed to fetch trashed lines:", error);
        }
    } else {
        try {
            await linesStore.fetchLines();
        } catch (error) {
            console.error("❌ Failed to fetch lines:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await linesStore.fetchTrashedLines();
        } else {
            await linesStore.fetchLines();
        }
    } catch (error) {
        console.error("❌ Failed to refresh lines:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('lines.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('lines.bulkRestore'),
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
    const entityName = count === 1 ? t('lines.entitySingular') : t('lines.entityPlural');

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
            await linesStore.bulkDeleteLines(selectedRows.value, false);
            console.log("✅ Lines soft deleted successfully");
            showSuccess(t('lines.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await linesStore.bulkDeleteLines(selectedRows.value, true);
            console.log("✅ Lines permanently deleted successfully");
            showSuccess(t('lines.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await linesStore.bulkRestoreLines(selectedRows.value);
            console.log("✅ Lines restored successfully");
            showSuccess(t('lines.bulkRestoreSuccess', { count }));
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

const handleSubmitLines = async (lineData) => {
    validationError.value = null;
    
    try {
        const payload = {
            ...lineData,
            company: companyId.value || lineData.company,
        };
        if (isEditMode.value) {
            await linesStore.updateLine(selectedLine.value.id, payload);
            console.log('✅ Line updated successfully!');
            showSuccess(t('lines.updateSuccess'));
        } else {
            await linesStore.addLine(payload);
            console.log('✅ Line added successfully!');
            showSuccess(t('lines.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line:', error);

        if (applyServerErrors(error)) {
            return;
        }
        
        if (error.response?.data?.success === false && error.response?.data?.error) {
            validationError.value = error.response.data.error;
            
            setTimeout(() => {
                validationError.value = null;
            }, 5000);
            return;
        }
        
        alert(error.message || t('common.saveFailed'));
    }
};

const clearValidationError = () => {
    validationError.value = null;
};

const handleRestoreLine = async (line) => {
    try {
        await linesStore.restoreLine(line.id);
        console.log("✅ Line restored successfully!");
        showSuccess(t('lines.restoreSuccess'));
    } catch (error) {
        console.error("❌ Failed to restore line:", error);
        alert(error.message || 'Failed to restore line');
    }
};

const handleDeleteLine = async (line) => {
    try {
        await linesStore.deleteLine(line.id);
        console.log("✅ Line deleted successfully!");
        showSuccess(t('lines.deleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to delete line:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

const handlePermanentDeleteLine = async (line) => {
    try {
        await linesStore.deleteLine(line.id, true);
        console.log("✅ Line permanently deleted successfully!");
        showSuccess(t('lines.permanentDeleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to permanently delete line:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>