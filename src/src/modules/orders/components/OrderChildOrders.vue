<template>
  <div class="child-orders-container p-3">
    <h6 class="text-muted mb-3">
      <i class="fas fa-level-down-alt me-2"></i>
      {{ $t("orders.exchange.childOrders") }}
    </h6>
    <div class="row">
      <!-- Delivery Child Order -->
      <div v-if="row._deliveryOrder" class="col-md-6 mb-2">
        <div class="child-order-card delivery-card">
          <div class="child-order-header">
            <i class="fas fa-truck me-2"></i>
            {{ $t("orders.form.typeDelivery") }}
            <span class="badge bg-primary ms-2">
              #{{ row._deliveryOrder.order_code || row._deliveryOrder.id }}
            </span>
          </div>
          <div class="child-order-body">
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.price") }}:</span>
              <span>{{ formatPrice(row._deliveryOrder.price, row._deliveryOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.deliveryPrice") }}:</span>
              <span>{{ formatPrice(row._deliveryOrder.delivery_price, row._deliveryOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.totalPrice") }}:</span>
              <span>{{ formatPrice(row._deliveryOrder.total_price, row._deliveryOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.status") }}:</span>
              <span>{{ row._deliveryOrder.status }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.case") }}:</span>
              <span>{{ row._deliveryOrder.case }}</span>
            </div>
          </div>
          <div class="child-order-actions">
            <ActionsDropdown
              :row="row._deliveryOrder"
              :editLabel="$t('orders.actions.edit')"
              :detailsLabel="$t('orders.actions.view')"
              :deleteLabel="$t('orders.actions.delete')"
              :confirmDelete="true"
              @edit="$emit('edit', row._deliveryOrder)"
              @details="$emit('details', row._deliveryOrder)"
              @delete="$emit('delete', row._deliveryOrder)"
            />
          </div>
        </div>
      </div>

      <!-- Return Child Order -->
      <div v-if="row._returnOrder" class="col-md-6 mb-2">
        <div class="child-order-card return-card">
          <div class="child-order-header">
            <i class="fas fa-undo me-2"></i>
            {{ $t("orders.form.typeReturn") }}
            <span class="badge bg-warning ms-2">
              #{{ row._returnOrder.order_code || row._returnOrder.id }}
            </span>
          </div>
          <div class="child-order-body">
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.price") }}:</span>
              <span>{{ formatPrice(row._returnOrder.price, row._returnOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.deliveryPrice") }}:</span>
              <span>{{ formatPrice(row._returnOrder.delivery_price, row._returnOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.totalPrice") }}:</span>
              <span>{{ formatPrice(row._returnOrder.total_price, row._returnOrder.currency_symbol) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.status") }}:</span>
              <span>{{ row._returnOrder.status }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted">{{ $t("orders.table.case") }}:</span>
              <span>{{ row._returnOrder.case }}</span>
            </div>
          </div>
          <div class="child-order-actions">
            <ActionsDropdown
              :row="row._returnOrder"
              :editLabel="$t('orders.actions.edit')"
              :detailsLabel="$t('orders.actions.view')"
              :deleteLabel="$t('orders.actions.delete')"
              :confirmDelete="true"
              @edit="$emit('edit', row._returnOrder)"
              @details="$emit('details', row._returnOrder)"
              @delete="$emit('delete', row._returnOrder)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ActionsDropdown from "@/components/shared/Actions.vue";

defineProps({
  row: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
});

defineEmits(["edit", "details", "delete"]);

</script>
