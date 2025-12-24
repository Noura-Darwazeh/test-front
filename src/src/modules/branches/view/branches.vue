<template>
    <div class="user-page-container bg-light">
        <BranchesHeader v-model="searchText" :searchPlaceholder="$t('branch.searchPlaceholder')" :data="branches"
            groupKey="location" v-model:groupModelValue="selectedGroups" :groupLabel="$t('branch.filterByLocation')"
            translationKey="branch.locations" :columns="branchColumns" v-model:visibleColumns="visibleColumns"
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
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import BranchesHeader from "../components/branchesHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedbranch = ref({});

const branches = ref([
    {
        id: 1,
        name: "Branch Nablus Central",
        location: 'nablus',
        company: 'company 1'
    },
    {
        id: 2,
        name: "Branch Ramallah Downtown",
        location: 'ramallah',
        company: 'company 2'
    },
]);

const trashedbranches = ref([
    {
        id: 6,
        name: "Trashed Branch",
        location: 'nablus',
        company: 'company 1'
    },
]);

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
        name: 'location',
        label: t('branch.form.location'),
        type: 'select',
        required: true,
        options: [
            { value: 'nablus', label: t('branch.locations.nablus') },
            { value: 'ramallah', label: t('branch.locations.ramallah') },

        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.location : ''
    },
    {
        name: 'company',
        label: t('branch.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: t('lines.form.companies.company1') },
            { value: 'company 2', label: t('lines.form.companies.company2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedbranch.value.company : ''
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('branch.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('branch.name'), colClass: 'col-md-6' },
    { key: 'location', label: t('branch.location'), translationKey: 'branch.locations', colClass: 'col-md-6' },
    { key: 'company', label: t('branch.company'), colClass: 'col-md-6' },
]);

const branchColumns = ref([
    { key: "id", label: t("branch.id"), sortable: true },
    { key: "name", label: t("branch.name"), sortable: true },
    { key: "location", label: t("branch.location"), sortable: false },
    { key: "company", label: t("branch.company"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("branch.id") },
    { key: "name", label: t("branch.name") },
    { key: "location", label: t("branch.location") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return branchColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredbranches = computed(() => {
    let result = branches.value;
    result = filterByGroups(result, selectedGroups.value, "location");
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

const handleSubmitbranch = (branchData) => {
    if (isEditMode.value) {
        // Update existing branch
        const index = branches.value.findIndex(d => d.id === selectedbranch.value.id);
        if (index > -1) {
            branches.value[index] = {
                ...branches.value[index],
                name: branchData.name,
                company: branchData.company || 'company 1',
                location: branchData.location,
            };
            console.log('Branch updated successfully!');
        }
    } else {
        // Add new branch
        const newbranch = {
            id: branches.value.length + 1,
            name: branchData.name,
            company: branchData.company,
            location: branchData.location,
        };
        branches.value.push(newbranch);
        console.log('Branch added successfully!');
    }
};

const handleRestorebranch = (branch) => {
    branches.value.push(branch);
    const index = trashedbranches.value.findIndex(d => d.id === branch.id);
    if (index > -1) {
        trashedbranches.value.splice(index, 1);
    }
    console.log("Branch restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>