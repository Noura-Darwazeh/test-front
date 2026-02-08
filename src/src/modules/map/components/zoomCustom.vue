<template>
  <div class="zoom-controls d-flex">
    <button @click="zoomIn">+</button>
    <button @click="zoomOut">-</button>
  </div>
</template>
<script setup>
const props = defineProps({
  mapInstance: {
    type: Object,
  },
});

// ----------- Functions ------------
const zoomIn = () => {
  if (props.mapInstance) {
    const view = props.mapInstance.getView();
    const currentZoom = view.getZoom();
    view.animate({
      zoom: currentZoom + 1,
      duration: 300,
    });
  }
};

const zoomOut = () => {
  if (props.mapInstance) {
    const view = props.mapInstance.getView();
    const currentZoom = view.getZoom();
    view.animate({
      zoom: currentZoom - 1,
      duration: 300,
    });
  }
};
</script>

<style scoped>
.zoom-controls {
  position: absolute;
  top: 80px;
  right: 70px;
  gap: 10px;
}

.zoom-controls button {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.zoom-controls button:hover {
  background: #f0f0f0;
}
</style>
