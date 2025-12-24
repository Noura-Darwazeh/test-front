<template>
    <div class="user-page-container bg-light">
        <LinePriceHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('linePrice.searchPlaceholder')" 
            :data="linePrices"
            groupKey="company" 
            v-model:groupModelValue="selectedGroups" 
            :groupLabel="$t('linePrice.filterByCompany')"
            translationKey="companyNames" 
            :columns="linePriceColumns" 
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true" 
            :addButtonText="$t('linePrice.addNew')" 
            @add-click="openAddModal"
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedlinePrices"
                    :actionsLabel="$t('linePrice.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('linePrice.edit')"
                            :detailsLabel="$t('linePrice.details')" @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredlinePrices.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit linePrice -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('linePrice.edit') : $t('linePrice.addNew')"
            :fields="linePriceFields" :showImageUpload="false" @close="closeFormModal"
            @submit="handleSubmitlinePrice" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('linePrice.details')" :data="selectedlinePrice"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed linePrices Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('linePrice.trashed.title')"
            :emptyMessage="$t('linePrice.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedlinePrices"
            @close="closeTrashedModal" @restore="handleRestorelinePrice" />
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
import LinePriceHeader from "../components/linePriceHeader.vue";
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
const selectedlinePrice = ref({});

const linePrices = ref([
    {
        id: 1,
        name: "Line 1",
        price: 50,
        currency: 'ILS',
        company: 'company 1',
        type: 'delivery'
    },
    {
        id: 2,
        name: "Line 2",
        price: 75,
        currency: 'USD',
        company: 'company 2',
        type: 'return'
    },
    {
        id: 3,
        name: "Line 3",
        price: 100,
        currency: 'JOD',
        company: 'company 1',
        type: 'delivery'
    },
]);

const trashedlinePrices = ref([
    {
        id: 4,
        name: "Line 4",
        price: 90,
        currency: 'USD',
        company: 'company 2',
        type: 'delivery'
    },
]);

// linePrice Form Fields 
const linePriceFields = computed(() => [
    {
        name: 'name',
        label: t('linePrice.form.name'),
        type: 'text',
        required: true,
        placeholder: t('linePrice.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlinePrice.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('linePrice.validation.nameMax');
            return null;
        }
    },
    {
        name: 'price',
        label: t('linePrice.form.price'),
        type: 'number',
        required: true,
        placeholder: t('linePrice.form.pricePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlinePrice.value.price : '',
        validate: (value) => {
            if (!value || value <= 0) return t('linePrice.validation.priceRequired');
            return null;
        }
    },
    {
        name: 'currency',
        label: t('linePrice.form.currency'),
        type: 'select',
        required: true,
        options: [
            { value: 'ILS', label: t('linePrice.form.currencies.currency3') },
            { value: 'JOD', label: t('linePrice.form.currencies.currency2') },
            { value: 'USD', label: t('linePrice.form.currencies.currency1') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlinePrice.value.currency : ''
    },
    {
        name: 'company',
        label: t('linePrice.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: t('linePrice.form.companies.company1') },
            { value: 'company 2', label: t('linePrice.form.companies.company2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlinePrice.value.company : ''
    },
    {
        name: 'type',
        label: t('linePrice.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'delivery', label: t('linePrice.form.types.type1') },
            { value: 'return', label: t('linePrice.form.types.type2') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedlinePrice.value.type : ''
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('linePrice.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('linePrice.name'), colClass: 'col-md-6' },
    { key: 'price', label: t('linePrice.price'), colClass: 'col-md-6' },
    { key: 'currency', label: t('linePrice.currency'), colClass: 'col-md-6' },
    { key: 'company', label: t('linePrice.company'), translationKey: 'companyNames', colClass: 'col-md-6' },
    { key: 'type', label: t('linePrice.type'), translationKey: 'linePrice.form.types', colClass: 'col-md-6' },
]);

const linePriceColumns = ref([
    { key: "id", label: t("linePrice.id"), sortable: true },
    { key: "name", label: t("linePrice.name"), sortable: true },
    { key: "price", label: t("linePrice.price"), sortable: true },
    { key: "currency", label: t("linePrice.currency"), sortable: false },
    { key: "company", label: t("linePrice.company"), sortable: false },
    { key: "type", label: t("linePrice.type"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("linePrice.id") },
    { key: "name", label: t("linePrice.name") },
    { key: "price", label: t("linePrice.price") },
    { key: "company", label: t("linePrice.company") },
    { key: "type", label: t("linePrice.type") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return linePriceColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredlinePrices = computed(() => {
    let result = linePrices.value;
    result = filterByGroups(result, selectedGroups.value, "company");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedlinePrices = computed(() => {
    return paginateData(
        filteredlinePrices.value,
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
    selectedlinePrice.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (linePrice) => {
    isEditMode.value = true;
    selectedlinePrice.value = { ...linePrice };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (linePrice) => {
    selectedlinePrice.value = { ...linePrice };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedlinePrice.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedlinePrice.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitlinePrice = (linePriceData) => {
    if (isEditMode.value) {
        // Update existing line price
        const index = linePrices.value.findIndex(d => d.id === selectedlinePrice.value.id);
        if (index > -1) {
            linePrices.value[index] = {
                ...linePrices.value[index],
                name: linePriceData.name,
                price: linePriceData.price,
                currency: linePriceData.currency,
                company: linePriceData.company,
                type: linePriceData.type,
            };
            console.log('Line price updated successfully!');
        }
    } else {
        // Add new line price
        const newlinePrice = {
            id: linePrices.value.length + 1,
            name: linePriceData.name,
            price: linePriceData.price,
            currency: linePriceData.currency,
            company: linePriceData.company,
            type: linePriceData.type,
        };
        linePrices.value.push(newlinePrice);
        console.log('Line price added successfully!');
    }
};

const handleRestorelinePrice = (linePrice) => {
    linePrices.value.push(linePrice);
    const index = trashedlinePrices.value.findIndex(d => d.id === linePrice.id);
    if (index > -1) {
        trashedlinePrices.value.splice(index, 1);
    }
    console.log("Line price restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>