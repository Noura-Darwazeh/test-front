<template>
  <div class="card border-0">
    <div v-if="showTabs" class="card-header bg-white border-bottom">
      <ul class="nav nav-tabs card-header-tabs">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'active' }"
            @click="$emit('switch-tab', 'active')"
          >
            {{ $t("common.active") }}
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link trashed-tab"
            :class="{ active: activeTab === 'trashed' }"
            @click="$emit('switch-tab', 'trashed')"
          >
            {{ $t("orders.trashed.title") }}
          </button>
        </li>
      </ul>
    </div>
    <div class="card-body p-0">
      <BulkActionsBar
        v-if="showBulkActions"
        :selectedCount="selectedRowsProxy.length"
        entityName="orders"
        :actions="bulkActions"
        :loading="bulkActionLoading"
        @action="(payload) => $emit('bulk-action', payload)"
      />
      <div v-if="currentLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ $t("common.loading") }}</span>
        </div>
        <p class="mt-2">{{ $t("common.loading") }}</p>
      </div>

      <div v-else-if="errorMessage" class="alert alert-danger m-3">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ errorMessage }}
      </div>

      <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="paginatedData"
            :actionsLabel="actionsLabel || $t('orders.actionsLabel')"
            v-model="selectedRowsProxy"
            :isExpandable="isOrderExpandable"
            :showCheckbox="showCheckbox"
          >
            <template v-if="showActions" #actions="{ row }">
              <button
                v-if="actionsVariant === 'goToOrder'"
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="$emit('go-to-order', row)"
              >
                {{ actionButtonLabel || $t("statistics.goToOrder") }}
              </button>
              <ActionsDropdown
                v-else-if="activeTab === 'active'"
                :row="row"
                :editLabel="$t('orders.actions.edit')"
                :detailsLabel="$t('orders.actions.view')"
                :progressLabel="$t('orders.progress.view')"
                :showProgress="true"
                :deleteLabel="$t('orders.actions.delete')"
                :confirmDelete="true"
                @edit="$emit('edit', row)"
                @details="$emit('details', row)"
                @progress="$emit('progress', row)"
                @delete="$emit('delete', row)"
              />
              <ActionsDropdown
                v-else
                :row="row"
                :restoreLabel="$t('orders.trashed.restore')"
                :deleteLabel="$t('orders.trashed.delete')"
                :showEdit="false"
                :showDetails="false"
                :showRestore="true"
                :confirmDelete="true"
                @restore="$emit('restore', row)"
                @delete="$emit('delete-permanent', row)"
              />
            </template>

            <template v-if="showExpandable" #expand="{ row }">
              <OrderChildOrders
                :row="row"
                :formatPrice="formatPrice"
                @edit="$emit('edit', $event)"
                @details="$emit('details', $event)"
                @delete="$emit('delete', $event)"
              />
            </template>
          </DataTable>
        <div class="px-3 pt-1 pb-2 bg-light">
          <Pagination
            :totalItems="currentPagination.total"
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            :totalPages="currentPagination.lastPage"
            @update:currentPage="(page) => $emit('update:currentPage', page)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BulkActionsBar from "@/components/shared/BulkActionsBar.vue";
import DataTable from "@/components/shared/DataTable.vue";
import Pagination from "@/components/shared/Pagination.vue";
import ActionsDropdown from "@/components/shared/Actions.vue";
import OrderChildOrders from "./OrderChildOrders.vue";

const props = defineProps({
  activeTab: {
    type: String,
    default: "active",
  },
  actionsVariant: {
    type: String,
    default: "dropdown",
  },
  actionsLabel: {
    type: String,
    default: "",
  },
  actionButtonLabel: {
    type: String,
    default: "",
  },
  showTabs: {
    type: Boolean,
    default: true,
  },
  selectedRows: {
    type: Array,
    default: () => [],
  },
  currentLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  bulkActions: {
    type: Array,
    default: () => [],
  },
  bulkActionLoading: {
    type: Boolean,
    default: false,
  },
  showBulkActions: {
    type: Boolean,
    default: true,
  },
  filteredColumns: {
    type: Array,
    default: () => [],
  },
  paginatedData: {
    type: Array,
    default: () => [],
  },
  isOrderExpandable: {
    type: Function,
    required: true,
  },
  showExpandable: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showCheckbox: {
    type: Boolean,
    default: true,
  },
  currentPagination: {
    type: Object,
    default: () => ({ total: 0, lastPage: 1 }),
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits([
  "update:selectedRows",
  "update:currentPage",
  "switch-tab",
  "bulk-action",
  "edit",
  "details",
  "progress",
  "delete",
  "restore",
  "delete-permanent",
  "go-to-order",
]);

const selectedRowsProxy = computed({
  get() {
    return props.selectedRows;
  },
  set(value) {
    emit("update:selectedRows", value);
  },
});
</script>
