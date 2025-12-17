<template>
    <div class="user-page-container bg-light">
        <CompanyHeader v-model="searchText" :searchPlaceholder="$t('company.searchPlaceholder')" :data="companys"
            groupKey="type" v-model:groupModelValue="selectedGroups" :groupLabel="$t('company.filterByType')"
            translationKey="companyTypes" :columns="companyColumns" v-model:visibleColumns="visibleColumns"
            :showAddButton="true" :addButtonText="$t('company.addNew')" @add-click="openAddModal"
            @trashed-click="openTrashedModal" />

        <div class="card border-0">
            <div class="card-body p-0">
                <DataTable :columns="filteredColumns" :data="paginatedcompanys" :actionsLabel="$t('company.actions')">
                    <template #actions="{ row }">
                        <ActionsDropdown :row="row" :editLabel="$t('company.edit')"
                            :detailsLabel="$t('company.details')" @edit="openEditModal" @details="openDetailsModal" />
                    </template>
                </DataTable>
                <div class="px-3 pt-1 pb-2 bg-light">
                    <Pagination :totalItems="filteredcompanys.length" :itemsPerPage="itemsPerPage"
                        :currentPage="currentPage" @update:currentPage="(page) => currentPage = page" />
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit company -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('company.edit') : $t('company.addNew')"
            :fields="companyFields" :showImageUpload="true" :imageRequired="false"
            :imageUploadLabel="$t('company.form.uploadImage')" @close="closeFormModal" @submit="handleSubmitcompany" />

        <!-- Details Modal with Branches and Lines -->
        <DetailsModal :isOpen="isDetailsModalOpen" :title="$t('company.details')" :data="selectedcompany"
            :fields="detailsFields" @close="closeDetailsModal">
            <!-- Custom slot for branches and lines -->
            <template #after-details>
                <div class="mt-4">
                    <!-- Branches Section -->
                    <div class="mb-4">
                        <h6 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                class="bi bi-building" viewBox="0 0 16 16">
                                <path
                                    d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                <path
                                    d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                            </svg>
                            {{ $t('company.branches.title') }}
                        </h6>
                        <div v-if="selectedcompany.branches && selectedcompany.branches.length > 0" class="row g-3">
                            <div v-for="branch in selectedcompany.branches" :key="branch.id" class="col-md-6">
                                <div class="card border-0 shadow-sm h-100">
                                    <div class="card-body p-3">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    fill="var(--primary-color)" class="bi bi-geo-alt-fill"
                                                    viewBox="0 0 16 16">
                                                    <path
                                                        d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                                                </svg>
                                            </div>
                                            <div class="flex-grow-1">
                                                <h6 class="mb-1 fw-semibold text-dark">{{ branch.name }}</h6>
                                                <p class="mb-0 text-muted small">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                        fill="currentColor" class="bi bi-pin-map me-1"
                                                        viewBox="0 0 16 16">
                                                        <path fill-rule="evenodd"
                                                            d="M3.1 11.2a.5.5 0 0 1 .4-.2H6a.5.5 0 0 1 0 1H3.75L1.5 15h13l-2.25-3H10a.5.5 0 0 1 0-1h2.5a.5.5 0 0 1 .4.2l3 4a.5.5 0 0 1-.4.8H.5a.5.5 0 0 1-.4-.8z" />
                                                        <path fill-rule="evenodd"
                                                            d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999z" />
                                                    </svg>
                                                    {{ branch.location }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center text-muted py-4 bg-light rounded-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                                class="bi bi-building opacity-25 mb-2" viewBox="0 0 16 16">
                                <path
                                    d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                <path
                                    d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm11 0H3v14h3v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V15h3z" />
                            </svg>
                            <p class="mb-0">{{ $t('company.branches.empty') }}</p>
                        </div>
                    </div>

                    <!-- Lines Section -->
                    <div>
                        <h6 class="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                class="bi bi-diagram-3" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                    d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5z" />
                            </svg>
                            {{ $t('company.lines.title') }}
                        </h6>
                        <div v-if="selectedcompany.lines && selectedcompany.lines.length > 0" class="row g-3">
                            <div v-for="line in selectedcompany.lines" :key="line.id" class="col-md-6">
                                <div class="card border-0 shadow-sm h-100">
                                    <div class="card-body p-3">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="bg-success bg-opacity-10 rounded-circle p-2 flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    fill="var(--color-success)" class="bi bi-bezier2"
                                                    viewBox="0 0 16 16">
                                                    <path fill-rule="evenodd"
                                                        d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5h4.134a1 1 0 1 1 0 1h-2.01q.269.27.484.605C8.246 5.097 8.5 6.459 8.5 8c0 1.993.257 3.092.713 3.7.356.476.895.721 1.787.784A1.5 1.5 0 0 1 12.5 11h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5H6.866a1 1 0 1 1 0-1h1.711a3 3 0 0 1-.165-.2C7.743 11.407 7.5 10.007 7.5 8c0-1.46-.246-2.597-.733-3.355-.39-.605-.952-1-1.767-1.112A1.5 1.5 0 0 1 3.5 5h-1A1.5 1.5 0 0 1 1 3.5zM2.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm10 10a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                </svg>
                                            </div>
                                            <div class="flex-grow-1">
                                                <h6 class="mb-1 fw-semibold text-dark">{{ line.name }}</h6>
                                                <p class="mb-0">
                                                    <span class="badge" :class="getRegionBadgeClass(line.region)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                            fill="currentColor" class="bi bi-globe me-1"
                                                            viewBox="0 0 16 16">
                                                            <path
                                                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h3.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
                                                        </svg>
                                                        {{ getRegionName(line.region) }}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center text-muted py-4 bg-light rounded-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor"
                                class="bi bi-diagram-3 opacity-25 mb-2" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                    d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5z" />
                            </svg>
                            <p class="mb-0">{{ $t('company.lines.empty') }}</p>
                        </div>
                    </div>
                </div>
            </template>
        </DetailsModal>

        <!-- Trashed companys Modal -->
        <TrashedItemsModal :isOpen="isTrashedModalOpen" :title="$t('company.trashed.title')"
            :emptyMessage="$t('company.trashed.empty')" :columns="trashedColumns" :trashedItems="trashedcompanys"
            @close="closeTrashedModal" @restore="handleRestorecompany" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import CompanyHeader from "../components/companyHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import TrashedItemsModal from "../../../components/shared/TrashedItemsModal.vue";

const { t } = useI18n();
const searchText = ref("");
const selectedGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isTrashedModalOpen = ref(false);
const isEditMode = ref(false);
const selectedcompany = ref({});

const companys = ref([
    {
        id: 1,
        name: "Ali Ahmed",
        type: 'delivery company',
        branches: [
            { id: 1, name: "Branch Nablus", location: "Nablus, Palestine" },
            { id: 2, name: "Branch Ramallah", location: "Ramallah, Palestine" }
        ],
        lines: [
            { id: 1, name: "Line North", region: "palestine" },
            { id: 2, name: "Line South", region: "palestine" }
        ]
    },
    {
        id: 2,
        name: "Sara Mohammad",
        type: 'admin company',
        branches: [
            { id: 3, name: "Branch Amman", location: "Amman, Jordan" }
        ],
        lines: [
            { id: 3, name: "Line Central", region: "jordan" }
        ]
    },
    {
        id: 3,
        name: "Ahmed Hassan",
        type: 'delivery company',
        branches: [
            { id: 4, name: "Branch Jenin", location: "Jenin, Palestine" },
            { id: 5, name: "Branch Tulkarm", location: "Tulkarm, Palestine" },
            { id: 6, name: "Branch Hebron", location: "Hebron, Palestine" }
        ],
        lines: [
            { id: 4, name: "Line East", region: "palestine" },
            { id: 5, name: "Line West", region: "palestine" }
        ]
    },
]);

const trashedcompanys = ref([
    {
        id: 4,
        name: "Trashed",
        type: 'delivery company',
        branches: [],
        lines: []
    },
]);

// Helper functions for region display
const getRegionName = (region) => {
    return t(`regions.${region}`);
};

const getRegionBadgeClass = (region) => {
    return region === 'palestine'
        ? 'bg-success bg-opacity-10 text-success'
        : 'bg-info bg-opacity-10 text-info';
};

// company Form Fields 
const companyFields = computed(() => [
    {
        name: 'name',
        label: t('company.form.name'),
        type: 'text',
        required: true,
        placeholder: t('company.form.namePlaceholder'),
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedcompany.value.name : '',
        validate: (value) => {
            if (value.length > 255) return t('company.validation.nameMax');
            return null;
        }
    },

    {
        name: 'type',
        label: t('company.form.type'),
        type: 'select',
        required: true,
        options: [
            { value: 'admin company', label: t('company.form.types.delivery') },
            { value: 'delivery company', label: t('company.form.types.admin') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedcompany.value.type : ''
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('company.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('company.name'), colClass: 'col-md-6' },
    { key: 'type', label: t('company.type'), translationKey: 'companyTypes', colClass: 'col-md-6' },
]);

const companyColumns = ref([
    { key: "id", label: t("company.id"), sortable: true },
    { key: "name", label: t("company.name"), sortable: true },
    { key: "type", label: t("company.type"), sortable: false },
]);

const trashedColumns = computed(() => [
    { key: "id", label: t("company.id") },
    { key: "name", label: t("company.name") },
    { key: "type", label: t("company.type") },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return companyColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

const filteredcompanys = computed(() => {
    let result = companys.value;
    result = filterByGroups(result, selectedGroups.value, "type");
    result = filterData(result, searchText.value);
    return result;
});

const paginatedcompanys = computed(() => {
    return paginateData(
        filteredcompanys.value,
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
    selectedcompany.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (company) => {
    isEditMode.value = true;
    selectedcompany.value = { ...company };
    isFormModalOpen.value = true;
};

// Details Modal
const openDetailsModal = (company) => {
    selectedcompany.value = { ...company };
    isDetailsModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditMode.value = false;
    selectedcompany.value = {};
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedcompany.value = {};
};

const openTrashedModal = () => {
    isTrashedModalOpen.value = true;
};

const closeTrashedModal = () => {
    isTrashedModalOpen.value = false;
};

const handleSubmitcompany = (companyData) => {
    if (isEditMode.value) {
        // Update existing company
        const index = companys.value.findIndex(d => d.id === selectedcompany.value.id);
        if (index > -1) {
            companys.value[index] = {
                ...companys.value[index],
                name: companyData.name,
                username: companyData.username,
                email: companyData.email || '',
                phone_number: companyData.phone_number,
                status: companyData.status || 'available',
                type: companyData.type,
                branch_name: companyData.branch_name,
                vehicle_number: companyData.vehicle_number,
                image: companyData.imagePreview || companys.value[index].image
            };
            console.log('company updated successfully!');
        }
    } else {
        // Add new company
        const newcompany = {
            id: companys.value.length + 1,
            name: companyData.name,
            type: companyData.type,
            image: companyData.imagePreview || 'path/test',
            branches: [],
            lines: []
        };
        companys.value.push(newcompany);
        console.log('company added successfully!');
    }
};

const handleRestorecompany = (company) => {
    companys.value.push(company);
    const index = trashedcompanys.value.findIndex(d => d.id === company.id);
    if (index > -1) {
        trashedcompanys.value.splice(index, 1);
    }
    console.log("company restored successfully!");
};
</script>

<style scoped>
.user-page-container {
    max-width: 100%;
}

.card:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
}
</style>