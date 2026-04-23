import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useCustomerCompanyAccountsStore = defineStore("customerCompanyAccounts", () => {
  const accounts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const pagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });

  const normalizeAccount = (account) => {
    if (!account) return {};
    return {
      ...account,
      user_id: account.user?.id || null,
      user_name: account.user?.name || "",
      username: account.user?.username || "",
      phone_number: account.user?.phone_number || "",
      email: account.user?.email || "",
      company_id: account.company?.id || null,
      company_name: account.company?.name || "",
      status: account.is_active === 1 ? 'active' : 'inactive',
    };
  };

  const fetchAccounts = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getCustomerCompanyAccounts({ page, perPage, filters });
      const dataRoot = response.data?.data || response.data || [];
      const metaSource = response.data?.meta || response.data || {};
      accounts.value = (Array.isArray(dataRoot) ? dataRoot : dataRoot.data || []).map(normalizeAccount);
      pagination.value = {
        currentPage: metaSource.current_page || page,
        perPage: metaSource.per_page || perPage,
        total: metaSource.total || accounts.value.length,
        lastPage: metaSource.last_page || 1,
      };
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch accounts";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // للسوبر ادمن فقط
const fetchAllAccounts = async ({ page = 1, perPage = 10, filters = {} } = {}) => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiServices.getCustomerCompanyUsers({ page, perPage, filters });
    
    const rawList = response.data?.data ?? [];
    const meta = response.data?.meta || {};

    accounts.value = rawList.map((item) => ({
      id: item.id,
      is_active: item.is_active,
      created_at: item.created_at,
      user_id: item.id,
      user_name: item.name || "",
      username: item.username || "",
      phone_number: item.phone_number || "",
      email: item.email || "",
      company_id: item.company?.id || null,
      company_name: item.company?.name || "",
      accounts: item.accounts || [],
    }));

    pagination.value = {
      currentPage: meta.current_page || page,
      perPage: meta.per_page || perPage,
      total: meta.total || accounts.value.length,
      lastPage: meta.last_page || 1,
    };
  } catch (err) {
    error.value = err.message || "Failed to fetch accounts";
    throw err;
  } finally {
    loading.value = false;
  }
};

  return {
    accounts,
    loading,
    error,
    pagination,
    fetchAccounts,
    fetchAllAccounts,
  };
});