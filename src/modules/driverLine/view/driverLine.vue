<template>
  <div class="driver-line-page-container bg-light">
    <!-- Floating Validation Error Alert -->
    <div v-if="validationError" class="position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
      <div class="alert alert-danger alert-dismissible fade show shadow-lg" role="alert" style="min-width: 400px;">
        <i class="fas fa-exclamation-circle me-2"></i>
        <strong>{{ $t('common.validationError') }}</strong>
        <p class="mb-0 mt-1">{{ validationError }}</p>
        <button type="button" class="btn-close" @click="clearValidationError"></button>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="alert alert-info d-flex align-items-center justify-content-between mb-3" role="alert">
      <div class="d-flex align-items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
        </svg>
        <span>{{ $t('driverLine.info.manageLines') }}</span>
      </div>
      <button @click="navigateToLines" class="btn btn-sm btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-3 me-1" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5z"/>
        </svg>
        {{ $t('driverLine.info.goToLines') }}
      </button>
    </div>

    <!-- Driver Line Header -->
    <DriverLineHeader
      v-model="searchText"
      :searchPlaceholder="$t('driverLine.searchPlaceholder')"
      :data="driverLines"
      :groupKey="'status'"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('driverLine.filterByStatus')"
      :translationKey="'driverLineStatus'"
      :columns="driverLineColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('driverLine.addNew')"
      @add-click="openModal"
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
              {{ $t('common.active') }}
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link trashed-tab"
              :class="{ active: activeTab === 'trashed' }"
              @click="switchTab('trashed')"
            >
              {{ $t('driverLine.trashed.title') }}
            </button>
          </li>
        </ul>
      </div>
      <div class="card-body p-0">
        <BulkActionsBar
          :selectedCount="selectedRows.length"
          entityName="driverLine"
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
        <div v-else-if="driverLineStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ driverLineStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable :columns="filteredColumns" :data="paginatedData" v-model="selectedRows">
            <template #actions="{ row }">
              <Actions
                v-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('driverLine.edit')"
                :detailsLabel="$t('driverLine.actions.details')"
                :deleteLabel="$t('driverLine.actions.delete')"
                :confirmDelete="true"
                @edit="handleEdit"
                @details="handleDetails"
                @delete="handleDeleteDriverLine"
              />
              <Actions
                v-else
                :row="row"
                :restoreLabel="$t('driverLine.trashed.restore')"
                :deleteLabel="$t('driverLine.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="handleRestoreDriverLine"
                @delete="handlePermanentDeleteDriverLine"
              />
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="currentFilteredData.length"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              @update:currentPage="(page) => (currentPage = page)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal for Driver Line -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('driverLine.edit') : $t('driverLine.addNew')"
      :fields="driverLineFieldsWithDefaults"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleSubmitDriverLine"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('driverLine.details.title')"
      :data="selectedDriverLine"
      :fields="detailsFields"
      @close="closeDetailsModal"
    />

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
import { useRouter } from "vue-router";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import DriverLineHeader from "../components/driverLineHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useDriverLineFormFields } from "../components/driverLineFormFields.js";
import { useDriverLineStore } from "../stores/driverLineStore.js";
import { useDriverStore } from "@/modules/driver/stores/driverStore.js";
import { useLineWorkStore } from "@/modules/lineWork/stores/lineworkStore.js";

const { t } = useI18n();
const router = useRouter();
const driverLineStore = useDriverLineStore();
const driverStore = useDriverStore();
const lineWorkStore = useLineWorkStore();

const drivers = computed(() => driverStore.drivers);
const lineWorks = computed(() => lineWorkStore.lineWorks);
const { driverLineFields } = useDriverLineFormFields({
  drivers,
  lineWorks,
});

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDriverLine = ref({});
const validationError = ref(null);
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);
const activeTab = ref('active');

// Get driver lines from store
const driverLines = computed(() => driverLineStore.driverLines);
const trashedDriverLines = computed(() => driverLineStore.trashedDriverLines);

const driversById = computed(() => {
  const map = {};
  drivers.value.forEach((driver) => {
    if (driver?.id === undefined || driver?.id === null) return;
    map[driver.id] = driver.name || driver.user?.name || driver.username || "";
  });
  return map;
});

const lineWorksById = computed(() => {
  const map = {};
  lineWorks.value.forEach((lineWork) => {
    if (lineWork?.id === undefined || lineWork?.id === null) return;
    map[lineWork.id] = lineWork.name || "";
  });
  return map;
});

const withDisplayNames = (driverLine) => {
  const driverName =
    driverLine.driver_name ||
    driversById.value[driverLine.driver_id] ||
    (driverLine.driver_id !== undefined && driverLine.driver_id !== null
      ? `Driver ${driverLine.driver_id}`
      : "");
  const lineWorkName =
    driverLine.line_work_name ||
    lineWorksById.value[driverLine.line_work_id] ||
    (driverLine.line_work_id !== undefined && driverLine.line_work_id !== null
      ? `Line Work ${driverLine.line_work_id}`
      : "");

  return {
    ...driverLine,
    driver_name: driverName,
    line_work_name: lineWorkName,
  };
};

const driverLinesWithNames = computed(() =>
  driverLines.value.map(withDisplayNames)
);
const trashedDriverLinesWithNames = computed(() =>
  trashedDriverLines.value.map(withDisplayNames)
);

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([
      driverLineStore.fetchDriverLines(),
      driverStore.fetchDrivers(),
      lineWorkStore.fetchLineWorks(),
    ]);
    console.log("✅ Driver lines loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load driver lines:", error);
  }
});

// Table columns
const driverLineColumns = computed(() => [
  { key: "id", label: t("driverLine.table.id"), sortable: true },
  { key: "driver_name", label: t("driverLine.table.driver"), sortable: true },
  {
    key: "line_work_name",
    label: t("driverLine.table.lineWork"),
    sortable: true,
  },
  { key: "created_at", label: t("driverLine.table.createdAt"), sortable: true },
]);

const trashedColumns = computed(() => [
  { key: "id", label: t("driverLine.table.id") },
  { key: "driver_name", label: t("driverLine.table.driver") },
  { key: "line_work_name", label: t("driverLine.table.lineWork") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
  if (activeTab.value === "active") {
    return driverLineColumns.value.filter((col) =>
      visibleColumns.value.includes(col.key)
    );
  }
  return trashedColumns.value;
});

const currentData = computed(() => {
  return activeTab.value === "active"
    ? driverLinesWithNames.value
    : trashedDriverLinesWithNames.value;
});

const currentLoading = computed(() => {
  return activeTab.value === "active"
    ? driverLineStore.loading
    : driverLineStore.trashedLoading;
});

const currentFilteredData = computed(() => {
  let result = currentData.value;
  if (activeTab.value === "active") {
    result = filterByGroups(result, selectedGroups.value, "status");
  }
  result = filterData(result, searchText.value);
  return result;
});

const paginatedData = computed(() => {
  return paginateData(
    currentFilteredData.value,
    currentPage.value,
    itemsPerPage.value
  );
});

const bulkActions = computed(() => {
  if (activeTab.value === "active") {
    return [
      {
        id: "delete",
        label: t("driverLine.bulkDelete"),
        bgColor: "var(--color-danger)",
      },
    ];
  }

  return [
    {
      id: "restore",
      label: t("driverLine.bulkRestore"),
      bgColor: "var(--color-success)",
    },
    {
      id: "permanentDelete",
      label: t("common.permanentDelete"),
      bgColor: "var(--color-danger)",
    },
  ];
});

const bulkConfirmMessage = computed(() => {
  if (!pendingBulkAction.value) return "";

  const count = selectedRows.value.length;
  const entity =
    count === 1 ? t("driverLine.entitySingular") : t("driverLine.entityPlural");

  if (pendingBulkAction.value === "delete") {
    return t("common.bulkDeleteConfirm", { count, entity });
  }
  if (pendingBulkAction.value === "permanentDelete") {
    return t("common.bulkPermanentDeleteConfirm", { count, entity });
  }
  if (pendingBulkAction.value === "restore") {
    return t("common.bulkRestoreConfirm", { count, entity });
  }
  return "";
});

// Action methods
const openModal = () => {
  isEditMode.value = false;
  selectedDriverLine.value = {};
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  isEditMode.value = false;
  selectedDriverLine.value = {};
};

const switchTab = async (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
  selectedRows.value = [];

  if (tab === "trashed") {
    try {
      await driverLineStore.fetchTrashedDriverLines();
    } catch (error) {
      console.error("Failed to load trashed driver lines:", error);
    }
  } else {
    try {
      await driverLineStore.fetchDriverLines();
    } catch (error) {
      console.error("Failed to load driver lines:", error);
    }
  }
};

const handleRefresh = async () => {
  selectedRows.value = [];
  try {
    if (activeTab.value === "trashed") {
      await driverLineStore.fetchTrashedDriverLines();
    } else {
      await driverLineStore.fetchDriverLines();
    }
  } catch (error) {
    console.error("Failed to refresh driver lines:", error);
  }
};

const handleSubmitDriverLine = async (driverLineData) => {
  // Clear previous validation error
  validationError.value = null;
  
  try {
    if (isEditMode.value) {
      // Update existing driver line
      await driverLineStore.updateDriverLine(selectedDriverLine.value.id, driverLineData);
      console.log('✅ Driver line updated successfully!');
    } else {
      // Add new driver line
      await driverLineStore.addDriverLine(driverLineData);
      console.log('✅ Driver line added successfully!');
    }
    closeModal();
  } catch (error) {
    console.error('❌ Failed to save driver line:', error);
    
    // Check for specific validation errors
    if (error.response?.data?.success === false && error.response?.data?.error) {
      const errorMessage = error.response.data.error;
      
      // Check for duplicate assignment error
      if (errorMessage.includes('already assigned') || errorMessage.includes('duplicate')) {
        validationError.value = t('driverLine.validation.duplicateAssignment');
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          validationError.value = null;
        }, 5000);
        return; // Keep form open for correction
      }
    }
    
    // For other errors, show generic alert
    alert(error.message || t('common.saveFailed'));
  }
};

const clearValidationError = () => {
  validationError.value = null;
};

const handleRestoreDriverLine = async (driverLine) => {
  try {
    await driverLineStore.restoreDriverLine(driverLine.id);
    console.log("Driver line restored successfully!");
  } catch (error) {
    console.error("Failed to restore driver line:", error);
    alert(error.message || "Failed to restore driver line");
  }
};

const handlePermanentDeleteDriverLine = async (driverLine) => {
  try {
    await driverLineStore.deleteDriverLine(driverLine.id, true);
    console.log("Driver line permanently deleted successfully!");
  } catch (error) {
    console.error("Failed to permanently delete driver line:", error);
    alert(error.message || t("common.saveFailed"));
  }
};

const handleBulkAction = ({ actionId }) => {
  pendingBulkAction.value = actionId;
  isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
  if (!pendingBulkAction.value) return;
  bulkActionLoading.value = true;

  try {
    if (pendingBulkAction.value === "delete") {
      await driverLineStore.bulkDeleteDriverLines(selectedRows.value, false);
    } else if (pendingBulkAction.value === "permanentDelete") {
      await driverLineStore.bulkDeleteDriverLines(selectedRows.value, true);
    } else if (pendingBulkAction.value === "restore") {
      await driverLineStore.bulkRestoreDriverLines(selectedRows.value);
    }
    selectedRows.value = [];
  } catch (error) {
    console.error("Failed to bulk delete driver lines:", error);
  } finally {
    bulkActionLoading.value = false;
    isBulkConfirmOpen.value = false;
    pendingBulkAction.value = null;
  }
};

const cancelBulkAction = () => {
  isBulkConfirmOpen.value = false;
  pendingBulkAction.value = null;
};

const handleEdit = (driverLine) => {
  isEditMode.value = true;
  selectedDriverLine.value = { ...driverLine };
  isModalOpen.value = true;
};

const handleDetails = (driverLine) => {
  selectedDriverLine.value = { ...driverLine };
  isDetailsModalOpen.value = true;
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedDriverLine.value = {};
};

// Update form fields to support edit mode
const driverLineFieldsWithDefaults = computed(() => {
  return driverLineFields.value.map((field) => {
    const rawValue = selectedDriverLine.value[field.name];
    const defaultValue = isEditMode.value
      ? field.type === "select" && rawValue !== undefined && rawValue !== null
        ? String(rawValue)
        : rawValue
      : field.defaultValue || "";

    return {
      ...field,
      defaultValue,
    };
  });
});

// Details fields configuration
const detailsFields = computed(() => [
  { key: "id", label: t("driverLine.table.id"), colClass: "col-md-6" },
  { key: "driver_name", label: t("driverLine.table.driver"), colClass: "col-md-6" },
  { key: "line_work_name", label: t("driverLine.table.lineWork"), colClass: "col-md-6" },
  { key: "created_at", label: t("driverLine.table.createdAt"), colClass: "col-md-6" },
]);

// Navigate to Lines management page
const navigateToLines = () => {
  router.push({ name: "Lines" });
};

watch([searchText, selectedGroups], () => {
  currentPage.value = 1;
});

const handleDeleteDriverLine = async (driverLine) => {
  try {
    await driverLineStore.deleteDriverLine(driverLine.id);
    console.log("?o. Driver line deleted successfully!");
  } catch (error) {
    console.error("??O Failed to delete driver line:", error);
    alert(error.message || t('common.saveFailed'));
  }
};

</script>

<style scoped>
.driver-line-page-container {
  max-width: 100%;
}
</style>

