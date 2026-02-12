<template>
  <BaseDropdown :menuPosition="position" class="currency-selector">
    <template #trigger>
      <button
        class="btn btn-link p-0 d-flex align-items-center gap-1"
        type="button"
      >
        <img
          :src="currencySvg"
          alt="Currency"
          width="25"
          height="25"
        />
        <span class="currency-code d-none d-md-inline text-dark">{{
          currentCurrency.code
        }}</span>
      </button>
    </template>
    <template #menu="{ close }">
      <ul class="list-unstyled mb-0">
        <li v-for="currency in availableCurrencies" :key="currency.code">
          <a
            class="dropdown-item d-flex align-items-center gap-2"
            href="#"
            :class="{ active: currency.code === currentCurrency.code }"
            @click.prevent="selectCurrency(currency, close)"
          >
            <span class="currency-symbol">{{ currency.symbol }}</span>
            <div class="currency-info">
              <div class="currency-code fw-semibold">{{ currency.code }}</div>
              <div class="currency-name text-muted small">
                {{ currency.name }}
              </div>
            </div>
          </a>
        </li>
      </ul>
    </template>
  </BaseDropdown>
</template>

<script setup>
import { computed } from "vue";
import { useCurrencyStore } from "@/stores/currency.js";
import BaseDropdown from "./BaseDropdown.vue";
import currencySvg from "@/assets/currency/currency.svg";

const props = defineProps({
  position: {
    type: String,
    default: "end",
    validator: (value) => ["start", "end"].includes(value),
  },
});

const emit = defineEmits(["currencyChanged"]);

const currencyStore = useCurrencyStore();

const currentCurrency = computed(() => currencyStore.currentCurrency);
const availableCurrencies = computed(() => currencyStore.availableCurrencies);

const selectCurrency = (currency, close) => {
  currencyStore.setSelectedCurrency(currency);
  emit("currencyChanged", currency);
  close();
};
</script>

<style scoped>
.currency-selector .btn-link {
  color: #6c757d;
  text-decoration: none;
}

.currency-selector .btn-link:hover {
  color: var(--primary-color);
}

.currency-selector .btn-link:focus {
  box-shadow: none;
}

.currency-code {
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.dropdown-item.active .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.currency-symbol {
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

.currency-info {
  flex: 1;
}

.currency-name {
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
