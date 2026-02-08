<template>
  <div
    class="stat-card"
    :class="{ 'stat-card-clickable': clickable }"
    @click="handleClick"
  >
    <div class="stat-icon" :class="iconClass">
      <i :class="icon" v-if="icon"></i>
      <component :is="iconComponent" v-else-if="iconComponent" />
    </div>
    <div class="stat-content">
      <h3 class="stat-number">{{ formattedValue }}</h3>
      <p class="stat-label">{{ label }}</p>
      <p v-if="subtitle" class="stat-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="showTrend" class="stat-trend" :class="trendClass">
      <i :class="trendIcon"></i>
      <span>{{ trendValue }}%</span>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
const props = defineProps({
  value: {
    type: [Number, String],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  iconComponent: {
    type: Object,
    default: null,
  },
  iconClass: {
    type: String,
    default: "stat-icon-blue",
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  formatType: {
    type: String,
    default: "number",
    validator: (value) => ["number", "currency", "percentage"].includes(value),
  },
  currency: {
    type: String,
    default: "ILS",
  },
  showTrend: {
    type: Boolean,
    default: false,
  },
  trendValue: {
    type: Number,
    default: 0,
  },
});

// --- Emits --
const emit = defineEmits(["click"]);

// --- Computed Values ---
const formattedValue = computed(() => {
  const numValue =
    typeof props.value === "string" ? parseFloat(props.value) : props.value;

  switch (props.formatType) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: props.currency,
      }).format(numValue);
    case "percentage":
      return `${numValue}%`;
    default:
      return new Intl.NumberFormat().format(numValue);
  }
});

const trendClass = computed(() => {
  return props.trendValue >= 0 ? "trend-positive" : "trend-negative";
});

const trendIcon = computed(() => {
  return props.trendValue >= 0 ? "fas fa-arrow-up" : "fas fa-arrow-down";
});

const handleClick = () => {
  if (props.clickable) {
    emit("click");
  }
};
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card-clickable {
  cursor: pointer;
}

.stat-card-clickable:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-icon-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stat-icon-green {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.stat-icon-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
.stat-icon-red {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
}
.stat-icon-purple {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}
.stat-icon-teal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.stat-subtitle {
  font-size: 12px;
  color: #a0aec0;
  margin: 2px 0 0 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  position: absolute;
  top: 12px;
  right: 12px;
}

.trend-positive {
  color: #38a169;
  background: rgba(56, 161, 105, 0.1);
}

.trend-negative {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-number {
    font-size: 24px;
  }
}
</style>
