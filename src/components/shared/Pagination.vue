<template>
  <div
    class="d-flex justify-content-between align-items-center mt-3"
    :class="{ rtl: isRTL }"
  >
    <div class="text-muted small">
      {{ $t("pagination.showing") }} {{ startItem }} - {{ endItem }}
      {{ $t("pagination.of") }} {{ totalItems }}
    </div>
    <nav>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link rounded-circle pagination-arrow me-1"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            &lt;
          </button>
        </li>
        <li
          v-for="page in pageNumbers"
          :key="page"
          class="page-item mx-1"
          :class="{ active: page === currentPage }"
        >
          <button
            v-if="page !== '...'"
            class="page-link rounded-circle"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link border-0 bg-transparent">...</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link rounded-circle pagination-arrow ms-1"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const isRTL = computed(() => locale.value === "ar");

const props = defineProps({
  totalItems: Number,
  itemsPerPage: Number,
  currentPage: Number,
});
const emit = defineEmits(["update:currentPage"]);

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  if (props.totalItems === 0) return 0;
  const end = props.currentPage * props.itemsPerPage;
  return end > props.totalItems ? props.totalItems : end;
});

const pageNumbers = computed(() => {
  const pages = [];
  const total = totalPages.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1, 2, 3);
    if (total > 6) {
      pages.push("...");
    }
    pages.push(total - 2, total - 1, total);
  }
  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("update:currentPage", [page]);
  }
};
</script>

<style scoped>
.page-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  transition: all 0.2s ease;
}



.page-item.active .page-link {
  background-color: var(--primary-color, #1e40af);
  color: white;
  border: none;
  font-weight: 600;
  z-index: 1;
}

.pagination-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-item.disabled .page-link {
  opacity: 0.4;
  background: transparent;
}

.page-link:focus {
  box-shadow: none;
  z-index: 0;
}
</style>