<template>
  <div v-if="authStore.userRole === 'SuperAdmin'" class="permission-page-container bg-light">
    <!-- Header with Search and Add Button -->
    <TableHeader 
      v-model="searchText" 
      :searchPlaceholder="$t('common.search') || 'Search permissions...'" 
      :showAddButton="true" 
      :addButtonText="$t('common.add') + ' Permission'" 
      :columns="permissionColumns" 
      v-model:visibleColumns="visibleColumns"
      @add-click="openAddModal"
      @refresh-click="handleRefresh" 
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="permissionStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t("common.loading") }}</span>
          </div>
          <p class="mt-2">{{ $t("common.loading") }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="permissionStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ permissionStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable 
            :columns="filteredColumns" 
            :data="filteredPermissions" 
            :actionsLabel="$t('common.actions') || 'Actions'"
            v-model="selectedRows"
          >
            <template #actions="{ row }">
              <ActionsDropdown 
                :row="row" 
                :editLabel="$t('common.edit')"
                :deleteLabel="$t('common.delete')" 
                :showEdit="true"
                :showDelete="true" 
                :showDetails="false"
                :confirmDelete="true"
                @edit="openEditModal" 
                @delete="openDeleteModal" 
              />
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination 
              :totalItems="permissionStore.pagination.total" 
              :itemsPerPage="itemsPerPage" 
              :currentPage="currentPage"
              :totalPages="permissionStore.pagination.lastPage" 
              @update:currentPage="(page) => (currentPage = page)" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for Add/Edit Permission -->
    <FormModal 
      :isOpen="isModalOpen" 
      :title="isEditMode ? `${$t('common.edit')} Permission` : `${$t('common.add')} Permission`" 
      :fields="permissionFields"
      :showImageUpload="false" 
      @close="closeModal" 
      @submit="handleSubmit" 
    />
    
    <!-- Delete Confirmation Modal -->
    <!-- (Handled natively inside ActionsDropdown if we emit delete, but we just show confirmation via the ActionsDropdown event which already prompts, wait... ActionsDropdown handles delete emission when confirmed?) 
         In user.vue, ActionsDropdown emits "delete" then user.vue opens its own ConfirmationModal. Let's do that. -->
    <ConfirmationModal 
      :isOpen="isDeleteModalOpen" 
      :title="`${$t('common.delete')} Permission`"
      :message="`Are you sure you want to delete the permission '${selectedPermission?.name}'?`" 
      :confirmText="$t('common.delete')" 
      :cancelText="$t('common.cancel')"
      @close="closeDeleteModal" 
      @confirm="confirmDelete" 
    />

  </div>
  
  <div v-else class="alert alert-danger m-4">
    You are not authorized to view this page.
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.js";
import { usePermissionModuleStore } from "../store/permission.js";

import TableHeader from "../../../components/shared/TableHeader.vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";

const { t } = useI18n();
const authStore = useAuthStore();
const permissionStore = usePermissionModuleStore();

const searchText = ref("");
const currentPage = ref(1);
const itemsPerPage = computed(() => permissionStore.pagination.perPage || 10);

const selectedRows = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const isDeleteModalOpen = ref(false);
const selectedPermission = ref(null);

const permissionColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: t("permissions.name") || "Permission Name", sortable: true },
]);

// Set default visible columns
const visibleColumns = ref(permissionColumns.value.map(c => c.key));

const filteredColumns = computed(() => {
  return permissionColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

// Front-end search filtering if API is not handling it search-wise
const filteredPermissions = computed(() => {
  let data = permissionStore.permissions;
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    data = data.filter(p => p.name?.toLowerCase().includes(search));
  }
  return data;
});

const permissionFields = computed(() => [
  {
    name: "name",
    label: t("permissions.name") || "Permission Name",
    type: "text",
    required: true,
    placeholder: "e.g. manage_users",
    colClass: "col-md-12",
    defaultValue: isEditMode.value && selectedPermission.value ? selectedPermission.value.name : "",
  }
]);

const fetchPage = async (page = 1) => {
  try {
    await permissionStore.fetchPermissions({ page, perPage: itemsPerPage.value });
  } catch (err) {
    console.error(err);
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  await fetchPage(currentPage.value);
};

const openAddModal = () => {
  isEditMode.value = false;
  selectedPermission.value = null;
  isModalOpen.value = true;
};

const openEditModal = (permission) => {
  isEditMode.value = true;
  selectedPermission.value = { ...permission };
  isModalOpen.value = true;
};

const openDeleteModal = (permission) => {
  selectedPermission.value = permission;
  isDeleteModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPermission.value = null;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  selectedPermission.value = null;
};

const handleSubmit = async (formData) => {
  try {
    const payload = { name: formData.name };
    if (isEditMode.value) {
      await permissionStore.editPermission(selectedPermission.value.id, payload);
    } else {
      await permissionStore.addPermission(payload);
    }
    closeModal();
  } catch (err) {
    console.error("Failed to save permission:", err);
  }
};

const confirmDelete = async () => {
  if (!selectedPermission.value) return;
  try {
    await permissionStore.deletePermission(selectedPermission.value.id);
    closeDeleteModal();
  } catch (err) {
    console.error("Failed to delete permission:", err);
  }
};

watch(currentPage, (newPage) => {
  fetchPage(newPage);
});

onMounted(() => {
  if (authStore.userRole === 'SuperAdmin') {
    fetchPage(1);
  }
});
</script>

<style scoped>
.permission-page-container {
  padding: 1rem;
}
</style>
