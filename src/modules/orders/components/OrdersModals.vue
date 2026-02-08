<template>
  <OrderWizard
    :isOpen="isWizardOpen"
    :customers="customers"
    :companies="companiesList"
    :currencies="currencies"
    :lines="lines"
    :linePrices="linePrices"
    :discounts="discounts"
    :branches="branches"
    :companyPrices="companyPrices"
    :existingOrders="existingOrders"
    @close="$emit('close-wizard')"
    @submit="(payload) => $emit('submit-order', payload)"
  />

  <FormModal
    :isOpen="isFormModalOpen"
    :title="$t('orders.edit')"
    :fields="orderFieldsWithDefaults"
    :showImageUpload="false"
    :serverErrors="formErrors"
    @close="$emit('close-form')"
    @submit="(payload) => $emit('submit-edit', payload)"
  />

  <DetailsModal
    :isOpen="isDetailsModalOpen"
    :title="$t('orders.details.title')"
    :data="selectedOrder"
    :fields="detailsFieldsForModal"
    @close="$emit('close-details')"
  >
    <template #before-details>
      <OrderDetailsTabs
        v-model="detailsModalTabProxy"
        :hasExchange="selectedOrderExchange.hasExchange"
      />
    </template>
    <template #after-details>
      <OrderDetailsContent
        :tab="detailsModalTabProxy"
        :order="selectedOrder"
        :exchange="selectedOrderExchange"
        :formatPrice="formatPrice"
        :getOrderItemTitle="getOrderItemTitle"
        :getOrderItemQuantity="getOrderItemQuantity"
        @edit="(payload) => $emit('edit-order', payload)"
        @details="(payload) => $emit('details-order', payload)"
        @delete="(payload) => $emit('delete-order', payload)"
      />
    </template>
  </DetailsModal>

  <DetailsModal
    :isOpen="isProgressModalOpen"
    :title="$t('orders.progress.title')"
    :data="selectedProgressOrder"
    :fields="[]"
    @close="$emit('close-progress')"
  >
    <template #after-details>
      <OrderDetailsContent
        v-if="selectedProgressOrder"
        tab="details"
        :order="selectedProgressOrder"
        :exchange="{ delivery: null, return: null, hasExchange: false }"
        :formatPrice="formatPrice"
        :getOrderItemTitle="getOrderItemTitle"
        :getOrderItemQuantity="getOrderItemQuantity"
        :showItems="false"
      />
    </template>
  </DetailsModal>

  <ConfirmationModal
    :isOpen="isBulkConfirmOpen"
    :title="$t('common.bulkDeleteConfirmTitle')"
    :message="bulkConfirmMessage"
    :confirmText="$t('common.confirm')"
    :cancelText="$t('common.cancel')"
    @confirm="$emit('confirm-bulk')"
    @close="$emit('close-bulk')"
  />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import OrderWizard from "./OrderWizard.vue";
import OrderDetailsTabs from "./OrderDetailsTabs.vue";
import OrderDetailsContent from "./OrderDetailsContent.vue";
import FormModal from "@/components/shared/FormModal.vue";
import DetailsModal from "@/components/shared/DetailsModal.vue";
import ConfirmationModal from "@/components/shared/ConfirmationModal.vue";
import apiServices from "@/services/apiServices.js";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

const props = defineProps({
  isWizardOpen: {
    type: Boolean,
    default: false,
  },
  companies: {
    type: Array,
    default: () => [],
  },
  existingOrders: {
    type: Array,
    default: () => [],
  },
  isFormModalOpen: {
    type: Boolean,
    default: false,
  },
  formErrors: {
    type: Object,
    default: () => ({}),
  },
  orderFields: {
    type: Array,
    default: () => [],
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  selectedOrder: {
    type: Object,
    default: () => ({}),
  },
  isDetailsModalOpen: {
    type: Boolean,
    default: false,
  },
  isProgressModalOpen: {
    type: Boolean,
    default: false,
  },
  detailsModalTab: {
    type: String,
    default: "details",
  },
  selectedOrderExchange: {
    type: Object,
    default: () => ({ delivery: null, return: null, hasExchange: false }),
  },
  selectedProgressOrder: {
    type: Object,
    default: () => ({}),
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  getOrderItemTitle: {
    type: Function,
    required: true,
  },
  getOrderItemQuantity: {
    type: Function,
    required: true,
  },
  isBulkConfirmOpen: {
    type: Boolean,
    default: false,
  },
  bulkConfirmMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "close-wizard",
  "submit-order",
  "close-form",
  "submit-edit",
  "close-details",
  "edit-order",
  "details-order",
  "delete-order",
  "close-progress",
  "confirm-bulk",
  "close-bulk",
  "update:detailsModalTab",
]);

const { t } = useI18n();
const { companyOption } = useAuthDefaults();

const customers = ref([]);
const currencies = ref([]);
const lines = ref([]);
const linePrices = ref([]);
const discounts = ref([]);
const branches = ref([]);
const companyPrices = ref([]);

const companiesList = computed(() => props.companies);

const detailsModalTabProxy = computed({
  get() {
    return props.detailsModalTab;
  },
  set(value) {
    return emit("update:detailsModalTab", value);
  },
});

const resolveCurrencyLabel = (currency) => {
  if (!currency) return "";
  if (Array.isArray(currency)) {
    const name = currency[1] || "";
    const symbol = currency[2] || "";
    if (name && symbol && name !== symbol) return `${name} (${symbol})`;
    return name || symbol || (currency[0] ? `Currency ${currency[0]}` : "");
  }
  const name =
    currency.nameenglish ||
    currency.namearabic ||
    currency.name ||
    currency.key ||
    currency.code ||
    "";
  const symbol = currency.symbol || "";
  if (name && symbol && name !== symbol) return `${name} (${symbol})`;
  return name || symbol || (currency.id ? `Currency ${currency.id}` : "");
};

const resolveLinePriceName = (linePrice) => {
  if (Array.isArray(linePrice)) {
    return linePrice[1] || (linePrice[0] ? `Line ${linePrice[0]}` : "");
  }
  return (
    linePrice.line_id?.name ||
    linePrice.line?.name ||
    linePrice.line_name ||
    linePrice.lineName ||
    linePrice.name ||
    ""
  );
};

const resolveLinePriceSymbol = (linePrice) => {
  if (Array.isArray(linePrice)) {
    return "";
  }
  return (
    linePrice.currency_id?.symbol ||
    linePrice.currency?.symbol ||
    linePrice.currency_symbol ||
    linePrice.currency_code ||
    "$"
  );
};

const resolveDiscountLabel = (discount) => {
  if (Array.isArray(discount)) {
    return discount[1] || (discount[0] ? `Discount #${discount[0]}` : "");
  }
  const baseLabel =
    discount.name ||
    discount.type ||
    (discount.value !== undefined &&
    discount.value !== null &&
    discount.value !== ""
      ? String(discount.value)
      : "");
  const percent = discount.discount_percentage ?? discount.percentage;
  const percentLabel =
    percent !== undefined && percent !== null && percent !== ""
      ? `${percent}%`
      : "";
  if (baseLabel && percentLabel) return `${baseLabel} (${percentLabel})`;
  return baseLabel || percentLabel || `Discount #${discount.id}`;
};

const resolveCompanyPriceLabel = (price) => {
  if (Array.isArray(price)) {
    return price[1] || (price[0] ? `Price #${price[0]}` : "");
  }
  const itemType =
    price.itemType || price.item_type || price.itemTypeDisplay || price.name || "";
  const priceValue = price.price ?? price.amount ?? price.cost;
  const currencySymbol =
    price.currency?.symbol ||
    price.currency_id?.symbol ||
    price.currency_symbol ||
    "$";
  const priceLabel =
    priceValue !== undefined && priceValue !== null && priceValue !== ""
      ? props.formatPrice(priceValue, currencySymbol)
      : "";
  if (itemType && priceLabel) return `${itemType} - ${priceLabel}`;
  return itemType || priceLabel || `Price #${price.id}`;
};

const customerOptions = computed(() =>
  customers.value.map((customer) => {
    const id = Array.isArray(customer)
      ? customer[0]
      : customer.id ?? customer.customer_id ?? "";
    const label = Array.isArray(customer)
      ? customer[1] || (id ? `Customer ${id}` : "")
      : customer.name ||
        customer.full_name ||
        customer.customer_name ||
        (id ? `Customer ${id}` : "");
    return {
      value: String(id),
      label,
    };
  })
);

const currencyOptions = computed(() =>
  currencies.value.map((currency) => ({
    value: String(Array.isArray(currency) ? currency[0] : currency.id),
    label: resolveCurrencyLabel(currency),
  }))
);

const linePriceOptions = computed(() =>
  linePrices.value.map((linePrice) => {
    const id = Array.isArray(linePrice) ? linePrice[0] : linePrice.id;
    const lineName = resolveLinePriceName(linePrice);
    const currencySymbol = resolveLinePriceSymbol(linePrice);
    const labelPrefix = lineName ? `${lineName} - ` : "";
    return {
      value: String(id),
      label: `${labelPrefix}${props.formatPrice(linePrice.price, currencySymbol)}`,
    };
  })
);

const discountOptions = computed(() => [
  { value: "", label: t("orders.form.noDiscount") },
  ...discounts.value.map((discount) => ({
    value: String(Array.isArray(discount) ? discount[0] : discount.id),
    label: resolveDiscountLabel(discount),
  })),
]);

const companyPriceOptions = computed(() =>
  companyPrices.value.map((price) => {
    const id = Array.isArray(price) ? price[0] : price.id;
    return {
      value: String(id),
      label: resolveCompanyPriceLabel(price),
    };
  })
);

const parentOrderOptions = computed(() => {
  const options = props.existingOrders.map((order) => {
    const customer = order.customer_name || "";
    const base = order.order_code
      ? order.order_code
      : order.id
        ? `#${order.id}`
        : "";
    const label = customer && base ? `${base} - ${customer}` : base || customer;
    return {
      value: String(order.id),
      label,
    };
  });

  return [{ value: "", label: t("orders.form.noParentOrder") }, ...options];
});

const branchOptions = computed(() =>
  branches.value.map((branch) => {
    const id = Array.isArray(branch) ? branch[0] : branch.id;
    const label = Array.isArray(branch)
      ? branch[1] || (id ? `Branch ${id}` : "")
      : branch.name || (id ? `Branch ${id}` : "");
    return {
      value: String(id),
      label,
    };
  })
);

const orderFieldsWithDefaults = computed(() => {
  return props.orderFields.map((field) => {
    const unwrappedField = {
      ...field,
      defaultValue: props.isEditMode
        ? props.selectedOrder[field.name]
        : field.defaultValue ?? "",
    };

    if (
      field.type === "select" &&
      unwrappedField.defaultValue !== "" &&
      unwrappedField.defaultValue !== null &&
      unwrappedField.defaultValue !== undefined
    ) {
      unwrappedField.defaultValue = String(unwrappedField.defaultValue);
    }
    if (
      field.name === "is_delivery_price_from_customer" &&
      (unwrappedField.defaultValue === "" ||
        unwrappedField.defaultValue === null ||
        unwrappedField.defaultValue === undefined)
    ) {
      unwrappedField.defaultValue = 0;
    }

    if (field.name === "customer_id") {
      unwrappedField.options = customerOptions.value;
    }
    if (field.name === "to_id") {
      unwrappedField.options = customerOptions.value;
    }
    if (field.name === "currency_id") {
      unwrappedField.options = currencyOptions.value;
    }
    if (field.name === "lineprice_id") {
      unwrappedField.options = linePriceOptions.value;
    }
    if (field.name === "discount_id") {
      unwrappedField.options = discountOptions.value;
    }
    if (field.name === "company_item_price_id") {
      unwrappedField.options = companyPriceOptions.value;
    }
    if (field.name === "company_id") {
      unwrappedField.options = companyOption.value.length
        ? companyOption.value
        : [{ value: "", label: t("common.noCompanyAssigned") }];
      unwrappedField.locked = true;
      unwrappedField.hidden = true;
    }
    if (field.name === "parent_order_id") {
      unwrappedField.options = parentOrderOptions.value;
    }
    if (field.name === "branch_customer_company_id" || field.name === "branch_delivery_company_id") {
      unwrappedField.options = branchOptions.value;
    }

    if (field.options && typeof field.options === "object" && "value" in field.options) {
      unwrappedField.options = field.options.value;
    }

    return unwrappedField;
  });
});

const detailsFields = computed(() => [
  { key: "id", label: t("orders.table.id"), colClass: "col-md-6" },
  { key: "customer_name", label: t("orders.table.customer"), colClass: "col-md-6" },
  { key: "company_name", label: t("orders.table.company"), colClass: "col-md-6" },
  {
    key: "type",
    label: t("orders.table.type"),
    colClass: "col-md-6",
    translator: (value) => {
      if (value === "delivery") return t("orders.form.typeDelivery");
      if (value === "return") return t("orders.form.typeReturn");
      if (value === "exchange") return t("orders.form.typeExchange");
      return value;
    }
  },
  {
    key: "package",
    label: t("orders.table.package"),
    colClass: "col-md-6",
    translator: (value) => value === "one" ? t("orders.form.packageOne") : t("orders.form.packageMulti")
  },
  {
    key: "case",
    label: t("orders.table.case"),
    colClass: "col-md-6"
  },
  {
    key: "price",
    label: t("orders.table.price"),
    colClass: "col-md-6",
    translator: () =>
      props.formatPrice(props.selectedOrder.price, props.selectedOrder.currency_symbol)
  },
  {
    key: "delivery_price",
    label: t("orders.table.deliveryPrice"),
    colClass: "col-md-6",
    translator: () =>
      props.formatPrice(props.selectedOrder.delivery_price, props.selectedOrder.currency_symbol),
  },
  {
    key: "total_price",
    label: t("orders.table.totalPrice"),
    colClass: "col-md-6",
    translator: () =>
      props.formatPrice(props.selectedOrder.total_price, props.selectedOrder.currency_symbol),
  },
  {
    key: "discount_percentage",
    label: t("orders.details.discountPercentage"),
    colClass: "col-md-6",
    translator: (value) => value ? `${value}%` : t("orders.form.noDiscount")
  },
  {
    key: "status",
    label: t("orders.table.status"),
    colClass: "col-md-6",
    translationKey: "orderStatus"
  },
  { key: "created_at", label: t("orders.table.createdAt"), colClass: "col-md-6" },
]);

const detailsFieldsForModal = computed(() => {
  return props.detailsModalTab === "details" ? detailsFields.value : [];
});

const fetchDropdownData = async () => {
  const extractArray = (response) => {
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  };

  const logError = (label, reason) => {
    console.error("Failed to load " + label + " dropdown data:", reason);
  };

  const results = await Promise.allSettled([
    apiServices.getCustomers(),
    apiServices.getCurrencies(),
    apiServices.getLines({ page: 1, perPage: 1000 }),
    apiServices.getLinePrices(),
    apiServices.getDiscounts(),
    apiServices.getBranches(),
    apiServices.getCompanyPrices(),
  ]);

  const [
    customersRes,
    currenciesRes,
    linesRes,
    linePricesRes,
    discountsRes,
    branchesRes,
    companyPricesRes,
  ] = results;

  if (customersRes.status === "fulfilled") {
    customers.value = extractArray(customersRes.value);
  } else {
    customers.value = [];
    logError("customers", customersRes.reason);
  }

  if (currenciesRes.status === "fulfilled") {
    currencies.value = extractArray(currenciesRes.value);
  } else {
    currencies.value = [];
    logError("currencies", currenciesRes.reason);
  }

  if (linesRes.status === "fulfilled") {
    lines.value = extractArray(linesRes.value);
  } else {
    lines.value = [];
    logError("lines", linesRes.reason);
  }

  if (linePricesRes.status === "fulfilled") {
    linePrices.value = extractArray(linePricesRes.value);
  } else {
    linePrices.value = [];
    logError("line prices", linePricesRes.reason);
  }

  if (discountsRes.status === "fulfilled") {
    discounts.value = extractArray(discountsRes.value);
  } else {
    discounts.value = [];
    logError("discounts", discountsRes.reason);
  }

  if (branchesRes.status === "fulfilled") {
    branches.value = extractArray(branchesRes.value);
  } else {
    branches.value = [];
    logError("branches", branchesRes.reason);
  }

  if (companyPricesRes.status === "fulfilled") {
    companyPrices.value = extractArray(companyPricesRes.value);
  } else {
    companyPrices.value = [];
    logError("company item prices", companyPricesRes.reason);
  }
};

onMounted(() => {
  fetchDropdownData();
});
</script>
