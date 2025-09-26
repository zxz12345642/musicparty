<template>
  <div
    class="playlist-wrapper bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100 overflow-hidden"
  >
    <!-- 标题区域 -->
    <h3 class="text-xl font-bold text-pink-600 mb-6 mt-3 flex justify-end">
      <span class="mr-2 text-purple-500">🎶</span>
      当前播放列表
      <span class="ml-2 inline-block w-5 h-5 relative">
        <div
          class="absolute top-0 left-1 w-3 h-2 bg-pink-300 rounded-t-full"
        ></div>
        <div
          class="absolute top-1 left-0 w-2 h-3 bg-pink-300 rounded-l-full"
        ></div>
        <div
          class="absolute top-1 right-0 w-2 h-3 bg-pink-300 rounded-r-full"
        ></div>
      </span>
    </h3>

    <!-- 空列表提示 -->
    <div
      v-if="mstore.playContainer.length === 0"
      class="text-center py-6 text-purple-400"
    >
      <span class="mr-2">🥺</span>播放列表还是空的呢，快去添加歌曲吧～
    </div>

    <div v-else>
      <!-- 当前播放歌曲卡片 -->
      <div
        class="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100"
      >
        <!-- 第一行：歌曲信息 + 加载状态 -->
        <div class="flex items-center justify-between mb-2">
          <!-- 歌曲序号+名称 -->
          <div class="flex items-center flex-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-pink-200 text-pink-600"
            >
              1
            </div>
            <div class="text-purple-700 font-medium truncate">
              {{ mstore.playContainer[0].songname }}
            </div>
          </div>
          <!-- 加载/错误状态 -->
          <div class="text-sm mr-4">
            <span v-if="isLoading" class="text-purple-400 flex items-center">
              <span class="animate-bounce mr-1">💖</span>加载中...
            </span>
            <span v-if="error" class="text-red-400 flex items-center">
              <span class="mr-1">😢</span>加载失败
            </span>
          </div>
        </div>
        <!-- 第二行：播放/暂停 + 删除按钮 -->
        <div class="flex justify-end">
          <button
            @click="togglePlayPause"
            class="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 transition-colors mr-2"
          >
            <span class="mr-1">{{ howl.isPlaying ? "⏸️" : "▶️" }}</span>
            {{ howl.isPlaying ? "暂停" : "播放" }}
          </button>
          <button
            @click="deleteSong(0)"
            class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors"
          >
            <span class="mr-1">🗑️</span>删除
          </button>
          <button
            @click="randomSong"
            class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors"
          >
            <span class="mr-1">🔀</span>打乱
          </button>
        </div>

        <!-- 歌词组件 -->
        <div class="mt-2">
          <SongLyric />
        </div>
      </div>

      <!-- 其他歌曲列表 -->
      <div class="space-y-2">
        <div class="flex justify-between items-center mb-2">
          <h4 class="text-purple-500 font-medium flex items-center">
            <span class="mr-2 text-pink-300">📋</span>其他歌曲
            <span class="ml-2 text-sm text-pink-400">
              (共 {{ otherSongs.length }} 首)
            </span>
          </h4>

          <!-- 分页控制器 -->
          <div v-if="totalPages > 1" class="flex items-center space-x-1">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-2 py-1 rounded text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50"
            >
              首页
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-2 py-1 rounded text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50"
            >
              上一页
            </button>
            <span class="text-xs text-purple-500">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 rounded text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50"
            >
              下一页
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 rounded text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50"
            >
              末页
            </button>
          </div>
        </div>

        <!-- 分页显示的歌曲 -->
        <div
          v-for="(song, index) in paginatedSongs"
          :key="song.songmid"
          class="flex flex-col p-3 rounded-xl transition-all hover:bg-pink-50"
        >
          <!-- 第一行：歌曲序号+名称 -->
          <div class="flex items-center flex-1 mb-2">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-500"
            >
              {{ getSongIndex(index) }}
            </div>
            <div class="text-purple-700 truncate">{{ song.songname }}</div>
          </div>
          <!-- 第二行：删除+置顶按钮 -->
          <div class="flex justify-end space-x-2">
            <button
              @click="deleteSong(getOriginalIndex(index))"
              class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors opacity-70 hover:opacity-100"
            >
              <span class="mr-1">🗑️</span>删除
            </button>
            <button
              @click="topSong(getOriginalIndex(index) - 1)"
              class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors opacity-70 hover:opacity-100"
            >
              <span class="mr-1">🔝</span>置顶
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from "vue";
import { musicStore } from "@/store/music";
import { howlStore } from "@/store/howl";
import { useStore } from "@/store/state";
import SongLyric from "./SongLyric.vue";
import axios from "axios";

// 状态管理实例
const mstore = musicStore();
const howl = howlStore();
const store = useStore();

// 加载/错误状态
const isLoading = ref(false);
const error = ref(null);

// 分页相关状态
const pageSize = ref(5); // 每页显示8首歌
const currentPage = ref(1); // 当前页码

// 计算其他歌曲列表（排除第一首正在播放的）
const otherSongs = computed(() => {
  return mstore.playContainer.slice(1);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(otherSongs.value.length / pageSize.value);
});

// 计算当前页显示的歌曲
const paginatedSongs = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return otherSongs.value.slice(startIndex, endIndex);
});

// 获取歌曲在原始列表中的序号（显示用）
const getSongIndex = (indexInPage) => {
  return (currentPage.value - 1) * pageSize.value + indexInPage + 2;
};

// 获取歌曲在原始列表中的索引（操作用）
const getOriginalIndex = (indexInPage) => {
  return (currentPage.value - 1) * pageSize.value + indexInPage + 1;
};

// 播放/暂停切换
const togglePlayPause = () => {
  if (howl.isPlaying) {
    howl.pauseMusic();
    mstore.sendPlayContainer("pause");
  } else {
    const message = { action: "continue", data: howl.sound.seek() || 0 };
    store.wsMusic.send(JSON.stringify(message));
    if (howl.sound) {
      howl.sound.play();
      howl.isPlaying = true;
      howl.updateProgress();
    } else if (mstore.playContainer.length > 0) {
      handlePlayFirstSong();
    }
  }
};

// 删除歌曲
function deleteSong(index) {
  const isPlayingSong = mstore.playContainer.length > 0 && index === 0;
  if (isPlayingSong) {
    howl.pauseMusic();
    howl.sound = null;
    mstore.state = 1;
    mstore.playContainer.splice(index, 1);
    mstore.sendPlayContainer("删除");
  } else {
    mstore.playContainer.splice(index, 1);
    mstore.sendPlayContainer("删除");

    // 处理删除后分页可能出现的问题
    if (paginatedSongs.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  }
}

// 歌曲置顶
function topSong(index) {
  if (index <= 0) return;
  const [pinnedSong] = mstore.playContainer.splice(index + 1, 1);
  mstore.playContainer.splice(1, 0, pinnedSong);
  mstore.sendPlayContainer("置顶");
}

// 打乱歌曲顺序
function randomSong() {
  for (let i = 1; i < mstore.playContainer.length; i++) {
    const randomIndex =
      Math.floor(Math.random() * (mstore.playContainer.length - i)) + i;
    [mstore.playContainer[i], mstore.playContainer[randomIndex]] = [
      mstore.playContainer[randomIndex],
      mstore.playContainer[i],
    ];
  }
  mstore.sendPlayContainer("打乱");
  // 打乱后重置到第一页
  currentPage.value = 1;
}

// 播放第一首歌曲
async function handlePlayFirstSong() {
  if (mstore.playContainer.length === 0 || isLoading.value) return;
  const firstSongMid = mstore.playContainer[0].songmid;
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get("api/song/urls", {
      params: { id: firstSongMid },
    });
    if (response.data.result == 100 && response.data.data) {
      const audioUrl = response.data.data[firstSongMid];
      howl.playMusic(audioUrl);
    }
  } catch (err) {
    console.error("请求播放链接失败:", err);
    error.value = true;
  } finally {
    isLoading.value = false;
  }
}

// 监听播放列表变化
watch(
  () => mstore.playContainer,
  () => {
    if (mstore.state == 1) {
      handlePlayFirstSong();
      mstore.state = 0;
    }

    // 当列表变化时，如果当前页超出总页数，自动调整到最后一页
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    }
  }
);

// 组件挂载时
onMounted(() => {
  const stopWatch = watch(
    () => mstore.playContainer[0],
    () => {
      handlePlayFirstSong();
      mstore.state = 0;
      stopWatch();
    }
  );
});
</script>
