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
            groupKey="company_name" 
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('customer.filterByCompany')" 
            translationKey="" 
            :columns="customerColumns"
            v-model:visibleColumns="visibleColumns" 
            :showAddButton="true" 
            :addButtonText="$t('customer.addNew')"
            @add-click="openAddModal" 
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="customerStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
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
                        :data="paginatedCustomers" 
                        :actionsLabel="$t('customer.actions')"
                    >
                        <template #actions="{ row }">
                            <ActionsDropdown 
                                :row="row" 
                                :editLabel="$t('customer.edit')"
                                :detailsLabel="$t('customer.details')" 
                                @edit="openEditModal" 
                                @details="openDetailsModal" 
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination 
                            :totalItems="filteredCustomer.length" 
                            :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage" 
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

        <!-- Trashed customers Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('customer.trashed.title')"
            :emptyMessage="$t('customer.trashed.empty')" 
            :columns="trashedColumns" 
            :trashedItems="trashedCustomers"
            @close="closeTrashedModal" 
            @restore="handleRestoreCustomer" 
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import CustomerHeader from "../components/customerHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useCustomerStore } from "../stores/customerStore.js";

const { t } = useI18n();
const customerStore = useCustomerStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedCustomer = ref({});
const validationError = ref(null);

// Get customers from store
const customers = computed(() => customerStore.customers);
const trashedCustomers = computed(() => customerStore.trashedCustomers);

// Fetch data on component mount
onMounted(async () => {
    try {
        await customerStore.fetchCustomers();
        console.log("✅ Customers loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load customers:", error);
    }
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
        options: [
            { value: '1', label: 'Company 1' },
            { value: '2', label: 'Company 2' },
            { value: '3', label: 'Company 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedCustomer.value.company_id) : ''
    },

    {
        name: 'set_location',
        label: t('customer.form.location'),
        type: 'button',
        required: false,
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
    { key: 'company_name', label: t('customer.companyName'), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("customer.id") },
    { key: "name", label: t("customer.name") },
    { key: "phone_number", label: t("customer.phoneNumber") },
    { key: 'company_name', label: t('customer.companyName') },
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

const paginatedCustomers = computed(() => {
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

const handleSubmitCustomer = async (customerData) => {
    // Clear previous validation error
    validationError.value = null;
    
    try {
        if (isEditMode.value) {
            // Update existing customer
            await customerStore.updateCustomer(selectedCustomer.value.id, customerData);
            console.log('✅ Customer updated successfully!');
        } else {
            // Add new customer
            await customerStore.addCustomer(customerData);
            console.log('✅ Customer added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save customer:', error);
        
        // Check for specific validation errors
        if (error.response?.data?.success === false && error.response?.data?.error) {
            validationError.value = error.response.data.error;
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                validationError.value = null;
            }, 5000);
            return; // Keep form open for correction
        }
        
        // For other errors, show generic alert
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
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>