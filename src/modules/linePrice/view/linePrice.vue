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

        <LinePriceHeader 
            v-model="searchText" 
            :searchPlaceholder="$t('linePrice.searchPlaceholder')" 
            :data="linePrices"
            groupKey="type" 
            v-model:groupModelValue="selectedGroups" 
            :groupLabel="$t('linePrice.filterByType')"
            translationKey="priceTypes" 
            :columns="linePriceColumns" 
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true" 
            :addButtonText="$t('linePrice.addNew')" 
            @add-click="openAddModal"
            @trashed-click="openTrashedModal" 
        />

        <div class="card border-0">
            <div class="card-body p-0">
                <!-- Loading State -->
                <div v-if="linePriceStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">{{ $t('common.loading') }}</p>
                </div>

                <!-- Error State -->
                <div v-else-if="linePriceStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ linePriceStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable :columns="filteredColumns" :data="paginatedLinePrices" :actionsLabel="$t('linePrice.actions')">
                        <template #actions="{ row }">
                            <ActionsDropdown 
                                :row="row" 
                                :editLabel="$t('linePrice.edit')" 
                                :detailsLabel="$t('linePrice.details')"
                                @edit="openEditModal" 
                                @details="openDetailsModal" 
                            />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination 
                            :totalItems="filteredLinePrices.length" 
                            :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage" 
                            @update:currentPage="(page) => currentPage = page" 
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit Line Price -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('linePrice.edit') : $t('linePrice.addNew')"
            :fields="linePriceFields" 
            :showImageUpload="false" 
            @close="closeFormModal" 
            @submit="handleSubmitLinePrice" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('linePrice.details')" 
            :data="selectedLinePrice"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        />

        <!-- Trashed Line Prices Modal -->
        <TrashedItemsModal 
            :isOpen="isTrashedModalOpen" 
            :title="$t('linePrice.trashed.title')"
            :emptyMessage="$t('linePrice.trashed.empty')" 
            :columns="trashedColumns" 
            :trashedItems="trashedLinePrices"
            @close="closeTrashedModal" 
            @restore="handleRestoreLinePrice" 
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
import LinePriceHeader from "../components/linePriceHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import { useLinePriceStore } from "../stores/linespriceStore.js";

const { t } = useI18n();
const linePriceStore = useLinePriceStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedLinePrice = ref({});
const validationError = ref(null);

// Get line prices from store
const linePrices = computed(() => linePriceStore.linePrices);
const trashedLinePrices = computed(() => linePriceStore.trashedLinePrices);

// Fetch data on component mount
onMounted(async () => {
    try {
        await linePriceStore.fetchLinePrices();
        console.log("✅ Line prices loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load line prices:", error);
    }
});

// Line Price Form Fields 
const linePriceFields = computed(() => [
    {
        name: 'line_id',
        label: t('linePrice.form.line'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'Line 1' },
            { value: '2', label: 'Line 2' },
            { value: '3', label: 'Line 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedLinePrice.value.line_id) : ''
    },
    {
        name: 'price',
        label: t('linePrice.form.price'),
        type: 'number',
        required: true,
        placeholder: t('linePrice.form.pricePlaceholder'),
        colClass: 'col-md-6',
        step: '0.01',
        min: '0',
        defaultValue: isEditMode.value ? selectedLinePrice.value.price : '',
        validate: (value) => {
            if (value <= 0) return t('linePrice.validation.pricePositive');
            return null;
        }
    },
    {
        name: 'currency_id',
        label: t('linePrice.form.currency'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'USD' },
            { value: '2', label: 'EUR' },
            { value: '3', label: 'ILS' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedLinePrice.value.currency_id) : ''
    },
    {
        name: 'company_id',
        label: t('linePrice.form.company'),
        type: 'select',
        required: true,
        options: [
            { value: '1', label: 'Company 1' },
            { value: '2', label: 'Company 2' },
            { value: '3', label: 'Company 3' },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedLinePrice.value.company_id) : ''
    },
    {
        name: 'type',
        label: t('linePrice.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'return', label: t('linePrice.form.types.return') },
            { value: 'delivery', label: t('linePrice.form.types.delivery') },
        ],
        colClass: 'col-md-12',
        defaultValue: isEditMode.value ? selectedLinePrice.value.type : '',
        validate: (value) => {
            const validTypes = ['return', 'delivery'];
            if (value && !validTypes.includes(value)) {
                return t('linePrice.validation.invalidType') || 'Invalid type selected. Valid options: return, delivery';
            }
            return null;
        }
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('linePrice.id'), colClass: 'col-md-6' },
    { key: 'line_name', label: t('linePrice.line'), colClass: 'col-md-6' },
    { key: 'price', label: t('linePrice.price'), colClass: 'col-md-6' },
    { key: 'currency_code', label: t('linePrice.currency'), colClass: 'col-md-6' },
    { key: 'company_name', label: t('linePrice.company'), colClass: 'col-md-6' },
    { 
        key: 'type', 
        label: t('linePrice.type'), 
        colClass: 'col-md-6',
        translator: (value) => {
            return value === 'return' ? t('linePrice.form.types.return') : t('linePrice.form.types.delivery');
        }
    },
    { key: 'created_at', label: t('linePrice.createdAt'), colClass: 'col-md-6' },
    { key: 'updated_at', label: t('linePrice.updatedAt'), colClass: 'col-md-6' },
]);

const linePriceColumns = ref([
    { key: "id", label: t("linePrice.id"), sortable: true },
    { key: "line_name", label: t("linePrice.line"), sortable: false },
    { key: "price", label: t("linePrice.price"), sortable: true },
    { key: "currency_code", label: t("linePrice.currency"), sortable: false },
    { key: "company_name", label: t("linePrice.company"), sortable: false },
    { key: "type", label: t("linePrice.type"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("linePrice.id") },
    { key: "line_name", label: t("linePrice.line") },
    { key: "price", label: t("linePrice.price") },
    { key: "currency_code", label: t("linePrice.currency") },
    { key: "type", label: t("linePrice.type") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return linePriceColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredLinePrices = computed(() => {
    let result = linePrices.value;
    result = filterByGroups(result, selectedGroups.value, "type");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedLinePrices = computed(() => {
    return paginateData(
        filteredLinePrices.value,
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
    selectedLinePrice.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (linePrice) => {
    isEditMode.value = true;
    selectedLinePrice.value = { ...linePrice };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (linePrice) => {
    selectedLinePrice.value = { ...linePrice };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedLinePrice.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedLinePrice.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitLinePrice = async (priceData) => {
    // Clear previous validation error
    validationError.value = null;
    
    try {
        if (isEditMode.value) {
            // Update existing line price
            await linePriceStore.updateLinePrice(selectedLinePrice.value.id, priceData);
            console.log('✅ Line price updated successfully!');
        } else {
            // Add new line price
            await linePriceStore.addLinePrice(priceData);
            console.log('✅ Line price added successfully!');
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line price:', error);
        
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

const handleRestoreLinePrice = async (linePrice) => {
    try {
        await linePriceStore.restoreLinePrice(linePrice.id);
        console.log("✅ Line price restored successfully!");
    } catch (error) {
        console.error("❌ Failed to restore line price:", error);
        alert(error.message || 'Failed to restore line price');
    }
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>