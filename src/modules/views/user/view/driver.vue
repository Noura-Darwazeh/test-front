<!-- src/modules/views/user/view/driver.vue -->
<template>
  <GenericTablePage
    :data="drivers"
    :columns="driverColumns"
    searchPlaceholder="Search drivers..."
    groupKey="status"
    groupLabel="Filter by Status"
  />
</template>

<script setup>
import GenericTablePage from "./user.vue";

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
  // ... rest of drivers
];

const driverColumns = [
  { key: "id", label: "ID", sortable: true },
  { key: "location", label: "LOCATION", sortable: true },
  { key: "status", label: "STATUS", sortable: false },
  { key: "type", label: "TYPE", sortable: false },
  { key: "branch_id", label: "BRANCH", sortable: false },
  { key: "vehicle_number", label: "VEHICLE NUMBER", sortable: true },
  { key: "created_by", label: "CREATE BY", sortable: false },
];
</script>