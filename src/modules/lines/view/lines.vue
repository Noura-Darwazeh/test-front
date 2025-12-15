<template>
    <div class="user-page-container bg-light">
        <LinesHeader v-model="searchText" :searchPlaceholder="$t('lines.searchPlaceholder')" :data="liness"
            groupKey="type" v-model:groupModelValue="selectedGroups" :groupLabel="$t('lines.filterByType')"
            translationKey="linesTypes" :columns="linesColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('lines.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedliness" :actionsLabel="$t('lines.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('lines.edit')" :detailsLabel="$t('lines.details')"
                            @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredliness.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit lines -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('lines.edit') : $t('lines.addNew')"
            :fields="linesFields" :showImageUpload="false" @close="closeFormModal" @submit="handleSubmitlines" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('lines.details')" :data="selectedlines"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed liness Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('lines.trashed.title')"
            :emptyMessage="$t('lines.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedliness"
            @close="closeTrashedModal" @restore="handleRestorelines" />
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
import LinesHeader from "../components/linesHeader.vue";
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
const selectedlines = ref({});

const liness = ref([
    {
        id: 1,
        name: "Ali Ahmed",
        region: 'palestine',
        company: 'delivery lines',
    },
    {
        id: 2,
        name: "Sara Mohammad",
        region: 'palestine',
        company: 'admin lines',
    },
    {
        id: 3,
        name: "Ahmed Hassan",
        region: 'palestine',
        company: 'delivery lines',
    },
]);

const trashedliness = ref([
    {
        id: 4,
        name: "Trashed",
        region: 'jordan',
        company: 'delivery lines',
    },
]);

// lines Form Fields 
const linesFields = computed(() => [
    {
        name: 'name',
        label: t('lines.form.name'),
        type: 'text',
        required: true,
        placeholder: t('lines.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlines.value.name : '',
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
            { value: 'palestine', label: t('lines.form.regions.region1') },
            { value: 'jordan', label: t('lines.form.regions.region2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlines.value.type : ''
    },

    {
        name: 'company',
        label: t('lines.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: t('lines.form.companies.company1') },
            { value: 'company 2', label: t('lines.form.companies.company2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlines.value.type : ''
    },

]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('lines.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('lines.name'), colClass: 'col-md-6' },
    { key: 'region', label: t('lines.region'), translationKey: 'linesTypes', colClass: 'col-md-6' },
    { key: 'company', label: t('lines.company'), translationKey: 'linesTypes', colClass: 'col-md-6' },

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

const filteredliness = computed(() => {
    let result = liness.value;
    result = filterByGroups(result, selectedGroups.value, "type");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedliness = computed(() => {
    return paginateData(
        filteredliness.value,
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
    selectedlines.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (lines) => {
    isEditMode.value = true;
    selectedlines.value = { ...lines };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (lines) => {
    selectedlines.value = { ...lines };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedlines.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedlines.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitlines = (linesData) => {
    if (isEditMode.value) {
        // Update existing lines
        const index = liness.value.findIndex(d => d.id === selectedlines.value.id);
        if (index > -1) {
            liness.value[index] = {
                ...liness.value[index],
                name: linesData.name,
                region: linesData.region,
                company: linesData.company,
            };
            console.log('lines updated successfully!');
        }
    } else {
        // Add new lines
        const newlines = {
            id: liness.value.length + 1,
            name: linesData.name,
            region: linesData.region,
            company: linesData.company,

        };
        liness.value.push(newlines);
        console.log('lines added successfully!');
    }
};

const handleRestorelines = (lines) => {
    liness.value.push(lines);
    const index = trashedliness.value.findIndex(d => d.id === lines.id);
    if (index > -1) {
        trashedliness.value.splice(index, 1);
    }
    console.log("lines restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>