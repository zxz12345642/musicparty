<template>
  <div>
    <button @click="connect">登录</button>
    <input type="text" v-model="store.userid" />
  </div>
</template>
<script setup>
import { useStore } from "@/store/state";
import { messageStore } from "@/store/message";
import { musicStore } from "@/store/music";
import config from "../assets/config.json";
import axios from "axios";
import { howlStore } from "@/store/howl";

const { cookie } = config;
const store = useStore();
const mstore = messageStore();
const musicS = musicStore();
const hstore = howlStore();

function connect() {
  if (!store.userid.trim()) {
    alert("请输入账号");
    return;
  }
  const wsUrlChat = `ws://localhost:8081/chat/${store.userid.trim()}`;
  const wsUrlMusic = `ws://localhost:8081/music/${store.userid.trim()}`;
  store.wsChat = new WebSocket(wsUrlChat);
  store.wsMusic = new WebSocket(wsUrlMusic);

  store.wsChat.onopen = () => {
    // 连接成功后设置登录状态为true
    store.isLoggedIn = true;
    mstore.chatList.push("登录成功！");

    axios.post("/api/user/setcookie", cookie);

    axios.get("/api/user/getcookie", {
      params: {
        id: "3520450550",
      },
    });
  };

  store.wsChat.onmessage = (Event) => {
    const data = JSON.parse(Event.data);
    if (data.type === "user") {
      mstore.onlinePeople = data.message;
    } else if (data.type === "userlist") {
      mstore.userlist = data.message ? data.message.split("，") : [];
    } else if (data.type === "message") {
      mstore.chatList.push(data.message);
    }
  };

  store.wsChat.onclose = () => {
    store.isLoggedIn = false;
    mstore.chatList.push("连接已断开，请重新登录");
    mstore.onlinePeople = "";
  };

  // 监听错误事件
  store.wsChat.onerror = (error) => {
    store.isLoggedIn = false;
    mstore.chatList.push("连接出错，请重新登录");
    console.error("WebSocket错误:", error);
  };

  store.wsMusic.onmessage = (Event) => {
    const data = JSON.parse(Event.data);
    if (data.type == "") {
      const msg = JSON.parse(data.message);
      musicS.playContainer = msg.data;
    }
    if (data.type == "new") {
      if (!hstore.sound) {
        console.log("123");
        return;
      }
      const message = {
        action: "refresh",
        time: hstore.sound?.seek(),
        id: data.message,
      };
      store.wsMusic.send(JSON.stringify(message));
    }
    if (data.type == "refresh") {
      if (data.time == null) {
        return;
      } else {
        hstore.progress = data.time;
      }
      setTimeout(() => {
        if (hstore.sound) {
          const newTime = Number(data.message);
          console.log("延迟后执行同步，时间：", newTime);
          hstore.sound.seek(newTime + 1);
        } else {
          console.log("延迟后sound仍未初始化");
        }
      }, 1000);
    }
  };
}
</script>
