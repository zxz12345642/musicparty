import { defineStore } from "pinia";
import { useStore } from "./state";
export const musicStore=defineStore("music",{
    state:() => ({
        playcontainer:[],
        state:""
    }),
    actions:{
        sendplaycontainer(action){
            const store=useStore();
            if(!store.isLoggedIn){
                return;
            }
            const message={"action":action,"data":this.playcontainer}
            store.wsMusic.send(JSON.stringify(message))
        }
    }
})