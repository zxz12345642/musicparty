import { defineStore } from "pinia";
export const useStore=defineStore("state",{
    state:() => ({
        isLoggedIn:false,
        playcontainer:[],
        userid:"",
        ws:""
    }
)})