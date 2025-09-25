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
      <!-- 当前播放歌曲卡片：父容器改为flex-col，实现“信息一行+按钮一行” -->
      <div
        class="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100"
      >
        <!-- 第一行：歌曲信息 + 加载状态（横向排列） -->
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
        <!-- 第二行：播放/暂停 + 删除按钮（单独一行，靠右） -->
        <div class="flex justify-end">
          <button
            @click="togglePlayPause"
            class="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 transition-colors mr-2"
          >
            <span class="mr-1">{{ howl.isPlaying ? "⏸️" : "▶️" }}</span>
            {{ howl.isPlaying ? "暂停" : "播放" }}
          </button>
          <button
            @click="deleteSong(mstore.playContainer[0].songmid)"
            class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors"
          >
            <span class="mr-1">🗑️</span>删除
          </button>
        </div>

        <!-- 歌词组件 -->
        <div class="mt-2">
          <SongLyric />
        </div>
      </div>

      <!-- 其他歌曲列表 -->
      <div class="space-y-2">
        <h4 class="text-purple-500 font-medium mb-2 flex items-center">
          <span class="mr-2 text-pink-300">📋</span>其他歌曲
        </h4>
        <!-- 其他歌曲项：父容器改为flex-col，实现“信息一行+按钮一行” -->
        <div
          v-for="(song, index) in mstore.playContainer.slice(1)"
          :key="song.songmid"
          class="flex flex-col p-3 rounded-xl transition-all hover:bg-pink-50"
        >
          <!-- 第一行：歌曲序号+名称（横向排列） -->
          <div class="flex items-center flex-1 mb-2">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-500"
            >
              {{ index + 2 }}
            </div>
            <div class="text-purple-700 truncate">{{ song.songname }}</div>
          </div>
          <!-- 第二行：删除+置顶按钮（单独一行，靠右） -->
          <div class="flex justify-end space-x-2">
            <button
              @click="deleteSong(song.songmid)"
              class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors opacity-70 hover:opacity-100"
            >
              <span class="mr-1">🗑️</span>删除
            </button>
            <button
              @click="topSong(song.songmid)"
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
import { onMounted, watch, ref } from "vue";
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

// 播放/暂停切换：核心逻辑不变
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

// 删除歌曲：核心逻辑不变
function deleteSong(songmid) {
  const isPlayingSong =
    mstore.playContainer.length > 0 &&
    mstore.playContainer[0].songmid === songmid;
  if (isPlayingSong) {
    howl.pauseMusic();
    howl.sound = null;
  }
  mstore.playContainer = mstore.playContainer.filter(
    (song) => song.songmid !== songmid
  );
  mstore.sendPlayContainer("删除");
}

// 歌曲置顶：核心逻辑不变
function topSong(songmid) {
  const songIndex = mstore.playContainer.findIndex(
    (song) => song.songmid === songmid
  );
  if (songIndex <= 1) return;
  const [pinnedSong] = mstore.playContainer.splice(songIndex, 1);
  mstore.playContainer.splice(1, 0, pinnedSong);
  mstore.sendPlayContainer("置顶");
}

// 播放第一首歌曲：核心逻辑不变
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

// 监听播放状态变化
watch(
  () => howl.isPlaying,
  () => {}
);

// 监听当前播放歌曲变化：切换歌曲时重新加载
watch(
  () => mstore.playContainer[0]?.songmid,
  (newMid, oldMid) => {
    if (newMid && newMid !== oldMid) handlePlayFirstSong();
  }
);

// 组件挂载时：播放第一首歌
onMounted(() => {
  if (mstore.playContainer.length > 0) handlePlayFirstSong();
});
</script>
