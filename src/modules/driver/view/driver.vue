<template>
    <div class="user-page-container bg-light">
        <DriversHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('driver.searchPlaceholder')" 
            :data="drivers"
            groupKey="status" 
            v-model:groupModelValue="selectedGroups" 
            :groupLabel="$t('driver.filterByStatus')"
            translationKey="statuses" 
            :columns="driverColumns" 
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true" 
            :addButtonText="$t('driver.addNew')" 
            @add-click="openAddModal"
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedDrivers" :actionsLabel="$t('driver.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown 
                            :row="row" 
                            :editLabel="$t('driver.edit')"
                            :detailsLabel="$t('driver.details')" 
                            @edit="openEditModal" 
                            @details="openDetailsModal" 
                        />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination 
                        :totalItems="filteredDrivers.length" 
                        :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" 
                        @update:currentPage="(page) => currentPage = page" 
                    />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit Driver -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('driver.edit') : $t('driver.addNew')" 
            :fields="driverFields"
            :showImageUpload="true" 
            :imageRequired="false"
            :imageUploadLabel="$t('driver.form.uploadImage')"
            @close="closeFormModal" 
            @submit="handleSubmitDriver" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('driver.details')" 
            :data="selectedDriver"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        />

        <!-- Trashed Drivers Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('driver.trashed.title')" 
            :emptyMessage="$t('driver.trashed.empty')"
            :columns="trashedColumns" 
            :trashedItems="trashedDrivers" 
            @close="closeTrashedModal"
            @restore="handleRestoreDriver" 
        />
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
import DriversHeader from "../components/driversHeader.vue";
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
const selectedDriver = ref({});

const drivers = ref([
    {
        id: 1,
        name: "Ali Ahmed",
        username: "alidriver",
        email: "ali@example.com",
        phone_number: "0598549638",
        role: "Driver",
        region_id: 1,
        status: 'available',
        type: 'delivery driver',
        branch_name: "branch 1",
        vehicle_number: '125746',
    },
    {
        id: 2,
        name: "Sara Mohammad",
        username: "saradriver",
        email: "sara@example.com",
        phone_number: "0598549639",
        role: "Driver",
        region_id: 2,
        status: 'busy',
        type: 'custom driver',
        branch_name: "branch 1",
        vehicle_number: '789012',
    },
    {
        id: 3,
        name: "Ahmed Hassan",
        username: "ahmeddriver",
        email: "ahmed@example.com",
        phone_number: "0598549640",
        role: "Driver",
        region_id: 1,
        status: 'available',
        type: 'delivery driver',
        branch_name: "branch 1",
        vehicle_number: '345678',
    },
]);

const trashedDrivers = ref([
    {
        id: 201,
        name: "Deleted Driver 1",
        username: "deleteddriver1",
        email: "deleted1@example.com",
        phone_number: "0591234567",
        role: "Driver",
        status: 'offline',
        type: 'custom driver',
        branch_name: "branch 1",
        vehicle_number: '555111',
    },
]);

// Driver Form Fields 
const driverFields = computed(() => [
    {
        name: 'name',
        label: t('driver.form.name'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.nameMax');
            return null;
        }
    },
    {
        name: 'username',
        label: t('driver.form.username'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.usernamePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.username : '',
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.usernameMax');
            if (!isEditMode.value) {
                const exists = drivers.value.some(d => d.username === value);
                if (exists) return t('driver.validation.usernameExists');
            }
            return null;
        }
    },
    {
        name: 'email',
        label: t('driver.form.email'),
        type: 'email',
        required: false,
        placeholder: t('driver.form.emailPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.email : '',
        validate: (value) => {
            if (value && value.length > 255) return t('driver.validation.emailMax');
            return null;
        }
    },
    {
        name: 'password',
        label: t('driver.form.password'),
        type: 'password',
        required: !isEditMode.value,
        minlength: 6,
        placeholder: isEditMode.value ? 'Leave empty to keep current password' : t('driver.form.passwordPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: ''
    },
    {
        name: 'phone_number',
        label: t('driver.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('driver.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.phone_number : '',
        validate: (value) => {
            if (value.length > 20) return t('driver.validation.phoneMax');
            return null;
        }
    },
    {
        name: 'type',
        label: t('driver.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'custom driver', label: t('driverTypes.customDriver') },
            { value: 'delivery driver', label: t('driverTypes.deliveryDriver') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.type : ''
    },
    {
        name: 'vehicle_number',
        label: t('driver.form.vehicleNumber'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.vehicleNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.vehicle_number : ''
    },
    {
        name: 'branch_name',
        label: t('driver.form.branch'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'Branch 1' },
            { value: '2', label: 'Branch 2' },
            { value: '3', label: 'Branch 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.branch_name : ''
    },
    {
        name: 'company_name',
        label: t('driver.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'Company 1' },
            { value: '2', label: 'Company 2' },
            { value: '3', label: 'Company 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.company_name : ''
    },
    {
        name: 'status',
        label: t('driver.form.status'),
        type: 'select',
        required: false,
        options: [
            { value: 'available', label: t('statuses.available') },
            { value: 'busy', label: t('statuses.busy') },
            { value: 'offline', label: t('statuses.offline') }
        ],
        defaultValue: isEditMode.value ? selectedDriver.value.status : 'available',
        colClass: 'col-md-6'
    },
    {
        name: 'set_location',
        label: t('driver.form.location'),
        type: 'button',
        required: !isEditMode.value,
        text: t('driver.form.setLocation'),
        colClass: 'col-md-6',
        onClick: () => {
            console.log('Setting driver location on map...');
        }
    }
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('driver.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('driver.name'), colClass: 'col-md-6' },
    { key: 'username', label: t('driver.username'), colClass: 'col-md-6' },
    { key: 'email', label: t('driver.email'), colClass: 'col-md-6' },
    { key: 'phone_number', label: t('driver.phoneNumber'), colClass: 'col-md-6' },
    { key: 'status', label: t('driver.status'), translationKey: 'statuses', colClass: 'col-md-6' },
    { key: 'type', label: t('driver.type'), translationKey: 'driverTypes', colClass: 'col-md-6' },
    { key: 'branch_name', label: t('driver.branchName'), colClass: 'col-md-6' },
    { key: 'vehicle_number', label: t('driver.vehicleNumber'), colClass: 'col-md-12' },
]);

const driverColumns = ref([
    { key: "id", label: t("driver.id"), sortable: true },
    { key: "name", label: t("driver.name"), sortable: true },
    { key: "username", label: t("driver.username"), sortable: true },
    { key: "status", label: t("driver.status"), sortable: false },
    { key: "type", label: t("driver.type"), sortable: false },
    { key: "branch_name", label: t("driver.branchName"), sortable: false },
    { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
    { key: "phone_number", label: t("driver.phoneNumber"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("driver.id") },
    { key: "name", label: t("driver.name") },
    { key: "username", label: t("driver.username") },
    { key: "status", label: t("driver.status") },
    { key: "type", label: t("driver.type") },
    { key: "vehicle_number", label: t("driver.vehicleNumber") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return driverColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredDrivers = computed(() => {
    let result = drivers.value;
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

// Add Modal
const openAddModal = () => {
    isEditMode.value = false;
    selectedDriver.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (driver) => {
    isEditMode.value = true;
    selectedDriver.value = { ...driver };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (driver) => {
    selectedDriver.value = { ...driver };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedDriver.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedDriver.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitDriver = (driverData) => {
    if (isEditMode.value) {
        // Update existing driver
        const index = drivers.value.findIndex(d => d.id === selectedDriver.value.id);
        if (index > -1) {
            drivers.value[index] = {
                ...drivers.value[index],
                name: driverData.name,
                username: driverData.username,
                email: driverData.email || '',
                phone_number: driverData.phone_number,
                status: driverData.status || 'available',
                type: driverData.type,
                branch_name: driverData.branch_name,
                vehicle_number: driverData.vehicle_number,
                image: driverData.imagePreview || drivers.value[index].image
            };
            console.log('Driver updated successfully!');
        }
    } else {
        // Add new driver
        const newDriver = {
            id: drivers.value.length + 1,
            name: driverData.name,
            username: driverData.username,
            email: driverData.email || '',
            phone_number: driverData.phone_number,
            role: 'Driver',
            status: driverData.status || 'available',
            type: driverData.type,
            branch_name: driverData.branch_name,
            vehicle_number: driverData.vehicle_number,
            image: driverData.imagePreview || 'path/test'
        };
        drivers.value.push(newDriver);
        console.log('Driver added successfully!');
    }
};

const handleRestoreDriver = (driver) => {
    drivers.value.push(driver);
    const index = trashedDrivers.value.findIndex(d => d.id === driver.id);
    if (index > -1) {
        trashedDrivers.value.splice(index, 1);
    }
    console.log("Driver restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>