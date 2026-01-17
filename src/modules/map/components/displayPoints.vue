<template>
  <!-- Company Info Popup -->
  <div class="company-popup" v-if="selectedLocation" :style="popupStyle">
    <div class="popup-content">
      <!-- Close button -->
      <button class="popup-close" @click="closePopup">
        <i class="fas fa-times"></i>
      </button>

      <!-- Company Info -->
      <div class="company-info">
        <h4>{{ selectedLocation.title }}</h4>
        <p><strong>{{ t('map.popup.company') }}:</strong> {{ selectedLocation.companyName }}</p>
        <p><strong>{{ t('map.popup.branch') }}:</strong> {{ selectedLocation.branchName }}</p>
        <p><strong>{{ t('map.popup.coordinates') }}:</strong> {{ selectedLocation.coordinatesText }}</p>
      </div>

      <!-- Action Button -->
      <div class="popup-actions">
        <button class="btn btn-primary btn-sm" @click="goToCompanyDetails">
          <i class="fas fa-building me-1"></i>
          {{ t('map.popup.viewDetails') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";
import companyIconSvg from "@/assets/map/company.svg";
import { useI18n } from "vue-i18n";

// ---- Props ----
const props = defineProps({
  mapInstance: {
    type: Object,
    required: true,
  },
  locations: {
    type: Array,
    default: () => [],
  },
});

// ---- Data ----
const selectedLocation = ref(null);
const popupPosition = ref({ x: 0, y: 0 });
const { t } = useI18n();

const locationsData = computed(() => {
  const rawLocations = Array.isArray(props.locations) ? props.locations : [];

  return rawLocations
    .map((location) => {
      const latitude = Number.parseFloat(
        location.latitude ?? location.location?.latitude
      );
      const longitude = Number.parseFloat(
        location.longitude ?? location.location?.longitude
      );

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      const companyName =
        location.company_name ||
        location.company?.name ||
        location.companyName ||
        "";
      const branchName = location.name || location.branch_name || "";
      const title = companyName || branchName || `#${location.id}`;

      return {
        id: location.id,
        companyName,
        branchName,
        title,
        latitude,
        longitude,
        coordinates: [longitude, latitude],
        coordinatesText: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    })
    .filter(Boolean);
});

// --- Computed popup styling ---
const popupStyle = computed(() => ({
  left: `${popupPosition.value.x}px`,
  top: `${popupPosition.value.y}px`,
  position: "fixed",
  zIndex: 1000,
  pointerEvents: "auto",
}));

// --- OpenLayer objects ---
let vectorLayer = null;
let vectorSource = null;

// ---- Event handlers ---
const handlePointerMove = (event) => {
  const feature = props.mapInstance.forEachFeatureAtPixel(
    event.pixel,
    (feature) => feature
  );

  if (feature && feature.get("companyData")) {
    props.mapInstance.getTargetElement().style.cursor = "pointer";
  } else {
    props.mapInstance.getTargetElement().style.cursor = "";
  }
};

const handleMapClick = (event) => {
  const feature = props.mapInstance.forEachFeatureAtPixel(
    event.pixel,
    (feature) => feature
  );

  if (feature && feature.get("companyData")) {
    selectedLocation.value = feature.get("companyData");

    // Position popup near the click
    popupPosition.value = {
      x: event.originalEvent.clientX + 10,
      y: event.originalEvent.clientY - 10,
    };
  } else {
    // Close popup if clicking elsewhere
    selectedLocation.value = null;
  }
};

const closePopup = () => {
  selectedLocation.value = null;
};

const goToCompanyDetails = () => {
  console.log("Navigate to company details:", selectedLocation.value);
  console.log("Prepared route:", `/company/${selectedLocation.value.id}`);
  // TODO: Will navigate to company details when route is ready
  // router.push(`/company/${selectedLocation.value.id}`);
  closePopup();
};

const handleZoomChange = () => {
  if (vectorSource) {
    vectorSource.getFeatures().forEach((feature) => {
      updateFeatureStyle(feature);
    });
  }
};
const ensureVectorLayer = () => {
  if (!vectorSource) {
    vectorSource = new VectorSource();
    vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    props.mapInstance.addLayer(vectorLayer);
  }
};

const renderMarkers = () => {
  if (!props.mapInstance) return;
  ensureVectorLayer();
  vectorSource.clear();

  locationsData.value.forEach((location) => {
    const feature = new Feature({
      geometry: new Point(location.coordinates),
      companyData: location,
    });

    updateFeatureStyle(feature);
    vectorSource.addFeature(feature);
  });
};

// --- Update icon style based on zoom level ---
const updateFeatureStyle = (feature) => {
  const zoom = props.mapInstance.getView().getZoom();
  const baseZoom = 10;
  const baseScale = 0.04;
  const scale = baseScale * Math.pow(1.2, zoom - baseZoom);

  const minScale = 0.01;
  const maxScale = 0.05;
  const finalScale = Math.max(minScale, Math.min(maxScale, scale));

  const iconStyle = new Style({
    image: new Icon({
      src: companyIconSvg,
      scale: finalScale,
      anchor: [0.5, 1],
    }),
  });

  feature.setStyle(iconStyle);
};
// --- LifeCycle hooks ---
onMounted(() => {
  if (props.mapInstance) {
    renderMarkers();

    // --- Add event listeners for click and hover ---
    props.mapInstance.on("pointermove", handlePointerMove);
    props.mapInstance.on("click", handleMapClick);
    props.mapInstance.getView().on("change:resolution", handleZoomChange);
  }
});

watch(
  locationsData,
  () => {
    renderMarkers();
  },
  { deep: true }
);

onUnmounted(() => {
  // --- Clean up ---
  if (props.mapInstance) {
    props.mapInstance.un("pointermove", handlePointerMove);
    props.mapInstance.un("click", handleMapClick);
    props.mapInstance.getView().un("change:resolution", handleZoomChange);
  }
  // --- Remove layer from map ---
  if (vectorLayer) {
    props.mapInstance.removeLayer(vectorLayer);
  }
});
</script>
<style scoped>
.company-popup {
  pointer-events: auto;
  z-index: 1000;
}

.popup-content {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  min-width: 280px;
  max-width: 320px;
  font-size: 14px;
  position: relative;
}

.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: #f5f5f5;
  color: #333;
}

.company-info h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  padding-right: 24px;
}

.company-info p {
  margin: 6px 0;
  color: #666;
  line-height: 1.4;
}

.company-info strong {
  color: #333;
  font-weight: 500;
}

.popup-actions {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.popup-actions .btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.popup-actions .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .popup-content {
    min-width: 260px;
    max-width: 280px;
    padding: 14px;
  }

  .company-info h4 {
    font-size: 16px;
  }
}
</style>
