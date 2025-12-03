<template>
    <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <!-- search and group filter components -->
        <div class="d-flex gap-2 flex-grow-1">
            <MainFilters v-model="searchText" :placeholder="searchPlaceholder" :data="data" :groupKey="groupKey"
                v-model:groupModelValue="selectedGroups" :groupLabel="groupLabel" :translationKey="translationKey" />
        </div>
        <!-- columnSelector component -->
        <div class="d-flex gap-2">
            <ColumnSelector :columns="columns" v-model="visibleColumns" />
        </div>
    </div>
</template>

<script setup>

import ColumnSelector from "./ColumnSelector.vue";
import MainFilters from "../filters/composed/MainFilters.vue";
// import { filterData, filterByGroups, paginateData } from "@/utils/dataHelpers";
</script>