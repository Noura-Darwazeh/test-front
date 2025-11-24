// src/stores/user.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  // بيانات المستخدم الحالي
  const id = ref(1);
  const name = ref("noura");
  const role = ref("Driver"); // أو "Admin" أو "User" حسب تسجيل الدخول

  return { id, name, role };
});
