<template>
    <div class="user-page-container bg-light">
        <BranchesHeader v-model="searchText" :searchPlaceholder="$t('branch.searchPlaceholder')" :data="branches"
            groupKey="company_name" v-model:groupModelValue="selectedGroups" :groupLabel="$t('branch.filterByCompany')"
            translationKey="" :columns="branchColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('branch.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedbranches" :actionsLabel="$t('branch.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('branch.edit')" :detailsLabel="$t('branch.details')"
                            @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredbranches.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit branch -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('branch.edit') : $t('branch.addNew')"
            :fields="branchFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitbranch" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('branch.details')" :data="selectedbranch"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed branches Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('branch.trashed.title')"
            :emptyMessage="$t('branch.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedbranches"
            @close="closeTrashedModal" @restore="handleRestorebranch" />
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
import BranchesHeader from "../components/branchesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useBranchesManagementStore } from "../stores/branchesStore";
import apiServices from "@/services/apiServices.js";

const { t } = useI18n();
const branchesStore = useBranchesManagementStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedbranch = ref({});
const companies = ref([]);

// Use store data instead of local refs
const branches = computed(() => branchesStore.branches);
const trashedbranches = computed(() => branchesStore.trashedBranches);

// Fetch companies for dropdown
const fetchCompanies = async () => {
    try {
        const response = await apiServices.getCompanies();
        companies.value = response.data.data.map(company => ({
            value: company.id,
            label: company.name
        }));
    } catch (error) {
        console.error("Failed to load companies:", error);
    }
};

// Load branches and companies on component mount
onMounted(async () => {
    try {
        await Promise.all([
            branchesStore.fetchBranches(),
            fetchCompanies()
        ]);
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
        options: companies.value,
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.company_id : ''
    },
    {
        name: 'latitude',
        label: t('branch.form.latitude'),
        type: 'text',
        required: true,
        placeholder: '32.2270',
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.latitude : '',
        validate: (value) => {
            const lat = parseFloat(value);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return 'Invalid latitude (must be between -90 and 90)';
            }
            return null;
        }
    },
    {
        name: 'longitude',
        label: t('branch.form.longitude'),
        type: 'text',
        required: true,
        placeholder: '35.2544',
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.longitude : '',
        validate: (value) => {
            const lng = parseFloat(value);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return 'Invalid longitude (must be between -180 and 180)';
            }
            return null;
        }
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

const filteredbranches = computed(() => {
    let result = branches.value;
    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedbranches = computed(() => {
    return paginateData(
        filteredbranches.value,
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

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitbranch = async (branchData) => {
    try {
        // تحضير البيانات بالتنسيق الصحيح
        const formattedData = {
            name: branchData.name,
            company_id: parseInt(branchData.company_id),
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
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>