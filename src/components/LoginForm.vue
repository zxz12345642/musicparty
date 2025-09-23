<template>
    <div>
        <button @click="connect">登录</button>
        <input type="text" v-model="store.userid">
    </div>
</template>
<script setup>
import { useStore } from '@/store/state';
import { messagestore } from '@/store/message';
import { musicStore } from '@/store/music';
import config from "../assets/config.json";
import axios from 'axios';
import { howlstore } from '@/store/howl';

const { cookie } = config;
const store = useStore();
const mstore = messagestore()
const musicS = musicStore()
const hstore = howlstore()

function connect() {
    if (!store.userid.trim()) {
        alert("请输入账号");
        return;
    }
    const wsUrlChat = `ws://localhost:8081/chat/${store.userid.trim()}`;
    const wsUrlMusic = `ws://localhost:8081/music/${store.userid.trim()}`;
    store.wsChat = new WebSocket(wsUrlChat)
    store.wsMusic = new WebSocket(wsUrlMusic)

    store.wsChat.onopen = () => {
        // 连接成功后设置登录状态为true
        store.isLoggedIn = true;
        mstore.chatlist.push("登录成功！");


        axios.post("/api/user/setcookie", cookie)

        axios.get("/api/user/getcookie", {
            params: {
                id: "3520450550"
            }
        })
    };

    store.wsChat.onmessage = (Event) => {
        const data = JSON.parse(Event.data);
        if (data.type === "user") {
            mstore.onlinepeople = data.message;
        }
        else if (data.type === "userlist") {
            mstore.userlist = data.message ? data.message.split("，") : [];
        }
        else if (data.type === "message") {
            mstore.chatlist.push(data.message);
        }
    }

    store.wsChat.onclose = () => {
        store.isLoggedIn = false;
        mstore.chatlist.push("连接已断开，请重新登录");
        mstore.onlinepeople = "";
    };

    // 监听错误事件
    store.wsChat.onerror = (error) => {
        store.isLoggedIn = false;
        mstore.chatlist.push("连接出错，请重新登录");
        console.error("WebSocket错误:", error);
    };

    store.wsMusic.onmessage = (Event) => {
        const data = JSON.parse(Event.data);
        if (data.type == "") {
            const msg = JSON.parse(data.message);
            musicS.playcontainer = msg.data
        }
        if (data.type == "new") {
            const message = { "action": "refresh", "time": hstore.sound.seek(), "id": data.message }
            store.wsMusic.send(JSON.stringify(message))
        }
        if (data.type == "refresh") {
            hstore.progress = data.time;
            setTimeout(() => {
                if (hstore.sound) {
                    const newTime = Number(data.message);
                    console.log("延迟后执行同步，时间：", newTime);
                    hstore.sound.seek(newTime+1);
                } else {
                    console.log("延迟后sound仍未初始化");
                }
            }, 1000);
        }
    }
}
</script>
