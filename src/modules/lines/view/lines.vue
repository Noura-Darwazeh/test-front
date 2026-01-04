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
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="linesStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
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
                    <DataTable :columns="filteredColumns" :data="paginatedLines" :actionsLabel="$t('lines.actions')">
                        <template #actions="{ row }">
                            <ActionsDropdown 
                                :row="row" 
                                :editLabel="$t('lines.edit')" 
                                :detailsLabel="$t('lines.details')"
                                @edit="openEditModal" 
                                @details="openDetailsModal" 
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination 
                            :totalItems="filteredLines.length" 
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

        <!-- Trashed Lines Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('lines.trashed.title')"
            :emptyMessage="$t('lines.trashed.empty')" 
            :columns="trashedColumns" 
            :trashedItems="trashedLines"
            @close="closeTrashedModal" 
            @restore="handleRestoreLine" 
        />
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
import LinesHeader from "../components/linesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useLinesStore } from "../stores/linesStore.js";

const { t } = useI18n();
const linesStore = useLinesStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedLine = ref({});
const validationError = ref(null);

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
        options: [
            { value: '1', label: t('lines.form.companies.company1') },
            { value: '2', label: t('lines.form.companies.company2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedLine.value.company_id) : ''
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

const filteredLines = computed(() => {
    let result = lines.value;
    result = filterByGroups(result, selectedGroups.value, "region");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedLines = computed(() => {
    return paginateData(
        filteredLines.value,
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

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitLines = async (lineData) => {
    // Clear previous validation error
    validationError.value = null;
    
    try {
        if (isEditMode.value) {
            // Update existing line
            await linesStore.updateLine(selectedLine.value.id, lineData);
            console.log('✅ Line updated successfully!');
        } else {
            // Add new line
            await linesStore.addLine(lineData);
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
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>