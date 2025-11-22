<template>
  <div
    class="pagination-wrapper d-flex justify-content-between align-items-center py-3 px-3"
  >
    <div class="pagination-info text-muted">
      Showing {{ startItem }} - {{ endItem }} of {{ totalItems }}
    </div>
    <nav>
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            Previous
          </button>
        </li>
        <li
          v-for="page in pageNumbers"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button
            v-if="page !== '...'"
            class="page-link"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link" disabled>...</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script setup>
import { computed } from "vue";

// ----------------- Props and Emits ----------------
const props = defineProps({
  totalItems: Number,
  itemsPerPage: Number,
  currentPage: Number,
});
const emit = defineEmits(["update:currentPage"]);

//---------------- Computed properties ---------------
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
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

// --------------- Methods ---------------
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("update:currentPage", [page]);
  }
};
</script>
<style scoped>
.pagination-wrapper {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.pagination-info {
  font-size: 0.875rem;
}

.pagination {
  gap: 0.25rem;
}

.page-link {
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  color: #495057;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-link:hover:not(.disabled) {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-link.disabled {
  cursor: default;
  pointer-events: none;
}
</style>
