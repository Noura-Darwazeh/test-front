<template>
    <div class="user-page-container bg-light">
        <CustomerHeader v-model="searchText" :searchPlaceholder="$t('customer.searchPlaceholder')" :data="customers"
            groupKey="company_name" v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('customer.filterByCompany')" translationKey="" :columns="customerColumns"
            v-model:visibleColumns="visibleColumns" :showAddButton="true" :addButtonText="$t('customer.addNew')"
            @add-click="openAddModal" @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedcustomers" :actionsLabel="$t('customer.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('customer.edit')"
                            :detailsLabel="$t('customer.details')" @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredCustomer.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit customer -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('customer.edit') : $t('customer.addNew')"
            :fields="customerFields" :showImageUpload="true" :imageRequired="false"
            :imageUploadLabel="$t('customer.form.uploadImage')" @close="closeFormModal"
            @submit="handleSubmitcustomer" />

        <!-- Details Modal -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('customer.details')" :data="selectedCustomer"
            :fields="detailsFields" @close="closeDetailsModal" />

        <!-- Trashed customers Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('customer.trashed.title')"
            :emptyMessage="$t('customer.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedcustomers"
            @close="closeTrashedModal" @restore="handleRestorecustomer" />
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
import CustomerHeader from "../components/customerHeader.vue";
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
const selectedCustomer = ref({});

const customers = ref([
    {
        id: 1,
        name: "Sami ",
        phone_number: "0598549638",
        company_name: "company 1",
        location: 'Nablus',
    },
    {
        id: 2,
        name: "Ali ",
        phone_number: "0598549638",
        company_name: "company 1",
        location: 'Nablus',
    },
    {
        id: 3,
        name: " Ahmed",
        phone_number: "0598549638",
        company_name: "company 2",
        location: 'Nablus',
    },
]);

const trashedcustomers = ref([
    {
        id: 3,
        name: "Mohammad",
        phone_number: "0598549638",
        company_name: "company 1",
        location: 'Nablus',
    },
]);

// customer Form Fields 
const customerFields = computed(() => [
    {
        name: 'name',
        label: t('customer.form.name'),
        type: 'text',
        required: true,
        placeholder: t('customer.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedCustomer.value.name : '',
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return t('customer.validation.nameRequired');
            }

            if (value.length < 3) {
                return t('customer.validation.nameMin');
            }

            if (value.length > 255) {
                return t('customer.validation.nameMax');
            }

            return null;
        }
    },
    {
        name: 'phone_number',
        label: t('customer.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('customer.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedCustomer.value.phone_number : '',
        validate: (value) => {
            if (value.length > 20) return t('customer.validation.phoneMax');
            return null;
        }
    },

    {
        name: 'company_name',
        label: t('customer.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: 'Company 1' },
            { value: 'company 2', label: 'Company 2' },
            { value: 'company 3', label: 'Company 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedCustomer.value.company_name : ''
    },

    {
        name: 'set_location',
        label: t('customer.form.location'),
        type: 'button',
        required: !isEditMode.value,
        text: t('customer.form.setLocation'),
        colClass: 'col-md-6',
        onClick: () => {
            console.log('Setting customer location on map...');
        }
    }
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('customer.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('customer.name'), colClass: 'col-md-6' },
    { key: 'phone_number', label: t('customer.phoneNumber'), colClass: 'col-md-6' },
    { key: 'company_name', label: t('customer.companyName'), colClass: 'col-md-6' },
]);

const customerColumns = ref([
    { key: "id", label: t("customer.id"), sortable: true },
    { key: "name", label: t("customer.name"), sortable: true },
    { key: "phone_number", label: t("customer.phoneNumber"), sortable: false },
    { key: 'company_name', label: t('customer.companyName'), colClass: 'col-md-6' },

]);

const trashedColumns = computed(() => [
    { key: "id", label: t("customer.id") },
    { key: "name", label: t("customer.name") },
    { key: "phone_number", label: t("customer.phoneNumber"), sortable: false },
    { key: 'company_name', label: t('customer.companyName'), colClass: 'col-md-6' },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return customerColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredCustomer = computed(() => {
    let result = customers.value;
    result = filterByGroups(result, selectedGroups.value, "company_name");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedcustomers = computed(() => {
    return paginateData(
        filteredCustomer.value,
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
    selectedCustomer.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (customer) => {
    isEditMode.value = true;
    selectedCustomer.value = { ...customer };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (customer) => {
    selectedCustomer.value = { ...customer };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedCustomer.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedCustomer.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitcustomer = (customerData) => {
    if (isEditMode.value) {
        // Update existing customer
        const index = customers.value.findIndex(d => d.id === selectedCustomer.value.id);
        if (index > -1) {
            customers.value[index] = {
                ...customers.value[index],
                name: customerData.name,
                phone_number: customerData.phone_number,
                company_name: customerData.company_name,
            };
            console.log('customer updated successfully!');
        }
    } else {
        // Add new customer
        const newcustomer = {
            id: customers.value.length + 1,
            name: customerData.name,
            phone_number: customerData.phone_number,
            company_name: customerData.company_name,
        };
        customers.value.push(newcustomer);
        console.log('customer added successfully!');
    }
};

const handleRestorecustomer = (customer) => {
    customers.value.push(customer);
    const index = trashedcustomers.value.findIndex(d => d.id === customer.id);
    if (index > -1) {
        trashedcustomers.value.splice(index, 1);
    }
    console.log("customer restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>