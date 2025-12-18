<template>
  <div class="fullscreen-controls">
    <button @click="toggleFullScreen">
      <img
        alt="Enter Full screen mode"
        :src="currentIcon"
        style="width: 30px; height: 30px"
      />
    </button>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import fullScreenEnter from "@/assets/map/fullscreen-enter.svg";
import fullScreenExit from "@/assets/map/fullscreen-exit.svg";

// --- Props ---
const props = defineProps({
  mapInstance: {
    type: Object,
  },
});

// --- Variables ---
const isFullscreen = ref(false);

// --- Computed properties ---
const currentIcon = computed(() => {
  return isFullscreen.value ? fullScreenExit : fullScreenEnter;
});

// --- Functions ---
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    const mapContainer = document.querySelector(".map-container");
    mapContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
  if (props.mapInstance) {
    setTimeout(() => {
      props.mapInstance.updateSize();
    }, 100);
  }
};

// --- Listeners ---
const handleFullScreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// --- LifeCycle hooks ---
onMounted(() => {
  document.addEventListener("fullscreenchange", handleFullScreenChange);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullScreenChange);
});
</script>
<style scoped>
.fullscreen-controls {
  position: absolute;
  top: 80px;
  right: 10px;
  gap: 10px;
}

.fullscreen-controls button {
  height: 40px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.fullscreen-controls button:hover {
  background: #f0f0f0;
}
</style>
