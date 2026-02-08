import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const id = ref(1);
  const name = ref("noura");
  const role = ref("Driver"); 

  return { id, name, role };
});
