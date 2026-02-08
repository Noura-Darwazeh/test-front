<template>
  <div>
    <!-- Order Progress -->
    <div v-if="tab === 'details'" class="order-progress mb-4">
      <div v-if="!isFailed" class="progress-steps">
        <template v-for="(step, index) in progressSteps" :key="step.key">
          <div
            class="progress-step"
            :class="{
              active: index <= activeIndex,
              current: index === activeIndex,
              [step.key]: true,
            }"
          >
            <div class="progress-icon">
              <img :src="step.icon" :alt="step.label" />
            </div>
            <div class="progress-label">{{ step.label }}</div>
          </div>
          <div
            v-if="index < progressSteps.length - 1"
            class="progress-bar"
            :class="{ active: index < activeIndex }"
          ></div>
        </template>
      </div>
      <div v-else class="progress-failed">
        <img :src="failedIcon" :alt="$t('orders.progress.failed')" />
        <span>{{ $t("orders.progress.failed") }}</span>
      </div>
    </div>

    <!-- Order Items (only shown in details tab) -->
    <div v-if="tab === 'details' && hasOrderItems && showItems" class="mt-4">
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
import { useI18n } from "vue-i18n";
import ActionsDropdown from "@/components/shared/Actions.vue";
import pendingIcon from "@/assets/order_transaction/pending.svg";
import inprocessIcon from "@/assets/order_transaction/inprocess.svg";
import shippedIcon from "@/assets/order_transaction/shipped.svg";
import failedIcon from "@/assets/order_transaction/failed.svg";

const { t } = useI18n();

const props = defineProps({
  tab: {
    type: String,
    default: "details",
  },
  order: {
    type: Object,
    default: () => ({}),
  },
  showItems: {
    type: Boolean,
    default: true,
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

const orderStatus = computed(() =>
  String(props.order?.status || "").toLowerCase()
);

const isFailed = computed(() => orderStatus.value === "failed");

const progressSteps = computed(() => [
  { key: "pending", label: t("orders.progress.pending"), icon: pendingIcon },
  {
    key: "inprocess",
    label: t("orders.progress.inprocess"),
    icon: inprocessIcon,
  },
  { key: "done", label: t("orders.progress.done"), icon: shippedIcon },
]);

const activeIndex = computed(() => {
  if (orderStatus.value === "pending") return 0;
  if (orderStatus.value === "inprocess") return 1;
  if (orderStatus.value === "done") return 2;
  return 0;
});
</script>

<style scoped>
.order-progress {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #eef1f5;
}

.progress-steps {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 90px;
  opacity: 0.5;
}

.progress-step.active {
  opacity: 1;
}

.progress-step.current .progress-icon {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

.progress-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f8f9fb;
  border: 1px solid #e2e6ea;
}

.progress-icon img {
  width: 34px;
  height: 34px;
  filter: brightness(0) invert(1);
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #5b6472;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e6e9ef;
  border-radius: 999px;
  min-width: 40px;
}

.progress-bar.active {
  background: linear-gradient(90deg, #0d6efd, #37b3ff);
  animation: progressPulse 1.6s ease-in-out infinite;
}

.progress-failed {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc3545;
  font-weight: 600;
}

.progress-failed img {
  width: 36px;
  height: 36px;
}

.progress-step.pending .progress-icon {
  background: #ffc107;
  border-color: #ffca2c;
}

.progress-step.inprocess .progress-icon {
  background: #0d6efd;
  border-color: #5aa2ff;
}

.progress-step.done .progress-icon {
  background: #198754;
  border-color: #3cb371;
}

.progress-step.failed .progress-icon {
  background: #dc3545;
  border-color: #e06b75;
}

@keyframes progressPulse {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.15);
  }
  100% {
    filter: brightness(1);
  }
}

@media (max-width: 600px) {
  .progress-steps {
    flex-direction: column;
    align-items: flex-start;
  }

  .progress-bar {
    width: 100%;
  }

  .progress-step {
    flex-direction: row;
    min-width: auto;
  }
}
</style>
