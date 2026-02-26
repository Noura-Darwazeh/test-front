<template>
    <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'" :class="{ rtl: isRTL }"
     :maxHeight="'150px'">
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
                <li v-if="showProgress">
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handleProgress(close)">
                        <img :src=progressIcon width="20" height="20" />
                        {{ progressLabel }}
                    </a>
                </li>
                <li v-if="showActivate || showDeactivate">
                    <button
                        type="button"
                        class="dropdown-item d-flex align-items-center justify-content-between gap-2 action-toggle-item"
                        @click.prevent="handleActiveToggle(close)"
                    >
                        <span>{{ activeToggleLabel }}</span>
                        <span class="action-toggle-switch" :class="{ 'is-on': isRowActive }" aria-hidden="true">
                            <span class="action-toggle-knob"></span>
                        </span>
                    </button>
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

    <!-- Delete confirmation modal -->
    <ConfirmationModal
        :isOpen="deleteConfirmState"
        :title="confirmTitleText"
        :message="confirmMessageText"
        :confirmText="confirmButtonText"
        :cancelText="cancelButtonText"
        :reverseButtons="true"
        @confirm="onDeleteConfirmed"
        @close="closeDeleteConfirm"
    />

    <!-- Activate/Deactivate confirmation modal -->
    <ConfirmationModal
        :isOpen="activationConfirmState"
        :title="activationConfirmTitleText"
        :message="activationConfirmMessageText"
        :confirmText="activationConfirmButtonText"
        :cancelText="cancelButtonText"
        :confirmColor="pendingActivationAction === 'activate' ? 'var(--color-success, #28a745)' : 'var(--color-danger)'"
        @confirm="onActivationConfirmed"
        @close="closeActivationConfirm"
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
import progressIcon from "../../assets/order_transaction/shipped.svg";
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
        default: true
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
    progressLabel: {
        type: String,
        default: 'Progress'
    },
    showProgress: {
        type: Boolean,
        default: false
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
    },
    activateLabel: {
        type: String,
        default: 'Activate'
    },
    showActivate: {
        type: Boolean,
        default: false
    },
    deactivateLabel: {
        type: String,
        default: 'Deactivate'
    },
    showDeactivate: {
        type: Boolean,
        default: false
    },
    confirmActivation: {
        type: Boolean,
        default: false 
    }
});

const emit = defineEmits(['edit', 'details', 'delete', 'restore', 'permanent-delete', 'progress', 'activate', 'deactivate']);

// Delete confirmation state
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

// Activation confirmation state
const activationConfirmState = ref(false);
const pendingActivationAction = ref(null);

const activationConfirmTitleText = computed(() => t('common.confirm'));
const activationConfirmMessageText = computed(() => {
    if (pendingActivationAction.value === 'activate') {
        return t('common.activateConfirmMessage');
    }
    return t('common.deactivateConfirmMessage');
});
const activationConfirmButtonText = computed(() => {
    if (pendingActivationAction.value === 'activate') {
        return t('common.activate');
    }
    return t('common.deactivate');
});

const isRowActive = computed(() => {
    if (props.row && props.row.is_active !== undefined && props.row.is_active !== null) {
        return Number(props.row.is_active) === 1;
    }
    return props.showDeactivate && !props.showActivate;
});

const activeToggleLabel = computed(() =>
    isRowActive.value ? props.deactivateLabel : props.activateLabel
);

const handleEdit = (close) => {
    close();
    emit('edit', props.row);
};

const handleDetails = (close) => {
    close();
    emit('details', props.row);
};

const handleProgress = (close) => {
    close();
    emit('progress', props.row);
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

const handleActivate = (close) => {
    close();
    if (props.confirmActivation) {
        pendingActivationAction.value = 'activate';
        activationConfirmState.value = true;
        return;
    }
    emit('activate', props.row);
};

const handleDeactivate = (close) => {
    close();
    if (props.confirmActivation) {
        pendingActivationAction.value = 'deactivate';
        activationConfirmState.value = true;
        return;
    }
    emit('deactivate', props.row);
};

const handleActiveToggle = (close) => {
    if (isRowActive.value) {
        handleDeactivate(close);
        return;
    }
    handleActivate(close);
};

const onDeleteConfirmed = () => {
    deleteConfirmState.value = false;
    emit('delete', props.row);
};

const closeDeleteConfirm = () => {
    deleteConfirmState.value = false;
};

const onActivationConfirmed = () => {
    activationConfirmState.value = false;
    if (pendingActivationAction.value === 'activate') {
        emit('activate', props.row);
    } else {
        emit('deactivate', props.row);
    }
    pendingActivationAction.value = null;
};

const closeActivationConfirm = () => {
    activationConfirmState.value = false;
    pendingActivationAction.value = null;
};
</script>

<style scoped>
.action-toggle-item {
    cursor: pointer;
}

.action-toggle-switch {
    position: relative;
    width: 34px;
    height: 20px;
    border-radius: 999px;
    background: #d1d5db;
    transition: background-color 0.2s ease;
}

.action-toggle-switch.is-on {
    background: var(--color-success, #28a745);
}

.action-toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
}

.action-toggle-switch.is-on .action-toggle-knob {
    transform: translateX(14px);
}
</style>