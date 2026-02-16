<template>
  <div class="driver-steps-container bg-light">
    <DriverStepsHeader
      v-model="searchText"
      :searchPlaceholder="$t('driverSteps.searchPlaceholder')"
      :data="steps"
      groupKey="status"
      v-model:groupModelValue="selectedGroups"
      :groupLabel="$t('driverSteps.filterByStatus')"
      translationKey="driverSteps.status"
      :columns="stepsColumns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="false"
      @refresh-click="handleRefresh"
    />

    <!-- Tabs Navigation -->
    <div class="card border-0 mb-3">
      <div class="card-body p-0">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'ongoing' }"
              @click="switchTab('ongoing')"
            >
              <i class="bi bi-hourglass-split me-2"></i> 
              {{ $t('driverSteps.tabs.ongoing') }}
              <span v-if="ongoingCount > 0" class="badge bg-primary ms-2">{{ ongoingCount }}</span>
            </button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link" 
              :class="{ active: activeTab === 'all' }" 
              @click="switchTab('all')"
            >
              <i class="bi bi-list-task me-2"></i> 
              {{ $t('driverSteps.tabs.all') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="stepsStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t("common.loading") }}</span>
          </div>
          <p class="mt-2">{{ $t("common.loading") }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="stepsStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ stepsStore.error }}
        </div>

        <!-- Data Table -->
        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            :actionsLabel="$t('driverSteps.actions')"
            :showCheckbox="false"
          >
            <template #cell-status="{ row }">
              <StatusBadge :status="row.status" type="workPlan" />
            </template>

            <template #cell-date="{ row }">
              {{ formatDate(row.date) }}
            </template>

            <template #cell-created_at="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>

            <template #actions="{ row }">
              <ActionsDropdown
                :row="row"
                :detailsLabel="$t('driverSteps.details')"
                :showEdit="false"
                :showDelete="false"
                :showDetails="true"
                @details="openDetailsModal"
              />
            </template>
          </DataTable>
          
          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="stepsStore.pagination.total"
              :itemsPerPage="itemsPerPage"
              :currentPage="currentPage"
              :totalPages="stepsStore.pagination.lastPage"
              @update:currentPage="(page) => (currentPage = page)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <DetailsModal
      :isOpen="isDetailsModalOpen"
      :title="$t('driverSteps.stepDetails')"
      :data="selectedStep"
      :fields="detailsFields"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import StatusBadge from "../../../components/shared/StatusBadge.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { useI18n } from "vue-i18n";
import DriverStepsHeader from "../components/driverStepsHeader.vue";
import { useDriverStepsStore } from "../stores/driverStepsStore.js";
import apiServices from "@/services/apiServices.js";

const { t, locale } = useI18n();
const stepsStore = useDriverStepsStore();

const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const skipNextPageWatch = ref(false);
const isDetailsModalOpen = ref(false);
const selectedStep = ref({});
const activeTab = ref('ongoing'); // Default to ongoing tab

const itemsPerPage = computed(() => stepsStore.pagination.perPage || 10);

// Get steps from store
const steps = computed(() => stepsStore.steps);

// Filter steps based on active tab - FRONTEND FILTERING
const filteredSteps = computed(() => {
  if (activeTab.value === 'ongoing') {
    // Exclude done and failed
    return steps.value.filter(step => 
      !['done', 'failed'].includes(step.status)
    );
  }
  // All tab - show everything
  return steps.value;
});

// Calculate ongoing count (exclude done and failed)
const ongoingCount = computed(() => {
  return filteredSteps.value.length;
});

const stepsColumns = computed(() => [
  { key: "__index", label: "#", sortable: false, isIndex: true },
  { key: "name", label: t("driverSteps.name"), sortable: true },
  { key: "driver_name", label: t("driverSteps.driver"), sortable: true },
  { key: "status", label: t("driverSteps.status"), sortable: true },
  { key: "date", label: t("driverSteps.date"), sortable: true },
  { key: "created_at", label: t("driverSteps.createdAt"), sortable: true },
]);

const visibleColumns = ref([]);

// Details fields for modal
const detailsFields = computed(() => [
  { key: "id", label: t("driverSteps.id"), colClass: "col-md-6" },
  { key: "name", label: t("driverSteps.name"), colClass: "col-md-6" },
  { key: "driver_name", label: t("driverSteps.driver"), colClass: "col-md-6" },
  { key: "status", label: t("driverSteps.status"), colClass: "col-md-6", translationKey: "driverSteps.status" },
  { key: "date", label: t("driverSteps.date"), colClass: "col-md-6" },
  { key: "created_at", label: t("driverSteps.createdAt"), colClass: "col-md-6" },
  { key: "notes", label: t("driverSteps.notes"), colClass: "col-md-12" },
]);

// Fetch data on component mount
onMounted(async () => {
  try {
    await fetchStepsPage(1);
  } catch (error) {
    console.error("❌ Failed to load data:", error);
  }
});

// Watch for page changes
watch(currentPage, async (newPage) => {
  if (skipNextPageWatch.value) {
    skipNextPageWatch.value = false;
    return;
  }
  try {
    await fetchStepsPage(newPage);
  } catch (err) {
    console.error("Failed to load page:", err);
  }
});

// Switch tab function
const switchTab = async (tab) => {
  activeTab.value = tab;
  skipNextPageWatch.value = true;
  currentPage.value = 1;
  
  try {
    await fetchStepsPage(1);
  } catch (error) {
    console.error("Failed to switch tabs:", error);
  }
};

const handleRefresh = async () => {
  try {
    await fetchStepsPage(currentPage.value);
  } catch (error) {
    console.error("❌ Failed to refresh steps:", error);
  }
};

const filteredColumns = computed(() => {
  return stepsColumns.value.filter((col) => visibleColumns.value.includes(col.key));
});

const buildStepsFilters = () => {
  const filters = {};
  const trimmedSearch = searchText.value.trim();
  if (trimmedSearch) {
    filters.search = trimmedSearch;
  }
  
  // Apply status filter only in 'all' tab when manually selected
  if (activeTab.value === 'all' && selectedGroups.value.length > 0) {
    filters.status =
      selectedGroups.value.length === 1
        ? selectedGroups.value[0]
        : selectedGroups.value.join(",");
  }
  
  return filters;
};

const fetchStepsPage = async (page = 1) => {
  const filters = buildStepsFilters();
  await stepsStore.fetchSteps({
    page,
    perPage: itemsPerPage.value,
    filters,
  });
};

// Server returns paginated data, then filter on frontend
const paginatedData = computed(() => filteredSteps.value);

watch([searchText, selectedGroups], async () => {
  if (currentPage.value !== 1) {
    skipNextPageWatch.value = true;
    currentPage.value = 1;
  }
  try {
    await fetchStepsPage(1);
  } catch (error) {
    console.error("❌ Failed to apply filters:", error);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Open details modal and fetch step details
const openDetailsModal = async (row) => {
  try {
    const response = await apiServices.getWorkPlanStepById(row.id);
    
    if (response.data?.data) {
      const stepData = response.data.data;
      
      // Format the data for display
      selectedStep.value = {
        id: stepData.id,
        name: stepData.name || 'N/A',
        driver_name: stepData.driver_name || stepData.driver?.[1] || 'N/A',
        status: stepData.status || 'N/A',
        date: formatDate(stepData.date),
        created_at: formatDateTime(stepData.created_at),
        notes: stepData.notes || t('driverSteps.noNotes'),
      };
      
      isDetailsModalOpen.value = true;
    }
  } catch (error) {
    console.error("❌ Failed to fetch step details:", error);
    alert(error.message || t('common.errorLoadingData'));
  }
};

const closeDetailsModal = () => {
  isDetailsModalOpen.value = false;
  selectedStep.value = {};
};
</script>

<style scoped>
.driver-steps-container {
  max-width: 100%;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  padding: 1rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background-color: transparent;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>