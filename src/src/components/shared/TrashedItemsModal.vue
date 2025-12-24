<template>
    <!-- Modal -->
    <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
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

                    <!-- Use DataTable Component with Actions Slot -->
                    <div v-else>
                        <DataTable :columns="columns" :data="trashedItems" :showCheckbox="false"
                            :actionsLabel="$t('user.actions')">
                            <template #actions="{ row }">
                                <PrimaryButton text="Restore" :iconBefore="restoreIcon" bgColor="var(--color-success)"
                                    class="d-inline-flex align-items-center mx-2" @click="handleRestore(row)" />
                                <PrimaryButton v-if="showDeleteButton" text="Delete" :iconBefore="restoreIcon"
                                    bgColor="var(--color-danger)" class="d-inline-flex align-items-center"
                                    @click="handleDelete(row)" />
                            </template>
                        </DataTable>
                    </div>
                </div>

                <!-- Footer -->
                <div class="modal-footer bg-light">
                    <PrimaryButton text="Close" @click="closeModal" bg-color="var(--color-secondary)" />
                </div>
            </div>
        </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from '../../components/shared/DataTable.vue';
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
// Prevent body scroll when modal is open
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});
</script>
