import { defineStore } from "pinia";
export const messageStore = defineStore("messageState", {
  state: () => ({
    chatList: [],
    userList: [],
    onlinePeople: "0",
  }),
});
