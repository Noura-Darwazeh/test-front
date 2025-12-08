<template>
    <div class="user-page-container bg-light">
        <DriversHeader v-model="searchText" :searchPlaceholder="$t('driver.searchPlaceholder')" :data="drivers"
            groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('driver.filterByStatus')"
            translationKey="statuses" :columns="driverColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('driver.addNew') || 'Add Driver'" @add-click="openModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedDrivers" />
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredDrivers.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Driver -->
        <FormModal :isOpen="isModalOpen" :title="$t('driver.addNew') || 'Add New Driver'" :fields="driverFields"
            @close="closeModal" @submit="handleAddDriver" />

        <!-- Trashed Drivers Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" title="Trashed Drivers" emptyMessage="No trashed drivers"
            :columns="trashedColumns" :trashedItems="trashedDrivers" @close="closeTrashedModal"
            @restore="handleRestoreDriver" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import DriversHeader from "../components/driversHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);

const drivers = [
    {
        id: 1,
        location: "Nablus",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '125746',
        created_by: 'ali'
    },
    {
        id: 2,
        location: "Ramallah",
        status: 'busy',
        type: 'freelance',
        branch_id: '2',
        vehicle_number: '789012',
        created_by: 'sara'
    },
    {
        id: 3,
        location: "Hebron",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '345678',
        created_by: 'ahmed'
    },
    {
        id: 4,
        location: "Nablus",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '125746',
        created_by: 'ali'
    },
    {
        id: 5,
        location: "Ramallah",
        status: 'busy',
        type: 'freelance',
        branch_id: '2',
        vehicle_number: '789012',
        created_by: 'sara'
    },
    {
        id: 6,
        location: "Hebron",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '345678',
        created_by: 'ahmed'
    },
    {
        id: 7,
        location: "Nablus",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '125746',
        created_by: 'ali'
    },
    {
        id: 8,
        location: "Ramallah",
        status: 'busy',
        type: 'freelance',
        branch_id: '2',
        vehicle_number: '789012',
        created_by: 'sara'
    },
    {
        id: 9,
        location: "Hebron",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '345678',
        created_by: 'ahmed'
    },
    {
        id: 10,
        location: "Nablus",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '125746',
        created_by: 'ali'
    },
    {
        id: 11,
        location: "Ramallah",
        status: 'busy',
        type: 'freelance',
        branch_id: '2',
        vehicle_number: '789012',
        created_by: 'sara'
    },
    {
        id: 12,
        location: "Hebron",
        status: 'available',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '345678',
        created_by: 'ahmed'
    }
];

// السائقون المحذوفون
const trashedDrivers = ref([
    {
        id: 201,
        location: "Jerusalem",
        status: 'in holiday',
        type: 'freelance',
        branch_id: '3',
        vehicle_number: '555111',
        created_by: 'admin'
    },
    {
        id: 202,
        location: "Bethlehem",
        status: 'available',
        type: 'delivery company',
        branch_id: '2',
        vehicle_number: '999888',
        created_by: 'manager'
    },
]);

// Driver Form Fields Configuration
const driverFields = computed(() => [
    {
        name: 'name',
        label: 'Driver Name',
        type: 'text',
        required: true,
        placeholder: 'Enter driver name',
        colClass: 'col-md-6'
    },
    {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: false,
        placeholder: 'driver@example.com',
        colClass: 'col-md-6'
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        minlength: 6,
        placeholder: '••••••••',
        colClass: 'col-md-6'
    },
    {
        name: 'phone_number',
        label: 'Phone Number',
        type: 'tel',
        required: true,
        placeholder: '0599000000',
        colClass: 'col-md-6'
    },
    {
        name: 'type',
        label: 'Driver Type',
        type: 'select',
        required: true,
        options: [
            { value: 'custom driver', label: 'Custom Driver' },
            { value: 'delivery company', label: 'Delivery Driver' },
        ],
        colClass: 'col-md-6'
    },
    {
        name: 'vehicle_number',
        label: 'Vehicle Number',
        type: 'text',
        required: true,
        placeholder: '22-5566',
        colClass: 'col-md-6'
    },
    {
        name: 'branch_name',
        label: 'Branch Name',
        type: 'select',
        required: true,
        options: [
            { value: 'branch 1', label: t('statuses.available') },
            { value: 'branch 2', label: t('statuses.busy') },
        ],
        colClass: 'col-md-6'
    },
    {
        name: 'company_name',
        label: 'Company Name',
        type: 'select',
        required: true,
        options: [
            { value: 'company 1', label: t('statuses.available') },
            { value: 'company 1', label: t('statuses.busy') },
        ],
        colClass: 'col-md-6'
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'available', label: t('statuses.available') },
            { value: 'busy', label: t('statuses.busy') },
            { value: 'in holiday', label: t('statuses.offline') }
        ],
        defaultValue: 'available',
        colClass: 'col-md-6'
    },
    {
        name: 'set_location',
        label: 'Set Location',
        type: 'button',
        text: 'Set Location',
        colClass: 'col-md-6',
        onClick: () => {
            console.log('Setting driver location...');
        }
    }

]);

const driverColumns = ref([
    { key: "id", label: t("driver.id"), sortable: true },
    { key: "location", label: t("driver.location"), sortable: true },
    { key: "status", label: t("driver.status"), sortable: false },
    { key: "type", label: t("driver.type"), sortable: false },
    { key: "branch_id", label: t("driver.branchId"), sortable: false },
    { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
    { key: "created_by", label: t("driver.createdBy"), sortable: false },
]);

// columns for trashed drivers
const trashedColumns = computed(() => [
    { key: "id", label: t("driver.id") },
    { key: "location", label: t("driver.location") },
    { key: "status", label: t("driver.status") },
    { key: "type", label: t("driver.type") },
    { key: "vehicle_number", label: t("driver.vehicleNumber") },
    { key: "created_by", label: t("driver.createdBy") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return driverColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredDrivers = computed(() => {
    let result = drivers;
    result = filterByGroups(result, selectedGroups.value, "status");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedDrivers = computed(() => {
    return paginateData(
        filteredDrivers.value,
        currentPage.value,
        itemsPerPage.value
    );
});

watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});

const openModal = () => {
    console.log('Opening driver modal...');
    isModalOpen.value = true;
};

const closeModal = () => {
    console.log('Closing driver modal...');
    isModalOpen.value = false;
};

const openTrashedModal = () => {
    console.log('Opening trashed drivers modal...');
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    console.log('Closing trashed drivers modal...');
    isTrashedModalOpen.value = false;
};

const handleAddDriver = (driverData) => {
    console.log("New driver added successfully:", driverData);
};

const handleRestoreDriver = (driver) => {
    console.log("Restoring driver:", driver);
    // restore
    drivers.push(driver);
    // delete
    const index = trashedDrivers.value.findIndex(d => d.id === driver.id);
    if (index > -1) {
        trashedDrivers.value.splice(index, 1);
    }
    //success
    alert(`Driver from "${driver.location}" has been restored successfully!`);
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>