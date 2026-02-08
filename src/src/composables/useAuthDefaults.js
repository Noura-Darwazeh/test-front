import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.js";

export const useAuthDefaults = () => {
  const authStore = useAuthStore();

  const hasCompany = computed(() => !!authStore.userCompanyId);
  const hasCurrency = computed(() => !!authStore.userCurrencyId);

  const companyId = computed(() =>
    authStore.userCompanyId !== null && authStore.userCompanyId !== undefined
      ? String(authStore.userCompanyId)
      : ""
  );

  const companyName = computed(() => authStore.userCompanyName || "");

  const companyOption = computed(() =>
    hasCompany.value
      ? [
          {
            value: companyId.value,
            label: companyName.value || `Company #${companyId.value}`,
          },
        ]
      : []
  );

  const currencyId = computed(() =>
    authStore.userCurrencyId !== null && authStore.userCurrencyId !== undefined
      ? String(authStore.userCurrencyId)
      : ""
  );

  const currencyName = computed(() => authStore.userCurrencyName || "");

  return {
    authStore,
    hasCompany,
    hasCurrency,
    companyId,
    companyName,
    companyOption,
    currencyId,
    currencyName,
  };
};
