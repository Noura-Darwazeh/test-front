<template>
    <BaseDropdown :menuPosition="isRTL ? 'start' : 'end'" :class="{ rtl: isRTL }">
        <template #trigger>
            <PrimaryButton :iconBefore="actionsIcon" bg-color=#ffffff iconColor="black" />
        </template>

        <template #menu="{ close }">
            <ul class="list-unstyled mb-0">
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2" href="#"
                        @click.prevent="handleEdit(close)">
                        <img :src=editIcon width="20" height="20" />
                        {{ editLabel }}
                    </a>
                </li>
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-1" href="#"
                        @click.prevent="handleDetails(close)">
                        <img :src=detailsIcon width="20" height="20" />

                        {{ detailsLabel }}
                    </a>
                </li>
            </ul>
        </template>
    </BaseDropdown>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseDropdown from './BaseDropdown.vue';
import actionsIcon from "../../assets/table/actions.svg";
import editIcon from "../../assets/table/edit.svg";
import detailsIcon from "../../assets/table/details.svg"
import PrimaryButton from './PrimaryButton.vue';
const { locale } = useI18n();
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
    }
});

const emit = defineEmits(['edit', 'details']);

const handleEdit = (close) => {
    close();
    emit('edit', props.row);
};

const handleDetails = (close) => {
    close();
    emit('details', props.row);
};
</script>
