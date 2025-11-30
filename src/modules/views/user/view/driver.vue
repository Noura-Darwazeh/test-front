<template>
  <Table :data="drivers" :columns="driverColumns" :searchPlaceholder="$t('driver.searchPlaceholder')" groupKey="status"
    groupLabel="Filter by Status" />
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

  {
    id: 4,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 5,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 6,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 7,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 8,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 9,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 10,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 11,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 12,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 13,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 14,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 15,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },
  {
    id: 16,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 17,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 18,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },

  {
    id: 19,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 20,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 21,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 22,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 23,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 24,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 25,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 26,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 27,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 28,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 29,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 30,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },
  {
    id: 31,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 32,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 33,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },

  {
    id: 34,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 35,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 36,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 37,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 38,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 39,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 40,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 41,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 42,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  }, {
    id: 43,
    location: "Nablus",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '125746',
    created_by: 'ali'
  },
  {
    id: 44,
    location: "Ramallah",
    status: 'busy',
    type: 'freelance',
    branch_id: '2',
    vehicle_number: '789012',
    created_by: 'sara'
  },
  {
    id: 45,
    location: "Hebron",
    status: 'available',
    type: 'delivery company',
    branch_id: '1',
    vehicle_number: '345678',
    created_by: 'ahmed'
  },
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