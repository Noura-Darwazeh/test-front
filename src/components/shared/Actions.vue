<template>
    <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'" :class="{ rtl: isRTL }">
        <template #trigger>
            <PrimaryButton :iconBefore="actionsIcon" bg-color=#ffffff iconColor="black" />
        </template>

        <template #menu="{ close }">
            <ul class="list-unstyled mb-0">
                <li v-if="showEdit">
                    <a class="dropdown-item d-flex align-items-center gap-2" href="#"
                        @click.prevent="handleEdit(close)">
                        <img :src=editIcon width="20" height="20" />
                        {{ editLabel }}
                    </a>
                </li>
                <li v-if="showDetails">
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handleDetails(close)">
                        <img :src=detailsIcon width="20" height="20" />

                        {{ detailsLabel }}
                    </a>
                </li>
                <li v-if="showDelete">
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handleDelete(close)">
                        <img :src=deleteIcon width="20" height="20" />

                        {{ deleteLabel }}
                    </a>
                </li>
                <li v-if="showRestore">
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handleRestore(close)">
                        <img :src=restoreIcon width="20" height="20" />

                        {{ restoreLabel }}
                    </a>
                </li>
                <li v-if="showPermanentDelete">
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handlePermanentDelete(close)">
                        <img :src=deleteIcon width="20" height="20" />

                        {{ permanentDeleteLabel }}
                    </a>
                </li>
            </ul>
        </template>
    </BaseDropdown>

    <ConfirmationModal
        :isOpen="deleteConfirmState"
        :title="confirmTitleText"
        :message="confirmMessageText"
        :confirmText="confirmButtonText"
        :cancelText="cancelButtonText"
        @confirm="confirmDelete"
        @close="closeDeleteConfirm"
    />
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDropdown from './BaseDropdown.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import actionsIcon from "../../assets/table/actions.svg";
import editIcon from "../../assets/table/edit.svg";
import detailsIcon from "../../assets/table/details.svg";
import deleteIcon from "../../assets/table/recycle.svg";
import restoreIcon from "../../assets/table/refresh.svg";
import PrimaryButton from './PrimaryButton.vue';
const { locale, t } = useI18n();
const isRTL = computed(() => locale.value === 'ar');

const props = defineProps({
    row: {
        type: Object,
        required: true
    },
    editLabel: {
        type: String,
        default: 'Edit'
    },
    detailsLabel: {
        type: String,
        default: 'Details'
    },
    deleteLabel: {
        type: String,
        default: 'Delete'
    },
    confirmDelete: {
        type: Boolean,
        default: false
    },
    confirmTitle: {
        type: String,
        default: ''
    },
    confirmMessage: {
        type: String,
        default: ''
    },
    confirmText: {
        type: String,
        default: ''
    },
    cancelText: {
        type: String,
        default: ''
    },
    showDelete: {
        type: Boolean,
        default: true
    },
    showEdit: {
        type: Boolean,
        default: true
    },
    showDetails: {
        type: Boolean,
        default: true
    },
    restoreLabel: {
        type: String,
        default: 'Restore'
    },
    showRestore: {
        type: Boolean,
        default: false
    },
    permanentDeleteLabel: {
        type: String,
        default: 'Delete Permanently'
    },
    showPermanentDelete: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['edit', 'details', 'delete', 'restore', 'permanent-delete']);

const deleteConfirmState = ref(false);

const confirmTitleText = computed(() =>
    props.confirmTitle || t('common.confirm')
);
const confirmMessageText = computed(() =>
    props.confirmMessage || t('common.deleteConfirmMessage')
);
const confirmButtonText = computed(() =>
    props.confirmText || t('common.delete')
);
const cancelButtonText = computed(() =>
    props.cancelText || t('common.cancel')
);

const handleEdit = (close) => {
    close();
    emit('edit', props.row);
};

const handleDetails = (close) => {
    close();
    emit('details', props.row);
};

const handleDelete = (close) => {
    close();
    if (props.confirmDelete) {
        deleteConfirmState.value = true;
        return;
    }
    emit('delete', props.row);
};

const handleRestore = (close) => {
    close();
    emit('restore', props.row);
};

const handlePermanentDelete = (close) => {
    close();
    emit('permanent-delete', props.row);
};

const confirmDelete = () => {
    deleteConfirmState.value = false;
    emit('delete', props.row);
};

const closeDeleteConfirm = () => {
    deleteConfirmState.value = false;
};
</script>
