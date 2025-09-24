<template>
  <div
    class="login-container bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100 max-w-md mx-auto"
  >
    <!-- 标题带装饰 -->
    <h3
      class="text-xl font-bold text-pink-600 mb-6 flex items-center justify-center"
    >
      <span class="mr-2 inline-block w-6 h-6 relative">
        <!-- 美乐蒂蝴蝶结 -->
        <div
          class="absolute top-0 left-1 w-4 h-2 bg-pink-300 rounded-t-full"
        ></div>
        <div
          class="absolute top-1 left-0 w-2 h-4 bg-pink-300 rounded-l-full"
        ></div>
        <div
          class="absolute top-1 right-0 w-2 h-4 bg-pink-300 rounded-r-full"
        ></div>
      </span>
      欢迎回来～
      <span class="ml-2 inline-block w-6 h-6 relative">
        <!-- 库洛米恶魔角 -->
        <div
          class="absolute top-0 left-0 w-3 h-5 bg-purple-300 rounded-t-full transform rotate-[-30deg]"
        ></div>
        <div
          class="absolute top-0 right-0 w-3 h-5 bg-purple-300 rounded-t-full transform rotate-[30deg]"
        ></div>
      </span>
    </h3>

    <div class="flex flex-col gap-4">
      <!-- 用户ID输入框 -->
      <input
        type="text"
        v-model="store.userid"
        placeholder="请输入你的账号呀～"
        class="px-4 py-3 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 text-purple-700 placeholder-pink-300 transition-all"
      />

      <!-- 登录按钮 -->
      <button
        @click="connect"
        class="px-6 py-3 bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full font-medium hover:from-pink-400 hover:to-purple-400 transform hover:scale-105 transition-all shadow-sm flex items-center justify-center mt-2"
      >
        <span class="mr-2">✨</span>登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "@/store/state";
import { messageStore } from "@/store/message";
import { musicStore } from "@/store/music";
import config from "../../public/config.json";
import axios from "axios";
import { howlStore } from "@/store/howl";
import { useToast } from "vue-toastification";

const { cookie } = config;
const store = useStore();
const mstore = messageStore();
const musicS = musicStore();
const hstore = howlStore();
const toast = useToast();

async function connect() {
  if (!store.userid.trim()) {
    // 替换为更可爱的提示方式
    toast.info("请输入账号哦～", {
      // 自定义样式（可选，让提示更可爱）
      style: {
        fontFamily: "Comic Sans MS, Marker Felt, sans-serif",
        backgroundColor: "#ffe6f2", // 浅粉色背景
        color: "#d81f7c", // 粉色文字
        borderRadius: "16px", // 圆角
        boxShadow: "0 4px 12px rgba(216, 31, 124, 0.2)", // 柔和阴影
        padding: "12px 20px",
      },
      icon: "📱", // 自定义图标（可用 emoji）
    });
    return;
  }
  const response = await axios.get("http://localhost:8081/getUserList", {
    params: {
      userID: store.userid,
    },
  });
  if (response.data) {
    // 用户已存在：提示并终止函数
    toast.warning("这个账号已经被使用啦～ 换一个吧～", {
      style: {
        fontFamily: "Comic Sans MS, Marker Felt, sans-serif",
        backgroundColor: "#fff5e6", // 浅橙色背景
        color: "#e67e22", // 橙色文字
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(230, 126, 34, 0.2)",
      },
      icon: "⚠️",
    });
    return; // 这里的 return 会终止整个 connect() 函数
  }

  const wsUrlChat = `ws://localhost:8081/chat/${store.userid.trim()}`;
  const wsUrlMusic = `ws://localhost:8081/music/${store.userid.trim()}`;
  store.wsChat = new WebSocket(wsUrlChat);
  store.wsMusic = new WebSocket(wsUrlMusic);

  store.wsChat.onopen = () => {
    // 连接成功后设置登录状态为true
    store.isLoggedIn = true;
    toast.success("🎉欢迎公主~王子殿下回来!", {
      style: {
        fontFamily: "Comic Sans MS, Marker Felt, sans-serif",
        backgroundColor: "#e6ffe6", // 浅绿色背景
        color: "#27ae60", // 绿色文字
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(39, 174, 96, 0.2)",
      },
    });
    mstore.chatList.push("登录成功啦～ 欢迎回来！");

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
    mstore.chatList.push("连接已断开，请重新登录哦～");
    mstore.onlinePeople = "";
  };

  // 监听错误事件
  store.wsChat.onerror = (error) => {
    store.isLoggedIn = false;
    mstore.chatList.push("连接出错了，请重新登录呀～");
    console.error("WebSocket错误:", error);
  };

  store.wsMusic.onmessage = (Event) => {
    const data = JSON.parse(Event.data);
    console.log(data);
    if (data.type == "") {
      const msg = JSON.parse(data.message);
      musicS.playContainer = msg.data;
    }
    if (data.type == "pause") {
      hstore.pauseMusic();
    }
    if (data.type == "continue") {
      if (hstore.sound) {
        const url = hstore.sound._src;
        // 先跳转到指定进度，再播放
        const progress = parseFloat(data.message) || 0;
        hstore.playMusic(url);
        hstore.sound.seek(progress); // 关键：同步进度
        hstore.isPlaying = true;
      }
    }
    if (data.type == "new") {
      if (!hstore.sound) {
        return;
      }

      const message = {
        action: "refresh",
        time: hstore.sound?.seek(),
        id: data.message,
      };
      console.log(message);
      store.wsMusic.send(JSON.stringify(message));
    }
    if (data.type == "refresh") {
      if (data.message == null) {
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
