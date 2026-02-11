<template>
  <div class="map-container">
    <ol-map
      ref="mapRef"
      :controls="[]"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="width: 100%; height: 100%"
    >
      <ol-view
        :center="palestineCenter"
        :zoom="zoom"
        :projection="projection"
      />
      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>
    </ol-map>
    <!-- Company points display -->
    <displayPoints
      v-if="mapInstance"
      :map-instance="mapInstance"
      :locations="branches"
    />
    <fullScreenMode :map-instance="mapInstance" />
    <zoomCustom :map-instance="mapInstance" />
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import zoomCustom from "../components/zoomCustom.vue";
import fullScreenMode from "../components/fullScreenMode.vue";
import displayPoints from "../components/displayPoints.vue";
import { useBranchesManagementStore } from "@/modules/branches/stores/branchesStore.js";
const palestineCenter = ref([35.2033, 31.7683]);
const zoom = ref(8);
const projection = ref("EPSG:4326");

// --- Variables ---
const mapRef = ref(null);
const mapInstance = ref(null);
const branchesStore = useBranchesManagementStore();
const branches = computed(() => branchesStore.branches);
// --- Lifecycle hooks ---
onMounted(async () => {
  if (mapRef.value) {
    mapInstance.value = mapRef.value.map;
  }
  try {
    await branchesStore.fetchBranches();
  } catch (error) {
    console.error("Failed to load branches:", error);
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
