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

        <!-- Mode Selector -->
        <div class="modal-body pb-0">
          <div class="mode-selector mb-4">
            <div class="mode-tabs mode-tabs-3">
              <button
                type="button"
                class="mode-tab"
                :class="{ active: wizardMode === 'delivery', 'mode-delivery': true }"
                @click="switchMode('delivery')"
              >
                <i class="fas fa-truck me-2"></i>
                {{ $t("orders.wizard.modeDelivery") }}
              </button>
              <button
                type="button"
                class="mode-tab"
                :class="{ active: wizardMode === 'return', 'mode-return': true }"
                @click="switchMode('return')"
              >
                <i class="fas fa-undo me-2"></i>
                {{ $t("orders.wizard.modeReturn") }}
              </button>
              <button
                type="button"
                class="mode-tab"
                :class="{ active: wizardMode === 'exchange', 'mode-exchange': true }"
                @click="switchMode('exchange')"
              >
                <i class="fas fa-exchange-alt me-2"></i>
                {{ $t("orders.wizard.modeExchange") }}
              </button>
            </div>
            <div class="mode-description" :class="wizardMode">
              <i :class="getModeIcon" class="me-2"></i>
              {{ getModeDescription }}
            </div>
          </div>

          <!-- Progress Steps -->
          <div class="wizard-steps mb-4" :class="wizardMode">
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
            <!-- Step 1: Basic Order Info (Delivery Mode) -->
            <div v-show="currentStep === 0 && wizardMode === 'delivery'" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.basicInfo") }}</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.customerId") }}
                    <span class="text-danger">*</span></label
                  >
                  <select
                    v-model="formData.to_id"
                    class="form-select"
                    required
                  >
                    <option value="">
                      {{ $t("orders.form.selectCustomer") }}
                    </option>
                    <option
                      v-for="(customer, index) in props.customers"
                      :key="getCustomerValue(customer) || index"
                      :value="getCustomerValue(customer)"
                    >
                      {{ getCustomerLabel(customer) }}
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
              </div>
            </div>

            <!-- Step 1: Return Mode - Parent Order Selection -->
            <div v-show="currentStep === 0 && wizardMode === 'return'" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.selectParentForReturn") }}</h6>

              <div class="return-parent-selection mb-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label"
                      >{{ $t("orders.form.customerId") }}
                      <span class="text-danger">*</span></label
                    >
                    <select
                      v-model="formData.to_id"
                      class="form-select"
                      :disabled="!!formData.parent_order_id"
                    >
                      <option value="">
                        {{ $t("orders.form.selectCustomer") }}
                      </option>
                      <option
                        v-for="(customer, index) in props.customers"
                        :key="getCustomerValue(customer) || index"
                        :value="getCustomerValue(customer)"
                      >
                        {{ getCustomerLabel(customer) }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label"
                      >{{ $t("orders.wizard.originalOrder") }}
                      <span class="text-danger">*</span></label
                    >
                    <select
                      v-model="formData.parent_order_id"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">
                        {{ $t("orders.form.selectParentOrder") }}
                      </option>
                      <option
                        v-for="order in filteredParentOrders"
                        :key="order.id"
                        :value="order.id"
                      >
                        {{ order.order_code }} - {{ order.customer_name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Selected Order Preview -->
                <div v-if="selectedParentOrder" class="parent-order-preview return-preview mt-3">
                  <div class="preview-header return-header">
                    <i class="fas fa-receipt me-2"></i>
                    {{ $t("orders.wizard.selectedOrderDetails") }}
                  </div>
                  <div class="preview-body">
                    <div class="row">
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.table.id") }}</span>
                          <span class="preview-value">{{ selectedParentOrder.order_code }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.table.customer") }}</span>
                          <span class="preview-value">{{ selectedParentOrder.customer_name }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.form.returnPrice") }}</span>
                          <span class="preview-value text-success fw-bold">{{ parentOrderPriceDisplay }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Return Case Type -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.form.case") }}
                    <span class="text-danger">*</span></label
                  >
                  <select v-model="formData.case" class="form-select" required>
                    <option value="Full">{{ $t("orders.form.caseFull") }}</option>
                    <option value="Part">{{ $t("orders.form.casePart") }}</option>
                    <option value="Fast">{{ $t("orders.form.caseFast") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 1: Exchange Mode - Parent Order Selection -->
            <div v-show="currentStep === 0 && wizardMode === 'exchange'" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.selectOriginalOrder") }}</h6>

              <!-- Parent Order Selection Card -->
              <div class="exchange-parent-selection mb-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label"
                      >{{ $t("orders.form.customerId") }}
                      <span class="text-danger">*</span></label
                    >
                    <select
                      v-model="formData.to_id"
                      class="form-select"
                      :disabled="!!formData.parent_order_id"
                    >
                      <option value="">
                        {{ $t("orders.form.selectCustomer") }}
                      </option>
                      <option
                        v-for="(customer, index) in props.customers"
                        :key="getCustomerValue(customer) || index"
                        :value="getCustomerValue(customer)"
                      >
                        {{ getCustomerLabel(customer) }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label"
                      >{{ $t("orders.wizard.originalOrder") }}
                      <span class="text-danger">*</span></label
                    >
                    <select
                      v-model="formData.parent_order_id"
                      class="form-select form-select-lg"
                      required
                    >
                      <option value="">
                        {{ $t("orders.form.selectParentOrder") }}
                      </option>
                      <option
                        v-for="order in filteredParentOrders"
                        :key="order.id"
                        :value="order.id"
                      >
                        {{ order.order_code }} - {{ order.customer_name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Selected Order Preview -->
                <div v-if="selectedParentOrder" class="parent-order-preview mt-3">
                  <div class="preview-header">
                    <i class="fas fa-receipt me-2"></i>
                    {{ $t("orders.wizard.selectedOrderDetails") }}
                  </div>
                  <div class="preview-body">
                    <div class="row">
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.table.id") }}</span>
                          <span class="preview-value">{{ selectedParentOrder.order_code }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.table.customer") }}</span>
                          <span class="preview-value">{{ selectedParentOrder.customer_name }}</span>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="preview-item">
                          <span class="preview-label">{{ $t("orders.form.returnPrice") }}</span>
                          <span class="preview-value text-success fw-bold">{{ parentOrderPriceDisplay }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Exchange Case Type -->
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.wizard.caseDelivery") }}
                    <span class="text-danger">*</span></label
                  >
                  <select v-model="formData.case" class="form-select" required>
                    <option value="Full">{{ $t("orders.form.caseFull") }}</option>
                    <option value="Part">{{ $t("orders.form.casePart") }}</option>
                    <option value="Fast">{{ $t("orders.form.caseFast") }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label"
                    >{{ $t("orders.wizard.caseReturn") }}
                    <span class="text-danger">*</span></label
                  >
                  <select v-model="formData.case_return" class="form-select" required>
                    <option value="Full">{{ $t("orders.form.caseFull") }}</option>
                    <option value="Part">{{ $t("orders.form.casePart") }}</option>
                    <option value="Fast">{{ $t("orders.form.caseFast") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 2: Pricing & Details -->
            <div v-show="currentStep === 1" class="step-content">
              <h6 class="mb-3">{{ $t("orders.wizard.pricingDetails") }}</h6>

              <!-- Exchange Mode Pricing Summary -->
              <div v-if="wizardMode === 'exchange'" class="exchange-pricing-summary mb-4">
                <div class="row">
                  <div class="col-md-6">
                    <div class="pricing-card delivery">
                      <div class="pricing-icon">
                        <i class="fas fa-truck"></i>
                      </div>
                      <div class="pricing-info">
                        <span class="pricing-label">{{ $t("orders.wizard.newDeliveryPrice") }}</span>
                        <div class="pricing-input">
                          <input
                            v-model="formData.price"
                            type="number"
                            class="form-control form-control-lg"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="pricing-card return">
                      <div class="pricing-icon">
                        <i class="fas fa-undo"></i>
                      </div>
                      <div class="pricing-info">
                        <span class="pricing-label">{{ $t("orders.wizard.originalOrderPrice") }}</span>
                        <span class="pricing-value">{{ parentOrderPriceDisplay || '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Normal Order Price (Delivery/Return modes) -->
              <div v-if="wizardMode !== 'exchange'" class="row g-3 mb-3">
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
                    <option value="">
                      {{ $t("orders.form.selectCurrency") }}
                    </option>
                    <option
                      v-for="(currency, index) in props.currencies"
                      :key="getCurrencyValue(currency) || index"
                      :value="getCurrencyValue(currency)"
                    >
                      {{ getCurrencyLabel(currency) }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row g-3">
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
                      v-for="(linePrice, index) in props.linePrices"
                      :key="getLinePriceValue(linePrice) || index"
                      :value="getLinePriceValue(linePrice)"
                    >
                      {{ getLinePriceLabel(linePrice) }}
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
                      v-for="(price, index) in props.companyPrices"
                      :key="getCompanyPriceValue(price) || index"
                      :value="getCompanyPriceValue(price)"
                    >
                      {{ getCompanyPriceLabel(price) }}
                    </option>
                  </select>
                </div>

                <div v-if="wizardMode !== 'exchange'" class="col-md-6">
                  <label class="form-label">{{
                    $t("orders.form.discountId")
                  }}</label>
                  <select v-model="formData.discount_id" class="form-select">
                    <option value="">{{ $t("orders.form.noDiscount") }}</option>
                    <option
                      v-for="(discount, index) in props.discounts"
                      :key="getDiscountValue(discount) || index"
                      :value="getDiscountValue(discount)"
                    >
                      {{ getDiscountLabel(discount) }}
                    </option>
                  </select>
                </div>

                <!-- Checkboxes Section -->
                <div class="col-12">
                  <div class="row g-3 mt-2">
                    <div class="col-md-6">
                      <div class="form-check">
                        <input
                          id="deliveryPriceFromCustomer"
                          v-model="formData.is_delivery_price_from_customer"
                          class="form-check-input"
                          type="checkbox"
                          :true-value="1"
                          :false-value="0"
                        />
                        <label class="form-check-label" for="deliveryPriceFromCustomer">
                          {{ $t("orders.form.deliveryPriceFromCustomer") }}
                        </label>
                      </div>
                    </div>

                    <div v-if="wizardMode === 'exchange'" class="col-md-6">
                      <div class="form-check">
                        <input
                          id="priceFromCustomer"
                          v-model="formData.is_price_from_customer"
                          class="form-check-input"
                          type="checkbox"
                          :true-value="1"
                          :false-value="0"
                        />
                        <label class="form-check-label" for="priceFromCustomer">
                          {{ $t("orders.form.priceFromCustomer") }}
                        </label>
                      </div>
                    </div>
                  </div>
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
                    class="btn btn-sm"
                    :class="getAddButtonClass"
                    @click="addOrderItem"
                    :disabled="isAddItemDisabled"
                  >
                    <i class="fas fa-plus me-2"></i>
                    {{ $t("orders.wizard.addItem") }}
                  </button>
                </div>

                <!-- Single Package Info (only for delivery orders) -->
                <div v-if="wizardMode === 'delivery' && formData.package === 'one' && orderItems.length >= 1" class="alert alert-warning mb-3">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ $t("orders.wizard.singlePackageLimit") }}
                </div>

                <!-- Exchange Mode Info -->
                <div v-if="wizardMode === 'exchange' && orderItems.length === 0" class="alert alert-info exchange-info mb-3">
                  <i class="fas fa-exchange-alt me-2"></i>
                  {{ $t("orders.wizard.exchangeItemsInfo") }}
                </div>

                <!-- No Items Message -->
                <div v-else-if="orderItems.length === 0" class="alert alert-info">
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
                    :class="{ 'exchange-item-card': wizardMode === 'exchange' }"
                  >
                    <div class="card-header d-flex justify-content-between align-items-center" v-if="wizardMode === 'exchange'">
                      <span class="fw-bold">
                        <i class="fas fa-box me-2"></i>
                        {{ $t("orders.wizard.exchangeItem") }} #{{ index + 1 }}
                      </span>
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        @click="removeOrderItem(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <!-- Branch Customer Company -->
                        <div class="col-md-6">
                          <label class="form-label">
                            {{ $t("orders.form.branchCustomerCompanyId") }}
                            <span class="text-danger">*</span>
                          </label>
                          <select
                            v-model="item.branch_customer_company_id"
                            class="form-select"
                            required
                          >
                            <option value="">
                              {{ $t("orders.form.selectBranch") }}
                            </option>
                            <option
                              v-for="(branch, bIndex) in getBranchOptions(item, 'customer')"
                              :key="getBranchValue(branch) || bIndex"
                              :value="getBranchValue(branch)"
                            >
                              {{ getBranchLabel(branch) }}
                            </option>
                          </select>
                        </div>

                        <!-- Branch Delivery Company -->
                        <div class="col-md-6">
                          <label class="form-label">
                            {{ $t("orders.form.branchDeliveryCompanyId") }}
                            <span class="text-danger">*</span>
                          </label>
                          <select
                            v-model="item.branch_delivery_company_id"
                            class="form-select"
                            required
                          >
                            <option value="">
                              {{ $t("orders.form.selectBranch") }}
                            </option>
                            <option
                              v-for="(branch, bIndex) in getBranchOptions(item, 'delivery')"
                              :key="getBranchValue(branch) || bIndex"
                              :value="getBranchValue(branch)"
                            >
                              {{ getBranchLabel(branch) }}
                            </option>
                          </select>
                        </div>

                        <!-- Nested Items (Delivery/Return Orders) -->
                        <div v-if="wizardMode !== 'exchange'" class="col-12">
                          <label class="form-label fw-bold">
                            {{ $t("orders.wizard.nestedItems") }}
                          </label>
                          <div class="border rounded p-3">
                            <button
                              type="button"
                              class="btn btn-sm btn-success mb-2"
                              @click="addNestedItem(index)"
                            >
                              <i class="fas fa-plus me-1"></i>
                              {{ $t("orders.wizard.addNestedItem") }}
                            </button>

                            <div
                              v-for="(nestedItem, nestedIndex) in item.items"
                              :key="nestedIndex"
                              class="row g-2 mb-2 align-items-center"
                            >
                              <div class="col-md-5">
                                <input
                                  v-model="nestedItem.name"
                                  type="text"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemName')"
                                />
                              </div>
                              <div class="col-md-3">
                                <input
                                  v-model="nestedItem.quantity"
                                  type="number"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemQuantity')"
                                  min="1"
                                />
                              </div>
                              <div class="col-md-4">
                                <button
                                  type="button"
                                  class="btn btn-sm btn-danger"
                                  @click="removeNestedItem(index, nestedIndex)"
                                >
                                  <i class="fas fa-times me-1"></i>
                                  <span>X</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Exchange Mode: Delivery Items -->
                        <div v-if="wizardMode === 'exchange'" class="col-md-6">
                          <label class="form-label fw-bold text-primary">
                            <i class="fas fa-truck me-1"></i>
                            {{ $t("orders.wizard.deliveryItems") }}
                          </label>
                          <div class="border border-primary rounded p-3 items-section delivery-section">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary mb-2"
                              @click="addNestedItem(index, 'itemsDelivery')"
                            >
                              <i class="fas fa-plus me-1"></i>
                              {{ $t("orders.wizard.addDeliveryItem") }}
                            </button>

                            <div
                              v-for="(nestedItem, nestedIndex) in item.itemsDelivery"
                              :key="nestedIndex"
                              class="row g-2 mb-2 align-items-center"
                            >
                              <div class="col-7">
                                <input
                                  v-model="nestedItem.name"
                                  type="text"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemName')"
                                />
                              </div>
                              <div class="col-3">
                                <input
                                  v-model="nestedItem.quantity"
                                  type="number"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemQuantity')"
                                  min="1"
                                />
                              </div>
                              <div class="col-2">
                                <button
                                  type="button"
                                  class="btn btn-sm btn-danger w-100"
                                  @click="removeNestedItem(index, nestedIndex, 'itemsDelivery')"
                                >
                                  <i class="fas fa-times"></i>
                                </button>
                              </div>
                            </div>

                            <div v-if="item.itemsDelivery.length === 0" class="text-muted small">
                              {{ $t("orders.wizard.noDeliveryItems") }}
                            </div>
                          </div>
                        </div>

                        <!-- Exchange Mode: Return Items -->
                        <div v-if="wizardMode === 'exchange'" class="col-md-6">
                          <label class="form-label fw-bold text-warning">
                            <i class="fas fa-undo me-1"></i>
                            {{ $t("orders.wizard.returnItems") }}
                          </label>
                          <div class="border border-warning rounded p-3 items-section return-section">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-warning mb-2"
                              @click="addNestedItem(index, 'itemsReturn')"
                            >
                              <i class="fas fa-plus me-1"></i>
                              {{ $t("orders.wizard.addReturnItem") }}
                            </button>

                            <div
                              v-for="(nestedItem, nestedIndex) in item.itemsReturn"
                              :key="nestedIndex"
                              class="row g-2 mb-2 align-items-center"
                            >
                              <div class="col-7">
                                <input
                                  v-model="nestedItem.name"
                                  type="text"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemName')"
                                />
                              </div>
                              <div class="col-3">
                                <input
                                  v-model="nestedItem.quantity"
                                  type="number"
                                  class="form-control form-control-sm"
                                  :placeholder="$t('orders.wizard.itemQuantity')"
                                  min="1"
                                />
                              </div>
                              <div class="col-2">
                                <button
                                  type="button"
                                  class="btn btn-sm btn-danger w-100"
                                  @click="removeNestedItem(index, nestedIndex, 'itemsReturn')"
                                >
                                  <i class="fas fa-times"></i>
                                </button>
                              </div>
                            </div>

                            <div v-if="item.itemsReturn.length === 0" class="text-muted small">
                              {{ $t("orders.wizard.noReturnItems") }}
                            </div>
                          </div>
                        </div>

                        <!-- Remove Button (Delivery/Return Orders) -->
                        <div v-if="wizardMode !== 'exchange'" class="col-12">
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
  if (value === null || value === undefined || value === "" || isNaN(value)) {
    return `${symbol}0.00`;
  }
  return `${symbol}${Number(value).toFixed(2)}`;
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const toNumericId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toSelectValue = (value) => {
  const numeric = toNumericId(value);
  return numeric === null ? "" : String(numeric);
};

const getEntityId = (entity, fallbackKey) => {
  if (!entity) return "";
  if (Array.isArray(entity)) return entity[0] ?? "";
  if (entity.id !== undefined && entity.id !== null) return entity.id;
  if (fallbackKey && entity[fallbackKey] !== undefined && entity[fallbackKey] !== null) {
    return entity[fallbackKey];
  }
  return "";
};

const getCustomerValue = (customer) => getEntityId(customer, "customer_id");
const getCurrencyValue = (currency) => getEntityId(currency, "currency_id");
const getLinePriceValue = (linePrice) => getEntityId(linePrice, "lineprice_id");
const getDiscountValue = (discount) => getEntityId(discount, "discount_id");
const getCompanyPriceValue = (price) =>
  getEntityId(price, "company_item_price_id");
const getBranchValue = (branch) => getEntityId(branch, "branch_id");

const getBranchLabel = (branch) => {
  if (!branch) return "";
  if (Array.isArray(branch)) {
    return branch[1] || (branch[0] ? `Branch ${branch[0]}` : "");
  }
  return branch.name || (branch.id ? `Branch ${branch.id}` : "");
};

const getBranchOptions = (item, mode) => {
  const otherId =
    mode === "customer"
      ? normalizeId(item.branch_delivery_company_id)
      : normalizeId(item.branch_customer_company_id);
  return props.branches.filter((branch) => {
    const branchId = normalizeId(getBranchValue(branch));
    return !otherId || branchId !== otherId;
  });
};

const getOrderCustomerId = (order) => {
  if (!order) return "";
  return (
    order.customer_id ??
    order.customer?.id ??
    order.to_id ??
    ""
  );
};

const getCustomerLabel = (customer) => {
  if (!customer) return "";
  if (Array.isArray(customer)) {
    return customer[1] || (customer[0] ? `Customer ${customer[0]}` : "");
  }
  return (
    customer.name ||
    customer.full_name ||
    customer.customer_name ||
    (customer.id || customer.customer_id ? `Customer ${customer.id || customer.customer_id}` : "")
  );
};

const getCurrencyLabel = (currency) => {
  if (!currency) return "";
  if (Array.isArray(currency)) {
    return currency[1] || (currency[0] ? `Currency ${currency[0]}` : "");
  }
  const name =
    currency.name ||
    currency.nameenglish ||
    currency.namearabic ||
    currency.code ||
    "";
  const symbol = currency.symbol || "";
  if (name && symbol) return `${name} (${symbol})`;
  return name || symbol || (currency.id ? `Currency ${currency.id}` : "");
};

const getLinePriceName = (linePrice) => {
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

const getLinePriceSymbol = (linePrice) => {
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

const getLinePriceLabel = (linePrice) => {
  const lineName = getLinePriceName(linePrice);
  const symbol = getLinePriceSymbol(linePrice);
  const priceLabel = formatPrice(linePrice.price, symbol);
  return lineName ? `${lineName} - ${priceLabel}` : priceLabel;
};

const getDiscountLabel = (discount) => {
  if (!discount) return "";
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

const getCompanyPriceLabel = (price) => {
  if (!price) return "";
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
      ? formatPrice(priceValue, currencySymbol)
      : "";
  if (itemType && priceLabel) return `${itemType} - ${priceLabel}`;
  return itemType || priceLabel || `Price #${price.id}`;
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

const emit = defineEmits(["close", "submit"]);

const currentStep = ref(0);
const wizardMode = ref("delivery"); // 'delivery', 'return', or 'exchange'

const steps = computed(() => {
  if (wizardMode.value === "exchange") {
    return [
      { label: t("orders.wizard.stepSelectOrder") },
      { label: t("orders.wizard.step2") },
      { label: t("orders.wizard.step3") },
    ];
  }
  if (wizardMode.value === "return") {
    return [
      { label: t("orders.wizard.stepSelectParent") },
      { label: t("orders.wizard.step2") },
      { label: t("orders.wizard.step3") },
    ];
  }
  return [
    { label: t("orders.wizard.step1") },
    { label: t("orders.wizard.step2") },
    { label: t("orders.wizard.step3") },
  ];
});

const getModeIcon = computed(() => {
  if (wizardMode.value === "delivery") return "fas fa-truck";
  if (wizardMode.value === "return") return "fas fa-undo";
  return "fas fa-exchange-alt";
});

const getModeDescription = computed(() => {
  if (wizardMode.value === "delivery") return t("orders.wizard.modeDeliveryDesc");
  if (wizardMode.value === "return") return t("orders.wizard.modeReturnDesc");
  return t("orders.wizard.modeExchangeDesc");
});

const getAddButtonClass = computed(() => {
  if (wizardMode.value === "exchange") return "btn-warning";
  if (wizardMode.value === "return") return "btn-info";
  return "btn-primary";
});

const buildDefaultFormData = () => ({
  to_id: "",
  type: "delivery",
  case: "Full",
  case_return: "Full", // For exchange mode
  package: "one",
  parent_order_id: "",
  price: "",
  currency_id: toSelectValue(currencyId.value),
  lineprice_id: "",
  discount_id: "",
  company_item_price_id: "",
  company_id: toSelectValue(companyId.value),
  is_delivery_price_from_customer: 0,
  is_price_from_customer: 0,
});

const formData = ref(buildDefaultFormData());

const orderItems = ref([]);

const switchMode = (mode) => {
  if (wizardMode.value === mode) return;
  wizardMode.value = mode;
  currentStep.value = 0;
  formData.value = buildDefaultFormData();
  orderItems.value = [];

  // Set type and package based on mode
  if (mode === "exchange") {
    formData.value.type = "exchange";
    formData.value.package = "one"; // Exchange is always single package
  } else if (mode === "return") {
    formData.value.type = "return";
    formData.value.package = "one"; // Return is always single package
  } else {
    formData.value.type = "delivery";
  }
};

const isExchange = computed(() => wizardMode.value === "exchange");
const isReturn = computed(() => wizardMode.value === "return");
const isDelivery = computed(() => wizardMode.value === "delivery");

const requiresParentOrder = computed(() =>
  wizardMode.value === "exchange" || wizardMode.value === "return"
);

const requiresSinglePackage = computed(() =>
  wizardMode.value === "exchange" || wizardMode.value === "return"
);

const isCustomerLocked = computed(() =>
  requiresParentOrder.value && !!formData.value.parent_order_id
);

const selectedParentOrder = computed(() => {
  const parentId = formData.value.parent_order_id;
  if (!parentId) return null;
  return props.existingOrders.find(
    (order) => String(order.id) === String(parentId)
  );
});

const parentOrderPriceValue = computed(() => {
  const price = selectedParentOrder.value?.price;
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number.parseFloat(price);
  return Number.isNaN(numeric) ? "" : numeric;
});

const parentOrderPriceDisplay = computed(() => {
  if (parentOrderPriceValue.value === "") return "";
  const symbol = selectedParentOrder.value?.currency_symbol || "$";
  return formatPrice(parentOrderPriceValue.value, symbol);
});

const filteredParentOrders = computed(() => {
  if (!requiresParentOrder.value) {
    return props.existingOrders;
  }
  const selectedCustomerId = normalizeId(formData.value.to_id);
  if (!selectedCustomerId) {
    return props.existingOrders;
  }
  return props.existingOrders.filter(
    (order) => normalizeId(getOrderCustomerId(order)) === selectedCustomerId
  );
});

const isPackageDisabled = computed(() => {
  return requiresSinglePackage.value;
});

const isMultiDisabled = computed(() => {
  return (
    requiresSinglePackage.value ||
    formData.value.case === "Part" ||
    formData.value.case === "Fast"
  );
});

// Disable add item button when single package already has 1 item
const isAddItemDisabled = computed(() => {
  return formData.value.package === "one" && orderItems.value.length >= 1;
});

const handleCaseChange = () => {
  if (formData.value.case === "Part" || formData.value.case === "Fast") {
    formData.value.package = "one";
  }
};

const addOrderItem = () => {
  orderItems.value.push({
    branch_customer_company_id: "",
    branch_delivery_company_id: "",
    items: [], // For multi-package nested items
    itemsDelivery: [],
    itemsReturn: [],
  });
};

const removeOrderItem = (index) => {
  orderItems.value.splice(index, 1);
};

const getNestedItemsList = (item, listKey) => {
  if (!Array.isArray(item[listKey])) {
    item[listKey] = [];
  }
  return item[listKey];
};

const addNestedItem = (itemIndex, listKey = "items") => {
  const list = getNestedItemsList(orderItems.value[itemIndex], listKey);
  list.push({
    name: "",
    quantity: 1,
  });
};

const removeNestedItem = (itemIndex, nestedIndex, listKey = "items") => {
  const list = getNestedItemsList(orderItems.value[itemIndex], listKey);
  list.splice(nestedIndex, 1);
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
  wizardMode.value = "delivery";
  formData.value = buildDefaultFormData();
  orderItems.value = [];
  emit("close");
};

const submitOrder = () => {
  // Validation
  if (requiresParentOrder.value && !formData.value.parent_order_id) {
    alert(t("orders.validation.returnRequiresParentOrder"));
    return;
  }
  if (isExchange.value && parentOrderPriceValue.value === "") {
    alert(t("orders.validation.parentOrderPriceMissing"));
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
    if (!item.branch_customer_company_id || !item.branch_delivery_company_id) {
      alert(t("orders.validation.incompleteOrderItem", { index: i + 1 }));
      return;
    }
    if (
      normalizeId(item.branch_customer_company_id) ===
      normalizeId(item.branch_delivery_company_id)
    ) {
      alert(t("orders.validation.sameBranchNotAllowed", { index: i + 1 }));
      return;
    }
  }

  const buildNestedItems = (items) => {
    const list = Array.isArray(items) ? items : [];
    return list
      .filter((nested) => nested.name && nested.quantity)
      .map((nested) => ({
        name: nested.name,
        quantity: parseInt(nested.quantity),
      }));
  };

  // Transform order items to API format
  const transformedOrderItems = orderItems.value.map((item) => {
    const apiItem = {
      branch_customer_company_id: parseInt(item.branch_customer_company_id),
      branch_delivery_company_id: parseInt(item.branch_delivery_company_id),
    };

    if (isExchange.value) {
      apiItem.itemsDelivery = buildNestedItems(item.itemsDelivery);
      apiItem.itemsReturn = buildNestedItems(item.itemsReturn);
    } else if (item.items && item.items.length > 0) {
      apiItem.items = buildNestedItems(item.items);
    }

    return apiItem;
  });

  // Build order data matching API format
  const resolvedCompanyId =
    toNumericId(companyId.value) ?? toNumericId(formData.value.company_id);
  const resolvedCurrencyId =
    toNumericId(formData.value.currency_id) ?? toNumericId(currencyId.value);

  if (!resolvedCurrencyId) {
    alert(t("common.validationError"));
    return;
  }

  const baseOrderData = {
    to_id: parseInt(formData.value.to_id),
    price: parseFloat(formData.value.price),
    currency_id: resolvedCurrencyId,
    lineprice_id: parseInt(formData.value.lineprice_id),
    discount_id: formData.value.discount_id ? parseInt(formData.value.discount_id) : null,
    company_item_price_id: parseInt(formData.value.company_item_price_id),
    case: formData.value.case,
    type: formData.value.type,
    package: requiresSinglePackage.value ? "one" : formData.value.package,
    parent_order_id: formData.value.parent_order_id ? parseInt(formData.value.parent_order_id) : null,
    company_id: resolvedCompanyId,
    order_items: transformedOrderItems,
    is_delivery_price_from_customer: (() => {
      const parsed = Number.parseInt(
        formData.value.is_delivery_price_from_customer,
        10
      );
      return Number.isNaN(parsed) ? 0 : parsed;
    })(),
  };

  // Add from_company_id if set
  if (resolvedCompanyId) {
    baseOrderData.from_company_id = resolvedCompanyId;
  }

  if (isExchange.value) {
    const exchangePayload = {
      price: parseFloat(formData.value.price),
      lineprice_id: parseInt(formData.value.lineprice_id),
      company_item_price_id: parseInt(formData.value.company_item_price_id),
      case_delivery: formData.value.case,
      case_return: formData.value.case_return || formData.value.case,
      is_delivery_price_from_customer: (() => {
        const parsed = Number.parseInt(
          formData.value.is_delivery_price_from_customer,
          10
        );
        return Number.isNaN(parsed) ? 0 : parsed;
      })(),
      is_price_from_customer: (() => {
        const parsed = Number.parseInt(formData.value.is_price_from_customer, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      })(),
      order_items: transformedOrderItems,
    };

    emit("submit", {
      exchange: true,
      parentOrderId: parseInt(formData.value.parent_order_id),
      payload: exchangePayload,
    });
    closeWizard();
    return;
  }

  // Add is_extra_price_for_customer for return orders
  if (formData.value.type === "return") {
    baseOrderData.is_extra_price_for_customer = 0; // Default to 0, can be made configurable later
  }
  emit("submit", baseOrderData);
  closeWizard();
};

watch(
  () => formData.value.parent_order_id,
  (newValue) => {
    if (!requiresParentOrder.value || !newValue) return;
    const selected = props.existingOrders.find(
      (order) => String(order.id) === String(newValue)
    );
    if (!selected) return;
    const customerId = getOrderCustomerId(selected);
    if (customerId !== "" && customerId !== null && customerId !== undefined) {
      formData.value.to_id = String(customerId);
    }
  }
);

watch(
  () => formData.value.to_id,
  (newValue) => {
    if (!requiresParentOrder.value || !formData.value.parent_order_id) return;
    const selected = props.existingOrders.find(
      (order) => String(order.id) === String(formData.value.parent_order_id)
    );
    if (!selected) return;
    const customerId = normalizeId(getOrderCustomerId(selected));
    if (customerId && normalizeId(newValue) !== customerId) {
      formData.value.parent_order_id = "";
    }
  }
);

// Type is now controlled by wizardMode, so we just ensure package consistency
watch(
  () => wizardMode.value,
  (newValue) => {
    if (newValue === "delivery") {
      // Delivery mode can have multi-package
      // No restrictions needed
    } else {
      // Return and Exchange modes are single package only
      formData.value.package = "one";
    }
  }
);
</script>

<style scoped>
/* Mode Selector Styles */
.mode-selector {
  margin-bottom: 1.5rem;
}

.mode-tabs {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
}

.mode-tab {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background-color: #f8f9fa;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-tabs-3 .mode-tab {
  border-right: 1px solid #e0e0e0;
}

.mode-tabs-3 .mode-tab:last-child {
  border-right: none;
}

.mode-tab.mode-delivery.active {
  background-color: #0d6efd;
  color: white;
}

.mode-tab.mode-return.active {
  background-color: #17a2b8;
  color: white;
}

.mode-tab.mode-exchange.active {
  background-color: #fd7e14;
  color: white;
}

.mode-tab:hover:not(.active) {
  background-color: #e9ecef;
}

.mode-description {
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
}

.mode-description.delivery {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  border-left: 3px solid #0d6efd;
}

.mode-description.return {
  background-color: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
  border-left: 3px solid #17a2b8;
}

.mode-description.exchange {
  background-color: rgba(253, 126, 20, 0.1);
  color: #fd7e14;
  border-left: 3px solid #fd7e14;
}

/* Wizard Steps */
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

.wizard-steps.return::before {
  background-color: rgba(23, 162, 184, 0.3);
}

.wizard-steps.exchange::before {
  background-color: rgba(253, 126, 20, 0.3);
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

.wizard-steps.delivery .wizard-step.active .step-number {
  background-color: #0d6efd;
  color: white;
}

.wizard-steps.return .wizard-step.active .step-number {
  background-color: #17a2b8;
  color: white;
}

.wizard-steps.exchange .wizard-step.active .step-number {
  background-color: #fd7e14;
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

.wizard-steps.delivery .wizard-step.active .step-label {
  color: #0d6efd;
  font-weight: 600;
}

.wizard-steps.return .wizard-step.active .step-label {
  color: #17a2b8;
  font-weight: 600;
}

.wizard-steps.exchange .wizard-step.active .step-label {
  color: #fd7e14;
  font-weight: 600;
}

.wizard-content {
  min-height: 300px;
}

.step-content {
  animation: fadeIn 0.3s;
}

/* Return Parent Selection */
.return-parent-selection {
  background-color: #f0f9fa;
  border: 1px solid rgba(23, 162, 184, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.parent-order-preview.return-preview .preview-header,
.return-header {
  background-color: #17a2b8;
}

/* Exchange Parent Selection */
.exchange-parent-selection {
  background-color: #fff8f0;
  border: 1px solid rgba(253, 126, 20, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.parent-order-preview {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.preview-header {
  background-color: #fd7e14;
  color: white;
  padding: 10px 16px;
  font-weight: 500;
}

.preview-body {
  padding: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.preview-value {
  font-size: 1rem;
  font-weight: 500;
}

/* Exchange Pricing Summary */
.exchange-pricing-summary .pricing-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  height: 100%;
}

.pricing-card.delivery {
  background-color: rgba(13, 110, 253, 0.1);
  border: 1px solid rgba(13, 110, 253, 0.3);
}

.pricing-card.return {
  background-color: rgba(253, 126, 20, 0.1);
  border: 1px solid rgba(253, 126, 20, 0.3);
}

.pricing-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.pricing-card.delivery .pricing-icon {
  background-color: #0d6efd;
  color: white;
}

.pricing-card.return .pricing-icon {
  background-color: #fd7e14;
  color: white;
}

.pricing-info {
  flex: 1;
}

.pricing-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.pricing-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.pricing-input .form-control {
  font-size: 1.25rem;
  font-weight: 500;
}

/* Order Items */
.order-items-list .card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.order-items-list .card:hover {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
}

.exchange-item-card {
  border-color: rgba(253, 126, 20, 0.5) !important;
}

.exchange-item-card:hover {
  border-color: #fd7e14 !important;
  box-shadow: 0 2px 8px rgba(253, 126, 20, 0.2) !important;
}

.exchange-item-card .card-header {
  background-color: rgba(253, 126, 20, 0.1);
  border-bottom: 1px solid rgba(253, 126, 20, 0.2);
}

.exchange-info {
  background-color: rgba(253, 126, 20, 0.1);
  border-color: rgba(253, 126, 20, 0.3);
  color: #b35900;
}

.items-section {
  min-height: 120px;
  background-color: rgba(0, 0, 0, 0.02);
}

.delivery-section {
  background-color: rgba(13, 110, 253, 0.05);
}

.return-section {
  background-color: rgba(253, 126, 20, 0.05);
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
