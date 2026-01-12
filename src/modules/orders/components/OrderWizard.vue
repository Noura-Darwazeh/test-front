<template>
  <div
    v-if="isOpen"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div
      class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
    >
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">{{ $t("orders.wizard.title") }}</h5>
          <button type="button" class="btn-close" @click="closeWizard"></button>
        </div>

        <!-- Progress Steps -->
        <div class="modal-body pb-0">
          <div class="wizard-steps mb-4">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="wizard-step"
              :class="{
                active: currentStep === index,
                completed: currentStep > index,
              }"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>

          <!-- Step Content -->
          <div class="wizard-content">
            <!-- Step 1: Basic Order Info -->
            <div v-show="currentStep === 0" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.basicInfo") }}</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.customerId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.customer_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectCustomer") }}
                    </option>
                    <option
                      v-for="customer in customers"
                      :key="customer.id"
                      :value="customer.id"
                    >
                      {{ customer.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.toId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select v-model="formData.to_id" class="form-select" required>
                    <option value="">
                      {{ $t("orders.form.selectLocation") }}
                    </option>
                    <option
                      v-for="customer in customers"
                      :key="customer.id"
                      :value="customer.id"
                    >
                      {{ customer.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.type") }}
                    <span class="text-danger">*</span></label
                  >
                  <select v-model="formData.type" class="form-select" required>
                    <option value="delivery">
                      {{ $t("orders.form.typeDelivery") }}
                    </option>
                    <option value="return">
                      {{ $t("orders.form.typeReturn") }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.case") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.case"
                    class="form-select"
                    required
                    @change="handleCaseChange"
                  >
                    <option value="Full">
                      {{ $t("orders.form.caseFull") }}
                    </option>
                    <option value="Part">
                      {{ $t("orders.form.casePart") }}
                    </option>
                    <option value="Fast">
                      {{ $t("orders.form.caseFast") }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.package") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.package"
                    class="form-select"
                    required
                    :disabled="isPackageDisabled"
                  >
                    <option value="one">
                      {{ $t("orders.form.packageOne") }}
                    </option>
                    <option value="multi" :disabled="isMultiDisabled">
                      {{ $t("orders.form.packageMulti") }}
                    </option>
                  </select>
                </div>

                <!-- Parent Order ID - Only show if type is return -->
                <div v-if="formData.type === 'return'" class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.parentOrderId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.parent_order_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectParentOrder") }}
                    </option>
                    <option
                      v-for="order in existingOrders"
                      :key="order.id"
                      :value="order.id"
                    >
                      {{ order.order_code }} - {{ order.customer_name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Business Rule Info -->
              <div class="mt-3">
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>{{ $t("orders.wizard.packageRules") }}:</strong>
                  <ul class="mb-0 mt-2">
                    <li>{{ $t("orders.wizard.fullCaseRule") }}</li>
                    <li>{{ $t("orders.wizard.fastPartCaseRule") }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Step 2: Pricing & Details -->
            <div v-show="currentStep === 1" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.pricingDetails") }}</h6>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.price") }}
                    <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="formData.price"
                    type="number"
                    class="form-control"
                    step="0.01"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.currencyId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.currency_id"
                    class="form-select"
                    required
                  >
                    <option
                      v-for="currency in availableCurrencies"
                      :key="currency.id"
                      :value="currency.id"
                    >
                      {{ currency.code }} ({{ currency.symbol }})
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.linepriceId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.lineprice_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectLinePrice") }}
                    </option>
                    <option
                      v-for="linePrice in linePrices"
                      :key="linePrice.id"
                      :value="linePrice.id"
                    >
                      {{ linePrice.name }} - {{ formatPrice(linePrice.price) }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">{{
                    $t("orders.form.discountId")
                  }}</label>
                  <select v-model="formData.discount_id" class="form-select">
                    <option value="">{{ $t("orders.form.noDiscount") }}</option>
                    <option
                      v-for="discount in discounts"
                      :key="discount.id"
                      :value="discount.id"
                    >
                      {{ discount.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.companyItemPriceId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.company_item_price_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectCompanyPrice") }}
                    </option>
                    <option
                      v-for="price in companyPrices"
                      :key="price.id"
                      :value="price.id"
                    >
                      {{ price.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.branchCustomerCompanyId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.branch_customer_company_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectBranch") }}
                    </option>
                    <option
                      v-for="branch in branches"
                      :key="branch.id"
                      :value="branch.id"
                    >
                      {{ branch.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.branchDeliveryCompanyId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.branch_delivery_company_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectBranch") }}
                    </option>
                    <option
                      v-for="branch in branches"
                      :key="branch.id"
                      :value="branch.id"
                    >
                      {{ branch.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 3: Order Items Creation -->
            <div v-show="currentStep === 2" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.orderItems") }}</h6>

              <!-- Order Items List -->
              <div class="mb-4">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h6 class="mb-0">{{ $t("orders.wizard.itemsList") }}</h6>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    @click="addOrderItem"
                    :disabled="isAddItemDisabled"
                  >
                    <i class="fas fa-plus me-2"></i>
                    {{ $t("orders.wizard.addItem") }}
                  </button>
                </div>

                <!-- Single Package Info -->
                <div v-if="formData.package === 'one' && orderItems.length >= 1" class="alert alert-warning mb-3">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ $t("orders.wizard.singlePackageLimit") }}
                </div>

                <!-- No Items Message -->
                <div v-if="orderItems.length === 0" class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  {{ $t("orders.wizard.noItems") }}
                </div>

                <!-- Order Items Cards -->
                <div
                  v-else
                  class="order-items-list"
                  style="max-height: 400px; overflow-y: auto"
                >
                  <div
                    v-for="(item, index) in orderItems"
                    :key="index"
                    class="card mb-3"
                  >
                    <div class="card-body">
                      <div class="row g-3">
                        <!-- Item Name -->
                        <div class="col-md-12">
                          <label class="form-label">
                            {{ $t("orders.wizard.itemName") }}
                            <span class="text-danger">*</span>
                          </label>
                          <input
                            v-model="item.name"
                            type="text"
                            class="form-control"
                            :placeholder="$t('orderItems.form.namePlaceholder')"
                            required
                          />
                        </div>

                        <!-- Quantity -->
                        <div class="col-md-4">
                          <label class="form-label">
                            {{ $t("orders.wizard.itemQuantity") }}
                            <span class="text-danger">*</span>
                          </label>
                          <input
                            v-model="item.quantity"
                            type="number"
                            class="form-control"
                            min="1"
                            required
                          />
                        </div>

                        <!-- Weight -->
                        <div class="col-md-4">
                          <label class="form-label">
                            {{ $t("orderItems.form.weight") }}
                            <span class="text-danger">*</span>
                          </label>
                          <select
                            v-model="item.selected_weight_id"
                            class="form-select"
                            required
                          >
                            <option value="">
                              {{ $t("orderItems.form.noWeightSelected") }}
                            </option>
                            <option
                              v-for="weight in item.weight"
                              :key="weight.id"
                              :value="String(weight.id)"
                            >
                              {{ weight.label }}
                            </option>
                          </select>
                        </div>

                        <!-- From Company - Only for Fast and Full cases -->
                        <div v-if="formData.case === 'Fast' || formData.case === 'Full'" class="col-md-6">
                          <label class="form-label">
                            {{ $t("orderItems.form.fromCompany") }}
                            <span v-if="formData.case === 'Fast'" class="text-danger">*</span>
                          </label>
                          <select
                            v-model="item.from_company_id"
                            class="form-select"
                            :required="formData.case === 'Fast'"
                          >
                            <option value="">
                              {{ $t("orderItems.form.noFromCompany") }}
                            </option>
                            <option
                              v-for="company in companies"
                              :key="company.id"
                              :value="company.id"
                            >
                              {{ company.name }}
                            </option>
                          </select>
                        </div>

                        <!-- To Company - Only for Part and Full cases -->
                        <div v-if="formData.case === 'Part' || formData.case === 'Full'" class="col-md-6">
                          <label class="form-label">
                            {{ $t("orderItems.form.toCompany") }}
                            <span v-if="formData.case === 'Part'" class="text-danger">*</span>
                          </label>
                          <select
                            v-model="item.to_company_id"
                            class="form-select"
                            :required="formData.case === 'Part'"
                          >
                            <option value="">
                              {{ $t("orderItems.form.noToCompany") }}
                            </option>
                            <option
                              v-for="company in companies"
                              :key="company.id"
                              :value="company.id"
                            >
                              {{ company.name }}
                            </option>
                          </select>
                        </div>

                        <!-- Description -->
                        <div class="col-12">
                          <label class="form-label">{{
                            $t("orders.wizard.itemDescription")
                          }}</label>
                          <textarea
                            v-model="item.description"
                            class="form-control"
                            rows="2"
                            :placeholder="
                              $t('orderItems.form.descriptionPlaceholder')
                            "
                          ></textarea>
                        </div>

                        <!-- Remove Button -->
                        <div class="col-12">
                          <div class="d-flex justify-content-end">
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              @click="removeOrderItem(index)"
                            >
                              <i class="fas fa-trash me-2"></i>
                              {{ $t("common.delete") }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn btn-secondary"
            @click="previousStep"
          >
            {{ $t("orders.wizard.previous") }}
          </button>
          <button
            v-if="currentStep < steps.length - 1"
            type="button"
            class="btn btn-primary"
            @click="nextStep"
          >
            {{ $t("orders.wizard.next") }}
          </button>
          <button
            v-if="currentStep === steps.length - 1"
            type="button"
            class="btn btn-success"
            @click="submitOrder"
          >
            {{ $t("orders.wizard.submit") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthDefaults } from "@/composables/useAuthDefaults.js";

const { t } = useI18n();
const { companyId, currencyId } = useAuthDefaults();

// Simple price formatter
const formatPrice = (value, symbol = "$") => {
  if (!value || isNaN(value)) return `${symbol}0.00`;
  return `${symbol}${Number(value).toFixed(2)}`;
};

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  customers: {
    type: Array,
    default: () => [],
  },
  companies: {
    type: Array,
    default: () => [],
  },
  currencies: {
    type: Array,
    default: () => [],
  },
  linePrices: {
    type: Array,
    default: () => [],
  },
  discounts: {
    type: Array,
    default: () => [],
  },
  branches: {
    type: Array,
    default: () => [],
  },
  companyPrices: {
    type: Array,
    default: () => [],
  },
  existingOrders: {
    type: Array,
    default: () => [],
  },
});

const availableCurrencies = computed(() => props.currencies);
const emit = defineEmits(["close", "submit"]);

const currentStep = ref(0);

const steps = computed(() => [
  { label: t("orders.wizard.step1") },
  { label: t("orders.wizard.step2") },
  { label: t("orders.wizard.step3") },
]);

const buildDefaultFormData = () => ({
  customer_id: "",
  to_id: "",
  type: "delivery",
  case: "Full",
  package: "one",
  parent_order_id: "",
  price: "",
  currency_id: currencyId.value || "",
  lineprice_id: "",
  discount_id: "",
  company_item_price_id: "",
  company_id: companyId.value || "",
  branch_customer_company_id: "",
  branch_delivery_company_id: "",
});

const formData = ref(buildDefaultFormData());

const orderItems = ref([]);
const selectedOrderItems = ref([]);

// Conditional logic for package selection based on case
const isMultiDisabled = computed(() => {
  return formData.value.case === "Part" || formData.value.case === "Fast";
});

const isPackageDisabled = computed(() => {
  return false; // Package field is always enabled, but multi option may be disabled
});

// Disable add item button when single package already has 1 item
const isAddItemDisabled = computed(() => {
  return formData.value.package === "one" && orderItems.value.length >= 1;
});

const handleCaseChange = () => {
  // If case is Part or Fast, force package to "one"
  if (formData.value.case === "Part" || formData.value.case === "Fast") {
    formData.value.package = "one";
  }
};

const addOrderItem = () => {
  orderItems.value.push({
    name: "",
    description: "",
    quantity: 1,
    selected_weight_id: "",
    weight: [
      {
        id: 1,
        label: "small_size & light_weight",
      },
      {
        id: 2,
        label: "small_size & heavy_weight",
      },
      {
        id: 3,
        label: "big_size & light_weight",
      },
      {
        id: 4,
        label: "big_size & heavy_weight",
      },
    ],
    from_company_id: "",
    to_company_id: "",
    warehouse_id: "1",
    multi_group_id: "",
  });
};

const removeOrderItem = (index) => {
  orderItems.value.splice(index, 1);
};

const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const closeWizard = () => {
  currentStep.value = 0;
  formData.value = buildDefaultFormData();
  orderItems.value = [];
  selectedOrderItems.value = [];
  emit("close");
};

const submitOrder = () => {
  // Validation
  if (formData.value.type === "return" && !formData.value.parent_order_id) {
    alert(t("orders.validation.returnRequiresParentOrder"));
    return;
  }

  // Order items validation
  if (orderItems.value.length === 0) {
    alert(t("orders.validation.noOrderItems"));
    return;
  }

  // Validate each order item
  for (let i = 0; i < orderItems.value.length; i++) {
    const item = orderItems.value[i];
    if (!item.name || !item.quantity || !item.selected_weight_id || !item.warehouse_id) {
      alert(t("orders.validation.incompleteOrderItem", { index: i + 1 }));
      return;
    }

    // Validate from_company_id for Fast case
    if (formData.value.case === "Fast" && !item.from_company_id) {
      alert(t("orders.validation.fromCompanyRequired", { index: i + 1 }));
      return;
    }

    // Validate to_company_id for Part case
    if (formData.value.case === "Part" && !item.to_company_id) {
      alert(t("orders.validation.toCompanyRequired", { index: i + 1 }));
      return;
    }
  }

  // Transform order items to API format
  const transformedOrderItems = orderItems.value.map((item) => ({
    name: item.name,
    description: item.description || "",
    quantity: parseInt(item.quantity),
    weight: parseInt(item.selected_weight_id), // Convert selected_weight_id to weight
    from_company_id: item.from_company_id ? parseInt(item.from_company_id) : null,
    to_company_id: item.to_company_id ? parseInt(item.to_company_id) : null,
    warehouse_id: parseInt(item.warehouse_id),
    multi_group_id: item.multi_group_id || null,
    items: [], // Nested items array (empty for now)
  }));

  // Build order data matching API format
  const resolvedCompanyId = companyId.value
    ? parseInt(companyId.value)
    : formData.value.company_id
      ? parseInt(formData.value.company_id)
      : null;

  const orderData = {
    from_company_id: parseInt(formData.value.branch_customer_company_id),
    to_id: parseInt(formData.value.to_id),
    price: parseFloat(formData.value.price),
    currency_id: currencyId.value
      ? parseInt(currencyId.value)
      : parseInt(formData.value.currency_id),
    lineprice_id: parseInt(formData.value.lineprice_id),
    discount_id: formData.value.discount_id ? parseInt(formData.value.discount_id) : null,
    company_item_price_id: parseInt(formData.value.company_item_price_id),
    case: formData.value.case,
    type: formData.value.type,
    package: formData.value.package,
    parent_order_id: formData.value.parent_order_id ? parseInt(formData.value.parent_order_id) : null,
    company_id: resolvedCompanyId,
    is_delivery_price_from_customer: 0, // Default value
    order_items: transformedOrderItems,
  };

  emit("submit", orderData);
  closeWizard();
};
</script>

<style scoped>
.wizard-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 20px;
}

.wizard-steps::before {
  content: "";
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.wizard-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.wizard-step.active .step-number {
  background-color: #0d6efd;
  color: white;
}

.wizard-step.completed .step-number {
  background-color: #198754;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

.wizard-step.active .step-label {
  color: #0d6efd;
  font-weight: 600;
}

.wizard-content {
  min-height: 300px;
}

.step-content {
  animation: fadeIn 0.3s;
}

.order-items-list .card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.order-items-list .card:hover {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
