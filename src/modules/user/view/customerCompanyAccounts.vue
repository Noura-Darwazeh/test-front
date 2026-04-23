<template>
  <div class="user-page-container bg-light">
    <customerAccountHeader
      v-model="searchText"
      :searchPlaceholder="$t('user.searchPlaceholder')"
      :data="store.accounts"
      :columns="columns"
      v-model:visibleColumns="visibleColumns"
      :showAddButton="false"
      @refresh-click="handleRefresh"
    />

    <div class="card border-0">
      <div class="card-body p-0">
        <div v-if="store.loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t("common.loading") }}</span>
          </div>
          <p class="mt-2">{{ $t("common.loading") }}</p>
        </div>

        <div v-else-if="store.error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ store.error }}
        </div>

        <div v-else>
          <DataTable
            :columns="filteredColumns"
            :data="store.accounts"
            :actionsLabel="$t('user.actions')"
            :showCheckbox="false"
            :rowClass="(row) => row.is_active === 0 ? 'row-inactive' : ''"
          >
            <template #cell-is_active="{ row }">
              <span class="badge" :class="row.is_active === 1 ? 'bg-success' : 'bg-secondary'">
                {{ row.is_active === 1 ? $t('user.active') : $t('user.inactive') }}
              </span>
            </template>
            <template #cell-created_at="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </DataTable>

          <div class="px-3 pt-1 pb-2 bg-light">
            <Pagination
              :totalItems="store.pagination.total"
              :itemsPerPage="10"
              :currentPage="currentPage"
              :totalPages="store.pagination.lastPage"
              @update:currentPage="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.js";
import customerAccountHeader from "../components/customerAccountHeader.vue";
import DataTable from "@/components/shared/DataTable.vue";
import Pagination from "@/components/shared/Pagination.vue";
import { useCustomerCompanyAccountsStore } from "../store/customerCompanyAccounts.js";

const { t } = useI18n();
const store = useCustomerCompanyAccountsStore();
const authStore = useAuthStore();

const isSuperAdmin = computed(() =>
  (authStore.userRole || "").toLowerCase() === "superadmin"
);

const searchText = ref("");
const currentPage = ref(1);
const skipNextPageWatch = ref(false);

const columns = computed(() => [
  { key: "__index", label: "#", isIndex: true },
  { key: "user_name", label: t("user.fullName"), sortable: true },
  { key: "username", label: t("user.username"), sortable: true },
  { key: "phone_number", label: t("user.phoneNumber") },
  // company_name فقط للسوبر ادمن
  ...(isSuperAdmin.value
    ? [{ key: "company_name", label: t("user.company") }]
    : []),
  { key: "is_active", label: t("common.status") },
  { key: "created_at", label: t("common.createdAt") },
]);

const visibleColumns = ref([]);

onMounted(() => {
  if (visibleColumns.value.length === 0) {
    visibleColumns.value = columns.value.map((col) => col.key);
  }
  fetchAccounts(1);
});

const filteredColumns = computed(() =>
  columns.value.filter((col) => visibleColumns.value.includes(col.key))
);

const fetchAccounts = async (page = 1) => {
  const filters = {};
  const trimmed = searchText.value.trim();
  if (trimmed) filters.search = trimmed;

  if (isSuperAdmin.value) {
    await store.fetchAllAccounts({ page, perPage: 10, filters });
  } else {
    await store.fetchAccounts({ page, perPage: 10, filters });
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleRefresh = async () => {
  await fetchAccounts(currentPage.value);
};

watch(currentPage, (newPage) => {
  if (skipNextPageWatch.value) {
    skipNextPageWatch.value = false;
    return;
  }
  fetchAccounts(newPage);
});

watch(searchText, () => {
  if (currentPage.value !== 1) {
    skipNextPageWatch.value = true;
    currentPage.value = 1;
  }
  fetchAccounts(1);
});

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};
</script>

<style scoped>
.user-page-container {
  max-width: 100%;
}
</style>