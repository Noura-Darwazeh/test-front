<template>
    <div class="user-page-container bg-light">
        <RegionsHeader v-model="searchText" :searchPlaceholder="$t('regions.searchPlaceholder')" :data="regions"
            groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('regions.filterByStatus')"
            translationKey="statuses" :columns="regionsColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('regions.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="regionsStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
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
                    <DataTable :columns="filteredColumns" :data="paginatedregions" :actionsLabel="$t('regions.actions')">
                        <template #actions="{ row }">
                            <ActionsDropdown :row="row" :editLabel="$t('regions.edit')"
                                :detailsLabel="$t('regions.details')" @edit="openEditModal" @details="openDetailsModal" />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination :totalItems="filteredregions.length" :itemsPerPage="itemsPerPage"
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

        <!-- Trashed regions Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('regions.trashed.title')"
            :emptyMessage="$t('regions.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedregions"
            @close="closeTrashedModal" @restore="handleRestoreregions" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import RegionsHeader from "../components/regionsHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useRegionsManagementStore } from "../store/regionsManagement.js";

const { t } = useI18n();
const regionsStore = useRegionsManagementStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedregions = ref({});

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
    return regionsColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredregions = computed(() => {
    let result = regions.value;
    result = filterByGroups(result, selectedGroups.value, "status");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedregions = computed(() => {
    return paginateData(
        filteredregions.value,
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

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitregions = async (regionsData) => {
    try {
        if (isEditMode.value) {
            // Update existing region
            await regionsStore.updateRegion(selectedregions.value.id, regionsData);
            console.log('✅ Region updated successfully!');
        } else {
            // Add new region
            const newRegion = {
                name: regionsData.name,
                timezone: regionsData.timezone || null,
            };
            await regionsStore.addRegion(newRegion);
            console.log('✅ Region added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save region:', error);
        alert(error.message || 'Failed to save region');
    }
};

const handleRestoreregions = async (region) => {
    try {
        await regionsStore.restoreRegion(region.id);
        console.log("✅ Region restored successfully!");
    } catch (error) {
        console.error("❌ Failed to restore region:", error);
        alert(error.message || "Failed to restore region");
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>