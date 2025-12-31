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
                    <option value="1">John Doe</option>
                    <option value="2">Sara Mohammed</option>
                    <option value="3">Ahmad Khalil</option>
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
                    <option value="1">Location 1</option>
                    <option value="2">Location 2</option>
                    <option value="3">Location 3</option>
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
                    <option value="1">Order #1</option>
                    <option value="2">Order #2</option>
                    <option value="3">Order #3</option>
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
                    <option value="1">Line Price 1</option>
                    <option value="2">Line Price 2</option>
                    <option value="3">Line Price 3</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">{{
                    $t("orders.form.discountId")
                  }}</label>
                  <select v-model="formData.discount_id" class="form-select">
                    <option value="">{{ $t("orders.form.noDiscount") }}</option>
                    <option value="1">Customer Discount 15%</option>
                    <option value="2">Region Discount 10%</option>
                    <option value="3">Price Discount 5%</option>
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
                    <option
                      v-for="option in companyItemPriceOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">{{
                    $t("orders.form.companyId")
                  }}</label>
                  <select v-model="formData.company_id" class="form-select">
                    <option value="1">Tech Solutions Ltd</option>
                    <option value="2">Fast Delivery Co</option>
                    <option value="3">Global Logistics Inc</option>
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
                    <option value="1">Customer Branch 1</option>
                    <option value="2">Customer Branch 2</option>
                    <option value="3">Customer Branch 3</option>
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
                    <option value="1">Delivery Branch 1</option>
                    <option value="2">Delivery Branch 2</option>
                    <option value="3">Delivery Branch 3</option>
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
                            <option value="1">Tech Solutions Ltd</option>
                            <option value="2">Fast Delivery Co</option>
                            <option value="3">Medical Corp</option>
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
                            <option value="1">Tech Solutions Ltd</option>
                            <option value="2">Fast Delivery Co</option>
                            <option value="3">Medical Corp</option>
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

const { t } = useI18n();

// TODO: Fetch currencies from API if needed
const availableCurrencies = ref([]);

// Simple price formatter
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "$0.00";
  return `$${Number(value).toFixed(2)}`;
};

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "submit"]);

const currentStep = ref(0);

const steps = computed(() => [
  { label: t("orders.wizard.step1") },
  { label: t("orders.wizard.step2") },
  { label: t("orders.wizard.step3") },
]);

const formData = ref({
  customer_id: "",
  to_id: "",
  type: "delivery",
  case: "Full",
  package: "one",
  parent_order_id: "",
  price: "",
  currency_id: "1",
  lineprice_id: "",
  discount_id: "",
  company_item_price_id: "",
  company_id: "1",
  branch_customer_company_id: "",
  branch_delivery_company_id: "",
});

const orderItems = ref([]);
const selectedOrderItems = ref([]);

// Computed properties for dynamic options
const currencyOptions = computed(() =>
  availableCurrencies.value.map((currency) => ({
    value: currency.id,
    label: `${currency.code} (${currency.symbol})`,
  }))
);

const companyItemPriceOptions = computed(() => [
  { value: "1", label: `Small & Light - ${formatPrice(25.5, "USD")}` },
  { value: "2", label: `Small & Heavy - ${formatPrice(45.0, "USD")}` },
  { value: "3", label: `Big & Light - ${formatPrice(35.75, "USD")}` },
  { value: "4", label: `Big & Heavy - ${formatPrice(120.0, "USD")}` },
]);

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
  formData.value = {
    customer_id: "",
    to_id: "",
    type: "delivery",
    case: "Full",
    package: "one",
    parent_order_id: "",
    price: "",
    currency_id: "1",
    lineprice_id: "",
    discount_id: "",
    company_item_price_id: "",
    company_id: "1",
    branch_customer_company_id: "",
    branch_delivery_company_id: "",
  };
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
    if (!item.name || !item.quantity || !item.weight || !item.warehouse_id) {
      alert(t("orders.validation.incompleteOrderItem", { index: i + 1 }));
      return;
    }

    if (item.type === "multi" && !item.multi_group_id) {
      alert(t("orders.validation.multiGroupIdRequired", { index: i + 1 }));
      return;
    }
  }

  const orderData = {
    ...formData.value,
    order_items: orderItems.value,
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
