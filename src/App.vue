<template>
  <div
    class="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8"
  >
    <!-- 应用标题 -->
    <div class="text-center mb-10">
      <h1
        class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"
      >
        音乐聊天室
      </h1>
      <div class="mt-2 flex justify-center items-center gap-2">
        <!-- 美乐蒂装饰 -->
        <div class="w-8 h-8 relative">
          <div
            class="absolute top-0 left-2 w-3 h-2 bg-pink-300 rounded-t-full"
          ></div>
          <div
            class="absolute top-1 left-0 w-2 h-5 bg-pink-300 rounded-l-full"
          ></div>
          <div
            class="absolute top-1 right-0 w-2 h-5 bg-pink-300 rounded-r-full"
          ></div>
        </div>
        <p class="text-purple-500">一起听歌聊天吧～</p>
        <!-- 库洛米装饰 -->
        <div class="w-8 h-8 flex justify-center gap-1">
          <div
            class="w-2 h-5 bg-purple-300 rounded-t-full transform rotate-[-30deg]"
          ></div>
          <div
            class="w-2 h-5 bg-purple-300 rounded-t-full transform rotate-[30deg]"
          ></div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="max-w-7xl mx-auto">
      <!-- 未登录状态 -->
      <div v-if="!store.isLoggedIn" class="flex justify-center">
        <div class="w-full max-w-md">
          <ChatRoom />
        </div>
      </div>

      <!-- 登录状态 - 三栏布局 -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：聊天 + 搜索 -->
        <div class="space-y-6">
          <ChatRoom />
          <div
            class="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100"
          >
            <SearchSong />
          </div>
        </div>

        <!-- 中间：播放列表组件（通过组件引入） -->
        <div>
          <PlaySongList />
        </div>

        <!-- 右侧：歌单列表 -->
        <div>
          <GetMusicList />
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="mt-12 text-center text-pink-300 text-sm">
      <p>💖 美乐蒂与库洛米的音乐小天地 💜</p>
    </div>
  </div>
</template>

<script setup>
// 引入所有需要的组件
import ChatRoom from "./components/ChatRoom.vue";
import GetMusicList from "./components/GetMusicList.vue";
import SearchSong from "./components/SearchSong.vue";
import PlaySongList from "./components/PlaySongList.vue";
import { useStore } from "./store/state";
import { onMounted } from "vue";

// 仅保留App.vue必要的状态管理
const store = useStore();

// App.vue自身的挂载逻辑（如果有）
onMounted(() => {
  console.log("App组件挂载完成");
});
</script>

<style>
#app {
  font-family: "Comic Sans MS", "Marker Felt", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #6b21a8;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #f472b6;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background-color: #f3e8ff;
  border-radius: 4px;
}

/* 悬浮动画 */
@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(10deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
