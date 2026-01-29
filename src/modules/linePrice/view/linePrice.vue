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
            :columns="linePriceColumns"
            v-model:visibleColumns="visibleColumns"
            :showAddButton="true"
            :addButtonText="$t('linePrice.addNew')"
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
                            {{ $t('linePrice.activeLinePrices') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('linePrice.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="linePrice"
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
                <div v-else-if="linePriceStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ linePriceStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('linePrice.actions')"
                        v-model="selectedRows"
                    >
                        <template #actions="{ row }">
                            <!-- Active Line Prices Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('linePrice.edit')"
                                :detailsLabel="$t('linePrice.details')"
                                :deleteLabel="$t('linePrice.delete')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteLinePrice"
                            />
                            <!-- Trashed Line Prices Actions -->
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('linePrice.trashed.restore')"
                                :deleteLabel="$t('linePrice.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestoreLinePrice"
                                @delete="handlePermanentDeleteLinePrice"
                            />
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit Line Price -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('linePrice.edit') : $t('linePrice.addNew')"
            :fields="linePriceFields" 
            :showImageUpload="false" 
            :serverErrors="formErrors"
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

        <!-- Success Modal -->
        <SuccessModal 
            :isOpen="isSuccessModalOpen" 
            :title="$t('common.success')"
            :message="successMessage"
            @close="closeSuccessModal" 
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { filterData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import LinePriceHeader from "../components/linePriceHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useLinePriceStore } from "../stores/linespriceStore.js";
import apiServices from "@/services/apiServices.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const linePriceStore = useLinePriceStore();
const { companyId, companyOption, currencyId } = useAuthDefaults();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();

const searchText = ref("");
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedLinePrice = ref({});
const formErrors = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);
const lineOptions = ref([]);
const currencyOptions = ref([]);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get line prices from store
const linePrices = computed(() => linePriceStore.linePrices);
const trashedLinePrices = computed(() => linePriceStore.trashedLinePrices);

// Fetch data on component mount
onMounted(async () => {
    try {
        await Promise.all([
            linePriceStore.fetchLinePrices(),
            fetchDropdownData()
        ]);
        console.log("✅ Line prices loaded successfully");
    } catch (error) {
        console.error("❌ Failed to load line prices:", error);
    }
});

const fetchDropdownData = async () => {
    try {
        const [linesResponse, currenciesResponse] = await Promise.all([
            apiServices.getLines({ page: 1, perPage: 1000 }),
            apiServices.getCurrencies({ page: 1, perPage: 1000 })
        ]);

        lineOptions.value = (linesResponse.data.data || []).map((line) => ({
            value: String(line.id),
            label: line.name
        }));

        currencyOptions.value = (currenciesResponse.data.data || []).map((currency) => {
            const name =
                currency.name ||
                currency.nameenglish ||
                currency.namearabic ||
                "";
            const symbol = currency.symbol || "";
            const label = name && symbol ? `${name} (${symbol})` : (name || symbol);
            return {
                value: String(currency.id),
                label
            };
        });
    } catch (error) {
        console.error("❌ Failed to load line price dropdown data:", error);
    }
};

// Line Price Form Fields 
const linePriceFields = computed(() => [
    {
        name: 'line_id',
        label: t('linePrice.form.line'),
        type: 'select',
        required: true,
        options: lineOptions.value,
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
        options: currencyOptions.value,
        colClass: 'col-md-6',
        defaultValue: isEditMode.value
            ? String(selectedLinePrice.value.currency_id)
            : currencyId.value
    },
    {
        name: 'company_id',
        label: t('linePrice.form.company'),
        type: 'select',
        required: true,
        options: companyOption.value.length
            ? companyOption.value
            : [{ value: "", label: t("common.noCompanyAssigned") }],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value
            ? String(selectedLinePrice.value.company_id ?? "")
            : companyId.value,
        locked: true,
        hidden: true
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

// Get current data based on active tab
const currentData = computed(() => {
    return activeTab.value === 'active' ? linePrices.value : trashedLinePrices.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? linePriceStore.loading : linePriceStore.trashedLoading;
});

// Filter current data
const currentFilteredData = computed(() => {
    let result = currentData.value;
    result = filterData(result, searchText.value);
    return result;
});

const paginatedData = computed(() => {
    return currentFilteredData.value;
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
    selectedLinePrice.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (linePrice) => {
    clearFormErrors();
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
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedLinePrice.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    selectedRows.value = [];
    if (tab === 'trashed') {
        try {
            await linePriceStore.fetchTrashedLinePrices();
        } catch (error) {
            console.error("❌ Failed to fetch trashed line prices:", error);
        }
    } else {
        try {
            await linePriceStore.fetchLinePrices();
        } catch (error) {
            console.error("❌ Failed to fetch line prices:", error);
        }
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        if (activeTab.value === 'trashed') {
            await linePriceStore.fetchTrashedLinePrices();
        } else {
            await linePriceStore.fetchLinePrices();
        }
    } catch (error) {
        console.error("❌ Failed to refresh line prices:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'delete',
                label: t('linePrice.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('linePrice.bulkRestore'),
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
    const entityName = count === 1 ? t('linePrice.entitySingular') : t('linePrice.entityPlural');

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
    const count = selectedRows.value.length;

    try {
        if (pendingBulkAction.value === 'delete') {
            await linePriceStore.bulkDeleteLinePrices(selectedRows.value, false);
            console.log("✅ Line prices soft deleted successfully");
            showSuccess(t('linePrice.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await linePriceStore.bulkDeleteLinePrices(selectedRows.value, true);
            console.log("✅ Line prices permanently deleted successfully");
            showSuccess(t('linePrice.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await linePriceStore.bulkRestoreLinePrices(selectedRows.value);
            console.log("✅ Line prices restored successfully");
            showSuccess(t('linePrice.bulkRestoreSuccess', { count }));
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

const handleSubmitLinePrice = async (priceData) => {
    validationError.value = null;
    
    try {
        const payload = {
            ...priceData,
            company_id: companyId.value || priceData.company_id,
        };
        if (isEditMode.value) {
            await linePriceStore.updateLinePrice(selectedLinePrice.value.id, payload);
            console.log('✅ Line price updated successfully!');
            showSuccess(t('linePrice.updateSuccess'));
        } else {
            await linePriceStore.addLinePrice(payload);
            console.log('✅ Line price added successfully!');
            showSuccess(t('linePrice.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save line price:', error);

        if (applyServerErrors(error)) {
            return;
        }
        
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

const handleRestoreLinePrice = async (linePrice) => {
    try {
        await linePriceStore.restoreLinePrice(linePrice.id);
        console.log("✅ Line price restored successfully!");
        showSuccess(t('linePrice.restoreSuccess'));
    } catch (error) {
        console.error("❌ Failed to restore line price:", error);
        alert(error.message || 'Failed to restore line price');
    }
};

const handleDeleteLinePrice = async (linePrice) => {
    try {
        await linePriceStore.deleteLinePrice(linePrice.id);
        console.log("✅ Line price deleted successfully!");
        showSuccess(t('linePrice.deleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to delete line price:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

const handlePermanentDeleteLinePrice = async (linePrice) => {
    try {
        await linePriceStore.deleteLinePrice(linePrice.id, true);
        console.log("✅ Line price permanently deleted successfully!");
        showSuccess(t('linePrice.permanentDeleteSuccess'));
    } catch (error) {
        console.error("❌ Failed to permanently delete line price:", error);
        alert(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>