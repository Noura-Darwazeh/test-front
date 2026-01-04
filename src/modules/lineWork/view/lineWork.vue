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
            groupKey="company" 
            v-model:groupModelValue="selectedGroups" 
            :groupLabel="$t('lineWork.filterByCompany')"
            translationKey="companyNames" 
            :columns="lineWorkColumns" 
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true" 
            :addButtonText="$t('lineWork.addNew')" 
            @add-click="openAddModal"
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="lineWorkStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
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
                    <DataTable :columns="filteredColumns" :data="paginatedLineWork" :actionsLabel="$t('lineWork.actions')">
                        <template #actions="{ row }">
                            <ActionsDropdown 
                                :row="row" 
                                :editLabel="$t('lineWork.edit')" 
                                :detailsLabel="$t('lineWork.details')"
                                @edit="openEditModal" 
                                @details="openDetailsModal" 
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination 
                            :totalItems="filteredLineWork.length" 
                            :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage" 
                            @update:currentPage="(page) => currentPage = page" 
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit lineWork -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('lineWork.edit') : $t('lineWork.addNew')"
            :fields="lineWorkFields" 
            :showImageUpload="false" 
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

        <!-- Trashed lineWork Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('lineWork.trashed.title')"
            :emptyMessage="$t('lineWork.trashed.empty')" 
            :columns="trashedColumns" 
            :trashedItems="trashedLineWork"
            @close="closeTrashedModal" 
            @restore="handleRestorelineWork" 
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
import lineWorkHeader from "../components/lineWorkHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useLineWorkStore } from "../stores/lineworkStore.js";

const { t } = useI18n();
const lineWorkStore = useLineWorkStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedlineWork = ref({});
const validationError = ref(null);

// Get lineWorks from store
const lineWorks = computed(() => lineWorkStore.lineWorks);
const trashedLineWork = computed(() => lineWorkStore.trashedLineWorks);

// Fetch data on component mount
onMounted(async () => {
    try {
        await lineWorkStore.fetchLineWorks();
        console.log("✅ Line works loaded successfully");
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
        options: [
            { value: '1', label: t('lineWork.form.companies.company1') },
            { value: '2', label: t('lineWork.form.companies.company2') },
        ],
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? String(selectedlineWork.value.company_id) : ''
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

const lineWorkColumns = ref([
    { key: "id", label: t("lineWork.id"), sortable: true },
    { key: "name", label: t("lineWork.name"), sortable: true },
    { key: "company", label: t("lineWork.company"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("lineWork.id") },
    { key: "name", label: t("lineWork.name") },
    { key: "company", label: t("lineWork.company") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return lineWorkColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredLineWork = computed(() => {
    let result = lineWorks.value;
    result = filterByGroups(result, selectedGroups.value, "company");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedLineWork = computed(() => {
    return paginateData(
        filteredLineWork.value,
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
    selectedlineWork.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (lineWork) => {
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
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedlineWork.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitlineWork = async (lineWorkData) => {
    // Clear previous validation error
    validationError.value = null;
    
    try {
        if (isEditMode.value) {
            // Update existing lineWork
            await lineWorkStore.updateLineWork(selectedlineWork.value.id, lineWorkData);
            console.log('✅ Line work updated successfully!');
        } else {
            // Add new lineWork
            await lineWorkStore.addLineWork(lineWorkData);
            console.log('✅ Line work added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line work:', error);
        
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

const handleRestorelineWork = async (lineWork) => {
    try {
        await lineWorkStore.restoreLineWork(lineWork.id);
        console.log("✅ Line work restored successfully!");
    } catch (error) {
        console.error("❌ Failed to restore line work:", error);
        alert(error.message || 'Failed to restore line work');
    }
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>