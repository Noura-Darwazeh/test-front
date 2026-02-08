<template>
  <div class="currency-demo p-4">
    <h3>Currency Management Demo</h3>

    <div class="mb-3">
      <strong>Current Currency:</strong>
      {{ selectedCurrency?.name }} ({{ selectedCurrency?.code }})
    </div>

    <div class="mb-3">
      <strong>Available Currencies:</strong>
      <select
        v-model="selectedCurrencyCode"
        @change="handleCurrencyChange"
        class="form-select"
      >
        <option
          v-for="currency in availableCurrencies"
          :key="currency.code"
          :value="currency.code"
        >
          {{ currency.name }} ({{ currency.symbol }})
        </option>
      </select>
    </div>

    <div class="mb-3">
      <strong>Sample Conversions:</strong>
      <ul>
        <li>$100 USD = {{ formatPrice(100, "USD") }}</li>
        <li>€85 EUR = {{ formatPrice(85, "EUR") }}</li>
        <li>£73 GBP = {{ formatPrice(73, "GBP") }}</li>
      </ul>
    </div>

    <div class="mb-3">
      <strong>Status:</strong>
      <span v-if="isLoading" class="text-info">Loading...</span>
      <span v-else-if="error" class="text-danger">{{ error }}</span>
      <span v-else class="text-success">Ready</span>
    </div>

    <div class="mb-3">
      <button
        @click="refreshRates"
        class="btn btn-primary"
        :disabled="isLoading"
      >
        Refresh Exchange Rates
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCurrency } from "@/composables/useCurrency.js";

const {
  selectedCurrency,
  availableCurrencies,
  isLoading,
  error,
  setSelectedCurrency,
  refreshExchangeRates,
  formatPrice,
} = useCurrency();

const selectedCurrencyCode = ref(selectedCurrency.value?.code || "USD");

const handleCurrencyChange = () => {
  const currency = availableCurrencies.value.find(
    (c) => c.code === selectedCurrencyCode.value
  );
  if (currency) {
    setSelectedCurrency(currency);
  }
};

const refreshRates = () => {
  refreshExchangeRates();
};
</script>

<style scoped>
.currency-demo {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
