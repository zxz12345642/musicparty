<template>
  <div
    class="song-list-container bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100"
  >
    <!-- 标题带装饰 -->
    <h3 class="text-2xl font-bold text-pink-600 mb-6 flex items-center">
      <span class="mr-2 text-purple-500">🎵</span>
      歌曲列表
      <span class="ml-2 inline-block w-6 h-6 relative">
        <!-- 小蝴蝶结装饰 -->
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
    </h3>

    <!-- 歌曲列表区域 -->
    <div class="flex-3">
      <!-- 表头 -->
      <div
        class="flex font-bold mb-4 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl"
      >
        <div class="w-16 text-pink-600">序号</div>
        <div class="flex-1 text-purple-600">歌曲名称</div>
        <div class="w-24 text-pink-600">操作</div>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-10 text-purple-500"
      >
        <span class="animate-bounce mr-2">💖</span>加载歌曲中～
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="currentPageSongs.length === 0"
        class="flex items-center justify-center py-10 text-purple-400"
      >
        <span class="mr-2">🥺</span>没有找到歌曲数据哦～
      </div>

      <!-- 歌曲列表内容 -->
      <div v-else class="space-y-1">
        <div
          class="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-pink-50 hover:shadow-md"
          v-for="(song, index) in currentPageSongs"
          :key="song.songmid"
          :class="index % 2 === 0 ? 'bg-purple-50/50' : 'bg-white'"
        >
          <div class="w-16 text-center text-pink-500 font-medium">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </div>
          <div class="flex-1 text-purple-700 truncate">
            <span class="inline-block mr-2 text-pink-300">🎶</span>
            {{ song.songname }}
          </div>
          <div class="w-24">
            <button
              @click="addToPlaylist(song)"
              class="px-3 py-1 bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full text-sm font-medium hover:from-pink-400 hover:to-purple-400 transform hover:scale-105 transition-all shadow-sm"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div
        v-if="totalPages > 1"
        class="mt-6 flex justify-center items-center gap-2"
      >
        <button
          @click="changePage(1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
        >
          首页
        </button>
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
        >
          上一页
        </button>
        <span
          class="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm"
        >
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
        >
          下一页
        </button>
        <button
          @click="changePage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, watch, computed, defineProps } from "vue";
import { musicStore } from "@/store/music";

// 接收父组件参数
const props = defineProps({
  tid: {
    type: [String, Number],
    required: true,
  },
});

// 状态管理
const allSongs = ref([]); // 所有歌曲数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示数量
const loading = ref(false); // 加载状态
const mstore = musicStore();

// 当tid变化时重新获取数据
watch(
  () => props.tid,
  (newTid) => {
    if (newTid) {
      currentPage.value = 1; // 重置页码
      getSongList(newTid);
    }
  },
  { immediate: true } // 初始化时立即执行
);

// 获取歌曲列表数据
function getSongList(tid) {
  loading.value = true;
  axios
    .get("api/songlist", {
      params: { id: tid },
    })
    .then((response) => {
      loading.value = false;
      // 提取并处理歌曲数据
      if (response.data?.data?.songlist) {
        allSongs.value = response.data.data.songlist.map((song) => ({
          songname: song.songname,
          songmid: song.songmid,
        }));
      } else {
        allSongs.value = [];
      }
    })
    .catch((error) => {
      loading.value = false;
      console.error("获取歌曲列表失败:", error);
      allSongs.value = [];
    });
}

// 计算当前页显示的歌曲
const currentPageSongs = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return allSongs.value.slice(startIndex, endIndex);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(allSongs.value.length / pageSize.value);
});

// 切换页码
function changePage(page) {
  // 边界检查
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;

  // 滚动到列表顶部
  const container = document.querySelector(".song-list-container");
  if (container) container.scrollTop = 0;
}

// 添加到播放列表
function addToPlaylist(song) {
  if (mstore.playContainer.length == 0) {
    mstore.state = 1;
  }
  mstore.playContainer.push(song);
  mstore.sendPlayContainer("添加");
}
</script>
