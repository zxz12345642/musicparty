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

      <!-- 消息列表：核心修复——固定高度+溢出滚动 -->
      <div class="relative">
        <!-- 滚动容器：必须固定高度（h-64 或 具体像素）+ overflow-y-auto -->
        <div
          ref="chatContainer"
          class="chat-messages bg-purple-50/50 rounded-2xl p-4 h-64 overflow-y-auto mb-6"
          @scroll="handleScroll"
        >
          <!-- 消息列表：直接渲染，不额外嵌套多余容器 -->
          <div
            v-for="(msg, index) in mstore.chatList"
            :key="index"
            class="mb-3"
          >
            <p
              class="text-purple-700 bg-white px-3 py-2 rounded-xl inline-block max-w-[80%] shadow-sm"
            >
              {{ msg }}
            </p>
          </div>
        </div>

        <!-- 新消息提示 -->
        <button
          v-if="hasNewMessages && !isAtBottom"
          @click="scrollToBottom"
          class="absolute bottom-8 right-4 bg-pink-400 text-white px-3 py-1 rounded-full text-sm shadow-md hover:bg-pink-500 transition-colors"
        >
          新消息 ({{ unreadCount }})
        </button>
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
import { ref, watch, onMounted, nextTick } from "vue";
import { useStore } from "../store/state";
import LoginForm from "./LoginForm.vue";
import { messageStore } from "@/store/message";

const store = useStore();
const mstore = messageStore();
const message = ref("");
const chatContainer = ref(null); // 滚动容器的ref
const isAtBottom = ref(true); // 是否在底部
const hasNewMessages = ref(false); // 是否有未读消息
const unreadCount = ref(0); // 未读消息数
const lastMessageCount = ref(0); // 上一次的消息总数

// 处理滚动事件：判断是否在底部（保留15px误差，避免视觉误判）
function handleScroll() {
  if (!chatContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value;
  isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 15;

  // 滚动到底部时重置提示
  if (isAtBottom.value) {
    hasNewMessages.value = false;
    unreadCount.value = 0;
    lastMessageCount.value = mstore.chatList.length;
  }
}

// 滚动到底部：确保DOM更新后执行
function scrollToBottom() {
  if (!chatContainer.value) return;

  nextTick(() => {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: "smooth", // 平滑滚动（不想要可以删，改为直接赋值scrollTop）
    });
  });
}

// 发送消息函数
function send() {
  if (!store.userid || !message.value.trim()) {
    return;
  }
  store.wsChat.send(message.value);
  message.value = "";
}

// 监听消息列表变化：控制自动滚动/提示
watch(
  () => mstore.chatList.length,
  (newCount) => {
    // 初始加载：直接滚到底
    if (lastMessageCount.value === 0) {
      lastMessageCount.value = newCount;
      scrollToBottom();
      return;
    }

    // 有新消息时
    if (newCount > lastMessageCount.value) {
      if (isAtBottom.value) {
        scrollToBottom(); // 在底部则自动滚
      } else {
        hasNewMessages.value = true; // 不在底部则显示提示
        unreadCount.value = newCount - lastMessageCount.value;
      }
      lastMessageCount.value = newCount;
    }
  }
);

// 初始加载滚到底
onMounted(() => {
  scrollToBottom();
  lastMessageCount.value = mstore.chatList.length;
});
</script>
