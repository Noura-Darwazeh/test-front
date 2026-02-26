<template>
    <div class="user-page-container bg-light">
        <RegionsHeader v-model="searchText" :searchPlaceholder="$t('regions.searchPlaceholder')" :data="regions"
            :columns="regionsColumns" v-model:visibleColumns="visibleColumns"
            :showActiveFilter="true" :activeFilterValue="activeStatusFilter" @update:activeFilterValue="activeStatusFilter = $event"
            :showAddButton="isSuperAdmin" :addButtonText="$t('regions.addNew')" @add-click="openAddModal"
            @refresh-click="handleRefresh" />

        <div class="card border-0">
            <div class="card-header bg-white border-bottom" v-if="isSuperAdmin">
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
                            {{ $t('regions.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>
            
            <div class="card-body p-0">
                <BulkActionsBar
                    v-if="isSuperAdmin"
                    :selectedCount="selectedRows.length"
                    entityName="regions"
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
                <div v-else-if="regionsStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ regionsStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('regions.actions')"
                        v-model="selectedRows"
                        :showCheckbox="isSuperAdmin"
                        :rowClass="(row) => row.is_active === 0 ? 'row-inactive' : ''"
                    >
                        <template #actions="{ row }">
                            <!-- للأدمن: فقط Details -->
                            <ActionsDropdown
                                v-if="!isSuperAdmin"
                                :row="row"
                                :detailsLabel="$t('regions.details')"
                                :showEdit="false"
                                :showDelete="false"
                                :showRestore="false"
                                @details="openDetailsModal"
                            />
                            
                            <ActionsDropdown
                                v-else-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('regions.edit')"
                                :detailsLabel="$t('regions.details')"
                                :deleteLabel="$t('regions.delete')"
                                :showActivate="row.is_active === 0" :showDeactivate="row.is_active === 1"
                                :activateLabel="$t('common.activate')" :deactivateLabel="$t('common.deactivate')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteRegion"
                                @activate="handleActivate" @deactivate="handleDeactivate"
                            />
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('regions.trashed.restore')"
                                :deleteLabel="$t('regions.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestoreregions"
                                @delete="handlePermanentDeleteRegion"
                            />
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <FormModal 
            v-if="isSuperAdmin"
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('regions.edit') : $t('regions.addNew')"
            :fields="regionsFields" 
            :showImageUpload="false" 
            :serverErrors="formErrors"
            @close="closeFormModal" 
            @submit="handleSubmitregions" 
        />

        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('regions.details')" 
            :data="selectedregions"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        />

        <ConfirmationModal 
            v-if="isSuperAdmin"
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

        <!-- Error Modal -->
        <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import ErrorModal from "../../../components/shared/ErrorModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { useErrorModal } from "../../../composables/useErrorModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import RegionsHeader from "../components/regionsHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useRegionsManagementStore } from "../store/regionsManagement.js";
import { useAuthStore } from "@/stores/auth.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";
import { useActiveToggle } from "../../../composables/useActiveToggle.js";

const { t, locale } = useI18n();
const regionsStore = useRegionsManagementStore();
const authStore = useAuthStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();

const isSuperAdmin = computed(() => authStore.hasRole('SuperAdmin'));

const searchText = ref("");
const activeStatusFilter = ref("");
const itemsPerPage = 1000;
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedregions = ref({});
const formErrors = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Active Toggle
const refreshRegions = () => regionsStore.fetchRegions({ page: 1, perPage: itemsPerPage, filters: activeStatusFilter.value !== '' ? { is_active: activeStatusFilter.value } : {} });
const { handleActivate, handleDeactivate, handleBulkActivate, handleBulkDeactivate } = useActiveToggle("regions", refreshRegions, { showSuccess, showError });

// Get regions from store
const regions = computed(() => regionsStore.regions);
const trashedregions = computed(() => regionsStore.trashedRegions);

// Fetch regions on component mount
onMounted(async () => {
  try {
    await regionsStore.fetchRegions({ page: 1, perPage: itemsPerPage });
  } catch (error) {
    console.error("❌ Failed to load regions:", error);
  }
});


// Watch for active status filter changes — re-fetch from server
watch(activeStatusFilter, async (newValue) => {
    const filters = {};
    if (newValue !== '') filters.is_active = newValue;
    try {
        await regionsStore.fetchRegions({ page: 1, perPage: itemsPerPage, filters });
    } catch (err) {
        console.error("Failed to filter regions:", err);
    }
});

// regions Form Fields
const regionsFields = computed(() => [
    {
        name: 'key',
        label: t('regions.form.key'),
        type: 'text',
        required: true,
        placeholder: t('regions.form.keyPlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedregions.value.key : '',
        validate: (value) => {
            if (!value) return t('regions.validation.keyRequired');
            return null;
        }
    },
    {
        name: 'nameenglish',
        label: t('regions.form.nameEnglish'),
        type: 'text',
        required: true,
        placeholder: t('regions.form.nameEnglishPlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value
            ? (selectedregions.value.nameenglish
                ?? (locale.value === 'en' ? selectedregions.value.name : ''))
            : '',
        validate: (value) => {
            if (!value) return t('regions.validation.nameEnglishRequired');
            if (value.length > 255) return t('regions.validation.nameMax');
            return null;
        }
    },
    {
        name: 'namearabic',
        label: t('regions.form.nameArabic'),
        type: 'text',
        required: true,
        placeholder: t('regions.form.nameArabicPlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value
            ? (selectedregions.value.namearabic
                ?? (locale.value === 'ar' ? selectedregions.value.name : ''))
            : '',
        validate: (value) => {
            if (!value) return t('regions.validation.nameArabicRequired');
            if (value.length > 255) return t('regions.validation.nameMax');
            return null;
        }
    },
    {
        name: 'timezone',
        label: t('regions.form.timezone'),
        type: 'text',
        required: false,
        placeholder: t('regions.form.timezonePlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedregions.value.timezone : '',
        validate: (value) => {
            if (value && value.length > 50) return t('regions.validation.timezoneMax');
            return null;
        }
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('regions.id'), colClass: 'col-md-6' },
    { key: 'key', label: t('regions.key'), colClass: 'col-md-6' },
    { key: 'name', label: t('regions.name'), colClass: 'col-md-6' },
    { key: 'timezone', label: t('regions.timezone'), colClass: 'col-md-12' },
]);

const regionsColumns = ref([
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("regions.name"), sortable: true },
    { key: "timezone", label: t("regions.timezone"), sortable: false },
    { key: "is_active", label: t("common.status"), sortable: false, component: "StatusBadge", componentProps: { statusMap: { 1: "active", 0: "inactive" } } },
]);

const trashedColumns = computed(() => [
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("regions.name") },
    { key: "timezone", label: t("regions.timezone") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    if (activeTab.value === 'active') {
        return regionsColumns.value.filter((col) =>
            visibleColumns.value.includes(col.key)
        );
    }
    return trashedColumns.value;
});

const regionsWithLocalizedName = computed(() => {
    return regions.value.map((region) => ({
        ...region,
        name: locale.value === 'ar'
            ? region.namearabic || region.name || region.nameenglish || ''
            : region.nameenglish || region.name || region.namearabic || ''
    }));
});

const trashedRegionsWithLocalizedName = computed(() => {
    return trashedregions.value.map((region) => ({
        ...region,
        name: locale.value === 'ar'
            ? region.namearabic || region.name || region.nameenglish || ''
            : region.nameenglish || region.name || region.namearabic || ''
    }));
});

const currentData = computed(() => {
    return activeTab.value === 'active'
        ? regionsWithLocalizedName.value
        : trashedRegionsWithLocalizedName.value;
});

const currentLoading = computed(() => {
    return activeTab.value === 'active' ? regionsStore.loading : regionsStore.trashedLoading;
});

const currentFilteredData = computed(() => {
    let result = currentData.value;
    result = filterData(result, searchText.value);
    return result;
});

// Server already returns paginated data
const paginatedData = computed(() => {
    return currentFilteredData.value;
});


const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'activate',
                label: t('common.bulkActivate'),
                bgColor: 'var(--color-success)',
            },
            {
                id: 'deactivate',
                label: t('common.bulkDeactivate'),
                bgColor: 'var(--color-warning, #ffc107)',
            },
            {
                id: 'delete',
                label: t('regions.bulkDelete'),
                bgColor: 'var(--color-danger)'
            }
        ];
    }

    return [
        {
            id: 'restore',
            label: t('regions.bulkRestore'),
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
    const entity = count === 1 ? t('regions.entitySingular') : t('regions.entityPlural');

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

const openAddModal = () => {
    if (!isSuperAdmin.value) {
        return;
    }
    clearFormErrors();
    isEditMode.value = false;
    selectedregions.value = {};
    isFormModalOpen.value = true;
};

const openEditModal = (regions) => {
    if (!isSuperAdmin.value) {
        return;
    }
    clearFormErrors();
    isEditMode.value = true;
    selectedregions.value = { ...regions };
    isFormModalOpen.value = true;
};

const openDetailsModal = (regions) => {
    selectedregions.value = { ...regions };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedregions.value = {};
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedregions.value = {};
};

const switchTab = async (tab) => {
    if (!isSuperAdmin.value) {
        return;
    }

    activeTab.value = tab;
    selectedRows.value = [];

    if (tab === 'trashed') {
        try {
            await regionsStore.fetchTrashedRegions({ page: 1, perPage: itemsPerPage });
        } catch (error) {
            console.error("❌ Failed to load trashed regions:", error);
        }
    } else {
        const filters = {};
        if (activeStatusFilter.value !== '') filters.is_active = activeStatusFilter.value;
        try {
            await regionsStore.fetchRegions({ page: 1, perPage: itemsPerPage, filters });
        } catch (error) {
            console.error("❌ Failed to load regions:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    const filters = {};
    if (activeStatusFilter.value !== '') filters.is_active = activeStatusFilter.value;
    try {
        if (activeTab.value === 'trashed') {
            await regionsStore.fetchTrashedRegions({ page: 1, perPage: itemsPerPage });
        } else {
            await regionsStore.fetchRegions({ page: 1, perPage: itemsPerPage, filters });
        }
    } catch (error) {
        console.error("❌ Failed to refresh regions:", error);
    }
};

const handleSubmitregions = async (regionsData) => {
    if (!isSuperAdmin.value) {
        return;
    }

    try {
        const keyValue = (regionsData.key || "").trim();
        const payload = {
            key: keyValue ? keyValue.toUpperCase() : keyValue,
            nameenglish: regionsData.nameenglish,
            namearabic: regionsData.namearabic,
            timezone: regionsData.timezone || null,
        };

        if (isEditMode.value) {
            await regionsStore.updateRegion(selectedregions.value.id, payload);
            console.log("✅ Region updated successfully!");
            showSuccess(t('regions.updateSuccess'));
        } else {
            await regionsStore.addRegion(payload);
            console.log("✅ Region added successfully!");
            showSuccess(t('regions.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error("❌ Failed to save region:", error);
        if (applyServerErrors(error)) {
            return;
        }
        showError(error.message || "Failed to save region");
    }
};

const handleRestoreregions = async (region) => {
    if (!isSuperAdmin.value) {
        return;
    }

    try {
        await regionsStore.restoreRegion(region.id);
        console.log("✅ Region restored successfully!");
        showSuccess(t('regions.restoreSuccess'));
    } catch (error) {
        console.error("❌ Failed to restore region:", error);
        showError(error.message || "Failed to restore region");
    }
};

const handleDeleteRegion = async (region) => {
    if (!isSuperAdmin.value) {
        return;
    }

    try {
        await regionsStore.deleteRegion(region.id);
        console.log("✅ Region deleted successfully!");
        showSuccess(t('regions.deleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to delete region:", error);
        showError(error.message || "Failed to delete region");
    }
};

const handlePermanentDeleteRegion = async (region) => {
    if (!isSuperAdmin.value) {
        return;
    }

    try {
        await regionsStore.deleteRegion(region.id, true);
        console.log("✅ Region permanently deleted successfully!");
        showSuccess(t('regions.permanentDeleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to permanently delete region:", error);
        showError(error.message || "Failed to delete region");
    }
};

const handleBulkAction = ({ actionId }) => {
    if (!isSuperAdmin.value) {
        return;
    }

    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    if (!isSuperAdmin.value || !pendingBulkAction.value) return;
    
    bulkActionLoading.value = true;
    isBulkConfirmOpen.value = false;
    const count = selectedRows.value.length;

    try {
        if (pendingBulkAction.value === 'delete') {
            await regionsStore.bulkDeleteRegions(selectedRows.value, false);
            console.log("✅ Regions soft deleted successfully");
            showSuccess(t('regions.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await regionsStore.bulkDeleteRegions(selectedRows.value, true);
            console.log("✅ Regions permanently deleted successfully");
            showSuccess(t('regions.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await regionsStore.bulkRestoreRegions(selectedRows.value);
            console.log("✅ Regions restored successfully");
            showSuccess(t('regions.bulkRestoreSuccess', { count }));
        } else if (pendingBulkAction.value === 'activate') {
            await handleBulkActivate(selectedRows.value);
        } else if (pendingBulkAction.value === 'deactivate') {
            await handleBulkDeactivate(selectedRows.value);
        }
        selectedRows.value = [];
        pendingBulkAction.value = null;
    } catch (error) {
        console.error("❌ Failed to bulk delete regions:", error);
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
</style>