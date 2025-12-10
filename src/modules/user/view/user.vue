<template>
    <div class="user-page-container bg-light">
        <usersHeader v-model="searchText" :searchPlaceholder="$t('user.searchPlaceholder')" :data="users"
            groupKey="role" v-model:groupModelValue="selectedGroups" :groupLabel="$t('user.filterByRole')"
            translationKey="roles" :columns="userColumns" v-model:visibleColumns="visibleColumns" :showAddButton="true"
            :addButtonText="$t('user.addNew')" @add-click="openModal" @trashed-click="openTrashedModal" />
        
        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedUsers" />
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredUsers.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Form Modal for User -->
        <FormModal 
            :isOpen="isModalOpen" 
            :title="$t('user.addNew')" 
            :fields="userFields"
            :showImageUpload="true" 
            :imageRequired="false" 
            :imageUploadLabel="$t('user.form.uploadImage')"
            @close="closeModal" 
            @submit="handleAddUser" 
        />

        <!-- Trashed Users Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('user.trashed.title')" 
            :emptyMessage="$t('user.trashed.empty')"
            :columns="trashedColumns" 
            :trashedItems="trashedUsers" 
            :showDeleteButton="false" 
            @close="closeTrashedModal"
            @restore="handleRestoreUser" 
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
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);

const users = ref([
    {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        image: "path/test",
        phone_number: "0598549638",
        role: "Admin",
        company_name: "company 1",
    },
    {
        id: 2,
        name: "Ahmad Ali",
        username: "ahmadali",
        email: "ahmad@example.com",
        image: "path/test",
        phone_number: "0598549639",
        role: "Supervisor",
        company_name: "company 2",
    },
    {
        id: 3,
        name: "Sami Hassan",
        username: "samihassan",
        email: "sami@example.com",
        image: "path/test",
        phone_number: "0598549640",
        role: "Employee",
        company_name: "company 3",
    },
]);

const trashedUsers = ref([
    {
        id: 101,
        name: "Deleted User 1",
        username: "deleteduser1",
        email: "deleted1@example.com",
        phone_number: "0591234567",
        role: "User",
        company_name: "company 1",
    },
    {
        id: 102,
        name: "Deleted User 2",
        username: "deleteduser2",
        email: "deleted2@example.com",
        phone_number: "0597654321",
        role: "Admin",
        company_name: "company 2",
    },
]);

// User Form Fields 
const userFields = computed(() => [
    {
        name: 'name',
        label: t('user.form.name'),
        type: 'text',
        required: true,
        placeholder: t('user.form.namePlaceholder'),
        colClass: 'col-md-6',
        validate: (value) => {
            if (value.length > 255) return t('user.validation.nameMax');
            return null;
        }
    },
    {
        name: 'username',
        label: t('user.form.username'),
        type: 'text',
        required: true,
        placeholder: t('user.form.usernamePlaceholder'),
        colClass: 'col-md-6',
        validate: (value) => {
            if (value.length > 255) return t('user.validation.usernameMax');
            const exists = users.value.some(u => u.username === value);
            if (exists) return t('user.validation.usernameExists');
            return null;
        }
    },
    {
        name: 'email',
        label: t('user.form.email'),
        type: 'email',
        required: false,
        placeholder: t('user.form.emailPlaceholder'),
        colClass: 'col-md-6',
        validate: (value) => {
            if (value && value.length > 255) return t('user.validation.emailMax');
            return null;
        }
    },
    {
        name: 'password',
        label: t('user.form.password'),
        type: 'password',
        required: true,
        minlength: 6,
        placeholder: t('user.form.passwordPlaceholder'),
        colClass: 'col-md-6'
    },
    {
        name: 'phone_number',
        label: t('user.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('user.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
        validate: (value) => {
            if (value.length > 20) return t('user.validation.phoneMax');
            return null;
        }
    },
    {
        name: 'role',
        label: t('user.form.role'),
        type: 'select',
        required: true,
        options: [
            { value: 'Admin', label: t('roles.Admin') },
            { value: 'Supervisor', label: t('roles.Supervisor') },
            { value: 'Employee', label: t('roles.Employee') },
        ],
        colClass: 'col-md-6'
    },
    {
        name: 'company_name',
        label: t('user.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'Company 1' },
            { value: '2', label: 'Company 2' },
            { value: '3', label: 'Company 3' },
        ],
        colClass: 'col-md-6'
    },
]);

const userColumns = computed(() => [
    { key: "id", label: t("user.id"), sortable: true },
    { key: "name", label: t("user.fullName"), sortable: true },
    { key: "username", label: t("user.username"), sortable: true },
    { key: "email", label: t("user.email"), sortable: false },
    { key: "phone_number", label: t("user.phoneNumber"), sortable: false },
    { key: "role", label: t("user.userRole"), sortable: true },
    { key: "company_name", label: t("user.company"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("user.id") },
    { key: "name", label: t("user.fullName") },
    { key: "username", label: t("user.username") },
    { key: "email", label: t("user.email") },
    { key: "phone_number", label: t("user.phoneNumber") },
    { key: "role", label: t("user.userRole") },
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
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleAddUser = (userData) => {
    console.log("New user added successfully:", userData);
    
    if (userData.image && userData.image.size > 200 * 1024) {
        console.log(t('user.validation.imageSize'));
        return;
    }
    
    const newUser = {
        id: users.value.length + 1,
        name: userData.name,
        username: userData.username,
        email: userData.email || '',
        phone_number: userData.phone_number,
        role: userData.role,
        company_name: userData.company_name || null,
        image: userData.imagePreview || 'path/test'
    };
    
    users.value.push(newUser);
    console.log('User added successfully!');
};

const handleRestoreUser = (user) => {
    console.log("Restoring user:", user);
    users.value.push(user);
    const index = trashedUsers.value.findIndex(u => u.id === user.id);
    if (index > -1) {
        trashedUsers.value.splice(index, 1);
    }
    console.log("User has been restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>