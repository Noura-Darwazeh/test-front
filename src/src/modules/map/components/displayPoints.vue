<template>
  <!-- Company Info Popup -->
  <div class="company-popup" v-if="selectedCompany" :style="popupStyle">
    <div class="popup-content">
      <!-- Close button -->
      <button class="popup-close" @click="closePopup">
        <i class="fas fa-times"></i>
      </button>

      <!-- Company Info -->
      <div class="company-info">
        <h4>{{ selectedCompany.name }}</h4>
        <p><strong>Branch:</strong> {{ selectedCompany.branch }}</p>
        <p><strong>Location:</strong> {{ selectedCompany.location }}</p>
        <p><strong>Role:</strong> {{ selectedCompany.role }}</p>
      </div>

      <!-- Action Button -->
      <div class="popup-actions">
        <button class="btn btn-primary btn-sm" @click="goToCompanyDetails">
          <i class="fas fa-building me-1"></i>
          View Company Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";
import companyIconSvg from "@/assets/map/company.svg";

// ---- Props ----
const props = defineProps({
  mapInstance: {
    type: Object,
    required: true,
  },
  companies: {
    type: Array,
    default: () => [],
  },
});

// ---- Data ----
const selectedCompany = ref(null);
const popupPosition = ref({ x: 0, y: 0 });

// ---- Mock Data ----
const companiesData = computed(() => {
  if (props.companies && props.companies.length > 0) {
    return props.companies;
  }

  return [
    {
      id: 1,
      name: "Tech Solutions Ltd",
      branch: "Main Branch",
      location: "Jerusalem",
      role: "admin",
      coordinates: [35.2137, 31.7683], // Jerusalem coordinates
    },
    {
      id: 2,
      name: "Delivery Express",
      branch: "North Branch",
      location: "Ramallah",
      role: "delivery",
      coordinates: [35.2058, 31.9038], // Ramallah coordinates
    },
    {
      id: 3,
      name: "Logistics Hub",
      branch: "South Branch",
      location: "Hebron",
      role: "admin",
      coordinates: [35.0938, 31.5326], // Hebron coordinates
    },
    {
      id: 4,
      name: "Fast Courier",
      branch: "Central Branch",
      location: "Bethlehem",
      role: "delivery",
      coordinates: [35.2033, 31.705], // Bethlehem coordinates
    },
  ];
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
    selectedCompany.value = feature.get("companyData");

    // Position popup near the click
    popupPosition.value = {
      x: event.originalEvent.clientX + 10,
      y: event.originalEvent.clientY - 10,
    };
  } else {
    // Close popup if clicking elsewhere
    selectedCompany.value = null;
  }
};

const closePopup = () => {
  selectedCompany.value = null;
};

const goToCompanyDetails = () => {
  console.log("Navigate to company details:", selectedCompany.value);
  console.log("Prepared route:", `/company/${selectedCompany.value.id}`);
  // TODO: Will navigate to company details when route is ready
  // router.push(`/company/${selectedCompany.value.id}`);
  closePopup();
};

const handleZoomChange = () => {
  if (vectorSource) {
    vectorSource.getFeatures().forEach((feature) => {
      updateFeatureStyle(feature);
    });
  }
};
// --- Create company markers ----
const createCompanyMarkers = () => {
  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  // --- Create features for each company ---
  companiesData.value.forEach((company) => {
    const feature = new Feature({
      geometry: new Point(company.coordinates),
      companyData: company,
    });

    // --- Create style with dynamic scale based icons ---
    updateFeatureStyle(feature);
    vectorSource.addFeature(feature);
  });

  // --- Add Layer to map ---
  props.mapInstance.addLayer(vectorLayer);
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
    // --- Create company markers ---
    createCompanyMarkers();

    // --- Add event listeners for click and hover ---
    props.mapInstance.on("pointermove", handlePointerMove);
    props.mapInstance.on("click", handleMapClick);
    props.mapInstance.getView().on("change:resolution", handleZoomChange);
  }
});

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
