import { defineStore } from "pinia";
import { ref } from "vue";
import apiServices from "@/services/apiServices.js";

export const useNotificationEventsStore = defineStore("notificationEvents", () => {
  const events = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchEvents = async ({ search = "" } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.getEvents({ search });
      events.value = response.data?.data ?? response.data ?? [];
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to fetch events";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addEvent = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.createEvent(data);
      const created = response.data?.data ?? response.data;
      events.value.push(created);
      return created;
    } catch (err) {
      error.value = err.message || "Failed to create event";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateEvent = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiServices.updateEvent(id, data);
      const updated = response.data?.data ?? response.data;
      const idx = events.value.findIndex((e) => e.id === id);
      if (idx !== -1) events.value[idx] = updated;
      return updated;
    } catch (err) {
      error.value = err.message || "Failed to update event";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteEvent = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await apiServices.deleteEvent(id);
      events.value = events.value.filter((e) => e.id !== id);
    } catch (err) {
      error.value = err.message || "Failed to delete event";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { events, loading, error, fetchEvents, addEvent, updateEvent, deleteEvent };
});
