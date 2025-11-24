<template>
    <div class="user-page-container">
        <!-- Page Header -->
        <div class="page-header mb-4">
            <h2 class="page-title mb-1">Users Management</h2>
            <p class="text-muted mb-0">Manage system users and their permissions</p>
        </div>

        <!-- Table Card -->
        <div class="card shadow-sm">
            <!-- Filters Bar -->
            <div class="card-header bg-white border-bottom">
                <div class="d-flex align-items-center justify-content-between gap-3">
                    <div class="d-flex align-items-center gap-3 flex-grow-1">
                        <MainFilters v-model="searchText" placeholder="Search users..." :data="users" groupKey="role"
                            v-model:groupModelValue="selectedGroups" />
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <ColumnSelector :columns="userColumns" v-model="visibleColumns" />
                    </div>
                </div>
            </div>

            <!-- Table Body -->
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedUsers" />
                <Pagination :totalItems="filteredUsers.length" :itemsPerPage="itemsPerPage" :currentPage="currentPage"
                    @update:currentPage="currentPage = $event" />
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "@/components/shared/DataTable.vue";
import ColumnSelector from "@/components/shared/ColumnSelector.vue";
import MainFilters from "@/components/filters/composed/MainFilters.vue";
import Pagination from "@/components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";

// --------------- Variables and Data ---------------
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const users = [
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
        location: "ramallah",
        status: 'active',
        type: 'delivery company',
        branch_id: '1',
        vehicle_number: '125776',
        created_by: 'ali'
    },

];
const userColumns = [
    { key: "id", label: "ID", sortable: true },
    { key: "location", label: "LOCATION", sortable: true },
    { key: "status", label: "STATUS", sortable: false },
    { key: "type", label: "TYPE", sortable: false },
    { key: "branch_id", label: "BRANCH", sortable: false },
    { key: "vehicle_number", label: "VEHICLE NUMBER", sortable: true },
    { key: "created_by", label: "CREATE BY", sortable: false },

];

const visibleColumns = ref([]);

// ----------- Computed values -------------
const filteredColumns = computed(() => {
    return userColumns.filter((col) => visibleColumns.value.includes(col.key));
});

const filteredUsers = computed(() => {
    let result = users;

    // Apply group filtering first
    result = filterByGroups(result, selectedGroups.value, "role");

    // Then apply search filtering
    result = filterData(result, searchText.value);

    return result;
});

const paginatedUsers = computed(() => {
    return paginateData(
        filteredUsers.value,
        currentPage.value,
        itemsPerPage.value
    );
});

// ------------ Watchers ------------
watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});
</script>
