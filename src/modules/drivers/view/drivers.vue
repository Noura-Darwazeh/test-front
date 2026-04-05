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

        <DriversHeader
            v-model="searchText"
            :searchPlaceholder="$t('driver.searchPlaceholder')"
            :data="drivers"
            groupKey="status"
            v-model:groupModelValue="selectedGroups"
            :groupLabel="$t('driver.filterByStatus')"
            translationKey="statuses"
            groupKey2="type"
            v-model:groupModelValue2="selectedTypeGroups"
            :groupLabel2="$t('common.filterByType')"
            translationKey2="driverTypes"
            :columns="driverColumns"
            v-model:visibleColumns="visibleColumns"
            :showActiveFilter="true"
            :activeFilterValue="activeStatusFilter"
            @update:activeFilterValue="activeStatusFilter = $event"
            :showAddButton="true"
            :addButtonText="$t('driver.addNew')"
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
                            {{ $t('driver.activeDrivers') }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link trashed-tab"
                            :class="{ active: activeTab === 'trashed' }"
                            @click="switchTab('trashed')"
                        >
                            {{ $t('driver.trashed.title') }}
                        </button>
                    </li>
                </ul>
            </div>

            <div class="card-body p-0">
                <!-- Bulk Actions Bar -->
                <BulkActionsBar
                    :selectedCount="selectedRows.length"
                    entityName="driver"
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
                <div v-else-if="driverStore.error" class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ driverStore.error }}
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :columns="filteredColumns"
                        :data="paginatedData"
                        :actionsLabel="$t('driver.actions')"
                        v-model="selectedRows"
                        :rowClass="(row) => row.is_active === 0 ? 'row-inactive' : ''"
                    >
                        <template #actions="{ row }">
                            <!-- Active Drivers Actions -->
                            <ActionsDropdown
                                v-if="activeTab === 'active'"
                                :row="row"
                                :editLabel="$t('driver.edit')"
                                :detailsLabel="$t('driver.details')"
                                :deleteLabel="$t('driver.delete')"
                                :showActivate="row.is_active === 0"
                                :showDeactivate="row.is_active === 1"
                                :activateLabel="$t('common.activate')"
                                :deactivateLabel="$t('common.deactivate')"
                                :confirmDelete="true"
                                @edit="openEditModal"
                                @details="openDetailsModal"
                                @delete="handleDeleteDriver"
                                @activate="handleActivate"
                                @deactivate="handleDeactivate"
                            />
                            <!-- Trashed Drivers Actions -->
                            <ActionsDropdown
                                v-else
                                :row="row"
                                :restoreLabel="$t('driver.trashed.restore')"
                                :deleteLabel="$t('driver.trashed.delete')"
                                :showEdit="false"
                                :showDetails="false"
                                :showRestore="true"
                                :confirmDelete="true"
                                @restore="handleRestoreDriver"
                                @delete="handlePermanentDeleteDriver"
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

        <!-- Dynamic Form Modal for Add/Edit Driver -->
        <FormModal 
            :isOpen="isFormModalOpen" 
            :title="isEditMode ? $t('driver.edit') : $t('driver.addNew')" 
            :fields="driverFields"
            :showImageUpload="true" 
            :imageRequired="false"
            :imageUploadLabel="$t('driver.form.uploadImage')"
            :initialImage="selectedDriverImage"
            :serverErrors="formErrors"
            @close="closeFormModal" 
            @submit="handleSubmitDriver" 
        />

        <!-- Details Modal -->
        <DetailsModal 
            :isOpen="isDetailsModalOpen" 
            :title="$t('driver.details')" 
            :data="selectedDriver"
            :fields="detailsFields" 
            @close="closeDetailsModal" 
        >
            <template #after-details>
                <div v-if="selectedDriver.notification_channels_data?.length" class="mt-3">
                    <label class="detail-label text-muted small fw-semibold text-uppercase mb-2 d-block">
                        {{ $t('driver.form.notificationSection') }}
                    </label>
                    <div v-for="item in selectedDriver.notification_channels_data" :key="item.eventName" class="mb-3">
                        <div class="fw-semibold small mb-1 text-dark">{{ item.eventName }}</div>
                        <div class="d-flex flex-wrap gap-2">
                            <span v-for="ch in item.channelStates" :key="ch.key" class="badge px-3 py-2"
                                :class="ch.active ? 'bg-primary text-white' : 'bg-light text-muted border'" style="font-size: 0.75rem;">
                                {{ ch.label }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </DetailsModal>

        <!-- ✅ NEW: Driver Reassign Modal -->
        <DriverReassignModal
    :isOpen="isReassignModalOpen"
    :driver="driverToDelete"
    :workPlans="driverWorkPlans"
    :availableDrivers="otherDrivers"
    :canDelete="canDeleteDriver"
    @close="closeReassignModal"
    @reassign="handleReassignWorkPlans"
    @delete="handleDirectDelete"
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

        <SuccessModal
            :isOpen="isSuccessModalOpen"
            :title="$t('common.success')"
            :message="successMessage"
            @close="closeSuccessModal"
        />

        <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
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
import DriverReassignModal from "../../../components/shared/DriverReassignModal.vue"; // ✅ NEW
import { useI18n } from "vue-i18n";
import DriversHeader from "../components/driversHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useDriverStore } from "../stores/driversStore.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";
import apiServices from "@/services/apiServices.js";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import ErrorModal from "../../../components/shared/ErrorModal.vue";
import { useErrorModal } from "../../../composables/useErrorModal.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";
import { useActiveToggle } from "../../../composables/useActiveToggle.js";
import { useNotificationEventsStore } from "@/stores/notificationEvents.js";

const { t, locale } = useI18n();
const driverStore = useDriverStore();
const notificationEventsStore = useNotificationEventsStore();
const { companyId, companyOption } = useAuthDefaults();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/api\/?$/, "");
const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "path/test") return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

const searchText = ref("");
const selectedGroups = ref([]);
const selectedTypeGroups = ref([]);
const activeStatusFilter = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDriver = ref({});
const formErrors = ref({});
const validationError = ref(null);
const activeTab = ref('active');
const selectedRows = ref([]);

// ✅ NEW: Reassignment Modal State
const isReassignModalOpen = ref(false);
const driverToDelete = ref(null);
const driverWorkPlans = ref([]);
const canDeleteDriver = ref(true);

const selectedDriverImage = computed(() =>
    getFullImageUrl(selectedDriver.value?.image)
);

// Bulk action state
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Get drivers from store
const drivers = computed(() => driverStore.drivers);
const trashedDrivers = computed(() => driverStore.trashedDrivers);

// Active Toggle
const refreshDrivers = () => fetchDriversPage(currentPage.value);
const { handleActivate, handleDeactivate, handleBulkActivate, handleBulkDeactivate } = useActiveToggle("drivers", refreshDrivers, { showSuccess, showError });
const branches = ref([]);

// ✅ NEW: Computed for other drivers
const otherDrivers = computed(() => {
  if (!driverToDelete.value) return [];
  
  return driverStore.drivers.filter(driver => 
    driver.id !== driverToDelete.value.id &&
    driver.status !== 'offline'
  );
});

const branchOptions = computed(() =>
    branches.value.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }))
);

const toSelectValue = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
};

const normalizeDriverForEdit = (driver) => ({
    ...driver,
    name: driver.user?.name || driver.name || "",
    username: driver.user?.username || driver.username || "",
    email: driver.user?.email || driver.email || "",
    phone_number: driver.user?.phone_number || driver.phone_number || "",
    branch_id: toSelectValue(driver.branch_id ?? driver.branch?.id),
    company_id: toSelectValue(driver.company_id ?? driver.company?.id),
    status: driver.status || "available",
    type: driver.type || "delivery driver",
    vehicle_number: driver.vehicle_number || "",
});

const fetchBranches = async () => {
    try {
        const response = await apiServices.getBranches();
        branches.value = response.data.data || [];
    } catch (error) {
        console.error("❌ Failed to load branches:", error);
    }
};

// Fetch data on component mount
onMounted(async () => {
    try {
        await Promise.all([
            fetchDriversPage(1),
            fetchBranches(),
            notificationEventsStore.fetchEvents(),
        ]);
    } catch (error) {
        console.error("❌ Failed to load drivers:", error);
    }
});

watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    try {
        await fetchDriversPage(newPage);
    } catch (err) {
        console.error("Failed to load page:", err);
    }
});

// Get the correct pagination metadata based on active tab
const currentPagination = computed(() => {
    return activeTab.value === "active"
        ? driverStore.driversPagination
        : driverStore.trashedPagination;
});

// Driver Form Fields
const driverFields = computed(() => [
    {
        name: 'name',
        label: t('driver.form.name'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.name : '',
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
        defaultValue: isEditMode.value ? selectedDriver.value.username : '',
        validate: (value) => {
            if (value.length > 255) return t('driver.validation.usernameMax');
            if (!isEditMode.value) {
                const exists = drivers.value.some(d => d.username === value);
                if (exists) return t('driver.validation.usernameExists');
            }
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
        defaultValue: isEditMode.value ? selectedDriver.value.email : '',
        validate: (value) => {
            if (value && value.length > 255) return t('driver.validation.emailMax');
            return null;
        }
    },
    {
        name: 'password',
        label: t('driver.form.password'),
        type: 'password',
        required: !isEditMode.value,
        minlength: 6,
        placeholder: isEditMode.value ? 'Leave empty to keep current password' : t('driver.form.passwordPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: ''
    },
    {
        name: 'phone_number',
        label: t('driver.form.phoneNumber'),
        type: 'tel',
        required: true,
        placeholder: t('driver.form.phoneNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.phone_number : '',
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
            { value: 'custom driver', label: t('driver.form.driverTypes.customDriver') },
            { value: 'delivery driver', label: t('driver.form.driverTypes.deliveryDriver') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.type : ''
    },
    {
        name: 'vehicle_number',
        label: t('driver.form.vehicleNumber'),
        type: 'text',
        required: true,
        placeholder: t('driver.form.vehicleNumberPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedDriver.value.vehicle_number : ''
    },
    {
        name: 'branch_id',
        label: t('driver.form.branch'),
        type: 'select',
        required: true,
        options: branchOptions.value,
        placeholder: t('driver.form.branchPlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? String(selectedDriver.value.branch_id || '') : ''
    },
    {
        name: 'company_id',
        label: t('driver.form.company'),
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
        name: 'status',
        label: t('driver.form.status'),
        type: 'select',
        required: false,
        options: [
            { value: 'available', label: t('statuses.available') },
            { value: 'busy', label: t('statuses.busy') },
            { value: 'in_holiday', label: t('statuses.in_holiday') }
        ],
        defaultValue: isEditMode.value ? selectedDriver.value.status : 'available',
        colClass: 'col-md-6',
        validate: (value) => {
            const validStatuses = ['available', 'busy', 'in_holiday'];
            if (value && !validStatuses.includes(value)) {
                return t('driver.validation.invalidStatus') || 'Invalid status selected. Valid options: available, busy, in_holiday';
            }
            return null;
        }
    },
    // ── Notification Preferences ───────────────────────────────────────────
    {
        type: 'section',
        label: t('driver.form.notificationSection'),
        colClass: 'col-12',
    },
    // ── Notification Matrix ────────────────────────────────────────────────
    {
        type: 'notification-matrix',
        colClass: 'col-12',
        prefix: 'notify_',
        enableEmailRecipients: true,
        defaultValues: isEditMode.value ? (selectedDriver.value || {}) : {},
        events: (Array.isArray(notificationEventsStore.events) ? notificationEventsStore.events : []).map((ev) => ({
            key: ev.key,
            label: locale.value === 'ar' ? ev.ar_name : ev.en_name,
            icon: 'fas fa-bell',
        })),
        channels: [
            { key: 'sms',      label: t('driver.form.smsAlert'),      icon: 'fas fa-sms' },
            { key: 'web',      label: t('driver.form.webAlert'),      icon: 'fas fa-globe' },
            { key: 'email',    label: t('driver.form.emailAlert'),    icon: 'fas fa-envelope' },
            { key: 'mobile',   label: t('driver.form.mobileAlert'),   icon: 'fas fa-mobile-alt' },
            { key: 'telegram', label: t('driver.form.telegramAlert'), icon: 'fab fa-telegram-plane' },
            { key: 'whatsapp', label: t('driver.form.whatsappAlert'), icon: 'fab fa-whatsapp', requiresPermission: 'whatsapp channel' },
        ],
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('driver.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('driver.name'), colClass: 'col-md-6' },
    { key: 'username', label: t('driver.username'), colClass: 'col-md-6' },
    { key: 'email', label: t('driver.email'), colClass: 'col-md-6' },
    { key: 'phone_number', label: t('driver.phoneNumber'), colClass: 'col-md-6' },
    { key: 'status', label: t('driver.status'), translationKey: 'statuses', colClass: 'col-md-6' },
    { key: 'type', label: t('driver.type'), translationKey: 'driverTypes', colClass: 'col-md-6' },
    { key: 'branch_name', label: t('driver.branchName'), colClass: 'col-md-6' },
    { key: 'vehicle_number', label: t('driver.vehicleNumber'), colClass: 'col-md-12' },
]);

const driverColumns = ref([
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("driver.name"), sortable: true },
    { key: "username", label: t("driver.username"), sortable: true },
    {
        key: "status",
        label: t("driver.status"),
        sortable: false,
        component: "StatusBadge",
        componentProps: { type: "driver" },
    },
    { key: "type", label: t("driver.type"), sortable: false },
    { key: "branch_name", label: t("driver.branchName"), sortable: false },
    { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
    { key: "phone_number", label: t("driver.phoneNumber"), sortable: false },
    { key: "is_active", label: t("common.status"), sortable: false, component: "StatusBadge", componentProps: { statusMap: { 1: "active", 0: "inactive" } } },
]);

const trashedColumns = computed(() => [
    { key: "__index", label: "#", sortable: false, isIndex: true },
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

// Get current data based on active tab
const currentData = computed(() => {
    return activeTab.value === 'active' ? drivers.value : trashedDrivers.value;
});

// Get current loading state based on active tab
const currentLoading = computed(() => {
    return activeTab.value === 'active' ? driverStore.loading : driverStore.trashedLoading;
});

const buildDriverFilters = () => {
    const filters = {};
    const trimmedSearch = searchText.value.trim();
    if (trimmedSearch) {
        filters.search = trimmedSearch;
    }
    if (selectedGroups.value.length > 0) {
        filters.status =
            selectedGroups.value.length === 1
                ? selectedGroups.value[0]
                : selectedGroups.value.join(",");
    }
    if (selectedTypeGroups.value.length > 0) {
        filters.type =
            selectedTypeGroups.value.length === 1
                ? selectedTypeGroups.value[0]
                : selectedTypeGroups.value.join(",");
    }
    if (activeStatusFilter.value !== '') {
        filters.is_active = activeStatusFilter.value;
    }
    return filters;
};

const fetchDriversPage = async (page = 1) => {
    const filters = buildDriverFilters();
    if (activeTab.value === "trashed") {
        await driverStore.fetchTrashedDrivers({ page, perPage: itemsPerPage.value, filters });
    } else {
        await driverStore.fetchDrivers({ page, perPage: itemsPerPage.value, filters });
    }
};

// Server already returns paginated data; use store results directly
const paginatedData = computed(() => currentData.value);

watch([searchText, selectedGroups, selectedTypeGroups, activeStatusFilter], async () => {
    if (currentPage.value !== 1) {
        skipNextPageWatch.value = true;
        currentPage.value = 1;
    }
    try {
        await fetchDriversPage(1);
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
    selectedDriver.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = async (driver) => {
    clearFormErrors();
    isEditMode.value = true;
    selectedDriver.value = normalizeDriverForEdit(driver);
    
    try {
        const targetUserId = driver.user_id || driver.user?.id || driver.id;
        const response = await apiServices.getUserNotificationEvents(targetUserId);
        let data = [];
        const rData = response?.data;
        if (Array.isArray(rData)) data = rData;
        else if (Array.isArray(rData?.data)) data = rData.data;

        const channelKeys = ['sms', 'web', 'email', 'mobile', 'telegram', 'whatsapp'];

        data.forEach((item) => {
            const ev = notificationEventsStore.events.find(
                (e) => e.id === item.event_id || e.id === item.event?.id
            );
            if (!ev) return;

            let ch = item.channel || {};
            if (typeof ch === 'string') { try { ch = JSON.parse(ch); } catch { ch = {}; } }

            channelKeys.forEach((chKey) => {
                const val = ch[`${chKey}_alert`];
                const isActive = val === true || val === 1 || val === '1' || val === 'true' ? 1 : 0;
                selectedDriver.value[`notify_${ev.key}_${chKey}`] = isActive;
            });

            if (Array.isArray(ch.email) && ch.email.length) {
                selectedDriver.value[`notify_${ev.key}_email_recipients`] = [...ch.email];
            } else {
                selectedDriver.value[`notify_${ev.key}_email_recipients`] = [];
            }

            if (Array.isArray(ch.phone) && ch.phone.length) {
                selectedDriver.value[`notify_${ev.key}_phone_recipients`] = [...ch.phone];
            } else {
                selectedDriver.value[`notify_${ev.key}_phone_recipients`] = [];
            }
        });
    } catch (err) {
        console.error('Failed to load notification events for driver edit:', err);
    }
    
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = async (driver) => {
    selectedDriver.value = { ...driver };
    isDetailsModalOpen.value = true;
    selectedDriver.value.notification_matrix_details = t('common.loading') || 'Loading...';
    selectedDriver.value.notification_channels_data = [];

    try {
        const targetUserId = driver.user_id || driver.user?.id || driver.id;
        const response = await apiServices.getUserNotificationEvents(targetUserId);
        let notificationsData = [];
        const rData = response?.data;

        if (Array.isArray(rData)) notificationsData = rData;
        else if (Array.isArray(rData?.data)) notificationsData = rData.data;
        else if (Array.isArray(rData?.data?.data)) notificationsData = rData.data.data;

        const channelDefs = [
            { key: "sms", label: t("driver.form.smsAlert", "SMS Alert") },
            { key: "web", label: t("driver.form.webAlert", "Web Alert") },
            { key: "email", label: t("driver.form.emailAlert", "Email Alert") },
            { key: "mobile", label: t("driver.form.mobileAlert", "Mobile Alert") },
            { key: "telegram", label: t("driver.form.telegramAlert", "Telegram Alert") },
            { key: "whatsapp", label: t("driver.form.whatsappAlert", "Whatsapp Alert") },
        ];

        selectedDriver.value.notification_channels_data = notificationsData.map((item) => {
            const eventName = item.event?.name || t("common.unknownEvent", "Unknown Event");
            let channels = item.channel || {};
            if (typeof channels === 'string') {
                try { channels = JSON.parse(channels); } catch { channels = {}; }
            }

            const channelStates = channelDefs.map((ch) => {
                const val = channels[`${ch.key}_alert`];
                return {
                    key: ch.key,
                    label: ch.label,
                    active: val === true || val === 1 || val === "1" || val === "true",
                };
            });

            return { eventName, channelStates };
        }).filter(item => item.channelStates.some(ch => ch.active));
        
        selectedDriver.value.notification_matrix_details = 
            selectedDriver.value.notification_channels_data.length
                ? selectedDriver.value.notification_channels_data
                  .map(item => `${item.eventName}: ${item.channelStates.filter(c => c.active).map(c => c.label).join(', ')}`)
                  .join(' | ')
                : t('common.none', 'N/A');

    } catch (error) {
        console.error("Failed to load generic notification events for driver", error);
        selectedDriver.value.notification_matrix_details = t('common.error') || 'Error loading details';
        selectedDriver.value.notification_channels_data = [];
    }
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedDriver.value = {};
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedDriver.value = {};
};

// Tab switching function
const switchTab = async (tab) => {
    activeTab.value = tab;
    skipNextPageWatch.value = true;
    currentPage.value = 1;
    selectedRows.value = [];
    try {
        await fetchDriversPage(1);
    } catch (error) {
        console.error("❌ Failed to fetch drivers:", error);
    }
};

const handleRefresh = async () => {
    selectedRows.value = [];
    try {
        await fetchDriversPage(currentPage.value);
    } catch (error) {
        console.error("❌ Failed to refresh drivers:", error);
    }
};

// Bulk actions configuration
const bulkActions = computed(() => {
    if (activeTab.value === 'active') {
        return [
            {
                id: 'activate',
                label: t('common.bulkActivate'),
                bgColor: 'var(--color-success)',
            },
            {
                id: 'deactivate',
                label: t('common.bulkDeactivate'),
                bgColor: 'var(--color-warning, #ffc107)',
            },
            {
                id: 'delete',
                label: t('driver.bulkDelete'),
                icon: 'fa-trash',
                bgColor: 'var(--color-danger)'
            }
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('driver.bulkRestore'),
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
    const entityName = count === 1 ? t('driver.entitySingular') : t('driver.entityPlural');

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
            await driverStore.bulkDeleteDrivers(selectedRows.value, false);
            console.log("✅ Drivers soft deleted successfully");
            showSuccess(t('driver.bulkDeleteSuccess', { count}));
        } else if (pendingBulkAction.value === 'permanentDelete') {
            await driverStore.bulkDeleteDrivers(selectedRows.value, true);
            console.log("✅ Drivers permanently deleted successfully");
            showSuccess(t('driver.bulkDeleteSuccess', { count }));
        } else if (pendingBulkAction.value === 'restore') {
            await driverStore.bulkRestoreDrivers(selectedRows.value);
            console.log("✅ Drivers restored successfully");
            showSuccess(t('driver.bulkRestoreSuccess', { count }));
        } else if (pendingBulkAction.value === 'activate') {
            await handleBulkActivate(selectedRows.value);
        } else if (pendingBulkAction.value === 'deactivate') {
            await handleBulkDeactivate(selectedRows.value);
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

const handleSubmitDriver = async (driverData) => {
 
    validationError.value = null;
    
    try {
        const buildEventsPayload = (data) => {
            const globalEmails = Array.isArray(data?.notification_emails) ? data.notification_emails : [];
            const eventsPayload = [];
            const missing = [];

            (Array.isArray(notificationEventsStore.events) ? notificationEventsStore.events : []).forEach((ev) => {
                const channels = ['sms', 'web', 'email', 'mobile', 'telegram', 'whatsapp'];
                const eventConfig = { event_id: ev.id };
                let hasAnyChannel = false;

                channels.forEach((ch) => {
                    const isEnabled = Number(data?.[`notify_${ev.key}_${ch}`] ?? 0) === 1;
                    if (isEnabled) {
                        eventConfig[`${ch}_alert`] = 1;
                        hasAnyChannel = true;
                    }
                });

                if (!hasAnyChannel) return;

                if (eventConfig.email_alert === 1) {
                    const recipientsKey = `notify_${ev.key}_email_recipients`;
                    const eventEmails = Array.isArray(data?.[recipientsKey]) ? data[recipientsKey] : [];
                    const emailsToSend = eventEmails.length ? eventEmails : globalEmails;

                    if (!emailsToSend.length) {
                        missing.push(locale.value === "ar" ? ev.ar_name : ev.en_name || ev.key || String(ev.id));
                        return;
                    }
                    eventConfig.email = emailsToSend;
                }

                eventsPayload.push(eventConfig);
            });

            return { eventsPayload, missing };
        };

        const computeGlobalChannelAlerts = (data) => {
            const eventList = Array.isArray(notificationEventsStore.events) ? notificationEventsStore.events : [];
            const isAnyChannelActive = (chKey) =>
                eventList.some((ev) => Number(data?.[`notify_${ev.key}_${chKey}`] ?? 0) === 1);

            return {
                sms_alert: isAnyChannelActive("sms") ? 1 : 0,
                web_alert: isAnyChannelActive("web") ? 1 : 0,
                email_alert: isAnyChannelActive("email") ? 1 : 0,
                mobile_alert: isAnyChannelActive("mobile") ? 1 : 0,
                telegram_alert: isAnyChannelActive("telegram") ? 1 : 0,
                whatsapp_alert: isAnyChannelActive("whatsapp") ? 1 : 0,
            };
        };

        const { eventsPayload, missing } = buildEventsPayload(driverData);
        if (missing.length) {
            showError(`${t("driver.form.notificationEmails") || 'Missing Emails'}: ${missing.join(", ")} missing at least one email.`);
            return;
        }

        const alerts = computeGlobalChannelAlerts(driverData);
        alerts.email_alert = eventsPayload.some((e) => Array.isArray(e.email) && e.email.length > 0) ? 1 : 0;
        
        if (isEditMode.value) {
            const updatedData = {};

            const fields = ["name", "username", "email", "phone_number", "role", "company_id", "branch_id", "type", "status", "vehicle_number"];
            fields.forEach(f => {
                if (driverData[f] !== selectedDriver.value[f]) {
                    updatedData[f] = driverData[f];
                }
            });
            
            if (driverData.password) {
                updatedData.password = driverData.password;
            }

            Object.assign(updatedData, alerts);

            notificationEventsStore.events.forEach((ev) => {
                ['sms', 'web', 'email', 'mobile', 'telegram', 'whatsapp'].forEach((ch) => {
                    const key = `notify_${ev.key}_${ch}`;
                    if ((driverData[key] ?? 0) !== (selectedDriver.value[key] ?? 0)) {
                        updatedData[key] = driverData[key] ?? 0;
                    }
                });
            });

            if (driverData.image && driverData.image instanceof File) updatedData.image = driverData.image;

            await driverStore.updateDriver(selectedDriver.value.id, updatedData);

            // User ID should rigorously be taken from the connected User object
            const targetUserId = selectedDriver.value.user?.id || selectedDriver.value.user_id;
            console.log('🔄 Extracted user_id for updateUserNotificationEvents:', targetUserId, 'from driver:', selectedDriver.value);
            console.log('🔄 Events Payload to update via API:', eventsPayload);
            
            await apiServices.updateUserNotificationEvents({
                user_id: targetUserId,
                events: eventsPayload
            });

            console.log('✅ Driver updated successfully!');
            showSuccess(t('driver.updateSuccess'));
        } else {
            const newDriver = {
                ...driverData,
                role: "Driver",
                company_id: companyId.value || driverData.company_id,
            };

            if (eventsPayload.length) newDriver.events = eventsPayload;

            Object.assign(newDriver, alerts);

            notificationEventsStore.events.forEach((ev) => {
                ['sms', 'web', 'email', 'mobile', 'telegram', 'whatsapp'].forEach((ch) => {
                    const k = `notify_${ev.key}_${ch}`;
                    newDriver[k] = driverData[k] ?? 0;
                });
            });

            if ((!newDriver.events || newDriver.events.length === 0) && driverData.notification_emails?.length) {
                newDriver.notification_emails = driverData.notification_emails;
            }

            if (driverData.image && driverData.image instanceof File) newDriver.image = driverData.image;

            console.log('📦 Sending POST to Add Driver with payload:', newDriver);
            console.log('📦 Events array attached:', newDriver.events);
            
            await driverStore.addDriver(newDriver);
            console.log('✅ Driver added successfully!');
            showSuccess(t('driver.addSuccess'));
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to save driver:', error);

        if (applyServerErrors(error)) {
            return;
        }

        // Check for specific validation errors
        if (error.response?.data?.success === false && error.response?.data?.error) {
            const errorMessage = error.response.data.error;
            
            // Check for username duplicate error
            if (errorMessage.includes('username has already been taken')) {
                validationError.value = t('driver.validation.usernameAlreadyTaken');
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    validationError.value = null;
                }, 5000);
                return; // Keep form open for correction
            }
            
            // Check for phone number duplicate in same company error
            if (errorMessage.includes('already registered as a driver in this company')) {
                validationError.value = t('driver.validation.phoneAlreadyInCompany');
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    validationError.value = null;
                }, 5000);
                return; // Keep form open for correction
            }
        }
        
        // For other errors, show generic alert
        showError(error.message || t('common.saveFailed'));
    }
};

const clearValidationError = () => {
    validationError.value = null;
};

const handleRestoreDriver = async (driver) => {
    try {
        await driverStore.restoreDriver(driver.id);
        console.log("✅ Driver restored successfully!");
        showSuccess(t('driver.restoreSuccess'));
    } catch (error) {
        console.error("❌ Failed to restore driver:", error);
        showError(error.message || 'Failed to restore driver');
    }
};

const handleDeleteDriver = async (driver) => {
    try {
        console.log('🔍 Checking work plans for driver:', driver.id);
        
        const response = await apiServices.getDriverWorkPlans(driver.id);
        
        const workplans = response.data?.workplans || response.data?.data || [];
        const success = response.data?.success;
        
        console.log('📦 Workplans found:', workplans);
        
        if (success === false) {
            canDeleteDriver.value = false;
            driverToDelete.value = driver;
            driverWorkPlans.value = workplans;
            isReassignModalOpen.value = true;
            return;
        }
        
        if (Array.isArray(workplans) && workplans.length > 0) {
            canDeleteDriver.value = true;
            driverToDelete.value = driver;
            driverWorkPlans.value = workplans;
            isReassignModalOpen.value = true;
            console.log('🔔 Opening options modal with', workplans.length, 'plans');
            return;
        }
        
        console.log('✅ No work plans found, deleting driver directly...');
        await driverStore.deleteDriver(driver.id);
        showSuccess(t('driver.deleteSuccess'));
        
    } catch (error) {
        console.error("❌ Error checking/deleting driver:", error);
        showError(error.message || t('common.saveFailed'));
    }
};

const handleReassignWorkPlans = async ({ workPlanIds, oldDriverId, newDriverId }) => {
    try {
        console.log('🔄 Reassigning and deleting driver:', {
            workPlanIds,
            oldDriverId,
            newDriverId
        });
        
        await apiServices.reassignDriverWorkPlans(workPlanIds, oldDriverId, newDriverId);
        
        console.log('✅ Driver work plans reassigned and driver deleted successfully');
        showSuccess(t('driver.reassignSuccess'));
        
        closeReassignModal();
        await handleRefresh();
        
    } catch (error) {
        console.error('❌ Failed to reassign/delete:', error);
        showError(error.message || t('driver.reassignFailed'));
    }
};

const handleDirectDelete = async (driverId) => {
    try {
        console.log('🗑️ Deleting driver without reassigning:', driverId);
        
        await driverStore.deleteDriver(driverId);
        
        console.log('✅ Driver deleted successfully');
        showSuccess(t('driver.deleteSuccess'));
        
        closeReassignModal();
        await handleRefresh();
        
    } catch (error) {
        console.error('❌ Failed to delete:', error);
        showError(error.message || t('driver.deleteFailed'));
    }
};

// ✅ NEW: Close reassign modal
const closeReassignModal = () => {
    isReassignModalOpen.value = false;
    driverToDelete.value = null;
    driverWorkPlans.value = [];
    canDeleteDriver.value = true;
};

const handlePermanentDeleteDriver = async (driver) => {
    try {
        await driverStore.deleteDriver(driver.id, true);
        showSuccess(t('driver.permanentDeleteSuccess')); 
    } catch (error) {
        console.error("Failed to permanently delete driver:", error);
        showError(error.message || t('common.saveFailed'));
    }
};

</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}
</style>