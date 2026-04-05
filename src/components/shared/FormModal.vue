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
                <template v-else-if="field.type === 'section'">
                  <div class="form-section-divider d-flex align-items-center gap-2">
                    <hr class="flex-grow-1 m-0" />
                    <span class="text-muted small fw-semibold text-uppercase">{{ field.label }}</span>
                    <hr class="flex-grow-1 m-0" />
                  </div>
                </template>
                <template v-else>
                  <!-- Checkbox / icon-toggle / notification-matrix handle their own label inline — skip the outer form-label -->
                  <label v-if="!['checkbox', 'icon-toggle', 'notification-matrix'].includes(field.type)" class="form-label fw-semibold" :for="field.name">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger">*</span>
                  </label>

                <!-- Text/Email/Tel/Password/Number/Date Input -->
                <div v-if="['text', 'email', 'tel', 'password', 'number', 'datetime-local', 'date'].includes(field.type) && field.type !== 'phone-prefix'"
                     class="position-relative">
                  <input
                    :id="field.name" 
                    :type="field.type === 'password' && showPassword[field.name] ? 'text' : field.type"
                    class="form-control" 
                    :class="{ 'pe-5': field.type === 'password' }"
                    v-model="formData[field.name]"
                    :placeholder="field.placeholder || field.label" 
                    :required="field.required"
                    :minlength="field.minlength" 
                    :step="field.step" 
                    :min="field.min" 
                    :max="field.max"
                    :disabled="field.disabled" 
                    :readonly="field.readonly"
                    @input="handleFieldInput(field)"
                    @blur="handleFieldBlur(field)" 
                  />
                  
                  <!-- Password Toggle Button -->
                  <button
                    v-if="field.type === 'password'"
                    type="button"
                    @click="togglePasswordVisibility(field.name)"
                    class="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent p-0 me-2"
                    style="z-index: 10"
                    tabindex="-1"
                  >
                    <img
                      v-if="showPassword[field.name]"
                      :src="showIcon"
                      alt="Hide password"
                      width="24"
                      height="24"
                      class="iconEye"
                    />
                    <img
                      v-else
                      :src="hideIcon"
                      alt="Show password"
                      width="24"
                      height="24"
                      class="iconEye"
                    />
                  </button>
                </div>
<!-- Phone with country prefix -->
<div v-else-if="field.type === 'phone-prefix'" class="d-flex gap-2">
  <select
    class="form-select"
    style="width: 140px; flex-shrink: 0;"
    :id="`${field.name}_prefix`"
    v-model="formData[`${field.name}_prefix`]"
  >
    <option v-for="c in countryCodesData" :key="c.code" :value="c.code">
      {{ c.label }}
    </option>
  </select>
  <input
    type="tel"
    class="form-control"
    :id="field.name"
    :placeholder="field.placeholder || field.label"
    :required="field.required"
    v-model="formData[field.name]"
    @input="handleFieldInput(field)"
    @blur="handleFieldBlur(field)"
  />
</div>
                <!-- Select Dropdown -->
                <select v-else-if="field.type === 'select'" :id="field.name" class="form-select"
                  v-model="formData[field.name]" :required="field.required"
                  :disabled="field.disabled || field.locked"
                  :class="{ 'locked-select': field.locked }"
                    @change="handleFieldChange(field, $event)"

                  @blur="handleFieldBlur(field)">
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
                        @change="handleFieldInput(field)"
                      />
                      <span class="option-label flex-grow-1">{{ option.label }}</span>
                      <i v-if="(formData[field.name] || []).includes(option.value)" 
                         class="bi bi-check-circle-fill text-success"></i>
                    </label>
                  </div>
                </div>

                <!-- Checkbox — toggle switch with inline label -->
                <div v-else-if="field.type === 'checkbox'" class="checkbox-field d-flex align-items-center h-100">
                  <div class="form-check form-switch mb-0">
                    <input
                      :id="field.name"
                      v-model="formData[field.name]"
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      :true-value="field.trueValue ?? 1"
                      :false-value="field.falseValue ?? 0"
                      :disabled="field.disabled"
                      @change="handleFieldInput(field)"
                    />
                    <label class="form-check-label fw-semibold" :for="field.name">
                      {{ field.label }}
                    </label>
                  </div>
                </div>

                <!-- Icon Toggle Tile — clickable square with icon + label -->
                <div
                  v-else-if="field.type === 'icon-toggle'"
                  class="it-tile"
                  :class="{ 'it-tile--active': formData[field.name] == (field.trueValue ?? 1) }"
                  @click="
                    formData[field.name] = formData[field.name] == (field.trueValue ?? 1)
                      ? (field.falseValue ?? 0)
                      : (field.trueValue ?? 1);
                    handleFieldInput(field);
                  "
                >
                  <i :class="field.icon"></i>
                  <span>{{ field.label }}</span>
                </div>

                <!-- Notification Matrix — accordion: activate event first, then pick channels -->
                <div v-else-if="field.type === 'notification-matrix'" class="nm-container">
                  <div
                    v-for="ev in field.events"
                    :key="ev.key"
                    class="nm-event-row"
                    :class="{ 'nm-event-row--open': isMatrixEventExpanded(field, ev.key) }"
                  >
                    <!-- Event header — click to toggle -->
                    <div
                      class="nm-event-header"
                      @click="toggleMatrixEvent(field, ev.key)"
                    >
                      <div class="d-flex align-items-center gap-2">
                        <i :class="ev.icon" class="nm-ev-icon"></i>
                        <span class="nm-ev-label">{{ ev.label }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <span
                          v-if="!isMatrixEventExpanded(field, ev.key) && getActiveChannelCount(field, ev.key) > 0"
                          class="nm-ch-badge"
                        >
                          {{ getActiveChannelCount(field, ev.key) }}
                        </span>
                        <i
                          class="fas nm-caret"
                          :class="isMatrixEventExpanded(field, ev.key) ? 'fa-chevron-up' : 'fa-chevron-down'"
                        ></i>
                      </div>
                    </div>

                    <!-- Channel strip — visible only when expanded -->
<div v-if="isMatrixEventExpanded(field, ev.key)" class="nm-channels-strip">
  <div
    v-for="ch in field.channels"
    :key="ch.key"
    class="nm-ch-item"
    :class="{ 
      'nm-ch-item--active': formData[`${field.prefix || 'notify_'}${ev.key}_${ch.key}`] == 1,
      'nm-ch-item--locked': ch.requiresPermission && !hasChannelPermission(ch.requiresPermission)
    }"
    @click="handleChannelClick(field, ev.key, ch.key, ch)"
  >
    <i :class="ch.icon" class="nm-ch-icon"></i>
    <small class="nm-ch-label">{{ ch.label }}</small>
  </div>
</div>

                    <!-- Email recipients — visible only when expanded and email channel active -->
                    <div
                      v-if="
                        field.enableEmailRecipients &&
                        isMatrixEventExpanded(field, ev.key) &&
                        isMatrixChannelActive(field, ev.key, 'email')
                      "
                      class="nm-email-recipients"
                    >
                      <div class="nm-email-title text-muted small mb-2">
                        <i class="fas fa-envelope me-1"></i>
                        {{ field.emailRecipientsLabel || t("user.form.notificationEmails") }}
                      </div>

                      <div
                        v-if="(formData[getMatrixEmailRecipientsKey(field, ev.key)] || []).length"
                        class="tags-chips d-flex flex-wrap gap-1 mb-2"
                      >
                        <span
                          v-for="(tag, idx) in formData[getMatrixEmailRecipientsKey(field, ev.key)]"
                          :key="idx"
                          class="badge bg-primary d-flex align-items-center gap-1 tag-chip"
                        >
                          {{ tag }}
                          <button type="button" class="tag-remove" @click="removeTag(getMatrixEmailRecipientsKey(field, ev.key), idx)">
                            &times;
                          </button>
                        </span>
                      </div>

                      <div class="d-flex gap-2">
                        <input
                          type="email"
                          class="form-control form-control-sm"
                          :placeholder="field.emailRecipientsPlaceholder || 'email@example.com'"
                          v-model="tagsInput[getMatrixEmailRecipientsKey(field, ev.key)]"
                          @keydown.enter.prevent="addTag(getMatrixEmailRecipientsKey(field, ev.key))"
                          @blur="addTag(getMatrixEmailRecipientsKey(field, ev.key))"
                        />
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm px-3"
                          @click="addTag(getMatrixEmailRecipientsKey(field, ev.key))"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <!-- ✅ Phone recipients — visible when sms or whatsapp active -->
                    <div
                      v-if="
                        field.enablePhoneRecipients &&
                        isMatrixEventExpanded(field, ev.key) &&
                        (isMatrixChannelActive(field, ev.key, 'sms') || isMatrixChannelActive(field, ev.key, 'whatsapp'))
                      "
                      class="nm-email-recipients"
                    >
                      <div class="nm-email-title text-muted small mb-2">
                        <i class="fas fa-phone me-1"></i>
                        {{ field.phoneRecipientsLabel || t("user.form.notificationPhones") }}
                      </div>

                      <div
                        v-if="(formData[getMatrixPhoneRecipientsKey(field, ev.key)] || []).length"
                        class="tags-chips d-flex flex-wrap gap-1 mb-2"
                      >
                        <span
                          v-for="(tag, idx) in formData[getMatrixPhoneRecipientsKey(field, ev.key)]"
                          :key="idx"
                          class="badge bg-warning text-dark d-flex align-items-center gap-1 tag-chip"
                        >
                          {{ tag }}
                          <button type="button" class="tag-remove" @click="removeTag(getMatrixPhoneRecipientsKey(field, ev.key), idx)">
                            &times;
                          </button>
                        </span>
                      </div>

                      <div class="d-flex gap-2">
                        <input
                          type="tel"
                          class="form-control form-control-sm"
                          :placeholder="field.phoneRecipientsPlaceholder || '0599123456'"
                          v-model="tagsInput[getMatrixPhoneRecipientsKey(field, ev.key)]"
                          @keydown.enter.prevent="addTag(getMatrixPhoneRecipientsKey(field, ev.key))"
                          @blur="addTag(getMatrixPhoneRecipientsKey(field, ev.key))"
                        />
                        <button
                          type="button"
                          class="btn btn-outline-warning btn-sm px-3"
                          @click="addTag(getMatrixPhoneRecipientsKey(field, ev.key))"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
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
                      <select
                        class="form-select"
                        v-model="formData[field.name][index].order"
                        @change="handleOrderRowChange(field, index)"
                        @blur="handleFieldBlur(field)"
                      >
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
                            @change="handleFieldInput(field)"
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
                        @input="handleFieldInput(field)"
                        @blur="handleFieldBlur(field)"
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

                <!-- Tags: free-text multi-value chips -->
                <div v-else-if="field.type === 'tags'" class="tags-field">
                  <div v-if="(formData[field.name] || []).length" class="tags-chips d-flex flex-wrap gap-1 mb-2">
                    <span
                      v-for="(tag, idx) in formData[field.name]"
                      :key="idx"
                      class="badge bg-primary d-flex align-items-center gap-1 tag-chip"
                    >
                      {{ tag }}
                      <button type="button" class="tag-remove" @click="removeTag(field.name, idx)">&times;</button>
                    </span>
                  </div>
                  <div class="d-flex gap-2">
                    <input
                      :type="field.inputType || 'tel'"
                      class="form-control form-control-sm"
                      :placeholder="field.placeholder || ''"
                      v-model="tagsInput[field.name]"
                      @keydown.enter.prevent="addTag(field.name)"
                      :disabled="field.locked || field.disabled"
                    />
                    <button type="button" class="btn btn-outline-primary btn-sm px-3" @click="addTag(field.name)">+</button>
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
                <small v-if="getFieldError(field)" class="text-danger">
                  {{ getFieldError(field) }}
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
import showIcon from "@/assets/login/show.svg";
import hideIcon from "@/assets/login/hide.svg";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";
import companyIconSvg from "@/assets/map/company.svg";
import { useAuthStore } from "@/stores/auth.js";
import { countryCodes as countryCodesData } from "@/utils/countryCodes.js";

const authStore = useAuthStore();

const hasChannelPermission = (permission) => {
  if (!permission) return true;
  return authStore.hasPermission(permission);
};

const handleChannelClick = (field, evKey, chKey, ch) => {
  if (ch.requiresPermission && !hasChannelPermission(ch.requiresPermission)) return;
  toggleMatrixCell(field, evKey, chKey);
};
const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: "Add New" },
  fields: { type: Array, required: true },
  showImageUpload: { type: Boolean, default: true },
  imageUploadLabel: { type: String, default: "" },
  imageRequired: { type: Boolean, default: false },
  initialImage: { type: String, default: "" },
  serverErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close", "submit"]);

const { t } = useI18n();

const formData = reactive({});
const errors = reactive({});
const serverFieldErrors = reactive({});
const tagsInput = reactive({});
const isSubmitting = ref(false);
const imagePreview = ref(null);
const imageFile = ref(null);
const imageError = ref("");
const fileInput = ref(null);
const showPassword = ref({});

const addTag = (fieldName) => {
  const val = (tagsInput[fieldName] || '').trim();
  if (!val) return;
  if (!Array.isArray(formData[fieldName])) formData[fieldName] = [];
  formData[fieldName].push(val);
  tagsInput[fieldName] = '';
};

const removeTag = (fieldName, index) => {
  formData[fieldName].splice(index, 1);
};

const toggleMatrixCell = (field, evKey, chKey) => {
  const k = `${field.prefix || "notify_"}${evKey}_${chKey}`;
  const nextVal = formData[k] == 1 ? 0 : 1;
  formData[k] = nextVal;

  // When disabling email for an event, clear its recipients list
  if (field.enableEmailRecipients && chKey === "email" && nextVal === 0) {
    const recipientsKey = getMatrixEmailRecipientsKey(field, evKey);
    formData[recipientsKey] = [];
  }

  // ✅ When disabling sms AND whatsapp, clear phone recipients
  if (field.enablePhoneRecipients && (chKey === "sms" || chKey === "whatsapp") && nextVal === 0) {
    const stillHasPhone =
      (chKey === "sms" && formData[`${field.prefix || "notify_"}${evKey}_whatsapp`] == 1) ||
      (chKey === "whatsapp" && formData[`${field.prefix || "notify_"}${evKey}_sms`] == 1);
    if (!stillHasPhone) {
      const phoneKey = getMatrixPhoneRecipientsKey(field, evKey);
      formData[phoneKey] = [];
    }
  }
};

// ── Notification Matrix accordion state ──
const matrixExpandedEvents = reactive({});

const isMatrixEventExpanded = (field, evKey) => {
  return !!matrixExpandedEvents[`${field.prefix || 'notify_'}_${evKey}`];
};

const getMatrixEmailRecipientsKey = (field, evKey) => {
  const prefix = field.prefix || "notify_";
  return `${prefix}${evKey}_email_recipients`;
};

// ✅ NEW: phone recipients key helper
const getMatrixPhoneRecipientsKey = (field, evKey) => {
  const prefix = field.prefix || "notify_";
  return `${prefix}${evKey}_phone_recipients`;
};

const getMatrixCellKey = (field, evKey, chKey) => {
  const prefix = field.prefix || "notify_";
  return `${prefix}${evKey}_${chKey}`;
};

const isMatrixChannelActive = (field, evKey, chKey) => {
  return formData[getMatrixCellKey(field, evKey, chKey)] == 1;
};

const getActiveChannelCount = (field, evKey) => {
  const prefix = field.prefix || 'notify_';
  return (field.channels || []).filter(ch => formData[`${prefix}${evKey}_${ch.key}`] == 1).length;
};

const toggleMatrixEvent = (field, evKey) => {
  const key = `${field.prefix || 'notify_'}_${evKey}`;
  if (matrixExpandedEvents[key]) {
    // Collapsing — zero out all channels for this event
    const prefix = field.prefix || 'notify_';
    (field.channels || []).forEach(ch => { formData[`${prefix}${evKey}_${ch.key}`] = 0; });

    // Also clear email recipients when matrix collapses
    if (field.enableEmailRecipients) {
      formData[getMatrixEmailRecipientsKey(field, evKey)] = [];
    }

    // ✅ Also clear phone recipients when matrix collapses
    if (field.enablePhoneRecipients) {
      formData[getMatrixPhoneRecipientsKey(field, evKey)] = [];
    }

    matrixExpandedEvents[key] = false;
  } else {
    matrixExpandedEvents[key] = true;
  }
};

const uploadLabel = computed(() =>
  props.imageUploadLabel ? props.imageUploadLabel : t("common.uploadImage")
);
const removeLabel = computed(() => t("common.remove"));

const togglePasswordVisibility = (fieldName) => {
  showPassword.value[fieldName] = !showPassword.value[fieldName];
};

// Get select options (supports computed properties)
const getSelectOptions = (field) => {
  if (!field.options) return [];
  
  if (typeof field.options === 'object' && 'value' in field.options) {
    const options = unref(field.options);
    return Array.isArray(options) ? options : [];
  }
  
  if (Array.isArray(field.options)) {
    return field.options;
  }
  
  return [];
};

// Get order options for a field
const getOrderOptionsForField = (field) => {
  if (field.getOrderOptions && typeof field.getOrderOptions === 'function') {
    return field.getOrderOptions() || [];
  }
  
  if (field.orderOptions) {
    if (typeof field.orderOptions === 'object' && 'value' in field.orderOptions) {
      const options = unref(field.orderOptions);
      return Array.isArray(options) ? options : [];
    }

    if (Array.isArray(field.orderOptions)) {
      return field.orderOptions;
    }
  }

  return [];
};

// Get items options based on selected order
const getItemsOptions = (field, selectedOrder) => {
  if (!selectedOrder) {
    return [];
  }
  
  if (field.getItemsOptions && typeof field.getItemsOptions === 'function') {
    return field.getItemsOptions(selectedOrder) || [];
  }
  
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

const getValidationConfig = (field) => {
  if (!field || !field.validation || typeof field.validation !== "object") {
    return {};
  }
  return field.validation;
};

const isEmptyValue = (field, value) => {
  if (field?.type === "multiselect") {
    return !Array.isArray(value) || value.length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return Number.isNaN(value);
  return false;
};

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
  if (fieldType === "tags") {
    return Array.isArray(field.defaultValue) ? [...field.defaultValue] : [];
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

  const resolvedValidation = resolveFieldProp(field, "validation");
  if (resolvedValidation !== undefined) resolved.validation = resolvedValidation;

  return resolved;
};

const setServerErrors = (payload) => {
  Object.keys(serverFieldErrors).forEach((key) => {
    delete serverFieldErrors[key];
  });
  imageError.value = "";

  if (!payload || typeof payload !== "object") {
    return;
  }

  Object.entries(payload).forEach(([field, message]) => {
    if (!message) return;
    if (Array.isArray(message)) {
      const firstMessage = message.find((entry) => entry);
      if (firstMessage) {
        if (field === "image") {
          imageError.value = String(firstMessage);
        } else {
          serverFieldErrors[field] = String(firstMessage);
        }
      }
      return;
    }
    if (field === "image") {
      imageError.value = String(message);
    } else {
      serverFieldErrors[field] = String(message);
    }
  });
};

const clearServerError = (fieldName) => {
  if (!fieldName) return;
  if (serverFieldErrors[fieldName]) {
    delete serverFieldErrors[fieldName];
  }
};

const getFieldError = (field) => {
  if (!field || !field.name) return "";
  return errors[field.name] || serverFieldErrors[field.name] || "";
};

const clearAllErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
  Object.keys(serverFieldErrors).forEach((key) => {
    delete serverFieldErrors[key];
  });
  imageError.value = "";
};

const renderFields = computed(() =>
  Array.isArray(props.fields)
    ? props.fields.map((field) => resolveFieldConfig(field))
    : []
);

const initializeForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  clearAllErrors();

  props.fields.forEach((field) => {
    if (!field) return;
    if (field.type === 'notification-matrix') {
      const prefix = field.prefix || 'notify_';
      (field.events || []).forEach((ev) => {
        (field.channels || []).forEach((ch) => {
          const key = `${prefix}${ev.key}_${ch.key}`;
          formData[key] = field.defaultValues?.[key] ?? 0;
        });

        if (field.enableEmailRecipients) {
          const recipientsKey = `${prefix}${ev.key}_email_recipients`;
          formData[recipientsKey] = field.defaultValues?.[recipientsKey] ?? [];
        }

        // ✅ Initialize phone recipients
        if (field.enablePhoneRecipients) {
          const phoneKey = `${prefix}${ev.key}_phone_recipients`;
          formData[phoneKey] = field.defaultValues?.[phoneKey] ?? [];
        }

        // Auto-expand events that already have an active channel (edit mode)
        const expandKey = `${prefix}_${ev.key}`;
        const hasActive = (field.channels || []).some(
          ch => (field.defaultValues?.[`${prefix}${ev.key}_${ch.key}`] ?? 0) == 1
        );
        matrixExpandedEvents[expandKey] = hasActive;
      });
    } else if (field.name) {
      if (field.type === "orderRows") {
        const defaultRows = Array.isArray(field.defaultValue) && field.defaultValue.length
          ? field.defaultValue
          : [{ order: "", items: [] }];

        formData[field.name] = defaultRows.map((row) => ({
          order: row?.order || "",
          items: Array.isArray(row?.items) ? [...row.items] : []
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
      } else if (field.type === "tags") {
        formData[field.name] = Array.isArray(field.defaultValue) ? [...field.defaultValue] : [];
        tagsInput[field.name] = "";
      } else {
        formData[field.name] = resolveDefaultValue(field);
         if (field.type === 'phone-prefix') {
    formData[`${field.name}_prefix`] = field.defaultPrefix || '+970';
  }
      }
      errors[field.name] = "";
    }
  });

  if (!imageFile.value) {
    imagePreview.value = props.initialImage || null;
    imageError.value = "";
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const resetForm = () => {
  if (!props.fields || props.fields.length === 0) return;

  props.fields.forEach((field) => {
    if (!field) return;
    if (field.type === 'notification-matrix') {
      const prefix = field.prefix || 'notify_';
      (field.events || []).forEach((ev) => {
        (field.channels || []).forEach((ch) => {
          const key = `${prefix}${ev.key}_${ch.key}`;
          formData[key] = 0;
        });

        if (field.enableEmailRecipients) {
          formData[`${prefix}${ev.key}_email_recipients`] = [];
        }

        // ✅ Reset phone recipients
        if (field.enablePhoneRecipients) {
          formData[`${prefix}${ev.key}_phone_recipients`] = [];
        }

        // Collapse all events on reset
        matrixExpandedEvents[`${prefix}_${ev.key}`] = false;
      });
    } else if (field.name) {
      if (field.type === "orderRows") {
        const defaultRows = Array.isArray(field.defaultValue) && field.defaultValue.length
          ? field.defaultValue
          : [{ order: "", items: [] }];

        formData[field.name] = defaultRows.map((row) => ({
          order: row?.order || "",
          items: Array.isArray(row?.items) ? [...row.items] : []
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
         if (field.type === 'phone-prefix') {
    formData[`${field.name}_prefix`] = field.defaultPrefix || '+970';
  }
      }
      errors[field.name] = "";
    }
  });

  imagePreview.value = null;
  imageFile.value = null;
  clearAllErrors();
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

const validateField = (field) => {
  if (!field || !field.name) return true;
  const value = formData[field.name];
  const validation = getValidationConfig(field);

  errors[field.name] = "";

  if (field.hidden) {
    return true;
  }

  if (field.type === "orderRows" && Array.isArray(value)) {
    const isRequired = field.required || validation.required;
    if (isRequired) {
      const hasInvalid = value.some(
        (row) =>
          !row.order ||
          !row.items ||
          (Array.isArray(row.items) && row.items.length === 0)
      );
      if (hasInvalid) {
        errors[field.name] = t("common.validation.orderRowRequired");
        return false;
      }
    }
    return true;
  }

  if (field.type === "branchRows" && Array.isArray(value)) {
    const isRequired = field.required || validation.required;
    if (isRequired) {
      const hasEmptyBranch = value.some(
        (row) => !row.name || row.name.trim() === ""
      );
      if (hasEmptyBranch) {
        errors[field.name] = t("common.validation.branchNameRequired");
        return false;
      }
    }
    return true;
  }

  const isRequired = field.required || validation.required;
  if (isRequired && isEmptyValue(field, value)) {
    errors[field.name] = validation.message
      ? validation.message
      : t("common.validation.requiredField", { field: field.label });
    return false;
  }

  if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors[field.name] = t("common.validation.invalidEmail");
    return false;
  }

  const minLength = validation.minLength ?? field.minlength;
  if (minLength && value && value.length < minLength) {
    errors[field.name] = t("common.validation.minLength", { min: minLength });
    return false;
  }

  if (validation.min !== undefined || validation.max !== undefined) {
    const numericValue =
      value === "" || value === null || value === undefined
        ? Number.NaN
        : Number(value);
    if (Number.isFinite(numericValue)) {
      if (validation.min !== undefined && numericValue < validation.min) {
        errors[field.name] = validation.message
          ? validation.message
          : t("common.validation.requiredField", { field: field.label });
        return false;
      }
      if (validation.max !== undefined && numericValue > validation.max) {
        errors[field.name] = validation.message
          ? validation.message
          : t("common.validation.requiredField", { field: field.label });
        return false;
      }
    }
  }

  if (field.validate && typeof field.validate === "function") {
    const validationError = field.validate(value, formData);
    if (validationError) {
      errors[field.name] = validationError;
      return false;
    }
  }

  return true;
};

const handleFieldBlur = (field) => {
  if (!field || !field.name) return;
  validateField(field);
};

const handleFieldInput = (field) => {
  if (!field || !field.name) return;
  clearServerError(field.name);
  if (errors[field.name]) {
    validateField(field);
  }
};

const handleOrderRowChange = (field, index) => {
  if (!field || !field.name) return;
  if (!Array.isArray(formData[field.name])) return;
  if (formData[field.name][index]) {
    formData[field.name][index].items = [];
  }
  handleFieldInput(field);
};

// Validate form
const validateForm = () => {
  let isValid = true;
  if (!props.fields || props.fields.length === 0) return false;

  if (props.showImageUpload && props.imageRequired && !imageFile.value && !imagePreview.value) {
    imageError.value = t("common.validation.imageRequired");
    isValid = false;
  }

  renderFields.value.forEach((field) => {
    if (!validateField(field)) {
      isValid = false;
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

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      initializeForm();
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      });
    } else {
      resetForm();
      requestAnimationFrame(() => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      });
    }
  }
);

watch(
  () => props.fields,
  () => {
    if (props.isOpen) {
      initializeForm();
    }
  },
  { deep: true }
);

watch(
  () => props.serverErrors,
  (newErrors) => {
    setServerErrors(newErrors);
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

/* Password Toggle Styles */
.form-control.pe-5 {
  padding-right: 3rem !important;
}

.btn .iconEye {
  filter: brightness(0) saturate(100%) invert(46%) sepia(3%) saturate(1481%)
    hue-rotate(167deg) brightness(96%) contrast(88%);
  transition: all 0.2s ease;
}

.btn:hover .iconEye {
  filter: brightness(0) saturate(100%) invert(38%) sepia(89%) saturate(2166%)
    hue-rotate(227deg) brightness(97%) contrast(92%);
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

/* ── Tags field ── */
.tags-field { display: flex; flex-direction: column; gap: 0; }
.tag-chip { font-size: 0.8rem; padding: 0.25rem 0.5rem; }
.tag-remove {
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-size: 1rem;
  margin-left: 2px;
}
.tag-remove:hover { color: #fff; }

/* ── Icon Toggle Tile ── */
.it-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 2px solid transparent;
  cursor: pointer;
  user-select: none;
  min-height: 76px;
  transition: background 0.18s, border-color 0.18s, transform 0.1s;
}
.it-tile i {
  font-size: 1.25rem;
  color: #9ca3af;
  transition: color 0.18s;
}
.it-tile span {
  font-size: 0.68rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
  transition: color 0.18s;
}
.it-tile--active {
  background: #3b82f6;
  border-color: #2563eb;
}
.it-tile--active i  { color: #fff; }
.it-tile--active span { color: #fff; }
.it-tile:hover:not(.it-tile--active) {
  background: #e5e7eb;
  border-color: #d1d5db;
}
.it-tile:active { transform: scale(0.93); }

/* ── Checkbox / toggle switch ── */
.checkbox-field {
  min-height: 38px;
}
.form-check-input[type="checkbox"] {
  cursor: pointer;
}
.form-check-label {
  cursor: pointer;
  user-select: none;
}

/* ── Section divider ── */
.form-section-divider { padding: 0.5rem 0 0.25rem; }
.form-section-divider hr { border-color: #dee2e6; opacity: 1; }

/* ── Notification Matrix (accordion) ── */
.nm-container {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.nm-event-row { border-bottom: 1px solid #f3f4f6; }
.nm-event-row:last-child { border-bottom: none; }

/* Event header row */
.nm-event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  cursor: pointer;
  background: #fafafa;
  user-select: none;
  transition: background 0.15s;
}
.nm-event-header:hover { background: #f3f4f6; }
.nm-event-row--open .nm-event-header {
  background: #eff6ff;
  border-bottom: 1px solid #dbeafe;
}
.nm-ev-icon { color: #6b7280; width: 16px; text-align: center; font-size: 14px; }
.nm-ev-label { font-size: 13px; font-weight: 500; color: #374151; }
.nm-caret { font-size: 11px; color: #9ca3af; transition: transform 0.2s; }
.nm-event-row--open .nm-caret { color: #3b82f6; }
.nm-ch-badge {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #3b82f6;
  border-radius: 20px;
  padding: 1px 8px;
  line-height: 1.6;
}

/* Channel strip (expanded area) */
.nm-channels-strip {
  display: flex;
  gap: 8px;
  padding: 12px 16px 14px;
  background: #fff;
  flex-wrap: wrap;
}
.nm-ch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.15s ease;
  min-width: 64px;
  user-select: none;
}
.nm-ch-item:hover { border-color: #3b82f6; background: #eff6ff; }
.nm-ch-item--active { background: #3b82f6; border-color: #2563eb; }
.nm-ch-item:active { transform: scale(0.93); }
.nm-ch-icon { font-size: 18px; color: #6b7280; transition: color 0.15s; }
.nm-ch-item--active .nm-ch-icon { color: #fff; }
.nm-ch-label {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: color 0.15s;
}
.nm-ch-item--active .nm-ch-label { color: rgba(255,255,255,0.9); }

/* ── Email / Phone recipients ── */
.nm-email-recipients {
  padding: 10px 16px 14px;
  background: #f9fafb;
  border-top: 1px dashed #e5e7eb;
}
.nm-email-title {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
}
.nm-ch-item--locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.nm-ch-item--locked:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}
</style>