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
      :companies="companies"
    />
    <fullScreenMode :map-instance="mapInstance" />
    <zoomCustom :map-instance="mapInstance" />
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import zoomCustom from "../components/zoomCustom.vue";
import fullScreenMode from "../components/fullScreenMode.vue";
import displayPoints from "../components/displayPoints.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const palestineCenter = ref([35.2033, 31.7683]);
const zoom = ref(8);
const projection = ref("EPSG:4326");

// --- Variables ---
const mapRef = ref(null);
const mapInstance = ref(null);
const companies = ref([
  {
    id: 1,
    name: "Tech Solutions Ltd",
    coordinates: [35.2033, 31.7683],
    status: "active",
    employees: 45,
    description: "Leading technology solutions provider",
  },
  {
    id: 2,
    name: "Fast Delivery Co",
    coordinates: [35.1833, 31.7983],
    status: "active",
    employees: 23,
    description: "Express delivery services",
  },
]);
// --- Lifecycle hooks ---
onMounted(() => {
  if (mapRef.value) {
    mapInstance.value = mapRef.value.map;
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
