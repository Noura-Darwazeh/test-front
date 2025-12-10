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
            @add-click="openModal"
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedDrivers" />
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

        <!-- Dynamic Form Modal for Driver -->
        <FormModal 
            :isOpen="isModalOpen" 
            :title="$t('driver.addNew')" 
            :fields="driverFields"
            :showImageUpload="true" 
            :imageRequired="false"
            :imageUploadLabel="$t('driver.form.uploadImage')"
            @close="closeModal" 
            @submit="handleAddDriver" 
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
];

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
    {
        id: 202,
        name: "Deleted Driver 2",
        username: "deleteddriver2",
        email: "deleted2@example.com",
        phone_number: "0597654322",
        role: "Driver",
        status: 'available',
        type: 'delivery driver',
        branch_name: "branch 2",
        vehicle_number: '999888',
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
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.usernameMax');
            const exists = drivers.some(d => d.username === value);
            if (exists) return t('driver.validation.usernameExists');
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
        validate: (value) => {
            if (value && value.length > 255) return t('driver.validation.emailMax');
            return null;
        }
    },
    {
        name: 'password',
        label: t('driver.form.password'),
        type: 'password',
        required: true,
        minlength: 6,
        placeholder: t('driver.form.passwordPlaceholder'),
        colClass: 'col-md-6'
    },
    {
        name: 'phone_number',
        label: t('driver.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('driver.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
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
        colClass: 'col-md-6'
    },
    {
        name: 'vehicle_number',
        label: t('driver.form.vehicleNumber'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.vehicleNumberPlaceholder'),
        colClass: 'col-md-6'
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
        colClass: 'col-md-6'
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
        colClass: 'col-md-6'
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
        defaultValue: 'available',
        colClass: 'col-md-6'
    },
    {
        name: 'set_location',
        label: t('driver.form.location'),
        type: 'button',
        required: true,
        text: t('driver.form.setLocation'),
        colClass: 'col-md-6',
        onClick: () => {
            console.log('Setting driver location on map...');
        }
    }
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
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalModal.value = false;
};

const handleAddDriver = (driverData) => {
    console.log("New driver added successfully:", driverData);

    if (driverData.image && driverData.image.size > 200 * 1024) {
        console.log(t('driver.validation.imageSize'));
        return;
    }

    if (driverData.image) {
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validFormats.includes(driverData.image.type)) {
            console.log(t('driver.validation.imageFormat'));
            return;
        }
    }

    const newDriver = {
        id: drivers.length + 1,
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

    drivers.push(newDriver);
    console.log('Driver added successfully!');
};

const handleRestoreDriver = (driver) => {
    console.log("Restoring driver:", driver);
    drivers.push(driver);
    const index = trashedDrivers.value.findIndex(d => d.id === driver.id);
    if (index > -1) {
        trashedDrivers.value.splice(index, 1);
    }
    console.log("Driver has been restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>