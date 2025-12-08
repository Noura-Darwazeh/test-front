<template>
    <div class="user-page-container bg-light">
        <usersHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('user.searchPlaceholder')" 
            :data="users"
            groupKey="role" 
            v-model:groupModelValue="selectedGroups" 
            :groupLabel="$t('user.filterByRole')"
            translationKey="roles" 
            :columns="userColumns" 
            v-model:visibleColumns="visibleColumns" 
            :showAddButton="true"
            :addButtonText="$t('user.addNew') || 'Add User'" 
            @add-click="openModal" 
        />
        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedUsers" />
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination 
                        :totalItems="filteredUsers.length" 
                        :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" 
                        @update:currentPage="(page) => currentPage = page" 
                    />
                </div>
            </div>
        </div>
        <!-- Dynamic Form Modal for User -->
        <DynamicFormModal 
            :isOpen="isModalOpen" 
            :title="$t('user.addNew') || 'Add New User'" 
            :fields="userFields"
            @close="closeModal"
            @submit="handleAddUser" 
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import usersHeader from "../components/usersHeader.vue";
import DynamicFormModal from "../../../components/shared/FormModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);

const users = ref([
    {
        id: 1,
        name: "Test name",
        email: "John@example.com",
        image: "path/test",
        phone_number: "0598549638",
        role: "Admin",
        land_page: "home",
        lang: "en",
        shared_line: 1,
    },
    {
        id: 2,
        name: "ahmad",
        email: "ahmad@example.com",
        image: "path/test",
        phone_number: "0598549638",
        role: "User",
        land_page: "home",
        lang: "en",
        shared_line: 1,
    },
    {
        id: 3,
        name: "sami",
        email: "sami@example.com",
        image: "path/test",
        phone_number: "0598549638",
        role: "Manager",
        land_page: "home",
        lang: "en",
        shared_line: 1,
    },
]);
// User Form Fields
const userFields = computed(() => [
    {
        name: 'name',
        label: t('user.name'),
        type: 'text',
        required: true,
        placeholder: t('user.name'),
        colClass: 'col-md-6'
    },
    {
        name: 'email',
        label: t('user.email'),
        type: 'email',
        required: true,
        placeholder: t('user.email'),
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
        label: t('user.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('user.phoneNumber'),
        colClass: 'col-md-6'
    },
    {
        name: 'role',
        label: t('user.role'),
        type: 'select',
        required: true,
        options: [
            { value: 'Admin', label: t('roles.Admin') },
            { value: 'User', label: t('roles.User') },
            { value: 'Manager', label: t('roles.Manager') }
        ],
        colClass: 'col-md-6'
    },
    {
        name: 'regionId',
        label: 'Region ID',
        type: 'text',
        required: true,
        placeholder: 'Region ID',
        colClass: 'col-md-6'
    },
    {
        name: 'companyId',
        label: 'Company ID',
        type: 'text',
        required: true,
        placeholder: 'Company ID',
        colClass: 'col-md-12'
    }
]);
const userColumns = computed(() => [
    { key: "id", label: t("user.id"), sortable: true },
    { key: "name", label: t("user.fullName"), sortable: true },
    { key: "email", label: t("user.email"), sortable: false },
    { key: "image", label: t("user.image"), sortable: false },
    { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
    { key: "role", label: t("user.userRole"), sortable: true },
    { key: "land_page", label: t("user.landingPage"), sortable: false },
    { key: "lang", label: t("user.language"), sortable: true },
    { key: "shared_line", label: t("user.sharedLine"), sortable: true },
]);
const visibleColumns = ref([]);
const filteredColumns = computed(() => {
    return userColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});
const filteredUsers = computed(() => {
    let result = users.value;
    result = filterByGroups(result, selectedGroups.value, "role");
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
watch([searchText, selectedGroups], () => {
    currentPage.value = 1;
});
const openModal = () => {
    console.log('Opening user modal...');
    isModalOpen.value = true;
};
const closeModal = () => {
    console.log('Closing user modal...');
    isModalOpen.value = false;
};
const handleAddUser = (userData) => {
    console.log("New user added successfully:", userData);
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>