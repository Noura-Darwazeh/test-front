<template>
  <div class="driver-line-page-container bg-light">
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

    <!-- Form Modal for Driver Line -->
    <FormModal
      :isOpen="isModalOpen"
      :title="isEditMode ? $t('driverLine.edit') : $t('driverLine.addNew')"
      :fields="driverLineFieldsWithDefaults"
      :showImageUpload="false"
      @close="closeModal"
      @submit="handleAddDriverLine"
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
import { ref, computed, watch } from "vue";
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

const { t } = useI18n();
const router = useRouter();
const { driverLineFields } = useDriverLineFormFields();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedDriverLine = ref({});

// Simple local data - following the backend API schema
const driverLines = ref([
  {
    id: 1,
    driver_id: 1,
    driver_name: "Ahmed Hassan",
    line_work_id: 1,
    line_work_name: "Jerusalem - Ramallah Line",
    
    created_at: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    driver_id: 2,
    driver_name: "Mohammed Ali",
    line_work_id: 2,
    line_work_name: "Nablus - Jenin Line",
   
    created_at: "2024-01-16 09:15:00",
  },
  {
    id: 3,
    driver_id: 4,
    driver_name: "Fatima Khalil",
    line_work_id: 3,
    line_work_name: "Hebron - Bethlehem Line",
   
    created_at: "2024-01-17 14:20:00",
  },
  {
    id: 4,
    driver_id: 5,
    driver_name: "Omar Yousef",
    line_work_id: 4,
    line_work_name: "Gaza - Khan Yunis Line",
  
    created_at: "2024-01-18 11:45:00",
  },
]);

const trashedDriverLines = ref([
  {
    id: 101,
    driver_id: 3,
    driver_name: "Sarah Ibrahim",
    line_work_id: 5,
    line_work_name: "Tulkarm - Qalqilya Line",
    created_at: "2024-01-10 12:00:00",
  },
]);

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

const handleAddDriverLine = (driverLineData) => {
  console.log("Driver line data:", driverLineData);

  try {
    // Validate input data
    if (!driverLineData.driver_id || !driverLineData.line_work_id) {
      alert(t("driverLine.validation.missingFields"));
      return;
    }

    const driverId = parseInt(driverLineData.driver_id);
    const lineWorkId = parseInt(driverLineData.line_work_id);

    // Get driver and line work details
    const driver = getDriverById(driverId);
    const lineWork = getLineWorkById(lineWorkId);

    if (!driver || !lineWork) {
      alert(t("driverLine.validation.invalidData"));
      return;
    }

    if (isEditMode.value) {
      // Update existing driver line
      const index = driverLines.value.findIndex(dl => dl.id === selectedDriverLine.value.id);
      if (index > -1) {
        // Validate the assignment (excluding current item)
        const validationResult = validateDriverAssignment(driverId, lineWorkId, selectedDriverLine.value.id);
        if (!validationResult.valid) {
          alert(validationResult.error);
          return;
        }

        driverLines.value[index] = {
          ...driverLines.value[index],
          driver_id: driverId,
          driver_name: driver.name,
          line_work_id: lineWorkId,
          line_work_name: lineWork.name,
        };
        console.log("Driver line assignment updated successfully!");
      }
    } else {
      // Validate the assignment
      const validationResult = validateDriverAssignment(driverId, lineWorkId);
      if (!validationResult.valid) {
        alert(validationResult.error);
        return;
      }

      // Create the assignment
      const newDriverLine = createDriverLineAssignment(driverId, driver.name, lineWorkId, lineWork.name);
      driverLines.value.push(newDriverLine);
      console.log("Driver line assignment added successfully!");
    }

    closeModal();
  } catch (error) {
    console.error("Error managing driver line assignment:", error);
    alert(t("driverLine.validation.generalError"));
  }
};

const validateDriverAssignment = (driverId, lineWorkId, excludeId = null) => {
  // Check for unique driver_id + line_work_id validation
  // Only prevent duplicate assignment of same driver to same line
  const existingAssignment = driverLines.value.find(
    (dl) =>
      dl.id !== excludeId &&
      dl.driver_id === driverId &&
      dl.line_work_id === lineWorkId 
  );
  if (existingAssignment) {
    return {
      valid: false,
      error: t("driverLine.validation.duplicateAssignment")
    };
  }

  // Drivers can work on multiple lines, so no additional validation needed
  return { valid: true };
};

const getDriverById = (driverId) => {
  const drivers = [
    { id: 1, name: "Ahmed Hassan" },
    { id: 2, name: "Mohammed Ali" },
    { id: 3, name: "Sarah Ibrahim" },
    { id: 4, name: "Fatima Khalil" },
    { id: 5, name: "Omar Yousef" },
  ];
  return drivers.find((d) => d.id === driverId);
};

const getLineWorkById = (lineWorkId) => {
  const lineWorks = [
    { id: 1, name: "Jerusalem - Ramallah Line" },
    { id: 2, name: "Nablus - Jenin Line" },
    { id: 3, name: "Hebron - Bethlehem Line" },
    { id: 4, name: "Gaza - Khan Yunis Line" },
    { id: 5, name: "Tulkarm - Qalqilya Line" },
  ];
  return lineWorks.find((lw) => lw.id === lineWorkId);
};

const createDriverLineAssignment = (driverId, driverName, lineWorkId, lineWorkName) => {
  return {
    id: Math.max(...driverLines.value.map((dl) => dl.id), 0) + 1,
    driver_id: driverId,
    driver_name: driverName,
    line_work_id: lineWorkId,
    line_work_name: lineWorkName,
    
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
  };
};

const handleRestoreDriverLine = (driverLine) => {
  console.log("Restoring driver line:", driverLine);
  const index = trashedDriverLines.value.findIndex(
    (dl) => dl.id === driverLine.id
  );
  if (index > -1) {
    trashedDriverLines.value.splice(index, 1);
  }
  console.log("Driver line assignment has been restored successfully!");
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
