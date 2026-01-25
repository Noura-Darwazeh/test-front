<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal"></div>
  </Transition>

  <!-- Modal -->
  <Transition name="modal">
    <div v-if="isOpen" class="modal d-block" tabindex="-1" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content shadow-lg border-0 rounded-3">
        <!-- Header -->
        <div class="modal-header bg-light border-bottom">
          <h5 class="modal-title fw-semibold">{{ title }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4" style="max-height: 70vh">
          <form @submit.prevent="handleSubmit">
            <!-- Image Upload Section -->
            <div v-if="showImageUpload" class="mb-4 text-center">
              <div class="p-3 bg-light rounded-3">
                <div class="d-flex justify-content-center mb-3">
                  <div class="position-relative" style="width: 150px; height: 150px">
                    <div
                      class="rounded-circle overflow-hidden border border-3 border-light bg-white w-100 h-100 d-flex align-items-center justify-content-center">
                      <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="w-100 h-100"
                        style="object-fit: cover" />
                      <div v-else
                        class="d-flex flex-column align-items-center justify-content-center text-secondary p-3">
                        <img :src="userIcon" alt="user" width="50" height="50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-center">
                  <input type="file" class="d-none" accept="image/*" @change="handleImageUpload" ref="fileInput" />

                  <PrimaryButton :text="uploadLabel" type="button" @click="triggerFileInput" :iconBefore="uploadIcon" />

                  <PrimaryButton v-if="imagePreview" :text="removeLabel" type="button" bgColor="#dc3545" @click="removeImage"
                    :iconBefore="removeIcon" />
                </div>
                <small v-if="imageError" class="text-danger d-block mt-2">
                  {{ imageError }}
                </small>
              </div>
            </div>

            <!-- Dynamic Fields -->
            <div class="row g-3">
              <div
                v-for="field in renderFields"
                :key="field.name"
                :class="field.hidden ? 'd-none' : field.colClass || 'col-md-6'"
              >
                <input v-if="field.hidden" type="hidden" v-model="formData[field.name]" />
                <template v-else>
                  <label class="form-label fw-semibold" :for="field.name">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>

                <!-- Text/Email/Tel/Password/Number/Date Input -->
                <input
                  v-if="['text', 'email', 'tel', 'password', 'number', 'datetime-local', 'date'].includes(field.type)"
                  :id="field.name" :type="field.type" class="form-control" v-model="formData[field.name]"
                  :placeholder="field.placeholder || field.label" :required="field.required"
                  :minlength="field.minlength" :step="field.step" :min="field.min" :max="field.max"
                  :disabled="field.disabled" :readonly="field.readonly" />

                <!-- Select Dropdown -->
                <select v-else-if="field.type === 'select'" :id="field.name" class="form-select"
                  v-model="formData[field.name]" :required="field.required"
                  :disabled="field.disabled || field.locked"
                  :class="{ 'locked-select': field.locked }"
                    @change="handleFieldChange(field, $event)"
>
                  <option value="" disabled>
                    {{ field.placeholder || field.label }}
                  </option>
                  <option v-for="option in getSelectOptions(field)" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>

                <!-- Multi-Select with Checkboxes -->
                <div v-else-if="field.type === 'multiselect'" class="multiselect-container">
                  <div class="multiselect-header">
                    <small class="text-muted d-flex align-items-center gap-1">
                      <i class="bi bi-check2-square"></i>
                      <span>{{ $t('common.selectMultiple') }}</span>
                      <span class="badge bg-primary rounded-pill">
                        {{ (formData[field.name] || []).length }}
                      </span>
                    </small>
                  </div>
                  <div class="multiselect-options">
                    <label
                      v-for="option in field.options"
                      :key="option.value"
                      class="multiselect-option"
                      :class="{ 'selected': (formData[field.name] || []).includes(option.value) }"
                    >
                      <input
                        type="checkbox"
                        :value="option.value"
                        v-model="formData[field.name]"
                        class="form-check-input me-2"
                      />
                      <span class="option-label flex-grow-1">{{ option.label }}</span>
                      <i v-if="(formData[field.name] || []).includes(option.value)" 
                         class="bi bi-check-circle-fill text-success"></i>
                    </label>
                  </div>
                </div>

                <!-- Checkbox -->
                <div v-else-if="field.type === 'checkbox'" class="form-check mt-2">
                  <input
                    :id="field.name"
                    v-model="formData[field.name]"
                    class="form-check-input"
                    type="checkbox"
                    :true-value="field.trueValue ?? 1"
                    :false-value="field.falseValue ?? 0"
                    :disabled="field.disabled"
                  />
                </div>

                <!-- Button field -->
                <PrimaryButton v-else-if="field.type === 'button'" type="button" :text="field.text || field.label"
                  @click="field.onClick && field.onClick()">
                  {{ field.text || field.label }}
                </PrimaryButton>

                <!-- Order + items dynamic rows with + -->
                <div v-else-if="field.type === 'orderRows'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">{{ field.label }}</span>

                    <PrimaryButton type="button" @click="addOrderRow(field.name)" bgColor="var(--color-success)"
                      :iconBefore="addIcon" />
                  </div>

                  <div v-for="(row, index) in formData[field.name]" :key="index" class="row g-2 align-items-end mb-2">
                    <div class="col-md-5">
                      <label class="form-label">
                        {{ field.orderLabel || t('common.order') }}
                      </label>
                      <select class="form-select" v-model="formData[field.name][index].order" @change="formData[field.name][index].items = []">
                        <option value="" disabled>{{ t('common.selectOrder') }}</option>
                        <option v-for="option in getOrderOptionsForField(field)" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>

                    <div class="col-md-5">
                      <label class="form-label d-flex align-items-center gap-2">
                        {{ field.itemsLabel || t('common.items') }}
                        <span v-if="formData[field.name][index].items?.length > 0" class="badge bg-primary rounded-pill">
                          {{ formData[field.name][index].items.length }}
                        </span>
                      </label>
                      
                      <!-- Checkboxes for items -->
                      <div class="multiselect-options-inline" v-if="formData[field.name][index].order">
                        <label
                          v-for="option in getItemsOptions(field, formData[field.name][index].order)"
                          :key="option.value"
                          class="multiselect-option-inline"
                          :class="{ 'selected': (formData[field.name][index].items || []).includes(option.value) }"
                        >
                          <input
                            type="checkbox"
                            :value="option.value"
                            v-model="formData[field.name][index].items"
                            class="form-check-input me-2"
                          />
                          <span>{{ option.label }}</span>
                        </label>
                      </div>
                      <div v-else class="text-muted small">
                        <i class="bi bi-info-circle me-1"></i>
                        {{ t('common.selectOrderFirst') }}
                      </div>
                    </div>

                    <div class="col-md-2">
                      <PrimaryButton type="button" @click="removeOrderRow(field.name, index)"
                        bgColor="var(--color-danger)" :iconBefore="crossIcon" />
                    </div>
                  </div>
                </div>

                <!-- Branch name dynamic rows with + -->
                <div v-else-if="field.type === 'branchRows'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">{{ field.label }}</span>

                    <PrimaryButton type="button" @click="addBranchRow(field.name)" bgColor="var(--color-success)"
                      :iconBefore="addIcon" />
                  </div>

                  <div v-for="(row, index) in formData[field.name]" :key="index" class="row g-2 align-items-end mb-2">
                    <input type="hidden" v-model="formData[field.name][index].latitude" />
                    <input type="hidden" v-model="formData[field.name][index].longitude" />

                    <div class="col-md-7">
                      <label class="form-label">
                        {{ field.branchLabel || t('company.form.branchName') }}
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData[field.name][index].name"
                        :placeholder="field.branchLabel || t('company.form.branchName')"
                      />
                      <small
                        v-if="formData[field.name][index].latitude && formData[field.name][index].longitude"
                        class="text-muted d-block mt-1"
                      >
                        {{ formData[field.name][index].latitude }}, {{ formData[field.name][index].longitude }}
                      </small>
                    </div>

                    <div class="col-md-4 d-grid">
                      <PrimaryButton
                        type="button"
                        :text="field.locationLabel || t('common.locateOnMap')"
                        @click="openBranchLocationPicker(field.name, index)"
                      />
                    </div>

                    <div class="col-md-1 d-flex align-items-end">
                      <PrimaryButton type="button" @click="removeBranchRow(field.name, index)"
                        bgColor="var(--color-danger)" :iconBefore="crossIcon" />
                    </div>
                  </div>
                </div>

                <!-- Location picker button -->
                <div v-else-if="field.type === 'locationPicker'" class="d-flex flex-column gap-2">
                  <PrimaryButton
                    type="button"
                    :text="field.text || t('common.locateOnMap')"
                    @click="openFieldLocationPicker(field)"
                  />
                  <small v-if="getFieldCoordinates(field)" class="text-muted">
                    {{ getFieldCoordinates(field) }}
                  </small>
                </div>

                <!-- Error Message -->
                <small v-if="errors[field.name]" class="text-danger">
                  {{ errors[field.name] }}
                </small>
                </template>
              </div>
            </div>

            <div v-if="mapPickerOpen" class="map-picker-panel mt-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">{{ t('common.selectLocation') }}</span>
                <button type="button" class="btn-close" @click="closeMapPicker"></button>
              </div>
              <div class="map-picker-container">
                <ol-map
                  ref="mapRef"
                  :controls="[]"
                  :loadTilesWhileAnimating="true"
                  :loadTilesWhileInteracting="true"
                  style="width: 100%; height: 260px"
                >
                  <ol-view
                    :center="mapCenter"
                    :zoom="mapZoom"
                    :projection="mapProjection"
                  />
                  <ol-tile-layer>
                    <ol-source-osm />
                  </ol-tile-layer>
                </ol-map>
              </div>
              <small class="text-muted d-block mt-2">{{ t('common.mapClickHint') }}</small>
            </div>

            <!-- Footer -->
            <div class="mt-4 d-flex justify-content-end gap-2">
              <PrimaryButton :text="t('common.cancel')" @click="closeModal" bg-color="var(--color-secondary)" />
              <PrimaryButton :text="t('common.save')" bgColor="var(--color-success)" :loadingText="t('common.saving')" :loading="isSubmitting"
                type="submit" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick, computed, unref, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import PrimaryButton from "./PrimaryButton.vue";
import uploadIcon from "../../assets/modal/upload.svg";
import removeIcon from "../../assets/table/recycle.svg";
import userIcon from "../../assets/modal/user.svg";
import addIcon from "../../assets/table/add.svg";
import crossIcon from "../../assets/modal/cross.svg";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";
import companyIconSvg from "@/assets/map/company.svg";

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: "Add New" },
  fields: { type: Array, required: true },
  showImageUpload: { type: Boolean, default: true },
  imageUploadLabel: { type: String, default: "" },
  imageRequired: { type: Boolean, default: false },
  initialImage: { type: String, default: "" },
});

const emit = defineEmits(["close", "submit"]);

const { t } = useI18n();

const formData = reactive({});
const errors = reactive({});
const isSubmitting = ref(false);
const imagePreview = ref(null);
const imageFile = ref(null);
const imageError = ref("");
const fileInput = ref(null);

const uploadLabel = computed(() =>
  props.imageUploadLabel ? props.imageUploadLabel : t("common.uploadImage")
);
const removeLabel = computed(() => t("common.remove"));

// Get select options (supports computed properties)
const getSelectOptions = (field) => {
  if (!field.options) return [];
  
  // Check if it's a Vue ref/computed (has value property)
  if (typeof field.options === 'object' && 'value' in field.options) {
    const options = unref(field.options);
    return Array.isArray(options) ? options : [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(field.options)) {
    return field.options;
  }
  
  return [];
};

// Get order options for a field
const getOrderOptionsForField = (field) => {
  // If field has a function to get order options, use it
  if (field.getOrderOptions && typeof field.getOrderOptions === 'function') {
    return field.getOrderOptions() || [];
  }
  
  // If field has orderOptions
  if (field.orderOptions) {
    // Check if it's a Vue ref/computed (has value property)
    if (typeof field.orderOptions === 'object' && 'value' in field.orderOptions) {
      const options = unref(field.orderOptions);
      console.log("📋 Order options from computed:", options);
      return Array.isArray(options) ? options : [];
    }
    
    // If it's already an array, return it
    if (Array.isArray(field.orderOptions)) {
      console.log("📋 Order options from array:", field.orderOptions);
      return field.orderOptions;
    }
  }
  
  // Otherwise, return empty array
  console.log("⚠️ No order options found for field:", field.name);
  return [];
};

// Get items options based on selected order
const getItemsOptions = (field, selectedOrder) => {
  if (!selectedOrder) {
    return [];
  }
  
  // If field has a function to get items options, use it
  if (field.getItemsOptions && typeof field.getItemsOptions === 'function') {
    return field.getItemsOptions(selectedOrder) || [];
  }
  
  // Otherwise, use static itemsOptions
  return field.itemsOptions || [];
};

const mapPickerOpen = ref(false);
const mapPickerTarget = ref(null);
const mapRef = ref(null);
const mapInstance = ref(null);
const mapCenter = ref([35.2033, 31.7683]);
const mapZoom = ref(8);
const mapProjection = ref("EPSG:4326");
let mapMarkerLayer = null;
let mapMarkerSource = null;
let mapMarkerFeature = null;
let mapListenersAttached = false;

const normalizeSelectValue = (value) => {
  if (Array.isArray(value)) {
    const first = value[0];
    return first === null || first === undefined || first === "" ? "" : String(first);
  }
  if (value && typeof value === "object") {
    const optionValue = value.value ?? value.id;
    return optionValue === null || optionValue === undefined || optionValue === ""
      ? ""
      : String(optionValue);
  }
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const resolveFieldProp = (field, prop) => {
  if (!field) return undefined;
  const value = field[prop];
  return typeof value === "function" ? value(formData) : value;
};

const resolveDefaultValue = (field) => {
  const fieldType = resolveFieldProp(field, "type") ?? field.type;
  if (fieldType === "multiselect") {
    return Array.isArray(field.defaultValue) ? field.defaultValue : [];
  }
  if (fieldType === "select") {
    return normalizeSelectValue(field.defaultValue);
  }
  return field.defaultValue ?? "";
};

const resolveFieldConfig = (field) => {
  if (!field) return field;
  const resolved = { ...field };

  const resolvedType = resolveFieldProp(field, "type");
  if (resolvedType !== undefined) resolved.type = resolvedType;

  const resolvedOptions = resolveFieldProp(field, "options");
  if (resolvedOptions !== undefined) resolved.options = resolvedOptions;

  const resolvedHidden = resolveFieldProp(field, "hidden");
  if (resolvedHidden !== undefined) resolved.hidden = resolvedHidden;

  const resolvedRequired = resolveFieldProp(field, "required");
  if (resolvedRequired !== undefined) resolved.required = resolvedRequired;

  const resolvedDisabled = resolveFieldProp(field, "disabled");
  if (resolvedDisabled !== undefined) resolved.disabled = resolvedDisabled;

  const resolvedLocked = resolveFieldProp(field, "locked");
  if (resolvedLocked !== undefined) resolved.locked = resolvedLocked;

  const resolvedLabel = resolveFieldProp(field, "label");
  if (resolvedLabel !== undefined) resolved.label = resolvedLabel;

  const resolvedPlaceholder = resolveFieldProp(field, "placeholder");
  if (resolvedPlaceholder !== undefined) resolved.placeholder = resolvedPlaceholder;

  const resolvedColClass = resolveFieldProp(field, "colClass");
  if (resolvedColClass !== undefined) resolved.colClass = resolvedColClass;

  return resolved;
};

const renderFields = computed(() =>
  Array.isArray(props.fields)
    ? props.fields.map((field) => resolveFieldConfig(field))
    : []
);

// Initialize form
// في src/components/shared/FormModal.vue

// Initialize form
const initializeForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  props.fields.forEach((field) => {
    if (field && field.name) {
      if (field.type === "orderRows") {
        // ✅ تعديل هون
        const defaultRows = Array.isArray(field.defaultValue) && field.defaultValue.length
          ? field.defaultValue
          : [{ order: "", items: [] }];
        
        formData[field.name] = defaultRows.map((row) => ({
          order: row?.order || "",
          items: Array.isArray(row?.items) ? [...row.items] : [] // ✅ نسخ الـ items
        }));
        
        console.log("🔄 Initialized orderRows:", formData[field.name]);
      } else if (field.type === "branchRows") {
        const defaultRows =
          Array.isArray(field.defaultValue) && field.defaultValue.length
            ? field.defaultValue
            : [{ name: "", latitude: "", longitude: "" }];
        formData[field.name] = defaultRows.map((row) => ({
          name: row?.name || "",
          latitude: row?.latitude ?? "",
          longitude: row?.longitude ?? "",
        }));
      } else {
        formData[field.name] = resolveDefaultValue(field);
      }
      errors[field.name] = "";
    }
  });
  
  // ✅ لوج لشوف شو صار
  console.log("📋 Form data after initialization:", formData);

  if (!imageFile.value) {
    imagePreview.value = props.initialImage || null;
    imageError.value = "";
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};


// Reset form
// Reset form
const resetForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  props.fields.forEach((field) => {
    if (field && field.name) {
      if (field.type === "orderRows") {
        // ✅ تعديل هون
        const defaultRows = Array.isArray(field.defaultValue) && field.defaultValue.length
          ? field.defaultValue
          : [{ order: "", items: [] }];
        
        formData[field.name] = defaultRows.map((row) => ({
          order: row?.order || "",
          items: Array.isArray(row?.items) ? [...row.items] : [] // ✅ نسخ الـ items
        }));
      } else if (field.type === "branchRows") {
        const defaultRows =
          Array.isArray(field.defaultValue) && field.defaultValue.length
            ? field.defaultValue
            : [{ name: "", latitude: "", longitude: "" }];
        formData[field.name] = defaultRows.map((row) => ({
          name: row?.name || "",
          latitude: row?.latitude ?? "",
          longitude: row?.longitude ?? "",
        }));
      } else {
        formData[field.name] = resolveDefaultValue(field);
      }
      errors[field.name] = "";
    }
  });

  imagePreview.value = null;
  imageFile.value = null;
  imageError.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  closeMapPicker();
};
    


// Add / Remove order rows
const addOrderRow = (fieldName) => {
  if (!Array.isArray(formData[fieldName])) {
    formData[fieldName] = [];
  }
  formData[fieldName].push({
    order: "",
    items: [],
  });
};

const removeOrderRow = (fieldName, index) => {
  if (!Array.isArray(formData[fieldName])) return;
  formData[fieldName].splice(index, 1);
};

// Add / Remove branch rows
const addBranchRow = (fieldName) => {
  if (!Array.isArray(formData[fieldName])) {
    formData[fieldName] = [];
  }
  formData[fieldName].push({
    name: "",
    latitude: "",
    longitude: "",
  });
};

const removeBranchRow = (fieldName, index) => {
  if (!Array.isArray(formData[fieldName])) return;
  formData[fieldName].splice(index, 1);
};

const getFieldCoordinates = (field) => {
  const latKey = field.latKey || "latitude";
  const lngKey = field.lngKey || "longitude";
  const latitude = formData[latKey];
  const longitude = formData[lngKey];

  if (!latitude || !longitude) return "";
  return `${latitude}, ${longitude}`;
};

const openBranchLocationPicker = (fieldName, index) => {
  mapPickerTarget.value = {
    type: "branchRows",
    fieldName,
    index,
    latKey: "latitude",
    lngKey: "longitude",
  };
  openMapPicker();
};

const openFieldLocationPicker = (field) => {
  mapPickerTarget.value = {
    type: "field",
    latKey: field.latKey || "latitude",
    lngKey: field.lngKey || "longitude",
  };
  openMapPicker();
};

const closeMapPicker = () => {
  mapPickerOpen.value = false;
  mapPickerTarget.value = null;
  detachMapListeners();
};

const getTargetCoordinates = () => {
  const target = mapPickerTarget.value;
  if (!target) return null;

  if (target.type === "branchRows") {
    const rows = formData[target.fieldName];
    const row = Array.isArray(rows) ? rows[target.index] : null;
    if (!row) return null;
    const latitude = Number.parseFloat(row.latitude);
    const longitude = Number.parseFloat(row.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }
    return [longitude, latitude];
  }

  const latitude = Number.parseFloat(formData[target.latKey]);
  const longitude = Number.parseFloat(formData[target.lngKey]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return [longitude, latitude];
};

const updateMapMarker = (coordinates) => {
  if (!mapInstance.value) return;

  if (!mapMarkerSource) {
    mapMarkerSource = new VectorSource();
    mapMarkerLayer = new VectorLayer({ source: mapMarkerSource });
    mapInstance.value.addLayer(mapMarkerLayer);
  }

  if (!mapMarkerFeature) {
    mapMarkerFeature = new Feature({
      geometry: new Point(coordinates),
    });
    mapMarkerFeature.setStyle(
      new Style({
        image: new Icon({
          src: companyIconSvg,
          scale: 0.04,
          anchor: [0.5, 1],
        }),
      })
    );
    mapMarkerSource.addFeature(mapMarkerFeature);
  } else {
    mapMarkerFeature.setGeometry(new Point(coordinates));
  }
};

const handleMapClick = (event) => {
  if (!mapPickerTarget.value) return;

  const [longitude, latitude] = event.coordinate || [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

  const formattedLatitude = latitude.toFixed(6);
  const formattedLongitude = longitude.toFixed(6);

  if (mapPickerTarget.value.type === "branchRows") {
    const rows = formData[mapPickerTarget.value.fieldName];
    if (Array.isArray(rows) && rows[mapPickerTarget.value.index]) {
      rows[mapPickerTarget.value.index].latitude = formattedLatitude;
      rows[mapPickerTarget.value.index].longitude = formattedLongitude;
    }
  } else {
    formData[mapPickerTarget.value.latKey] = formattedLatitude;
    formData[mapPickerTarget.value.lngKey] = formattedLongitude;
  }

  updateMapMarker([longitude, latitude]);
};

const attachMapListeners = () => {
  if (mapInstance.value && !mapListenersAttached) {
    mapInstance.value.on("click", handleMapClick);
    mapListenersAttached = true;
  }
};

const detachMapListeners = () => {
  if (mapInstance.value && mapListenersAttached) {
    mapInstance.value.un("click", handleMapClick);
    mapListenersAttached = false;
  }
};

const openMapPicker = () => {
  mapPickerOpen.value = true;
  const coordinates = getTargetCoordinates();

  if (coordinates) {
    mapCenter.value = coordinates;
    mapZoom.value = 12;
  } else {
    mapCenter.value = [35.2033, 31.7683];
    mapZoom.value = 8;
    if (mapMarkerSource) {
      mapMarkerSource.clear();
      mapMarkerFeature = null;
    }
  }

  nextTick(() => {
    if (mapRef.value && mapRef.value.map) {
      mapInstance.value = mapRef.value.map;
      mapInstance.value.getView().setCenter(mapCenter.value);
      mapInstance.value.getView().setZoom(mapZoom.value);
      mapInstance.value.updateSize();
      if (coordinates) {
        updateMapMarker(coordinates);
      }
    }
    attachMapListeners();
  });
};

// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = t("common.validation.invalidImageFile");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = t("common.validation.imageMaxSize", { size: 5 });
    return;
  }

  imageError.value = "";
  imageFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Remove image
const removeImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  imageError.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Trigger file input click
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Validate form
const validateForm = () => {
  let isValid = true;
  if (!props.fields || props.fields.length === 0) return false;

  renderFields.value.forEach((field) => {
    if (field && field.name) {
      errors[field.name] = "";
    }
  });

  if (props.showImageUpload && props.imageRequired && !imageFile.value && !imagePreview.value) {
    imageError.value = t("common.validation.imageRequired");
    isValid = false;
  }

  renderFields.value.forEach((field) => {
    if (!field || !field.name) return;
    const value = formData[field.name];

    if (field.hidden) {
      return;
    }

    if (field.type === "orderRows" && Array.isArray(value)) {
      if (field.required) {
        value.forEach((row) => {
          if (!row.order || !row.items || (Array.isArray(row.items) && row.items.length === 0)) {
            errors[field.name] = t("common.validation.orderRowRequired");
            isValid = false;
          }
        });
      }
      return;
    }

    if (field.type === "branchRows" && Array.isArray(value)) {
      if (field.required) {
        const hasEmptyBranch = value.some(row => !row.name || row.name.trim() === "");
        if (hasEmptyBranch) {
          errors[field.name] = t("common.validation.branchNameRequired");
          isValid = false;
        }
      }
      return;
    }

    if (field.required) {
      // For multiselect, check if array is empty
      if (field.type === 'multiselect' && (!value || value.length === 0)) {
        errors[field.name] = t("common.validation.requiredField", { field: field.label });
        isValid = false;
        return;
      }
      // For other fields, check if value is falsy
      if (field.type !== 'multiselect' && !value) {
        errors[field.name] = t("common.validation.requiredField", { field: field.label });
        isValid = false;
        return;
      }
    }

    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = t("common.validation.invalidEmail");
      isValid = false;
      return;
    }

    if (field.minlength && value && value.length < field.minlength) {
      errors[field.name] = t("common.validation.minLength", { min: field.minlength });
      isValid = false;
      return;
    }

    if (field.validate && typeof field.validate === "function") {
      const validationError = field.validate(value, formData);
      if (validationError) {
        errors[field.name] = validationError;
        isValid = false;
      }
    }
  });

  return isValid;
};

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) return;
  isSubmitting.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const submitData = { ...formData };

    if (imageFile.value) {
      submitData.image = imageFile.value;
      submitData.imagePreview = imagePreview.value;
    }

    emit("submit", submitData);

    resetForm();
    closeModal();
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Close modal
const closeModal = () => {
  resetForm();
  emit("close");
};

// Initialize on mount
onMounted(() => {
  initializeForm();
});

// Watch for modal open/close with smooth handling and scrollbar compensation
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      initializeForm();
      // Calculate scrollbar width BEFORE hiding overflow to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Apply both styles simultaneously in one operation to minimize reflow
      requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      });
    } else {
      closeMapPicker();
      // Remove styles in one operation
      requestAnimationFrame(() => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      });
    }
  }
);

// Watch for fields change
watch(
  () => props.fields,
  () => {
    if (props.isOpen) {
      initializeForm();
    }
  },
  { deep: true }
);

onUnmounted(() => {
  detachMapListeners();
  if (mapInstance.value && mapMarkerLayer) {
    mapInstance.value.removeLayer(mapMarkerLayer);
  }
});
const handleFieldChange = (field, event) => {
  if (field.onChange && typeof field.onChange === 'function') {
    field.onChange(event.target.value, formData);
  }
};
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
  will-change: opacity;
  backface-visibility: hidden;
}

/* Modal transitions */
.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog {
  transition: transform 0.2s ease-out;
}

.modal-leave-active .modal-dialog {
  transition: transform 0.15s ease-in;
}

.modal-enter-from .modal-dialog {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-dialog {
  transform: scale(0.95);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
  contain: layout style paint;
  will-change: opacity;
  backface-visibility: hidden;
  isolation: isolate;
}

.modal-dialog {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.modal-content {
  contain: layout style;
}

.locked-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 0.75rem;
}

/* ✅ Multiselect Styles */
.multiselect-container {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  background: #f8f9fa;
}

.multiselect-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.multiselect-header .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.multiselect-options {
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border-radius: 6px;
  padding: 8px;
}

.multiselect-option {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.multiselect-option:hover {
  background: #f8f9fa;
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.multiselect-option.selected {
  background: #e7f3ff;
  border-color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0,123,255,0.1);
}

.multiselect-option .form-check-input {
  margin: 0;
  cursor: pointer;
}

.multiselect-option .option-label {
  flex: 1;
  user-select: none;
  font-size: 0.9rem;
}

.multiselect-option i.bi-check-circle-fill {
  font-size: 1.1rem;
  margin-left: 8px;
}

/* ✅ Inline Multiselect for Order Items */
.multiselect-options-inline {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px;
}

.multiselect-option-inline {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 4px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  font-size: 0.85rem;
}

.multiselect-option-inline:hover {
  background: #f8f9fa;
  border-color: var(--primary-color);
}

.multiselect-option-inline.selected {
  background: #e7f3ff;
  border-color: var(--primary-color);
  font-weight: 500;
}

.multiselect-option-inline .form-check-input {
  cursor: pointer;
}

/* Scrollbar styling */
.multiselect-options::-webkit-scrollbar,
.multiselect-options-inline::-webkit-scrollbar {
  width: 6px;
}

.multiselect-options::-webkit-scrollbar-thumb,
.multiselect-options-inline::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

.multiselect-options::-webkit-scrollbar-track,
.multiselect-options-inline::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.map-picker-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 12px;
}

.map-picker-container {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  overflow: hidden;
}
</style>
