<template>
  <div>
    <!-- Order Items (only shown in details tab) -->
    <div v-if="tab === 'details' && hasOrderItems" class="mt-4">
      <h6 class="fw-bold text-primary mb-3">{{ $t("orders.details.orderItems") }}</h6>
      <div
        v-for="item in order.order_items"
        :key="item.id"
        class="card border-0 shadow-sm mb-3"
      >
        <div class="card-body p-3">
          <h6 class="fw-semibold mb-2">{{ getOrderItemTitle(item) }}</h6>
          <p v-if="getOrderItemQuantity(item) !== null" class="text-muted small mb-2">
            {{ $t("orders.details.quantity") }}: {{ getOrderItemQuantity(item) }}
          </p>
          <div v-if="item.items && item.items.length > 0">
            <p class="fw-semibold small mb-1">{{ $t("orders.details.subItems") }}:</p>
            <ul class="list-unstyled ms-3">
              <li v-for="(subItem, index) in item.items" :key="index" class="small text-muted">
                - {{ subItem.name }} ({{ subItem.quantity }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Exchanged Tab Content -->
    <div v-if="tab === 'exchanged'" class="exchange-tab-content">
      <!-- No Exchange -->
      <div v-if="!exchange?.hasExchange" class="text-center py-5">
        <i class="fas fa-exchange-alt fa-3x text-muted mb-3"></i>
        <p class="text-muted">{{ $t("orders.details.noExchange") }}</p>
      </div>

      <!-- Exchange Orders -->
      <div v-else class="exchange-orders">
        <div class="row">
          <!-- Delivery Order Card -->
          <div class="col-md-6 mb-3">
            <div class="exchange-part delivery-part h-100">
              <div class="part-header d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                  <i class="fas fa-truck me-2"></i>
                  {{ $t("orders.exchange.deliveryPart") }}
                  <span class="badge bg-primary ms-2">#{{ exchange?.delivery?.id }}</span>
                </div>
                <div class="flex-shrink-0 ms-2">
                  <ActionsDropdown
                    v-if="exchange?.delivery"
                    :row="exchange.delivery"
                    :editLabel="$t('orders.actions.edit')"
                    :detailsLabel="$t('orders.actions.view')"
                    :deleteLabel="$t('orders.actions.delete')"
                    :confirmDelete="true"
                    @edit="$emit('edit', exchange.delivery)"
                    @details="$emit('details', exchange.delivery)"
                    @delete="$emit('delete', exchange.delivery)"
                  />
                </div>
              </div>
              <div class="part-body">
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.id") }}:</span>
                  <span class="part-value">{{ exchange?.delivery?.order_code || exchange?.delivery?.id }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.form.case") }}:</span>
                  <span class="part-value">{{ exchange?.delivery?.case }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.form.price") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.delivery?.price, exchange?.delivery?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.deliveryPrice") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.delivery?.delivery_price, exchange?.delivery?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.totalPrice") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.delivery?.total_price, exchange?.delivery?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.status") }}:</span>
                  <span class="part-value">{{ exchange?.delivery?.status }}</span>
                </div>
                <div v-if="exchange?.delivery?.order_items && exchange.delivery.order_items.length > 0" class="part-items mt-2">
                  <span class="part-label">{{ $t("orders.wizard.deliveryItems") }}:</span>
                  <ul class="items-list mb-0">
                    <li v-for="item in exchange.delivery.order_items" :key="item.id || item.orderitemname || item.name">
                      {{ getOrderItemTitle(item) }}
                      <span v-if="getOrderItemQuantity(item) !== null" class="text-muted">
                        (x{{ getOrderItemQuantity(item) }})
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Return Order Card -->
          <div class="col-md-6 mb-3">
            <div class="exchange-part return-part h-100">
              <div class="part-header d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                  <i class="fas fa-undo me-2"></i>
                  {{ $t("orders.exchange.returnPart") }}
                  <span class="badge bg-warning ms-2">#{{ exchange?.return?.id }}</span>
                </div>
                <div class="flex-shrink-0 ms-2">
                  <ActionsDropdown
                    v-if="exchange?.return"
                    :row="exchange.return"
                    :editLabel="$t('orders.actions.edit')"
                    :detailsLabel="$t('orders.actions.view')"
                    :deleteLabel="$t('orders.actions.delete')"
                    :confirmDelete="true"
                    @edit="$emit('edit', exchange.return)"
                    @details="$emit('details', exchange.return)"
                    @delete="$emit('delete', exchange.return)"
                  />
                </div>
              </div>
              <div class="part-body">
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.id") }}:</span>
                  <span class="part-value">{{ exchange?.return?.order_code || exchange?.return?.id }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.form.case") }}:</span>
                  <span class="part-value">{{ exchange?.return?.case }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.form.returnPrice") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.return?.price, exchange?.return?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.deliveryPrice") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.return?.delivery_price, exchange?.return?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.totalPrice") }}:</span>
                  <span class="part-value">{{ formatPrice(exchange?.return?.total_price, exchange?.return?.currency_symbol) }}</span>
                </div>
                <div class="part-item">
                  <span class="part-label">{{ $t("orders.table.status") }}:</span>
                  <span class="part-value">{{ exchange?.return?.status }}</span>
                </div>
                <div v-if="exchange?.return?.order_items && exchange.return.order_items.length > 0" class="part-items mt-2">
                  <span class="part-label">{{ $t("orders.wizard.returnItems") }}:</span>
                  <ul class="items-list mb-0">
                    <li v-for="item in exchange.return.order_items" :key="item.id || item.orderitemname || item.name">
                      {{ getOrderItemTitle(item) }}
                      <span v-if="getOrderItemQuantity(item) !== null" class="text-muted">
                        (x{{ getOrderItemQuantity(item) }})
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import ActionsDropdown from "@/components/shared/Actions.vue";

const props = defineProps({
  tab: {
    type: String,
    default: "details",
  },
  order: {
    type: Object,
    default: () => ({}),
  },
  exchange: {
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
});

defineEmits(["edit", "details", "delete"]);

const hasOrderItems = computed(() => {
  return props.order?.order_items && props.order.order_items.length > 0;
});
</script>
