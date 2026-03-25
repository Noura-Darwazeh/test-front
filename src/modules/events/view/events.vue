<template>
  <div class="user-page-container bg-light">
    <EventsHeader
      v-model="searchText"
      :searchPlaceholder="$t('events.searchPlaceholder')"
      :data="eventsStore.events"
      :columns="columns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="true"
      :addButtonText="$t('events.addNew')"
      @add-click="openAddModal"
      @refresh-click="handleRefresh"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="eventsStore.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Error -->
        <div v-else-if="eventsStore.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ eventsStore.error }}
        </div>

        <!-- Table -->
        <DataTable
          v-else
          :columns="filteredColumns"
          :data="filteredEvents"
          :actionsLabel="$t('common.actions')"
        >
          <template #actions="{ row }">
            <ActionsDropdown
              :row="row"
              :editLabel="$t('common.edit')"
              :deleteLabel="$t('common.delete')"
              :showEdit="true"
              :showDelete="true"
              :showDetails="false"
              @edit="openEditModal"
              @delete="handleDelete"
            />
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <FormModal
      :isOpen="isFormModalOpen"
      :title="isEditMode ? $t('events.edit') : $t('events.addNew')"
      :fields="formFields"
      :showImageUpload="false"
      :serverErrors="formErrors"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <SuccessModal :isOpen="isSuccessModalOpen" :title="$t('common.success')" :message="successMessage" @close="closeSuccessModal" />
    <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import DataTable from "../../../components/shared/DataTable.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import ErrorModal from "../../../components/shared/ErrorModal.vue";
import EventsHeader from "../components/eventsHeader.vue";
import { useNotificationEventsStore } from "@/stores/notificationEvents.js";
import { filterData } from "@/utils/dataHelpers";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { useErrorModal } from "../../../composables/useErrorModal.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";

const { t } = useI18n();
const eventsStore = useNotificationEventsStore();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();

const searchText = ref("");
const isFormModalOpen = ref(false);
const isEditMode = ref(false);
const selectedEvent = ref(null);
const formErrors = ref({});

const columns = ref([
  { key: "id",      label: computed(() => t("events.id")),      visible: true },
  { key: "key",     label: computed(() => t("events.key")),     visible: true },
  { key: "en_name", label: computed(() => t("events.enName")), visible: true },
  { key: "ar_name", label: computed(() => t("events.arName")), visible: true },
]);

const visibleColumns = ref(columns.value.filter((c) => c.visible).map((c) => c.key));
const filteredColumns = computed(() => columns.value.filter((c) => visibleColumns.value.includes(c.key)));

const filteredEvents = computed(() =>
  filterData(eventsStore.events, searchText.value, ["key", "en_name", "ar_name"])
);

const formFields = computed(() => [
  {
    name: "en_name",
    label: t("events.enName"),
    type: "text",
    required: true,
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedEvent.value?.en_name : "",
  },
  {
    name: "ar_name",
    label: t("events.arName"),
    type: "text",
    required: true,
    colClass: "col-md-6",
    defaultValue: isEditMode.value ? selectedEvent.value?.ar_name : "",
  },
  {
    name: "key",
    label: t("events.key"),
    type: "text",
    required: true,
    colClass: "col-md-6",
    placeholder: "e.g. create_order",
    defaultValue: isEditMode.value ? selectedEvent.value?.key : "",
  },
]);

const openAddModal = () => {
  isEditMode.value = false;
  selectedEvent.value = null;
  formErrors.value = {};
  isFormModalOpen.value = true;
};

const openEditModal = (event) => {
  isEditMode.value = true;
  selectedEvent.value = event;
  formErrors.value = {};
  isFormModalOpen.value = true;
};

const closeModal = () => {
  isFormModalOpen.value = false;
  selectedEvent.value = null;
};

const handleSubmit = async (data) => {
  formErrors.value = {};
  const payload = {
    en_name: data.en_name,
    ar_name: data.ar_name,
    key: data.key,
  };
  try {
    if (isEditMode.value) {
      await eventsStore.updateEvent(selectedEvent.value.id, payload);
      showSuccess(t("events.updateSuccess"));
    } else {
      await eventsStore.addEvent(payload);
      showSuccess(t("events.addSuccess"));
    }
    closeModal();
  } catch (error) {
    const normalized = normalizeServerErrors(error);
    if (Object.keys(normalized).length > 0) {
      formErrors.value = normalized;
    } else {
      showError(error.message || t("common.unexpectedError"));
    }
  }
};

const handleDelete = async (event) => {
  try {
    await eventsStore.deleteEvent(event.id);
    showSuccess(t("events.deleteSuccess"));
  } catch (error) {
    showError(error.message || t("common.unexpectedError"));
  }
};

const handleRefresh = async () => {
  await eventsStore.fetchEvents();
};

onMounted(async () => {
  await eventsStore.fetchEvents();
});
</script>
