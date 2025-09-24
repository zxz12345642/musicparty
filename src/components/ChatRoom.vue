<template>
  <div
    class="chat-container bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100"
  >
    <!-- 未登录时显示登录表单 -->
    <div v-if="!store.isLoggedIn" class="mb-6">
      <LoginForm />
    </div>

    <!-- 聊天区域（登录后显示） -->
    <div v-if="store.isLoggedIn">
      <!-- 发送消息区域 -->
      <div class="flex gap-3 mb-6">
        <input
          type="text"
          v-model="message"
          placeholder="输入消息发送吧～"
          class="flex-1 px-4 py-3 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 text-purple-700 placeholder-pink-300 transition-all"
          @keyup.enter="send"
        />
        <button
          @click="send"
          class="px-6 py-3 bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full font-medium hover:from-pink-400 hover:to-purple-400 transform hover:scale-105 transition-all shadow-sm flex items-center"
        >
          <span class="mr-2">💌</span>发送
        </button>
      </div>

      <!-- 在线人数 -->
      <div class="mb-4 text-purple-600 flex items-center">
        <span class="mr-2 text-pink-400 animate-pulse">●</span>
        在线人数：{{ mstore.onlinePeople }}
      </div>

      <!-- 消息列表 -->
      <div
        class="chat-messages bg-purple-50/50 rounded-2xl p-4 h-64 overflow-y-auto mb-6"
      >
        <div v-for="(msg, index) in mstore.chatList" :key="index" class="mb-3">
          <p
            class="text-purple-700 bg-white px-3 py-2 rounded-xl inline-block max-w-[80%] shadow-sm"
          >
            {{ msg }}
          </p>
        </div>
      </div>

      <hr class="border-pink-100 my-4" />

      <!-- 在线用户列表 -->
      <div>
        <p class="text-pink-600 font-medium mb-3 flex items-center">
          <span class="mr-2 text-purple-400">👥</span>
          在线用户：
        </p>
        <div class="flex flex-wrap gap-2">
          <p
            v-for="(user, index) in mstore.userlist"
            :key="index"
            class="bg-pink-50 text-purple-600 px-3 py-1 rounded-full text-sm"
          >
            {{ user }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "../store/state";
import LoginForm from "./LoginForm.vue";
import { messageStore } from "@/store/message";

const store = useStore();
const mstore = messageStore();
const message = ref(""); // 双向绑定发送的消息

// 发送消息函数
function send() {
  if (!store.userid || !message.value.trim()) {
    return;
  }
  store.wsChat.send(message.value);
  message.value = "";
}
</script>
