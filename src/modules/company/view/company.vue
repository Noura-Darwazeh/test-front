<template>
    <div class="user-page-container bg-light">
        <CompanyHeader v-model="searchText" :searchPlaceholder="$t('company.searchPlaceholder')" :data="companys"
            groupKey="type" v-model:groupModelValue="selectedGroups" :groupLabel="$t('company.filterByType')"
            translationKey="companyTypes" :columns="companyColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('company.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedcompanys" :actionsLabel="$t('company.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('company.edit')"
                            :detailsLabel="$t('company.details')" @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredcompanys.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit company -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('company.edit') : $t('company.addNew')"
            :fields="companyFields" :showImageUpload="true" :imageRequired="false"
            :imageUploadLabel="$t('company.form.uploadImage')" @close="closeFormModal" @submit="handleSubmitcompany" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('company.details')" :data="selectedcompany"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed companys Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('company.trashed.title')"
            :emptyMessage="$t('company.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedcompanys"
            @close="closeTrashedModal" @restore="handleRestorecompany" />
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
import CompanyHeader from "../components/companyHeader.vue";
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
const selectedcompany = ref({});

const companys = ref([
    {
        id: 1,
        name: "Ali Ahmed",
        type: 'delivery company',
    },
    {
        id: 2,
        name: "Sara Mohammad",
        type: 'admin company',
    },
    {
        id: 3,
        name: "Ahmed Hassan",
        type: 'delivery company',
    },
]);

const trashedcompanys = ref([
    {
        id: 4,
        name: "Trashed",
        type: 'delivery company',
    },
]);

// company Form Fields 
const companyFields = computed(() => [
    {
        name: 'name',
        label: t('company.form.name'),
        type: 'text',
        required: true,
        placeholder: t('company.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedcompany.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('company.validation.nameMax');
            return null;
        }
    },

    {
        name: 'type',
        label: t('company.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'admin company', label: t('company.form.types.delivery') },
            { value: 'delivery company', label: t('company.form.types.admin') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedcompany.value.type : ''
    },



]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('company.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('company.name'), colClass: 'col-md-6' },
    { key: 'type', label: t('company.type'), translationKey: 'companyTypes', colClass: 'col-md-6' },
]);

const companyColumns = ref([
    { key: "id", label: t("company.id"), sortable: true },
    { key: "name", label: t("company.name"), sortable: true },
    { key: "type", label: t("company.type"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("company.id") },
    { key: "name", label: t("company.name") },
    { key: "type", label: t("company.type") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return companyColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredcompanys = computed(() => {
    let result = companys.value;
    result = filterByGroups(result, selectedGroups.value, "type");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedcompanys = computed(() => {
    return paginateData(
        filteredcompanys.value,
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
    selectedcompany.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (company) => {
    isEditMode.value = true;
    selectedcompany.value = { ...company };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (company) => {
    selectedcompany.value = { ...company };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedcompany.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedcompany.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitcompany = (companyData) => {
    if (isEditMode.value) {
        // Update existing company
        const index = companys.value.findIndex(d => d.id === selectedcompany.value.id);
        if (index > -1) {
            companys.value[index] = {
                ...companys.value[index],
                name: companyData.name,
                username: companyData.username,
                email: companyData.email || '',
                phone_number: companyData.phone_number,
                status: companyData.status || 'available',
                type: companyData.type,
                branch_name: companyData.branch_name,
                vehicle_number: companyData.vehicle_number,
                image: companyData.imagePreview || companys.value[index].image
            };
            console.log('company updated successfully!');
        }
    } else {
        // Add new company
        const newcompany = {
            id: companys.value.length + 1,
            name: companyData.name,
            type: companyData.type,
            image: companyData.imagePreview || 'path/test'
        };
        companys.value.push(newcompany);
        console.log('company added successfully!');
    }
};

const handleRestorecompany = (company) => {
    companys.value.push(company);
    const index = trashedcompanys.value.findIndex(d => d.id === company.id);
    if (index > -1) {
        trashedcompanys.value.splice(index, 1);
    }
    console.log("company restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>