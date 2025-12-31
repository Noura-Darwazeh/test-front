<template>
    <!-- Backdrop -->
    <Transition name="backdrop">
        <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
    </Transition>

    <!-- Modal -->
    <Transition name="modal">
        <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content shadow-lg border-0 rounded-3">
                    <!-- Header -->
                    <div class="modal-header bg-light">
                        <h5 class="modal-title fw-semibold d-flex align-items-center gap-2">
                            <img :src="trashIcon" alt="Trash" width="24" height="24" />
                            {{ title }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>

                    <!-- Body -->
                    <div class="modal-body p-3" style="max-height: 70vh; overflow-y: auto;">
                        <!-- Empty State -->
                        <div v-if="trashedItems.length === 0" class="text-center py-5">
                            <img :src="trashIcon" alt="Empty" width="64" height="64" class="opacity-25 mb-3" />
                            <p class="text-muted mb-0">{{ emptyMessage }}</p>
                        </div>

                        <!-- Use TrashedDataTable Component -->
                        <div v-else>
                            <TrashedDataTable :columns="columns" :data="trashedItems"
                                :actionsLabel="$t('user.actions')">
                                <template #actions="{ row }">
                                    <PrimaryButton text="Restore" :iconBefore="restoreIcon" bgColor="var(--color-success)"
                                        class="d-inline-flex align-items-center mx-2" @click="handleRestore(row)" />
                                    <PrimaryButton v-if="showDeleteButton" text="Delete" :iconBefore="restoreIcon"
                                        bgColor="var(--color-danger)" class="d-inline-flex align-items-center"
                                        @click="handleDelete(row)" />
                                </template>
                            </TrashedDataTable>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="modal-footer bg-light">
                        <PrimaryButton text="Close" @click="closeModal" bg-color="var(--color-secondary)" />
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TrashedDataTable from './TrashedDataTable.vue';
import trashIcon from '../../assets/table/recycle.svg';
import restoreIcon from '../../assets/table/recycle.svg';
import PrimaryButton from './PrimaryButton.vue';

const { locale } = useI18n();
const isRTL = computed(() => locale.value === 'ar');

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: 'Trashed Items',
    },
    emptyMessage: {
        type: String,
        default: 'No trashed items',
    },
    columns: {
        type: Array,
        required: true,
    },
    trashedItems: {
        type: Array,
        default: () => [],
    },
    showDeleteButton: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['close', 'restore', 'delete']);

const closeModal = () => {
    emit('close');
};

const handleRestore = (item) => {
    emit('restore', item);
};

const handleDelete = (item) => {
    emit('delete', item);
};

// Prevent body scroll when modal is open with scrollbar compensation
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
});
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
    transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
    opacity: 0;
}

.modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1040;
}

/* Modal transitions */
.modal-enter-active {
    transition: opacity 0.2s ease;
}

.modal-leave-active {
    transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-dialog {
    transition: transform 0.2s ease-out;
}

.modal-leave-active .modal-dialog {
    transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
    transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-dialog {
    transform: scale(0.95);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1050;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>
