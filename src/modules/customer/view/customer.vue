<template>
    <div class="user-page-container bg-light">
        <!-- Floating Validation Error Alert -->
        <div v-if="validationError" class="position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
            <div class="alert alert-danger alert-dismissible fade show shadow-lg" role="alert" style="min-width: 400px;">
                <i class="fas fa-exclamation-circle me-2"></i>
                <strong>{{ $t('common.validationError') }}</strong>
                <p class="mb-0 mt-1">{{ validationError }}</p>
                <button type="button" class="btn-close" @click="clearValidationError"></button>
            </div>
        </div>

        <CustomerHeader
            v-model="searchText"
            :searchPlaceholder="$t('customer.searchPlaceholder')"
            :data="customers"
            :groupKey="isSuperAdmin ? 'company_name' : null"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('customer.filterByCompany')"
            translationKey=""
            :columns="displayColumns"
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('customer.addNew')"
            @add-click="openAddModal"
            @refresh-click="handleRefresh"
        />

        <div class="card border-0">
            <!-- Tabs -->
            <div class="card-header bg-white border-bottom">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'active' }"
                            @click="switchTab('active')"
                        >
                            {{ $t('customer.activeCustomers') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('customer.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="customer"
                    :actions="bulkActions"
                    :loading="bulkActionLoading"
                    @action="handleBulkAction"
                />

                <!-- Loading State -->
                <div v-if="currentLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">{{ $t('common.loading') }}</span>
                    </div>
                    <p class="mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="customerStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ customerStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('customer.actions')"
                        v-model="selectedRows"
                    >
                        <template #actions="{ row }">
                            <!-- Active Customers Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('customer.edit')"
                                :detailsLabel="$t('customer.details')"
                                :deleteLabel="$t('customer.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteCustomer"
                            />
                            <!-- Trashed Customers Actions -->
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('customer.trashed.restore')"
                                :deleteLabel="$t('customer.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestoreCustomer"
                                @delete="handlePermanentDeleteCustomer"
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination
                            :totalItems="currentPagination.total"
                            :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage"
                            :totalPages="currentPagination.lastPage"
                            @update:currentPage="(page) => currentPage = page"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit customer -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('customer.edit') : $t('customer.addNew')" 
            :fields="customerFields"
            :showImageUpload="false"
            :serverErrors="formErrors"
            @close="closeFormModal"
            @submit="handleSubmitCustomer"
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('customer.details')" 
            :data="selectedCustomer"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        />

        <!-- Bulk Action Confirmation Modal -->
        <ConfirmationModal
            :isOpen="isBulkConfirmOpen"
            :title="$t('common.bulkDeleteConfirmTitle')"
            :message="bulkConfirmMessage"
            :confirmText="$t('common.confirm')"
            :cancelText="$t('common.cancel')"
            @confirm="executeBulkAction"
            @close="cancelBulkAction"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import { useI18n } from "vue-i18n";
import CustomerHeader from "../components/customerHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useCustomerStore } from "../stores/customerStore.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const customerStore = useCustomerStore();
const { companyId, companyOption, authStore } = useAuthDefaults();

// ✅ Check if user is SuperAdmin
const isSuperAdmin = computed(() => authStore.hasRole('SuperAdmin'));

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCustomer = ref({});
const formErrors = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get customers from store
const customers = computed(() => customerStore.customers);
const trashedCustomers = computed(() => customerStore.trashedCustomers);

// Fetch data on component mount
onMounted(async () => {
    try {
        await fetchCustomersPage(1);
        console.log("✅ Customers loaded successfully");
    } catch (error) {
        if (applyServerErrors(error)) {
            return;
        }
        console.error("❌ Failed to load customers:", error);
    }
});

// Watch for page changes to fetch new data from server
watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    try {
        await fetchCustomersPage(newPage);
    } catch (err) {
        console.error("Failed to load page:", err);
    }
});

// Get the correct pagination metadata based on active tab
const currentPagination = computed(() => {
    return activeTab.value === "active"
        ? customerStore.customersPagination
        : customerStore.trashedPagination;
});

// Customer Form Fields
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
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-6',
        defaultValue: companyId.value,
        locked: true,
        hidden: true
    },

    {
        name: 'latitude',
        label: t('customer.form.latitude'),
        type: 'text',
        required: false,
        placeholder: t('customer.form.latitudePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedCustomer.value.latitude : '',
        validate: (value) => {
            if (!value) return null;
            const lat = parseFloat(value);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return t('customer.validation.latitudeInvalid');
            }
            return null;
        }
    },
    {
        name: 'longitude',
        label: t('customer.form.longitude'),
        type: 'text',
        required: false,
        placeholder: t('customer.form.longitudePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedCustomer.value.longitude : '',
        validate: (value) => {
            if (!value) return null;
            const lng = parseFloat(value);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return t('customer.validation.longitudeInvalid');
            }
            return null;
        }
    },
    {
        name: 'locationPicker',
        label: t('customer.form.locationPicker'),
        type: 'locationPicker',
        text: t('common.locateOnMap'),
        latKey: 'latitude',
        lngKey: 'longitude',
        colClass: 'col-12'
    }
]);

// ✅ Details Fields - Hide company for Admin
const detailsFields = computed(() => {
    const fields = [
        { key: 'id', label: t('customer.id'), colClass: 'col-md-6' },
        { key: 'name', label: t('customer.name'), colClass: 'col-md-6' },
        { key: 'phone_number', label: t('customer.phoneNumber'), colClass: 'col-md-6' },
    ];
    
    // Only show company field for SuperAdmin
    if (isSuperAdmin.value) {
        fields.push({ key: 'company_name', label: t('customer.companyName'), colClass: 'col-md-6' });
    }
    
    fields.push(
        { key: 'latitude', label: t('customer.form.latitude'), colClass: 'col-md-6' },
        { key: 'longitude', label: t('customer.form.longitude'), colClass: 'col-md-6' }
    );
    
    return fields;
});

// ✅ Base columns - will be filtered based on role
const baseColumns = ref([
    { key: "id", label: t("customer.id"), sortable: true },
    { key: "name", label: t("customer.name"), sortable: true },
    { key: "phone_number", label: t("customer.phoneNumber"), sortable: false },
    { key: 'company_name', label: t('customer.companyName'), sortable: false },
]);

// ✅ Columns to display based on user role
const displayColumns = computed(() => {
    if (isSuperAdmin.value) {
        return baseColumns.value;
    }
    // For Admin, exclude company_name column
    return baseColumns.value.filter(col => col.key !== 'company_name');
});

const trashedColumns = computed(() => {
    const columns = [
        { key: "id", label: t("customer.id") },
        { key: "name", label: t("customer.name") },
        { key: "phone_number", label: t("customer.phoneNumber") },
    ];
    
    // Only show company for SuperAdmin
    if (isSuperAdmin.value) {
        columns.push({ key: 'company_name', label: t('customer.companyName') });
    }
    
    return columns;
});

const visibleColumns = ref([]);

// ✅ Initialize visible columns based on role
watch(() => displayColumns.value, (newColumns) => {
    if (visibleColumns.value.length === 0) {
        visibleColumns.value = newColumns.map(col => col.key);
    }
}, { immediate: true });

const filteredColumns = computed(() => {
    return displayColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

// Get current data based on active tab
const currentData = computed(() => {
    return activeTab.value === 'active' ? customers.value : trashedCustomers.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? customerStore.loading : customerStore.trashedLoading;
});

const buildCustomerFilters = () => {
    const filters = {};
    const trimmedSearch = searchText.value.trim();
    if (trimmedSearch) {
        filters.search = trimmedSearch;
    }
    if (isSuperAdmin.value && selectedGroups.value.length > 0) {
        filters.company =
            selectedGroups.value.length === 1
                ? selectedGroups.value[0]
                : selectedGroups.value.join(",");
    }
    return filters;
};

const fetchCustomersPage = async (page = 1) => {
    const filters = buildCustomerFilters();
    if (activeTab.value === "trashed") {
        await customerStore.fetchTrashedCustomers({ page, perPage: itemsPerPage.value, filters });
    } else {
        await customerStore.fetchCustomers({ page, perPage: itemsPerPage.value, filters });
    }
};

// Server already returns paginated data; use store results directly
const paginatedData = computed(() => currentData.value);

watch([searchText, selectedGroups], async () => {
    if (currentPage.value !== 1) {
        skipNextPageWatch.value = true;
        currentPage.value = 1;
    }
    try {
        await fetchCustomersPage(1);
    } catch (error) {
        console.error("❌ Failed to apply filters:", error);
    }
});

const applyServerErrors = (error) => {
    const normalized = normalizeServerErrors(error);
    formErrors.value = normalized;
    return Object.keys(normalized).length > 0;
};

const clearFormErrors = () => {
    formErrors.value = {};
};

// Add Modal
const openAddModal = () => {
    clearFormErrors();
    isEditMode.value = false;
    selectedCustomer.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (customer) => {
    clearFormErrors();
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
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedCustomer.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    skipNextPageWatch.value = true;
    currentPage.value = 1;
    selectedRows.value = [];
    try {
        await fetchCustomersPage(1);
    } catch (error) {
        console.error("❌ Failed to fetch customers:", error);
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        await fetchCustomersPage(currentPage.value);
    } catch (error) {
        console.error("❌ Failed to refresh customers:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('customer.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('customer.bulkRestore'),
                icon: 'fa-undo',
                bgColor: 'var(--color-success)'
            },
            {
                id: 'permanentDelete',
                label: t('common.permanentDelete'),
                icon: 'fa-trash-alt',
                bgColor: 'var(--color-danger)'
            }
        ];
    }
});

// Bulk confirm message
const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const count = selectedRows.value.length;
    const entityName = count === 1 ? t('customer.entitySingular') : t('customer.entityPlural');

    if (pendingBulkAction.value === 'delete') {
        return t('common.bulkDeleteConfirm', { count, entity: entityName });
    } else if (pendingBulkAction.value === 'permanentDelete') {
        return t('common.bulkPermanentDeleteConfirm', { count, entity: entityName });
    } else if (pendingBulkAction.value === 'restore') {
        return t('common.bulkRestoreConfirm', { count, entity: entityName });
    }
    return '';
});

// Bulk action handler
const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    bulkActionLoading.value = true;
    isBulkConfirmOpen.value = false;

    try {
        if (pendingBulkAction.value === 'delete') {
            await customerStore.bulkDeleteCustomers(selectedRows.value, false);
            console.log("✅ Customers soft deleted successfully");
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await customerStore.bulkDeleteCustomers(selectedRows.value, true);
            console.log("✅ Customers permanently deleted successfully");
        } else if (pendingBulkAction.value === 'restore') {
            await customerStore.bulkRestoreCustomers(selectedRows.value);
            console.log("✅ Customers restored successfully");
        }

        selectedRows.value = [];
        pendingBulkAction.value = null;
    } catch (error) {
        console.error("❌ Bulk action failed:", error);
    } finally {
        bulkActionLoading.value = false;
    }
};

const cancelBulkAction = () => {
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
};

const handleSubmitCustomer = async (customerData) => {
    validationError.value = null;
    
    try {
        const payload = {
            ...customerData,
            company_name: companyId.value || customerData.company_name,
        };
        if (isEditMode.value) {
            await customerStore.updateCustomer(selectedCustomer.value.id, payload);
            console.log('✅ Customer updated successfully!');
        } else {
            await customerStore.addCustomer(payload);
            console.log('✅ Customer added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save customer:', error);
        
        if (error.response?.data?.success === false && error.response?.data?.error) {
            validationError.value = error.response.data.error;
            
            setTimeout(() => {
                validationError.value = null;
            }, 5000);
            return;
        }
        
        alert(error.message || t('common.saveFailed'));
    }
};

const clearValidationError = () => {
    validationError.value = null;
};

const handleRestoreCustomer = async (customer) => {
    try {
        await customerStore.restoreCustomer(customer.id);
        console.log("✅ Customer restored successfully!");
    } catch (error) {
        console.error("❌ Failed to restore customer:", error);
        alert(error.message || 'Failed to restore customer');
    }
};

const handleDeleteCustomer = async (customer) => {
    try {
        await customerStore.deleteCustomer(customer.id);
        console.log("✅ Customer deleted successfully!");
    } catch (error) {
        console.error("❌ Failed to delete customer:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

const handlePermanentDeleteCustomer = async (customer) => {
    try {
        await customerStore.deleteCustomer(customer.id, true);
        console.log("Customer permanently deleted successfully!");
    } catch (error) {
        console.error("Failed to permanently delete customer:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>
