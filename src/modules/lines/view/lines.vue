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
            groupKey="region"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('lines.filterByRegion')"
            translationKey="regions"
            :columns="linesColumns"
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('lines.addNew')"
            @add-click="openAddModal"
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
                            <PrimaryButton
                                v-else
                                :text="$t('lines.trashed.restore')"
                                bgColor="var(--color-success)"
                                class="d-inline-flex align-items-center"
                                @click="handleRestoreLine(row)"
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

        <!-- Dynamic Form Modal for Add/Edit lines -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('lines.edit') : $t('lines.addNew')"
            :fields="linesFields" 
            :showImageUpload="false" 
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
import LinesHeader from "../components/linesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useLinesStore } from "../stores/linesStore.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

const { t } = useI18n();
const linesStore = useLinesStore();
const { companyId, companyOption } = useAuthDefaults();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedLine = ref({});
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

// Fetch data on component mount
onMounted(async () => {
    try {
        await linesStore.fetchLines();
        console.log("✅ Lines loaded successfully");
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
        options: [
            { value: '1', label: t('lines.form.regions.region1') },
            { value: '2', label: t('lines.form.regions.region2') },
        ],
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
        defaultValue: companyId.value,
        locked: true,
        hidden: true
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('lines.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('lines.name'), colClass: 'col-md-6' },
    { key: 'region', label: t('lines.region'), colClass: 'col-md-6' },
    { key: 'company', label: t('lines.company'), colClass: 'col-md-6' },
    { key: 'created_at', label: t('lines.createdAt'), colClass: 'col-md-6' },
    { key: 'updated_at', label: t('lines.updatedAt'), colClass: 'col-md-6' },
]);

const linesColumns = ref([
    { key: "id", label: t("lines.id"), sortable: true },
    { key: "name", label: t("lines.name"), sortable: true },
    { key: "region", label: t("lines.region"), sortable: false },
    { key: "company", label: t("lines.company"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("lines.id") },
    { key: "name", label: t("lines.name") },
    { key: "region", label: t("lines.region") },
    { key: "company", label: t("lines.company") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return linesColumns.value.filter((col) =>
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
    if (activeTab.value === 'active') {
        result = filterByGroups(result, selectedGroups.value, "region");
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
    selectedLine.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (line) => {
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
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedLine.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    currentPage.value = 1;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await linesStore.fetchTrashedLines();
        } catch (error) {
            console.error("❌ Failed to fetch trashed lines:", error);
        }
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

    try {
        if (pendingBulkAction.value === 'delete') {
            await linesStore.bulkDeleteLines(selectedRows.value, false);
            console.log("✅ Lines soft deleted successfully");
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await linesStore.bulkDeleteLines(selectedRows.value, true);
            console.log("✅ Lines permanently deleted successfully");
        } else if (pendingBulkAction.value === 'restore') {
            await linesStore.bulkRestoreLines(selectedRows.value);
            console.log("✅ Lines restored successfully");
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
    // Clear previous validation error
    validationError.value = null;
    
    try {
        const payload = {
            ...lineData,
            company: companyId.value || lineData.company,
        };
        if (isEditMode.value) {
            // Update existing line
            await linesStore.updateLine(selectedLine.value.id, payload);
            console.log('✅ Line updated successfully!');
        } else {
            // Add new line
            await linesStore.addLine(payload);
            console.log('✅ Line added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line:', error);
        
        // Check for specific validation errors
        if (error.response?.data?.success === false && error.response?.data?.error) {
            validationError.value = error.response.data.error;
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                validationError.value = null;
            }, 5000);
            return; // Keep form open for correction
        }
        
        // For other errors, show generic alert
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
    } catch (error) {
        console.error("❌ Failed to restore line:", error);
        alert(error.message || 'Failed to restore line');
    }
};

const handleDeleteLine = async (line) => {
    try {
        await linesStore.deleteLine(line.id);
        console.log("?o. Line deleted successfully!");
    } catch (error) {
        console.error("??O Failed to delete line:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>
