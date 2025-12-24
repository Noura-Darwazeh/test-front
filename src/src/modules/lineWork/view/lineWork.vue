<template>
    <div class="user-page-container bg-light">
        <lineWorkHeader v-model="searchText" :searchPlaceholder="$t('lineWork.searchPlaceholder')" :data="lineWork"
            groupKey="company" v-model:groupModelValue="selectedGroups" :groupLabel="$t('lineWork.filterByCompany')"
            translationKey="companyNames" :columns="lineWorkColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('lineWork.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedlineWork" :actionsLabel="$t('lineWork.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('lineWork.edit')"
                            :detailsLabel="$t('lineWork.details')" @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredlineWork.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit lineWork -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('lineWork.edit') : $t('lineWork.addNew')"
            :fields="lineWorkFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitlineWork" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('lineWork.details')" :data="selectedlineWork"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed lineWork Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('lineWork.trashed.title')"
            :emptyMessage="$t('lineWork.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedlineWork"
            @close="closeTrashedModal" @restore="handleRestorelineWork" />
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
import lineWorkHeader from "../components/lineWorkHeader.vue";
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
const selectedlineWork = ref({});

const lineWork = ref([
    {
        id: 1,
        name: "Nablus - Ramallah",
        company: 'company 1'
    },
    {
        id: 2,
        name: "Tulkarm - Nablus",
        company: 'company 2'
    },
    {
        id: 3,
        name: "Tulkarm - Jenin ",
        company: 'company 1'
    },
]);

const trashedlineWork = ref([
    {
        id: 6,
        name: "Trashed Line Work",
        company: 'company 1'
    },
]);

// lineWork Form Fields 
const lineWorkFields = computed(() => [
    {
        name: 'name',
        label: t('lineWork.form.name'),
        type: 'text',
        required: true,
        placeholder: t('lineWork.form.namePlaceholder'),
        colClass: 'col-md-6',
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
            { value: 'company 1', label: t('lineWork.form.companies.company1') },
            { value: 'company 2', label: t('lineWork.form.companies.company2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlineWork.value.company : ''
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('lineWork.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('lineWork.name'), colClass: 'col-md-6' },
    { key: 'company', label: t('lineWork.company'), translationKey: 'companyNames', colClass: 'col-md-6' },
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

const filteredlineWork = computed(() => {
    let result = lineWork.value;
    // تم تغيير الفلتر من "location" إلى "company"
    result = filterByGroups(result, selectedGroups.value, "company");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedlineWork = computed(() => {
    return paginateData(
        filteredlineWork.value,
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

const handleSubmitlineWork = (lineWorkData) => {
    if (isEditMode.value) {
        // Update existing lineWork
        const index = lineWork.value.findIndex(d => d.id === selectedlineWork.value.id);
        if (index > -1) {
            lineWork.value[index] = {
                ...lineWork.value[index],
                name: lineWorkData.name,
                company: lineWorkData.company || 'company 1',
            };
            console.log('LineWork updated successfully!');
        }
    } else {
        // Add new lineWork
        const newlineWork = {
            id: lineWork.value.length + 1,
            name: lineWorkData.name,
            company: lineWorkData.company,
        };
        lineWork.value.push(newlineWork);
        console.log('LineWork added successfully!');
    }
};

const handleRestorelineWork = (item) => {
    lineWork.value.push(item);
    const index = trashedlineWork.value.findIndex(d => d.id === item.id);
    if (index > -1) {
        trashedlineWork.value.splice(index, 1);
    }
    console.log("LineWork restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>