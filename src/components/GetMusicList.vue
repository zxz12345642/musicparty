<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-6">
    <!-- 歌单列表区域 -->
    <div
      class="playlist-container bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100 mb-8"
    >
      <h3 class="text-2xl font-bold text-pink-600 mb-6 flex items-center">
        <span class="mr-2 text-purple-500">📋</span>
        歌单列表
        <span class="ml-2 inline-block w-6 h-6 relative">
          <!-- 库洛米风格小恶魔角装饰 -->
          <div
            class="absolute top-0 left-0 w-3 h-5 bg-purple-300 rounded-t-full transform rotate-[-30deg]"
          ></div>
          <div
            class="absolute top-0 right-0 w-3 h-5 bg-purple-300 rounded-t-full transform rotate-[30deg]"
          ></div>
        </span>
      </h3>

      <!-- 歌单列表使用网格布局，调整列数和样式 -->
      <ul class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
        <li v-for="(item, index) in playListData" :key="index">
          <button
            @click="selectPlaylist(item.tid)"
            class="w-full py-3 px-4 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-2xl font-medium hover:from-pink-200 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center justify-start text-left"
          >
            <span
              class="inline-block w-2 h-2 rounded-full bg-pink-400 mr-2"
            ></span>
            <span class="truncate max-w-[80%]">{{ item.diss_name }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- 当前选中歌单的歌曲列表 -->
    <div v-if="selectedTid" class="songlist-container animate-fadeIn">
      <div class="flex items-center mb-4">
        <div class="w-8 h-0.5 bg-pink-300 mr-2"></div>
        <h3 class="text-xl font-bold text-purple-600">当前歌单歌曲</h3>
        <div class="w-8 h-0.5 bg-purple-300 ml-2"></div>
      </div>
      <SongList :tid="selectedTid" />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import SongList from "./SongList.vue";

const playListData = ref([]);
const selectedTid = ref(null);

// 请求歌单数据
const playlist = async () => {
  try {
    const response = await axios.get("api/user/songlist", {
      params: {
        id: "3520450550",
      },
    });
    if (response.data.result === 100) {
      const songList = response.data.data.list;
      playListData.value = songList
        .filter((playlist) => playlist.tid !== 0)
        .map((playlist) => ({
          diss_name: playlist.diss_name, // 歌单名称
          tid: playlist.tid, // 对应的 tid
        }));
    } else {
      console.error("请求失败，错误码：", response.data.result);
    }
  } catch (error) {
    console.error("请求出错：", error);
  }
};

// 选择歌单并滚动到歌曲列表
const selectPlaylist = (tid) => {
  selectedTid.value = tid;
  const songListContainer = document.querySelector(".songlist-container");
  if (songListContainer) {
    songListContainer.scrollIntoView({ behavior: "smooth" });
  }
};

// 组件挂载后执行请求
onMounted(() => {
  playlist();
});
</script>

<style>
/* 简单的淡入动画 */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
