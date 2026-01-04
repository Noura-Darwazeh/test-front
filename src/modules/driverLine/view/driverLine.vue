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
      @trashed-click="openTrashedModal"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="driverLineStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
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
          <DataTable :columns="filteredColumns" :data="paginatedDriverLines">
            <template #actions="{ row }">
              <Actions
                :row="row"
                :editLabel="$t('driverLine.edit')"
                :detailsLabel="$t('driverLine.actions.details')"
                @edit="handleEdit"
                @details="handleDetails"
              />
            </template>
          </DataTable>
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="filteredDriverLines.length"
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

    <!-- Trashed Driver Lines Modal -->
    <TrashedItemsModal
      :isOpen="isTrashedModalOpen"
      :title="$t('driverLine.trashed.title')"
      :emptyMessage="$t('driverLine.trashed.empty')"
      :columns="trashedColumns"
      :trashedItems="trashedDriverLines"
      :showDeleteButton="false"
      @close="closeTrashedModal"
      @restore="handleRestoreDriverLine"
    />

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('driverLine.details.title')"
      :data="selectedDriverLine"
      :fields="detailsFields"
      @close="closeDetailsModal"
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
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";
import Actions from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import { useDriverLineFormFields } from "../components/driverLineFormFields.js";
import { useDriverLineStore } from "../stores/driverLineStore.js";

const { t } = useI18n();
const router = useRouter();
const { driverLineFields } = useDriverLineFormFields();
const driverLineStore = useDriverLineStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDriverLine = ref({});
const validationError = ref(null);

// Get driver lines from store
const driverLines = computed(() => driverLineStore.driverLines);
const trashedDriverLines = computed(() => driverLineStore.trashedDriverLines);

// Fetch data on component mount
onMounted(async () => {
  try {
    await driverLineStore.fetchDriverLines();
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
  return driverLineColumns.value.filter((col) =>
    visibleColumns.value.includes(col.key)
  );
});

const filteredDriverLines = computed(() => {
  let result = driverLines.value;
  result = filterData(result, searchText.value);
  return result;
});

const paginatedDriverLines = computed(() => {
  return paginateData(
    filteredDriverLines.value,
    currentPage.value,
    itemsPerPage.value
  );
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

const openTrashedModal = () => {
  isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
  isTrashedModalOpen.value = false;
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
    console.log("✅ Driver line restored successfully!");
  } catch (error) {
    console.error("❌ Failed to restore driver line:", error);
    alert(error.message || 'Failed to restore driver line');
  }
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
  return driverLineFields.value.map(field => ({
    ...field,
    defaultValue: isEditMode.value ? selectedDriverLine.value[field.name] : field.defaultValue || ''
  }));
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
</script>

<style scoped>
.driver-line-page-container {
  max-width: 100%;
}
</style>