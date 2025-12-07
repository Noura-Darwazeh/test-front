<template>
    <div class="user-page-container bg-light">
        <DriversHeader v-model="searchText" :searchPlaceholder="$t('driver.searchPlaceholder')" :data="drivers"
            groupKey="status" v-model:groupModelValue="selectedGroups" :groupLabel="$t('driver.filterByStatus')"
            translationKey="statuses" :columns="driverColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('driver.addNew') || 'Add Driver'" @add-click="openModal"
            />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedDrivers" />
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredDrivers.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <AddUserModal :isOpen="isModalOpen" :title="$t('driver.addNew') || 'Add New Driver'" @close="closeModal"
            @submit="handleAddDriver" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import DriversHeader from "../components/driversHeader.vue"
import AddUserModal from "../../user/components/addUserModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
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

const driverColumns = ref([
    { key: "id", label: t("driver.id"), sortable: true },
    { key: "location", label: t("driver.location"), sortable: true },
    { key: "status", label: t("driver.status"), sortable: false },
    { key: "type", label: t("driver.type"), sortable: false },
    { key: "branch_id", label: t("driver.branchId"), sortable: false },
    { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
    { key: "created_by", label: t("driver.createdBy"), sortable: false },
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
    console.log('Opening modal...');
    isModalOpen.value = true;
};

const closeModal = () => {
    console.log('Closing modal...');
    isModalOpen.value = false;
};

const handleAddDriver = () => {
    console.log("New driver added successfully:");
    //API
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>