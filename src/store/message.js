import { defineStore } from "pinia";
export const messagestore=defineStore("messageState",{
    state:() => ({
        chatlist:[],
        userlist:[],
        onlinepeople:"0"
    }
)})