<template>
  <Table 
    :data="drivers" 
    :columns="driverColumns" 
    :searchPlaceholder="$t('driver.searchPlaceholder')" 
    groupKey="status"
    :groupLabel="$t('driver.filterByStatus')"
    translationKey="statuses"
  />
</template>

<script setup>
import Table from "./generalTable.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const drivers = [
  {
    id: 1,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 2,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 3,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },
  // ... باقي البيانات
];

const driverColumns = [
  { key: "id", label: t("driver.id"), sortable: true },
  { key: "location", label: t("driver.location"), sortable: true },
  { key: "status", label: t("driver.status"), sortable: false },
  { key: "type", label: t("driver.type"), sortable: false },
  { key: "branch_id", label: t("driver.branchId"), sortable: false },
  { key: "vehicle_number", label: t("driver.vehicleNumber"), sortable: true },
  { key: "created_by", label: t("driver.createdBy"), sortable: false },
];
</script>