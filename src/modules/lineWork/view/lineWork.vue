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

        <lineWorkHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('lineWork.searchPlaceholder')" 
            :data="lineWorks"
            :columns="lineWorkColumns" 
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true" 
            :addButtonText="$t('lineWork.addNew')"
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
                            {{ $t('common.active') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('lineWork.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="currentLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <p class="mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="lineWorkStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ lineWorkStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <BulkActionsBar
                        :selectedCount="selectedRows.length"
                        entityName="lineWork"
                        :actions="bulkActions"
                        :loading="bulkActionLoading"
                        @action="handleBulkAction"
                    />
                    <DataTable :columns="filteredColumns" :data="paginatedData" :actionsLabel="$t('lineWork.actions')"
                        v-model="selectedRows">
                        <template #actions="{ row }">
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('lineWork.edit')"
                                :detailsLabel="$t('lineWork.details')"
                                :deleteLabel="$t('lineWork.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteLineWork"
                            />
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('lineWork.trashed.restore')"
                                :deleteLabel="$t('lineWork.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestorelineWork"
                                @delete="handlePermanentDeleteLineWork"
                            />
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit lineWork -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('lineWork.edit') : $t('lineWork.addNew')" 
            :fields="lineWorkFields" 
            :showImageUpload="false" 
            :serverErrors="formErrors"
            @close="closeFormModal" 
            @submit="handleSubmitlineWork" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('lineWork.details')" 
            :data="selectedlineWork"
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
import { ref, computed, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import lineWorkHeader from "../components/lineWorkHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useLineWorkStore } from "../stores/lineworkStore.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const lineWorkStore = useLineWorkStore();
const { companyId, companyOption } = useAuthDefaults();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

const searchText = ref("");
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedlineWork = ref({});
const formErrors = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get lineWorks from store
const lineWorks = computed(() => lineWorkStore.lineWorks);
const trashedLineWork = computed(() => lineWorkStore.trashedLineWorks);

// Fetch data on component mount
onMounted(async () => {
    try {
        await lineWorkStore.fetchLineWorks();
    } catch (error) {
        console.error("❌ Failed to load line works:", error);
    }
});

// lineWork Form Fields 
const lineWorkFields = computed(() => [
    {
        name: 'name',
        label: t('lineWork.form.name'),
        type: 'text',
        required: true,
        placeholder: t('lineWork.form.namePlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedlineWork.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('lineWork.validation.nameMax');
            return null;
        }
    },
    {
        name: 'company',
        label: t('lineWork.form.company'),
        type: 'select',
        required: true,
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-12',
        defaultValue: isEditMode.value
            ? String(selectedlineWork.value.company_id ?? "")
            : companyId.value,
        locked: true,
        hidden: true
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('lineWork.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('lineWork.name'), colClass: 'col-md-6' },
    { key: 'company', label: t('lineWork.company'), colClass: 'col-md-6' },
    { key: 'created_at', label: t('lineWork.createdAt'), colClass: 'col-md-6' },
    { key: 'updated_at', label: t('lineWork.updatedAt'), colClass: 'col-md-6' },
]);

const lineWorkColumns = computed(() => [
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("lineWork.name"), sortable: true },
    { key: "company", label: t("lineWork.company"), sortable: false },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return lineWorkColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const currentData = computed(() => {
    return activeTab.value === 'active' ? lineWorks.value : trashedLineWork.value;
});

const currentLoading = computed(() => {
    return activeTab.value === 'active' ? lineWorkStore.loading : lineWorkStore.trashedLoading;
});

const currentFilteredData = computed(() => {
    let result = currentData.value;
    result = filterData(result, searchText.value);
    return result;
});

const paginatedData = computed(() => {
    return currentFilteredData.value;
});

const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('lineWork.bulkDelete'),
                bgColor: 'var(--color-danger)'
            }
        ];
    }
    return [
        {
            id: 'restore',
            label: t('lineWork.bulkRestore'),
            bgColor: 'var(--color-success)'
        },
        {
            id: 'permanentDelete',
            label: t('common.permanentDelete'),
            bgColor: 'var(--color-danger)'
        }
    ];
});

const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const count = selectedRows.value.length;
    const entity = count === 1 ? t('lineWork.entitySingular') : t('lineWork.entityPlural');

    if (pendingBulkAction.value === 'delete') {
        return t('common.bulkDeleteConfirm', { count, entity });
    }
    if (pendingBulkAction.value === 'permanentDelete') {
        return t('common.bulkPermanentDeleteConfirm', { count, entity });
    }
    if (pendingBulkAction.value === 'restore') {
        return t('common.bulkRestoreConfirm', { count, entity });
    }
    return '';
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
    selectedlineWork.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (lineWork) => {
    clearFormErrors();
    isEditMode.value = true;
    selectedlineWork.value = { ...lineWork };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (lineWork) => {
    selectedlineWork.value = { ...lineWork };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedlineWork.value = {};
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedlineWork.value = {};
};

const switchTab = async (tab) => {
    activeTab.value = tab;
    selectedRows.value = [];

    if (tab === 'trashed') {
        try {
            await lineWorkStore.fetchTrashedLineWorks();
        } catch (error) {
            console.error("❌ Failed to load trashed line works:", error);
        }
    } else {
        try {
            await lineWorkStore.fetchLineWorks();
        } catch (error) {
            console.error("❌ Failed to load line works:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await lineWorkStore.fetchTrashedLineWorks();
        } else {
            await lineWorkStore.fetchLineWorks();
        }
    } catch (error) {
        console.error("❌ Failed to refresh line works:", error);
    }
};

const handleSubmitlineWork = async (lineWorkData) => {
    validationError.value = null;
    
    try {
        const resolvedCompany =
            companyId.value ||
            lineWorkData.company ||
            selectedlineWork.value.company_id ||
            "";
        const payload = {
            ...lineWorkData,
            company: resolvedCompany,
        };
        if (isEditMode.value) {
            await lineWorkStore.updateLineWork(selectedlineWork.value.id, payload);
            console.log('✅ Line work updated successfully!');
            showSuccess(t('lineWork.updateSuccess'));
        } else {
            await lineWorkStore.addLineWork(payload);
            console.log('✅ Line work added successfully!');
            showSuccess(t('lineWork.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line work:', error);

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

const handleRestorelineWork = async (lineWork) => {
    try {
        await lineWorkStore.restoreLineWork(lineWork.id);
        console.log("✅ Line work restored successfully!");
        showSuccess(t('lineWork.restoreSuccess'));
    } catch (error) {
        console.error("❌ Failed to restore line work:", error);
        alert(error.message || "Failed to restore line work");
    }
};

const handlePermanentDeleteLineWork = async (lineWork) => {
    try {
        await lineWorkStore.deleteLineWork(lineWork.id, true);
        console.log("✅ Line work permanently deleted successfully!");
        showSuccess(t('lineWork.permanentDeleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to permanently delete line work:", error);
        alert(error.message || t("common.saveFailed"));
    }
};

const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    if (!pendingBulkAction.value) return;
    bulkActionLoading.value = true;
    isBulkConfirmOpen.value = false;
    const count = selectedRows.value.length;

    try {
        if (pendingBulkAction.value === 'delete') {
            await lineWorkStore.bulkDeleteLineWorks(selectedRows.value, false);
            console.log("✅ Line works soft deleted successfully");
            showSuccess(t('lineWork.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await lineWorkStore.bulkDeleteLineWorks(selectedRows.value, true);
            console.log("✅ Line works permanently deleted successfully");
            showSuccess(t('lineWork.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await lineWorkStore.bulkRestoreLineWorks(selectedRows.value);
            console.log("✅ Line works restored successfully");
            showSuccess(t('lineWork.bulkRestoreSuccess', { count }));
        }
        selectedRows.value = [];
        pendingBulkAction.value = null;
    } catch (error) {
        console.error("❌ Failed to perform bulk action on line works:", error);
    } finally {
        bulkActionLoading.value = false;
    }
};

const cancelBulkAction = () => {
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
};

const handleDeleteLineWork = async (lineWork) => {
    try {
        await lineWorkStore.deleteLineWork(lineWork.id);
        console.log("✅ Line work deleted successfully!");
        showSuccess(t('lineWork.deleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to delete line work:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>