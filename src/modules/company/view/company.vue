<template>
    <div class="user-page-container bg-light">
        <div v-if="!isSuperAdmin" class="alert alert-warning m-3">
            {{ $t('common.accessDenied') }}
        </div>
        <template v-else>
        <!-- Tabs for Active and Trashed Companies -->
        <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'"
                    style="cursor: pointer">
                    {{ $t('common.active') }}
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link trashed-tab" :class="{ active: activeTab === 'trashed' }" @click="activeTab = 'trashed'"
                    style="cursor: pointer">
                    {{ $t('company.trashed.title') }}
                </a>
            </li>
        </ul>

        <!-- Tab Content -->
        <div v-if="activeTab === 'active'">
            <!-- Active Companies Tab -->
            <CompanyHeader v-model="searchText" :searchPlaceholder="$t('company.searchPlaceholder')" :data="companies"
                groupKey="type" v-model:groupModelValue="selectedGroups" :groupLabel="$t('company.filterByType')"
                translationKey="companyTypes"
                groupKey2="shared_line" v-model:groupModelValue2="selectedSharedLineGroups"
                :groupLabel2="$t('common.filterBySharedLine')" translationKey2="sharedLineOptions"
                :columns="companyColumns" v-model:visibleColumns="visibleColumns"
                :showActiveFilter="true" :activeFilterValue="activeStatusFilter" @update:activeFilterValue="activeStatusFilter = $event"
                :showAddButton="true" :addButtonText="$t('company.addNew')" @add-click="openAddModal" @refresh-click="handleRefresh"
                :showTrashedButton="false" />

            <!-- Bulk Actions Bar for Active Tab -->
            <BulkActionsBar :selectedCount="selectedRows.length" entityName="company" :actions="bulkActions"
                :loading="bulkActionLoading" @action="handleBulkAction" />

            <div class="card border-0">
                <div class="card-body p-0">
                    <DataTable :columns="filteredColumns" :data="paginatedcompanies" v-model="selectedRows"
                        :actionsLabel="$t('company.actions')"
                        :rowClass="(row) => row.is_active === 0 ? 'row-inactive' : ''">
                        <!-- Shared Line Column -->
                        <template #cell-shared_line="{ row }">
                            <SharedLineToggle 
                                :companyId="row.id"
                                :sharedLine="row.shared_line ?? 0"
                                @updated="handleSharedLineUpdate"
                            />
                        </template>
                        
                        <template #actions="{ row }">
                            <ActionsDropdown :row="row" :editLabel="$t('company.edit')"
                                :detailsLabel="$t('company.details')" :deleteLabel="$t('company.delete')"
                                :showActivate="row.is_active === 0" :showDeactivate="row.is_active === 1"
                                :activateLabel="$t('common.activate')" :deactivateLabel="$t('common.deactivate')"
                                @edit="openEditModal" @details="openDetailsModal" @delete="handleDeleteCompany"
                                @activate="handleActivate" @deactivate="handleDeactivate" />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination :totalItems="companyStore.companiesPagination.total" :itemsPerPage="itemsPerPage"
                            :currentPage="currentPage" :totalPages="companyStore.companiesPagination.lastPage"
                            @update:currentPage="(page) => currentPage = page" />
                    </div>
                </div>
            </div>
        </div>

        <div v-else>
            <!-- Trashed Companies Tab -->
            <CompanyHeader v-model="trashedSearchText" :searchPlaceholder="$t('company.searchPlaceholder')"
                :data="trashedCompanies" groupKey="type" v-model:groupModelValue="trashedSelectedGroups"
                :groupLabel="$t('company.filterByType')" translationKey="companyTypes" :columns="companyColumns"
                v-model:visibleColumns="visibleColumns" :showAddButton="false" :showTrashedButton="false" @refresh-click="handleRefresh" />

            <!-- Bulk Actions Bar for Trashed Tab -->
            <BulkActionsBar :selectedCount="selectedRows.length" entityName="company" :actions="bulkActions"
                :loading="bulkActionLoading" @action="handleBulkAction" />

            <div class="card border-0">
                <div class="card-body p-0">
                    <DataTable :columns="filteredColumns" :data="paginatedTrashedCompanies" v-model="selectedRows"
                        :actionsLabel="$t('company.actions')">
                        <!-- Shared Line Column for Trashed -->
                        <template #cell-shared_line="{ row }">
                            <SharedLineToggle 
                                :companyId="row.id"
                                :sharedLine="row.shared_line ?? 0"
                                @updated="handleSharedLineUpdate"
                            />
                        </template>
                        
                        <template #actions="{ row }">
                            <ActionsDropdown :row="row" :restoreLabel="$t('company.trashed.restore')"
                                :deleteLabel="$t('company.trashed.delete')" :showEdit="false" :showDetails="false"
                                :showRestore="true" @restore="handleRestoreCompany" @delete="handleForceDeleteCompany" />
                        </template>
                    </DataTable>
                    <div class="px-3 pt-1 pb-2 bg-light">
                        <Pagination :totalItems="companyStore.trashedPagination.total" :itemsPerPage="itemsPerPage"
                            :currentPage="trashedCurrentPage" :totalPages="companyStore.trashedPagination.lastPage"
                            @update:currentPage="(page) => trashedCurrentPage = page" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Dynamic Form Modal for Add/Edit company -->
        <FormModal :isOpen="isFormModalOpen" :title="isEditMode ? $t('company.edit') : $t('company.addNew')"
            :fields="companyFields" :showImageUpload="false" :serverErrors="formErrors"
            @close="closeFormModal" @submit="handleSubmitcompany" />

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

        <!-- Confirmation Modal for Single Delete -->
        <ConfirmationModal :isOpen="isDeleteConfirmOpen" :title="$t('common.confirm')"
            :message="deleteConfirmMessage" :confirmText="$t('common.confirm')" :cancelText="$t('common.cancel')"
            @confirm="executeDelete" @close="cancelDelete" />

        <!-- Bulk Action Confirmation Modal -->
        <ConfirmationModal :isOpen="isBulkConfirmOpen" :title="bulkConfirmTitle" :message="bulkConfirmMessage"
            :confirmText="$t('common.confirm')" :cancelText="$t('common.cancel')" @confirm="executeBulkAction"
            @close="cancelBulkAction" />
        <ErrorModal :isOpen="isErrorModalOpen" :message="errorMessage" @close="closeErrorModal" />
        <SuccessModal :isOpen="isSuccessModalOpen" :title="$t('common.success')" :message="successMessage" @close="closeSuccessModal" />
        </template>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import DataTable from "../../../components/shared/DataTable.vue";
import Pagination from "../../../components/shared/Pagination.vue";
import ActionsDropdown from "../../../components/shared/Actions.vue";
import DetailsModal from "../../../components/shared/DetailsModal.vue";
import BulkActionsBar from "../../../components/shared/BulkActionsBar.vue";
import ConfirmationModal from "../../../components/shared/ConfirmationModal.vue";
import SharedLineToggle from "../../../components/shared/SharedLineToggle.vue";
import { filterData, filterByGroups } from "@/utils/dataHelpers";
import { useI18n } from "vue-i18n";
import CompanyHeader from "../components/companyHeader.vue";
import FormModal from "../../../components/shared/FormModal.vue";
import { useCompanyManagementStore } from "../store/companyManagement.js";
import apiServices from "@/services/apiServices.js";
import { normalizeServerErrors } from "@/utils/formErrors.js";
import { useAuthStore } from "@/stores/auth.js";
import ErrorModal from "../../../components/shared/ErrorModal.vue";
import SuccessModal from "../../../components/shared/SuccessModal.vue";
import { useErrorModal } from "../../../composables/useErrorModal.js";
import { useSuccessModal } from "../../../composables/useSuccessModal.js";
import { useActiveToggle } from "../../../composables/useActiveToggle.js";

const { t } = useI18n();
const { isErrorModalOpen, errorMessage, showError, closeErrorModal } = useErrorModal();
const { isSuccessModalOpen, successMessage, showSuccess, closeSuccessModal } = useSuccessModal();
const companyStore = useCompanyManagementStore();
const authStore = useAuthStore();
const isSuperAdmin = computed(
    () => (authStore.userRole || "").toLowerCase() === "superadmin",
);

// Tab Management
const activeTab = ref('active');

// Search and Filters - Active Tab
const searchText = ref("");
const selectedGroups = ref([]);
const activeStatusFilter = ref("");
const selectedSharedLineGroups = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const skipNextPageWatch = ref(false);

// Search and Filters - Trashed Tab
const trashedSearchText = ref("");
const trashedSelectedGroups = ref([]);
const trashedCurrentPage = ref(1);
const skipNextTrashedPageWatch = ref(false);

// Modal States
const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isEditMode = ref(false);
const selectedcompany = ref({});
const formErrors = ref({});

// Selection and Bulk Actions
const selectedRows = ref([]);
const bulkActionLoading = ref(false);
const isBulkConfirmOpen = ref(false);
const pendingBulkAction = ref(null);

// Single Delete Confirmation
const isDeleteConfirmOpen = ref(false);
const pendingDeleteCompany = ref(null);
const isForceDelete = ref(false);

// Active Toggle
const refreshCompanies = () => companyStore.fetchCompanies({ page: currentPage.value, perPage: itemsPerPage.value, filters: activeStatusFilter.value !== '' ? { is_active: activeStatusFilter.value } : {} });
const { handleActivate, handleDeactivate, handleBulkActivate, handleBulkDeactivate } = useActiveToggle("companies", refreshCompanies, { showSuccess, showError });

// Computed - Companies from Store
const companies = computed(() => companyStore.companies);
const trashedCompanies = computed(() => companyStore.trashedCompanies);
const loading = computed(() => companyStore.loading);
const trashedLoading = computed(() => companyStore.trashedLoading);

// Helper functions for region display
const getRegionName = (region) => {
    return t(`regions.${region}`);
};

const getRegionBadgeClass = (region) => {
    return region === 'palestine'
        ? 'bg-success bg-opacity-10 text-success'
        : 'bg-info bg-opacity-10 text-info';
};

// company Form Fields - UPDATED WITH BRANCHES
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
            { value: 'delivery company', label: t('company.form.types.delivery') },
            { value: 'admin company', label: t('company.form.types.admin') },
            { value: 'customer company', label: t('company.form.types.customer') },
        ],
        colClass: 'col-md-6',
        defaultValue: isEditMode.value ? selectedcompany.value.type : ''
    },

    {
        name: 'branches',
        label: t('company.form.branches'),
        type: 'branchRows',
        required: false,
        colClass: 'col-12',
        branchLabel: t('company.form.branchName'),
        locationLabel: t('common.locateOnMap'),
        defaultValue: isEditMode.value && selectedcompany.value.branches && selectedcompany.value.branches.length > 0
            ? selectedcompany.value.branches.map(b => ({
                name: b.name,
                latitude: b.latitude ?? b.location?.latitude ?? '',
                longitude: b.longitude ?? b.location?.longitude ?? ''
            }))
            : [{ name: '', latitude: '', longitude: '' }]
    },
]);

// Details Fields
const detailsFields = computed(() => [
    { key: 'id', label: t('company.id'), colClass: 'col-md-6' },
    { key: 'name', label: t('company.name'), colClass: 'col-md-6' },
    { key: 'type', label: t('company.type'), translationKey: 'companyTypes', colClass: 'col-md-6' },
    { 
        key: 'shared_line', 
        label: t('company.sharedLine'), 
        colClass: 'col-md-6',
        translator: (value) => value === 1 ? t('company.sharedLineEnabled') : t('company.sharedLineDisabled')
    },
]);

const companyColumns = ref([
    { key: "__index", label: "#", sortable: false, isIndex: true },
    { key: "name", label: t("company.name"), sortable: true },
    { key: "type", label: t("company.type"), sortable: false },
    { key: "shared_line", label: t("company.sharedLine"), sortable: false },
    { key: "is_active", label: t("common.status"), sortable: false, component: "StatusBadge", componentProps: { statusMap: { 1: "active", 0: "inactive" } } },
]);

const visibleColumns = ref([]);

const filteredColumns = computed(() => {
    return companyColumns.value.filter((col) =>
        visibleColumns.value.includes(col.key)
    );
});

// Active Companies Filtering (server handles pagination)
const filteredcompanies = computed(() => {
    let result = companies.value;
    result = filterByGroups(result, selectedGroups.value, "type");
    result = filterByGroups(result, selectedSharedLineGroups.value, "shared_line");
    result = filterData(result, searchText.value);
    return result;
});

// Server already returns paginated data
const paginatedcompanies = computed(() => {
    return filteredcompanies.value;
});

// Trashed Companies Filtering (server handles pagination)
const filteredTrashedCompanies = computed(() => {
    let result = trashedCompanies.value;
    result = filterByGroups(result, trashedSelectedGroups.value, "type");
    result = filterData(result, trashedSearchText.value);
    return result;
});

// Server already returns paginated data
const paginatedTrashedCompanies = computed(() => {
    return filteredTrashedCompanies.value;
});

// Bulk Actions Configuration
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
                label: t('company.bulkDelete'),
                bgColor: 'var(--color-danger)',
            },
        ];
    } else {
        return [
            {
                id: 'restore',
                label: t('company.bulkRestore'),
                bgColor: 'var(--color-success)',
            },
            {
                id: 'forceDelete',
                label: t('company.trashed.delete'),
                bgColor: 'var(--color-danger)',
            },
        ];
    }
});

// Bulk Confirmation Messages
const bulkConfirmTitle = computed(() => {
    if (pendingBulkAction.value === 'delete' || pendingBulkAction.value === 'forceDelete') {
        return t('common.bulkDeleteConfirmTitle');
    } else if (pendingBulkAction.value === 'restore') {
        return t('common.bulkRestoreConfirmTitle');
    }
    return '';
});

const bulkConfirmMessage = computed(() => {
    if (!pendingBulkAction.value) return '';

    const entity = selectedRows.value.length === 1
        ? t('company.entitySingular')
        : t('company.entityPlural');

    if (pendingBulkAction.value === 'delete' || pendingBulkAction.value === 'forceDelete') {
        return t('common.bulkDeleteConfirmMessage', {
            count: selectedRows.value.length,
            entity
        });
    } else if (pendingBulkAction.value === 'restore') {
        return t('common.bulkRestoreConfirmMessage', {
            count: selectedRows.value.length,
            entity
        });
    }
    return '';
});

// Single Delete Confirmation Message
const deleteConfirmMessage = computed(() => {
    if (!pendingDeleteCompany.value) return '';
    const entity = t('company.entitySingular');
    return t('common.bulkDeleteConfirmMessage', { count: 1, entity });
});

// Watch for search/filter changes
watch([searchText, selectedGroups, selectedSharedLineGroups], () => {
    currentPage.value = 1;
});

// Watch for active status filter changes — re-fetch from server
watch(activeStatusFilter, async (newValue) => {
    currentPage.value = 1;
    const filters = {};
    if (newValue !== '') filters.is_active = newValue;
    try {
        await companyStore.fetchCompanies({ page: 1, perPage: itemsPerPage.value, filters });
    } catch (err) {
        console.error("Failed to filter companies:", err);
    }
});

watch([trashedSearchText, trashedSelectedGroups], () => {
    trashedCurrentPage.value = 1;
});

// Clear selection when switching tabs
watch(activeTab, () => {
    selectedRows.value = [];
});

// Fetch data on mount
onMounted(async () => {
    try {
        await companyStore.fetchCompanies({ page: 1, perPage: itemsPerPage.value });
    } catch (error) {
        console.error("Failed to fetch companies:", error);
    }
});

// Watch for page changes to fetch new data from server
watch(currentPage, async (newPage) => {
    if (skipNextPageWatch.value) {
        skipNextPageWatch.value = false;
        return;
    }
    const filters = {};
    if (activeStatusFilter.value !== '') filters.is_active = activeStatusFilter.value;
    try {
        await companyStore.fetchCompanies({ page: newPage, perPage: itemsPerPage.value, filters });
    } catch (err) {
        console.error("Failed to load page:", err);
    }
});

watch(trashedCurrentPage, async (newPage) => {
    if (skipNextTrashedPageWatch.value) {
        skipNextTrashedPageWatch.value = false;
        return;
    }
    try {
        await companyStore.fetchTrashedCompanies({ page: newPage, perPage: itemsPerPage.value });
    } catch (err) {
        console.error("Failed to load trashed page:", err);
    }
});

// Watch active tab and refresh current list
watch(activeTab, async (newTab) => {
    skipNextPageWatch.value = true;
    skipNextTrashedPageWatch.value = true;
    if (newTab === 'trashed') {
        trashedCurrentPage.value = 1;
        try {
            await companyStore.fetchTrashedCompanies({ page: 1, perPage: itemsPerPage.value });
        } catch (error) {
            console.error("Failed to fetch trashed companies:", error);
        }
    } else {
        currentPage.value = 1;
        try {
            await companyStore.fetchCompanies({ page: 1, perPage: itemsPerPage.value });
        } catch (error) {
            console.error("Failed to fetch companies:", error);
        }
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
    selectedcompany.value = {};
    isFormModalOpen.value = true;
};

// Edit Modal
const openEditModal = (company) => {
    clearFormErrors();
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
    clearFormErrors();
};

const closeDetailsModal = () => {
    isDetailsModalOpen.value = false;
    selectedcompany.value = {};
};

const handleSubmitcompany = async (companyData) => {
    try {
        // Transform branches array for API
        const branches = (companyData.branches || [])
            .map((row) => {
                const name = (row.name || "").trim();
                if (!name) return null;
                const latitude = row.latitude === "" ? null : row.latitude;
                const longitude = row.longitude === "" ? null : row.longitude;
                return { name, latitude, longitude };
            })
            .filter(Boolean);

        const payload = {
            name: companyData.name,
            type: companyData.type,
            branches: branches, // Include branches in the payload
        };

        if (isEditMode.value) {
            await companyStore.updateCompany(selectedcompany.value.id, payload);
        } else {
            await companyStore.addCompany(payload);
        }
        closeFormModal();
    } catch (error) {
        console.error('❌ Failed to submit company:', error);
        if (applyServerErrors(error)) {
            return;
        }
        showError(error.message || 'Failed to save company');
    }
};

// Single Delete Handler (Soft Delete)
const handleDeleteCompany = (company) => {
    pendingDeleteCompany.value = company;
    isForceDelete.value = false;
    isDeleteConfirmOpen.value = true;
};

// Single Force Delete Handler (Permanent Delete)
const handleForceDeleteCompany = (company) => {
    pendingDeleteCompany.value = company;
    isForceDelete.value = true;
    isDeleteConfirmOpen.value = true;
};

const executeDelete = async () => {
    if (!pendingDeleteCompany.value) return;

    try {
        await companyStore.deleteCompany(pendingDeleteCompany.value.id, isForceDelete.value);

        // Refresh trashed list if we're soft deleting from active tab
        if (!isForceDelete.value && activeTab.value === 'active') {
            await companyStore.fetchTrashedCompanies();
        }
    } catch (error) {
        console.error('❌ Failed to delete company:', error);
    } finally {
        isDeleteConfirmOpen.value = false;
        pendingDeleteCompany.value = null;
        isForceDelete.value = false;
    }
};

const cancelDelete = () => {
    isDeleteConfirmOpen.value = false;
    pendingDeleteCompany.value = null;
    isForceDelete.value = false;
};

// Restore Handler
const handleRestoreCompany = async (company) => {
    try {
        await companyStore.restoreCompany(company.id);
    } catch (error) {
        console.error("❌ Failed to restore company:", error);
    }
};

// Bulk Actions Handler
const handleBulkAction = ({ actionId }) => {
    pendingBulkAction.value = actionId;

    // Always show confirmation for bulk actions
    isBulkConfirmOpen.value = true;
};

const executeBulkAction = async () => {
    bulkActionLoading.value = true;

    try {
        if (pendingBulkAction.value === 'delete') {
            // Soft delete from active tab
            await companyStore.bulkDeleteCompanies(selectedRows.value, false);
            // Refresh trashed list
            await companyStore.fetchTrashedCompanies();
        } else if (pendingBulkAction.value === 'forceDelete') {
            // Force delete from trashed tab
            await companyStore.bulkDeleteCompanies(selectedRows.value, true);
        } else if (pendingBulkAction.value === 'restore') {
            // Restore from trashed tab
            await companyStore.bulkRestoreCompanies(selectedRows.value);
        } else if (pendingBulkAction.value === 'activate') {
            await handleBulkActivate(selectedRows.value);
        } else if (pendingBulkAction.value === 'deactivate') {
            await handleBulkDeactivate(selectedRows.value);
        }

        // Clear selection after success
        selectedRows.value = [];
    } catch (error) {
        console.error(`❌ Failed to execute bulk ${pendingBulkAction.value}:`, error);
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

const handleRefresh = async () => {
    selectedRows.value = [];
    const filters = {};
    if (activeStatusFilter.value !== '') filters.is_active = activeStatusFilter.value;
    try {
        if (activeTab.value === 'trashed') {
            await companyStore.fetchTrashedCompanies({ page: trashedCurrentPage.value, perPage: itemsPerPage.value });
        } else {
            await companyStore.fetchCompanies({ page: currentPage.value, perPage: itemsPerPage.value, filters });
        }
    } catch (error) {
        console.error("Failed to refresh companies:", error);
    }
};

// ✅ Handler for Shared Line Toggle
const handleSharedLineUpdate = ({ companyId, sharedLine }) => {
    // Update local data in active companies
    const company = companies.value.find(c => c.id === companyId);
    if (company) {
        company.shared_line = sharedLine;
    }
    
    // Also update in trashed if exists
    const trashedCompany = trashedCompanies.value.find(c => c.id === companyId);
    if (trashedCompany) {
        trashedCompany.shared_line = sharedLine;
    }
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
