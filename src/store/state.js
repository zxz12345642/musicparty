import { defineStore } from "pinia";
export const useStore = defineStore("state", {
  state: () => ({
    isLoggedIn: false,
    userid: "",
    wsChat: "",
    wsMusic: "",
  }),
});
