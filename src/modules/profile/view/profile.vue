<template>
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Profile Header Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-auto">
              <div class="position-relative">
                <div class="rounded-circle overflow-hidden border border-3 border-light bg-white shadow-sm"
                  style="width: 120px; height: 120px">
                  <img v-if="formData.imagePreview || authStore.user?.image"
                    :src="formData.imagePreview || authStore.user?.image" alt="Profile" class="w-100 h-100"
                    style="object-fit: cover" />
                  <div v-else class="d-flex flex-column align-items-center justify-content-center h-100 bg-light">
                    <img :src="userIcon" alt="user" width="50" height="50" />
                  </div>
                </div>
                <button class="btn btn-sm rounded-circle position-absolute bottom-0 end-0 shadow"
                  style="width: 36px; height: 36px" @click="triggerFileInput" type="button">
                  <img :src="cameraIcon" alt="camera" width="16" height="16" />
                </button>
                <input type="file" class="d-none" accept="image/*" @change="handleImageUpload" ref="fileInput" />
              </div>
            </div>
            <div class="col">
              <h3 class="mb-1 fw-bold">{{ formData.name || userProfile?.name }}</h3>
              <p class="text-muted mb-2">{{ formData.email || userProfile?.email || $t('profile.noEmail') }}</p>
              <p class="text-muted mb-2">{{ formData.phone_number || userProfile?.phone_number }}</p>
              <span class="badge" :class="getRoleBadgeClass(userProfile?.role?.[0])">
                {{ $t(`roles.${userProfile?.role?.[0]}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="handleSaveChanges">
        <div class="row g-4">
          <!-- Personal Information -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <img :src="userIcon" alt="user" width="32" height="32" />
                  {{ $t('profile.personalInfo') }}
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-12">
                    <FormLabel :label="$t('user.id')" />
                    <input type="text" class="form-control bg-light" :value="userProfile?.id" disabled />
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.fullName')" :required="true" />
                    <TextField v-model="formData.name" type="text" :placeholder="$t('user.form.namePlaceholder')"
                      :class="{ 'is-invalid': fieldErrors.name }" @input="handleFieldInput('name')"
                      @blur="validateField('name')" />
                    <div v-if="fieldErrors.name" class="invalid-feedback d-block">{{ fieldErrors.name }}</div>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.username')" :required="true" />
                    <TextField v-model="formData.username" type="text" :placeholder="$t('user.form.usernamePlaceholder')"
                      :class="{ 'is-invalid': fieldErrors.username }" @input="handleFieldInput('username')"
                      @blur="validateField('username')" />
                    <div v-if="fieldErrors.username" class="invalid-feedback d-block">{{ fieldErrors.username }}</div>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.email')" />
                    <TextField v-model="formData.email" type="email" :placeholder="$t('user.form.emailPlaceholder')"
                      :class="{ 'is-invalid': fieldErrors.email }" @input="handleFieldInput('email')"
                      @blur="validateField('email')" />
                    <div v-if="fieldErrors.email" class="invalid-feedback d-block">{{ fieldErrors.email }}</div>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.phoneNumber')" :required="true" />
                    <TextField v-model="formData.phone_number" type="tel"
                      :placeholder="$t('user.form.phoneNumberPlaceholder')"
                      :class="{ 'is-invalid': fieldErrors.phone_number }" @input="handleFieldInput('phone_number')"
                      @blur="validateField('phone_number')" />
                    <div v-if="fieldErrors.phone_number" class="invalid-feedback d-block">{{ fieldErrors.phone_number }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Settings -->
          <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-bottom">
                <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <img :src="settingIcon" alt="settings" width="32" height="32" />
                  {{ $t('profile.accountSettings') }}
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <div class="col-12">
                    <FormLabel :label="$t('user.userRole')" />
                    <input type="text" class="form-control bg-light" :value="$t(`roles.${userProfile?.role?.[0]}`)" disabled />
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.company')" />
                    <select v-model="formData.company_id" class="form-select" @change="markAsChanged">
                      <option value="">{{ $t('user.form.companyPlaceholder') }}</option>
                      <option v-for="company in companies" :key="company.value" :value="company.value">{{ company.label }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.region')" />
                    <select v-model="formData.region_id" class="form-select" @change="markAsChanged">
                      <option value="">{{ $t('user.form.noRegion') }}</option>
                      <option v-for="region in regions" :key="region.value" :value="region.value">{{ region.label }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('user.form.currency')" />
                    <select v-model="formData.currency_id" class="form-select" @change="markAsChanged">
                      <option value="">{{ $t('user.form.noCurrency') }}</option>
                      <option v-for="currency in currencies" :key="currency.value" :value="currency.value">{{ currency.label }}</option>
                    </select>
                  </div>
                  <div class="col-12">
                    <FormLabel :label="$t('profile.language')" />
                    <select v-model="formData.language" class="form-select" @change="handleLanguageChange">
                      <option value="english">{{ $t('profile.languages.english') }}</option>
                      <option value="arabic">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Preferences -->
        <div class="row g-4 mt-0">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 class="mb-0 fw-semibold d-flex align-items-center gap-2">
                  <i class="fas fa-bell text-primary"></i>
                  {{ $t('user.form.notificationSection') || 'Notification Preferences' }}
                </h5>
                <div class="d-flex align-items-center gap-2">
                  <span v-if="notificationsLoading" class="spinner-border spinner-border-sm text-primary"></span>
                  <Transition name="fade">
                    <span v-if="notifSaveSuccess" class="text-success small fw-semibold">
                      <i class="fas fa-check-circle me-1"></i>{{ $t('common.save') || 'Saved!' }}
                    </span>
                  </Transition>
                  <PrimaryButton
                    v-if="notifHasChanges && !notificationsLoading"
                    :text="$t('common.save') || 'Save Preferences'"
                    bgColor="var(--color-success)"
                    :loading="notifSaving"
                    type="button"
                    @click="saveNotificationPreferences"
                  />
                </div>
              </div>

              <div class="card-body p-4">
                <!-- Loading -->
                <div v-if="notificationsLoading" class="text-center py-4">
                  <div class="spinner-border text-primary"></div>
                  <p class="text-muted mt-2 small">{{ $t('common.loading') }}</p>
                </div>

                <!-- No events configured -->
                <div v-else-if="notificationEventsStore.events.length === 0" class="text-center text-muted py-4">
                  <i class="fas fa-bell-slash fa-2x mb-2 opacity-50 d-block"></i>
                  <p class="mb-0">{{ $t('navbar.noNotifications') || 'No notification events available.' }}</p>
                </div>

                <!-- Events list -->
                <div v-else class="notif-events-list">
                  <div
                    v-for="ev in notificationEventsStore.events"
                    :key="ev.id"
                    class="notif-event-card mb-3"
                    :class="{ 'notif-event-card--open': isEventExpanded(ev.id) }"
                  >
                    <!-- Event Header -->
                    <div class="notif-event-header" @click="toggleEvent(ev.id)">
                      <div class="d-flex align-items-center gap-2 flex-wrap">
                        <i class="fas fa-bell notif-ev-icon"></i>
                        <span class="notif-ev-label">
                          {{ $i18n.locale === 'ar' ? ev.ar_name : ev.en_name }}
                        </span>
                        <div v-if="!isEventExpanded(ev.id)" class="d-flex gap-1 flex-wrap">
                          <template v-for="ch in channelDefs" :key="ch.key">
                            <span
                              v-if="notifFormData[`${ev.key}_${ch.key}`] == 1"
                              class="badge rounded-pill py-1 px-2"
                              :class="ch.badgeClass"
                              style="font-size:0.65rem"
                            >
                              <i :class="ch.icon"></i>
                            </span>
                          </template>
                          <span
                            v-if="!channelDefs.some(ch => notifFormData[`${ev.key}_${ch.key}`] == 1)"
                            class="text-muted"
                            style="font-size:0.75rem"
                          >
                            {{ $t('common.none') || 'No channels active' }}
                          </span>
                        </div>
                      </div>
                      <i
                        class="fas"
                        :class="isEventExpanded(ev.id) ? 'fa-chevron-up' : 'fa-chevron-down'"
                        style="color:#9ca3af;font-size:11px;flex-shrink:0"
                      ></i>
                    </div>

                    <!-- Event Body -->
                    <div v-if="isEventExpanded(ev.id)" class="notif-event-body">
                      <p class="text-muted small mb-2 fw-semibold">
                        {{ $t('user.form.selectChannels') || 'Select channels:' }}
                      </p>
                      <div class="notif-channels-strip mb-3">
                        <div
                          v-for="ch in channelDefs"
                          :key="ch.key"
                          class="notif-ch-item"
                          :class="{
                            'notif-ch-item--active': notifFormData[`${ev.key}_${ch.key}`] == 1,
                            'notif-ch-item--locked': ch.requiresPermission && !hasWhatsappPermission
                          }"
                          :title="ch.requiresPermission && !hasWhatsappPermission ? 'WhatsApp is a paid feature' : ''"
                          @click="toggleChannel(ev.key, ch.key)"
                        >
                          <i :class="ch.icon" class="notif-ch-icon"></i>
                          <small class="notif-ch-label">{{ ch.label }}</small>
                        </div>
                      </div>

                      <!-- Email recipients -->
                      <div v-if="notifFormData[`${ev.key}_email`] == 1" class="notif-recipients-block mb-2">
                        <div class="notif-recipients-title">
                          <i class="fas fa-envelope me-1 text-primary"></i>
                          {{ $t('user.form.notificationEmails') || 'Email Recipients' }}
                          <span class="text-danger">*</span>
                        </div>
                        <div class="d-flex flex-wrap gap-1 mb-2" v-if="notifFormData[`${ev.key}_email_list`]?.length">
                          <span
                            v-for="(email, idx) in notifFormData[`${ev.key}_email_list`]"
                            :key="idx"
                            class="badge bg-primary d-inline-flex align-items-center gap-1"
                            style="font-size:0.78rem;padding:0.3rem 0.55rem;border-radius:999px"
                          >
                            {{ email }}
                            <button type="button" class="tag-remove-btn" @click.stop="removeRecipient(ev.key, 'email_list', idx)">&times;</button>
                          </span>
                        </div>
                        <div class="d-flex gap-2">
                          <input
                            type="email"
                            class="form-control form-control-sm"
                            placeholder="email@example.com"
                            v-model="emailInputs[ev.key]"
                            @keydown.enter.prevent="addRecipient(ev.key, 'email_list', emailInputs[ev.key], 'email')"
                            @blur="addRecipient(ev.key, 'email_list', emailInputs[ev.key], 'email')"
                          />
                          <button type="button" class="btn btn-outline-primary btn-sm px-3" @click="addRecipient(ev.key, 'email_list', emailInputs[ev.key], 'email')">+</button>
                        </div>
                      </div>

                      <!-- Phone recipients -->
                      <div
                        v-if="notifFormData[`${ev.key}_sms`] == 1 || notifFormData[`${ev.key}_whatsapp`] == 1"
                        class="notif-recipients-block"
                      >
                        <div class="notif-recipients-title">
                          <i class="fas fa-phone me-1 text-warning"></i>
                          {{ $t('user.form.notificationPhones') || 'Phone Numbers (SMS / WhatsApp)' }}
                        </div>
                        <div class="d-flex flex-wrap gap-1 mb-2" v-if="notifFormData[`${ev.key}_phone_list`]?.length">
                          <span
                            v-for="(phone, idx) in notifFormData[`${ev.key}_phone_list`]"
                            :key="idx"
                            class="badge bg-warning text-dark d-inline-flex align-items-center gap-1"
                            style="font-size:0.78rem;padding:0.3rem 0.55rem;border-radius:999px"
                          >
                            {{ phone }}
                            <button type="button" class="tag-remove-btn tag-remove-btn--dark" @click.stop="removeRecipient(ev.key, 'phone_list', idx)">&times;</button>
                          </span>
                        </div>
                        <div class="d-flex gap-2">
                          <input
                            type="tel"
                            class="form-control form-control-sm"
                            placeholder="0599123456"
                            v-model="phoneInputs[ev.key]"
                            @keydown.enter.prevent="addRecipient(ev.key, 'phone_list', phoneInputs[ev.key], 'phone')"
                            @blur="addRecipient(ev.key, 'phone_list', phoneInputs[ev.key], 'phone')"
                          />
                          <button type="button" class="btn btn-outline-warning btn-sm px-3" @click="addRecipient(ev.key, 'phone_list', phoneInputs[ev.key], 'phone')">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Telegram Bot Card ── -->
        <div class="row g-4 mt-0">
          <div class="col-12">
            <div class="card border-0 shadow-sm tg-card">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-3 mb-4">
                  <div class="tg-icon-wrap">
                    <i class="fab fa-telegram-plane"></i>
                  </div>
                  <div>
                    <h5 class="mb-0 fw-bold">Telegram Bot</h5>
                    <p class="mb-0 text-muted small">
                      Connect with our bot for instant notifications
                    </p>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <div class="tg-bot-name">
                    <i class="fab fa-telegram-plane me-2"></i>
                    <span class="fw-semibold">{{ TELEGRAM_BOT }}</span>
                  </div>
                  <a
                    :href="TELEGRAM_LINK"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="tg-join-btn d-inline-flex align-items-center gap-2"
                  >
                    <i class="fab fa-telegram-plane"></i>
                    Open in Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <Transition name="slide-up">
          <div v-if="hasChanges" class="fixed-action-bar bg-white border-top shadow-lg">
            <div class="container-fluid">
              <div class="d-flex gap-3 justify-content-center align-items-center py-3">
                <PrimaryButton :text="$t('common.cancel')" bgColor="var(--color-secondary)" @click="handleCancel" type="button" />
                <PrimaryButton :text="$t('common.saveChanges')" bgColor="var(--color-success)" :loading="isSaving" type="submit" />
                <PrimaryButton :text="$t('profile.changePassword')" bgColor="var(--color-warning)" @click="openPasswordModal" type="button" />
              </div>
            </div>
          </div>
        </Transition>

        <div v-if="!hasChanges" class="d-flex gap-3 mt-4 justify-content-center">
          <PrimaryButton :text="$t('profile.changePassword')" bgColor="var(--color-warning)" @click="openPasswordModal" type="button" />
        </div>
      </form>

      <!-- Change Password Modal -->
      <FormModal
        :isOpen="isPasswordModalOpen"
        :title="$t('profile.changePassword')"
        :fields="passwordFields"
        :showImageUpload="false"
        :serverErrors="passwordFormErrors"
        @close="closePasswordModal"
        @submit="handleChangePassword"
      />

      <!-- Success Modal -->
      <SuccessModal
        :isOpen="isSuccessModalOpen"
        :title="$t('common.success')"
        :message="successMessage"
        @close="closeSuccessModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';
import { useNotificationEventsStore } from '@/stores/notificationEvents.js';
import FormModal from '@/components/shared/FormModal.vue';
import PrimaryButton from '@/components/shared/PrimaryButton.vue';
import FormLabel from '@/components/shared/FormLabel.vue';
import TextField from '@/components/shared/TextField.vue';
import SuccessModal from '@/components/shared/SuccessModal.vue';
import apiServices from '@/services/apiServices.js';
import api from '@/services/api.js';
import { setLocale } from '@/i18n/index';
import { normalizeServerErrors } from '@/utils/formErrors.js';
import cameraIcon from '@/assets/profile/camera.svg';
import settingIcon from '@/assets/profile/setting.svg';
import userIcon from '@/assets/sidebar/userIcon.svg';

// ── Telegram constants ──────────────────────────────────────────────────────
const TELEGRAM_BOT = '@pitsTrackingBot';
const TELEGRAM_LINK = 'https://t.me/pitsTrackingBot';

const API_BASE_URL = api.defaults.baseURL;
const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const notificationEventsStore = useNotificationEventsStore();

// ─── Profile state ──────────────────────────────────────────────────────────
const isLoading        = ref(true);
const userProfile      = ref(null);
const isSaving         = ref(false);
const hasChanges       = ref(false);
const fileInput        = ref(null);
const imageFile        = ref(null);
const isSuccessModalOpen = ref(false);
const successMessage   = ref('');
const isPasswordModalOpen = ref(false);
const passwordFormErrors  = ref({});

const fieldErrors = ref({ name: '', username: '', email: '', phone_number: '' });

const formData = reactive({
  name: '', username: '', email: '', phone_number: '',
  company_id: '', region_id: '', currency_id: '',
  language: 'english', default_page: '/user', imagePreview: null,
});
const originalData = ref({});

const regions    = ref([]);
const currencies = ref([]);
const companies  = ref([]);

// ─── Notification state ─────────────────────────────────────────────────────
const notificationsLoading = ref(false);
const notifSaving          = ref(false);
const notifSaveSuccess     = ref(false);
const notifHasChanges      = ref(false);

const notifFormData = reactive({});
const emailInputs   = reactive({});
const phoneInputs   = reactive({});
const expandedEvents = ref(new Set());

// ─── Channel definitions ────────────────────────────────────────────────────
const channelDefs = [
  { key: 'sms',      label: t('user.form.smsAlert')     || 'SMS',      icon: 'fas fa-sms',            badgeClass: 'bg-warning text-dark' },
  { key: 'web',      label: t('user.form.webAlert')      || 'Web',      icon: 'fas fa-globe',          badgeClass: 'bg-info text-dark'    },
  { key: 'email',    label: t('user.form.emailAlert')    || 'Email',    icon: 'fas fa-envelope',       badgeClass: 'bg-primary'           },
  { key: 'mobile',   label: t('user.form.mobileAlert')   || 'Mobile',   icon: 'fas fa-mobile-alt',     badgeClass: 'bg-success'           },
  { key: 'telegram', label: t('user.form.telegramAlert') || 'Telegram', icon: 'fab fa-telegram-plane', badgeClass: 'bg-primary'           },
  {
    key: 'whatsapp',
    label: t('user.form.whatsappAlert') || 'WhatsApp',
    icon: 'fab fa-whatsapp',
    badgeClass: 'bg-success',
    requiresPermission: 'whatsapp channel'
  },
];

const hasWhatsappPermission = computed(() => authStore.hasPermission('whatsapp channel'));

// ─── Expand / collapse ──────────────────────────────────────────────────────
const isEventExpanded = (evId) => expandedEvents.value.has(evId);

const toggleEvent = (evId) => {
  const s = new Set(expandedEvents.value);
  s.has(evId) ? s.delete(evId) : s.add(evId);
  expandedEvents.value = s;
};

// ─── Toggle channel ─────────────────────────────────────────────────────────
const toggleChannel = (evKey, chKey) => {
  if (chKey === 'whatsapp' && !hasWhatsappPermission.value) return;
  const k = `${evKey}_${chKey}`;
  notifFormData[k] = notifFormData[k] == 1 ? 0 : 1;
  if (chKey === 'email' && notifFormData[k] == 0) {
    notifFormData[`${evKey}_email_list`] = [];
  }
  if (chKey === 'sms' || chKey === 'whatsapp') {
    if (!notifFormData[`${evKey}_sms`] && !notifFormData[`${evKey}_whatsapp`]) {
      notifFormData[`${evKey}_phone_list`] = [];
    }
  }
  notifHasChanges.value = true;
};

// ─── Recipients ─────────────────────────────────────────────────────────────
const addRecipient = (evKey, listKey, value, inputType) => {
  const val = (value || '').trim();
  if (!val) return;
  const key = `${evKey}_${listKey}`;
  if (!Array.isArray(notifFormData[key])) notifFormData[key] = [];
  if (!notifFormData[key].includes(val)) {
    notifFormData[key].push(val);
    notifHasChanges.value = true;
  }
  if (inputType === 'email') emailInputs[evKey] = '';
  else phoneInputs[evKey] = '';
};

const removeRecipient = (evKey, listKey, idx) => {
  const key = `${evKey}_${listKey}`;
  if (Array.isArray(notifFormData[key])) {
    notifFormData[key].splice(idx, 1);
    notifHasChanges.value = true;
  }
};

// ─── Init notif form ────────────────────────────────────────────────────────
const initNotifFormData = () => {
  notificationEventsStore.events.forEach((ev) => {
    channelDefs.forEach((ch) => { notifFormData[`${ev.key}_${ch.key}`] = 0; });
    notifFormData[`${ev.key}_email_list`] = [];
    notifFormData[`${ev.key}_phone_list`] = [];
    emailInputs[ev.key] = '';
    phoneInputs[ev.key] = '';
  });
};

// ─── Load notifications ──────────────────────────────────────────────────────
const loadUserNotifications = async (userId) => {
  notificationsLoading.value = true;
  try {
    const response = await apiServices.getUserNotificationEvents(userId);
    const rData = response?.data;
    let data = [];
    if (Array.isArray(rData))            data = rData;
    else if (Array.isArray(rData?.data)) data = rData.data;

    data.forEach((item) => {
      const ev = notificationEventsStore.events.find(
        (e) => e.id === item.event_id || e.id === item.event?.id
      );
      if (!ev) return;

      let ch = item.channel || {};
      if (typeof ch === 'string') { try { ch = JSON.parse(ch); } catch { ch = {}; } }

      channelDefs.forEach((chDef) => {
        const val = ch[`${chDef.key}_alert`];
        notifFormData[`${ev.key}_${chDef.key}`] =
          val === true || val === 1 || val === '1' || val === 'true' ? 1 : 0;
      });

      if (Array.isArray(ch.email) && ch.email.length) {
        notifFormData[`${ev.key}_email_list`] = [...ch.email];
      }
      if (Array.isArray(ch.phone) && ch.phone.length) {
        notifFormData[`${ev.key}_phone_list`] = [...ch.phone];
      }

      if (channelDefs.some((chDef) => notifFormData[`${ev.key}_${chDef.key}`] == 1)) {
        expandedEvents.value = new Set([...expandedEvents.value, ev.id]);
      }
    });

    notifHasChanges.value = false;
  } catch (err) {
    console.error('❌ Failed to load notification events:', err);
  } finally {
    notificationsLoading.value = false;
  }
};

// ─── Save notifications ──────────────────────────────────────────────────────
const saveNotificationPreferences = async () => {
  notifSaving.value = true;
  notifSaveSuccess.value = false;

  try {
    const eventsPayload = [];
    const missingEmail = [];

    notificationEventsStore.events.forEach((ev) => {
      const eventConfig = { event_id: ev.id };
      let hasAnyChannel = false;

      channelDefs.forEach((ch) => {
        if (notifFormData[`${ev.key}_${ch.key}`] == 1) {
          eventConfig[`${ch.key}_alert`] = 1;
          hasAnyChannel = true;
        }
      });

      if (!hasAnyChannel) return;

      if (eventConfig.email_alert === 1) {
        const emails = notifFormData[`${ev.key}_email_list`] || [];
        if (!emails.length) {
          missingEmail.push(locale.value === 'ar' ? ev.ar_name : ev.en_name);
          return;
        }
        eventConfig.email = emails;
      }

      if (eventConfig.sms_alert === 1 || eventConfig.whatsapp_alert === 1) {
        const phones = notifFormData[`${ev.key}_phone_list`] || [];
        if (phones.length) eventConfig.phone = phones;
      }

      eventsPayload.push(eventConfig);
    });

    if (missingEmail.length) {
      alert(`Please add at least one email for: ${missingEmail.join(', ')}`);
      notifSaving.value = false;
      return;
    }

    await apiServices.updateUserNotificationEvents({
      user_id: userProfile.value.id,
      events: eventsPayload,
    });

    notifHasChanges.value = false;
    notifSaveSuccess.value = true;
    setTimeout(() => { notifSaveSuccess.value = false; }, 3000);

  } catch (err) {
    console.error('❌ Failed to save notifications:', err);
    alert(err.message || 'Failed to save notification preferences.');
  } finally {
    notifSaving.value = false;
  }
};

// ─── Profile helpers ─────────────────────────────────────────────────────────
const passwordFields = computed(() => [
  { name: 'current_password', label: t('profile.currentPassword'), type: 'password', required: true, placeholder: t('profile.currentPasswordPlaceholder'), colClass: 'col-12', minlength: 6 },
  { name: 'new_password',     label: t('profile.newPassword'),     type: 'password', required: true, placeholder: t('profile.newPasswordPlaceholder'),     colClass: 'col-12', minlength: 6 },
  { name: 'confirm_password', label: t('profile.confirmPassword'), type: 'password', required: true, placeholder: t('profile.confirmPasswordPlaceholder'), colClass: 'col-12', minlength: 6 },
]);

const validateField = (fieldName) => {
  const value = formData[fieldName];
  fieldErrors.value[fieldName] = '';
  if (['name', 'username', 'phone_number'].includes(fieldName) && (!value || !value.trim())) {
    fieldErrors.value[fieldName] = t('common.validation.requiredField', { field: fieldName });
    return false;
  }
  if (fieldName === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    fieldErrors.value.email = t('common.validation.invalidEmail');
    return false;
  }
  return true;
};

const validateAllFields = () => ['name', 'username', 'email', 'phone_number'].every(f => validateField(f));

const handleFieldInput = (fn) => { if (fieldErrors.value[fn]) fieldErrors.value[fn] = ''; markAsChanged(); };
const markAsChanged    = () => { hasChanges.value = true; };

const fetchDropdownData = async () => {
  try {
    const [rR, rC, rCo] = await Promise.all([
      apiServices.getRegions().catch(() => ({ data: { data: [] } })),
      apiServices.getCurrencies().catch(() => ({ data: { data: [] } })),
      apiServices.getCompanies().catch(() => ({ data: { data: [] } })),
    ]);
    regions.value    = (rR?.data?.data  || []).map(r  => ({ value: String(r.id),  label: r.name }));
    currencies.value = (rC?.data?.data  || []).map(c  => ({ value: String(c.id),  label: c.nameenglish || c.name || c.code || '' }));
    companies.value  = (rCo?.data?.data || []).map(co => ({ value: String(co.id), label: co.name }));
  } catch (e) { console.error(e); }
};

const populateDropdownsFromProfile = () => {
  const u = userProfile.value;
  if (!u) return;
  if (u.company?.id  && !companies.value.find(c  => c.value === String(u.company.id)))  companies.value.push({ value: String(u.company.id),  label: u.company.name  });
  if (u.region?.id   && !regions.value.find(r    => r.value   === String(u.region.id))) regions.value.push({ value: String(u.region.id),    label: u.region.name   });
  if (u.currency?.id && !currencies.value.find(c => c.value  === String(u.currency.id)))currencies.value.push({ value: String(u.currency.id),label: u.currency.name });
};

const initializeFormData = () => {
  if (!userProfile.value) return;
  const u = userProfile.value;
  formData.name         = u.name         || '';
  formData.username     = u.username     || '';
  formData.email        = u.email        || '';
  formData.phone_number = u.phone_number || '';
  formData.company_id   = u.company?.id  ? String(u.company.id)  : '';
  formData.region_id    = u.region?.id   ? String(u.region.id)   : '';
  formData.currency_id  = u.currency?.id ? String(u.currency.id) : '';
  formData.language     = u.language || 'english';
  formData.default_page = u.default_page || u.landing_page || '/user';
  formData.imagePreview = null;
  imageFile.value       = null;
  originalData.value    = { ...formData };
  Object.keys(fieldErrors.value).forEach(k => { fieldErrors.value[k] = ''; });
};

const fetchUserProfile = async () => {
  try {
    isLoading.value = true;
    const userId = authStore.user?.id;
    if (!userId) return;
    const response = await apiServices.getUserProfile(userId);
    userProfile.value = response.data.data;
    
    // Update authStore permissions if provided by the API
    if (userProfile.value.permissions) {
      authStore.permissions = userProfile.value.permissions;
      localStorage.setItem('auth_permissions', JSON.stringify(userProfile.value.permissions));
    }

    populateDropdownsFromProfile();
    initializeFormData();
  } catch (e) {
    console.error('❌ Failed to fetch user profile:', e);
  } finally {
    isLoading.value = false;
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
  imageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => { formData.imagePreview = e.target.result; markAsChanged(); };
  reader.readAsDataURL(file);
};

const triggerFileInput = () => { if (fileInput.value) fileInput.value.click(); };

const handleLanguageChange = () => {
  markAsChanged();
  setLocale(formData.language === 'arabic' ? 'ar' : 'en');
};

const handleSaveChanges = async () => {
  if (!validateAllFields()) return;
  const languageChanged = formData.language !== originalData.value.language;
  try {
    isSaving.value = true;
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('phone_number', formData.phone_number);
    if (formData.email?.trim()) fd.append('email', formData.email);
    if (formData.username !== originalData.value.username) fd.append('username', formData.username);
    if (formData.company_id)  fd.append('company_id',  formData.company_id);
    if (formData.region_id)   fd.append('region_id',   formData.region_id);
    if (formData.currency_id) fd.append('currency_id', formData.currency_id);
    fd.append('language', formData.language);
    if (imageFile.value) fd.append('image', imageFile.value);

    const response = await apiServices.updateUser(userProfile.value.id, fd);
    if (response.data?.data) {
      const userData = response.data.data;
      if (userData.image && !userData.image.startsWith('http')) userData.image = `${API_BASE_URL}${userData.image}`;
      userData.default_page = formData.default_page;
      authStore.updateUser(userData);
      successMessage.value = t('profile.updateSuccess') || 'Profile updated successfully!';
      isSuccessModalOpen.value = true;
      if (languageChanged) { setLocale(formData.language === 'arabic' ? 'ar' : 'en'); setTimeout(() => window.location.reload(), 1500); return; }
      userProfile.value = userData;
      imageFile.value = null; formData.imagePreview = null;
      if (fileInput.value) fileInput.value.value = '';
      initializeFormData();
      hasChanges.value = false;
      setTimeout(() => { window.location.reload(); }, 1500);
    }
  } catch (e) {
    console.error('❌ Failed to update profile:', e);
    successMessage.value = e.response?.data?.message || e.message || t('profile.updateError');
    isSuccessModalOpen.value = true;
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  if (confirm(t('common.confirmCancel'))) { initializeFormData(); hasChanges.value = false; }
};

const openPasswordModal  = () => { passwordFormErrors.value = {}; isPasswordModalOpen.value = true;  };
const closePasswordModal = () => { isPasswordModalOpen.value = false; passwordFormErrors.value = {}; };
const closeSuccessModal  = () => { isSuccessModalOpen.value = false; successMessage.value = '';       };

const handleChangePassword = async (passwordData) => {
  try {
    passwordFormErrors.value = {};
    if (passwordData.new_password !== passwordData.confirm_password) {
      passwordFormErrors.value = { confirm_password: t('profile.passwordMismatch') }; return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#]).{8,}$/.test(passwordData.new_password)) {
      passwordFormErrors.value = { new_password: 'Password must include uppercase, lowercase, a symbol, and be at least 8 characters.' }; return;
    }
    const response = await apiServices.changePassword({
      current_password: passwordData.current_password,
      password: passwordData.new_password,
      password_confirmation: passwordData.confirm_password,
    });
    if (response.data?.message) {
      successMessage.value = t('profile.passwordChangeSuccess');
      isSuccessModalOpen.value = true;
      closePasswordModal();
      setTimeout(() => { authStore.logout(); router.push('/login'); }, 2000);
    }
  } catch (e) {
    const norm = normalizeServerErrors(e);
    if (Object.keys(norm).length) { passwordFormErrors.value = norm; return; }
    successMessage.value = e.message || t('profile.passwordChangeError');
    isSuccessModalOpen.value = true;
  }
};

const getRoleBadgeClass = (role) => ({
  SuperAdmin: 'bg-danger', Admin: 'bg-primary', Employee: 'bg-info',
  Supervisor: 'bg-warning text-dark', Driver: 'bg-success',
}[role] || 'bg-secondary');

// ─── Mount ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  await notificationEventsStore.fetchEvents();
  initNotifFormData();
  await fetchDropdownData();
  await fetchUserProfile();
  if (userProfile.value?.id) {
    await loadUserNotifications(userProfile.value.id);
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 120px;
}

.form-control,
.form-select {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}
.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
}
.form-control.bg-light    { background-color: #f9fafb !important; cursor: not-allowed; }
.form-control.is-invalid,
.form-select.is-invalid   { border-color: #dc3545; }
.invalid-feedback          { color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; }
.badge                     { font-size: 0.875rem; padding: 0.5rem 1rem; border-radius: 0.5rem; }

/* ── Notification events ── */
.notif-events-list { display: flex; flex-direction: column; gap: 0; }

.notif-event-card {
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.notif-event-card--open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
}

.notif-event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  cursor: pointer;
  background: #fafafa;
  user-select: none;
  transition: background 0.15s;
  gap: 8px;
}
.notif-event-header:hover          { background: #f3f4f6; }
.notif-event-card--open .notif-event-header { background: #eff6ff; }

.notif-ev-icon  { color: #6b7280; font-size: 14px; flex-shrink: 0; }
.notif-ev-label { font-size: 13px; font-weight: 600; color: #374151; }

.notif-event-body {
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 14px 16px 18px;
}

.notif-channels-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notif-ch-item {
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
.notif-ch-item:hover               { border-color: #3b82f6; background: #eff6ff; }
.notif-ch-item--active             { background: #3b82f6; border-color: #2563eb; }
.notif-ch-item:active              { transform: scale(0.93); }
.notif-ch-icon                     { font-size: 18px; color: #6b7280; transition: color 0.15s; }
.notif-ch-item--active .notif-ch-icon { color: #fff; }
.notif-ch-label {
  font-size: 10px; font-weight: 600; color: #6b7280;
  text-transform: uppercase; letter-spacing: 0.3px; transition: color 0.15s;
}
.notif-ch-item--active .notif-ch-label { color: rgba(255,255,255,0.9); }

.notif-recipients-block {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
}
.notif-recipients-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}
.tag-remove-btn {
  background: none; border: none;
  color: rgba(255,255,255,0.85);
  cursor: pointer; padding: 0; line-height: 1; font-size: 1rem;
}
.notif-ch-item--locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.notif-ch-item--locked:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}
.tag-remove-btn:hover { color: #fff; }
.tag-remove-btn--dark { color: rgba(0,0,0,0.5); }
.tag-remove-btn--dark:hover { color: #000; }

/* ── Telegram Card ── */
.tg-card {
  background: linear-gradient(135deg, #e3f6fd 0%, #f0fbff 100%);
  border: 1.5px solid #b3e5fc !important;
  border-radius: 16px;
}
.tg-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #0088cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.tg-bot-name {
  font-size: 1rem;
  color: #374151;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: inline-flex;
  align-items: center;
}
.tg-join-btn {
  background: #0088cc;
  color: white;
  border-radius: 999px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0,136,204,0.3);
}
.tg-join-btn:hover {
  background: #006fa6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,136,204,0.4);
}

/* Fixed action bar */
.fixed-action-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>