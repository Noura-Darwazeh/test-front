<template>
    <div class="user-page-container bg-light">
        <RegionsHeader v-model="searchText" :searchPlaceholder="$t('regions.searchPlaceholder')" :data="regions"
            groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('regions.filterByStatus')"
            translationKey="statuses" :columns="regionsColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('regions.addNew')" @add-click="openAddModal" />

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
                            {{ $t('regions.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body p-0">
                <BulkActionsBar
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
                    <DataTable :columns="filteredColumns" :data="paginatedData" :actionsLabel="$t('regions.actions')"
                        v-model="selectedRows">
                        <template #actions="{ row }">
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('regions.edit')"
                                :detailsLabel="$t('regions.details')" :deleteLabel="$t('regions.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal" @details="openDetailsModal" @delete="handleDeleteRegion"
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
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination :totalItems="currentFilteredData.length" :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit regions -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('regions.edit') : $t('regions.addNew')"
            :fields="regionsFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitregions" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('regions.details')" :data="selectedregions"
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
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import RegionsHeader from "../components/regionsHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useRegionsManagementStore } from "../store/regionsManagement.js";

const { t } = useI18n();
const regionsStore = useRegionsManagementStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedregions = ref({});
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Get regions from store
const regions = computed(() => regionsStore.regions);
const trashedregions = computed(() => regionsStore.trashedRegions);

// Fetch regions on component mount
onMounted(async () => {
  try {
    await regionsStore.fetchRegions();
    console.log("✅ Regions loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load regions:", error);
  }
});

// regions Form Fields
const regionsFields = computed(() => [
    {
        name: 'name',
        label: t('regions.form.name'),
        type: 'text',
        required: true,
        placeholder: t('regions.form.namePlaceholder'),
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedregions.value.name : '',
        validate: (value) => {
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
    { key: 'name', label: t('regions.name'), colClass: 'col-md-6' },
    { key: 'timezone', label: t('regions.timezone'), colClass: 'col-md-12' },
]);

const regionsColumns = ref([
    { key: "id", label: t("regions.id"), sortable: true },
    { key: "name", label: t("regions.name"), sortable: true },
    { key: "timezone", label: t("regions.timezone"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("regions.id") },
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

const currentData = computed(() => {
    return activeTab.value === 'active' ? regions.value : trashedregions.value;
});

const currentLoading = computed(() => {
    return activeTab.value === 'active' ? regionsStore.loading : regionsStore.trashedLoading;
});

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

const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
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

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});

// Add Modal
const openAddModal = () => {
    isEditMode.value = false;
    selectedregions.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (regions) => {
    isEditMode.value = true;
    selectedregions.value = { ...regions };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (regions) => {
    selectedregions.value = { ...regions };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedregions.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedregions.value = {};
};

const switchTab = async (tab) => {
    activeTab.value = tab;
    currentPage.value = 1;
    selectedRows.value = [];

    if (tab === 'trashed') {
        try {
            await regionsStore.fetchTrashedRegions();
        } catch (error) {
            console.error("Failed to load trashed regions:", error);
        }
    }
};

const handleSubmitregions = async (regionsData) => {
    try {
        if (isEditMode.value) {
            await regionsStore.updateRegion(selectedregions.value.id, regionsData);
            console.log("Region updated successfully!");
        } else {
            const newRegion = {
                name: regionsData.name,
                timezone: regionsData.timezone || null,
            };
            await regionsStore.addRegion(newRegion);
            console.log("Region added successfully!");
        }
        closeFormModal();
    } catch (error) {
        console.error("Failed to save region:", error);
        alert(error.message || "Failed to save region");
    }
};

const handleRestoreregions = async (region) => {
    try {
        await regionsStore.restoreRegion(region.id);
        console.log("Region restored successfully!");
    } catch (error) {
        console.error("Failed to restore region:", error);
        alert(error.message || "Failed to restore region");
    }
};

const handleDeleteRegion = async (region) => {
    try {
        await regionsStore.deleteRegion(region.id);
        console.log("Region deleted successfully!");
    } catch (error) {
        console.error("Failed to delete region:", error);
        alert(error.message || "Failed to delete region");
    }
};

const handlePermanentDeleteRegion = async (region) => {
    try {
        await regionsStore.deleteRegion(region.id, true);
        console.log("Region permanently deleted successfully!");
    } catch (error) {
        console.error("Failed to permanently delete region:", error);
        alert(error.message || "Failed to delete region");
    }
};

const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    if (!pendingBulkAction.value) return;
    bulkActionLoading.value = true;

    try {
        if (pendingBulkAction.value === 'delete') {
            await regionsStore.bulkDeleteRegions(selectedRows.value, false);
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await regionsStore.bulkDeleteRegions(selectedRows.value, true);
        } else if (pendingBulkAction.value === 'restore') {
            await regionsStore.bulkRestoreRegions(selectedRows.value);
        }
        selectedRows.value = [];
    } catch (error) {
        console.error("Failed to bulk delete regions:", error);
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
</style>

