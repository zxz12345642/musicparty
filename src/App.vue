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
            class="absolute top-0 left-2 w-4 h-2 bg-pink-300 rounded-t-full"
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

    <!-- 主要内容区 - 新布局 -->
    <div class="max-w-7xl mx-auto">
      <!-- 未登录状态 - 居中显示登录框 -->
      <div v-if="!store.isLoggedIn" class="flex justify-center">
        <div class="w-full max-w-md">
          <ChatRoom />
        </div>
      </div>

      <!-- 登录状态 - 三栏布局：左(聊天+搜索)、中(已点列表)、右(歌单) -->
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

        <!-- 中间：已点列表（固定高度 + 动画装饰） -->
        <div>
          <div
            class="playlist-wrapper bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100 h-[700px] flex flex-col"
          >
            <!-- 标题带装饰 -->
            <h3 class="text-xl font-bold text-pink-600 mb-6 flex items-center">
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

            <!-- 内容区域（占满高度） -->
            <div class="flex-1 overflow-y-auto">
              <!-- 播放列表为空时（带装饰动画） -->
              <div
                v-if="mstore.playContainer.length === 0"
                class="h-full flex flex-col items-center justify-center text-purple-400 relative"
              >
                <span class="mr-2">🥺</span>播放列表还是空的呢，快去添加歌曲吧～

                <!-- 悬浮动画装饰（纯CSS实现，无需额外库） -->
                <div
                  class="absolute inset-0 overflow-hidden pointer-events-none"
                >
                  <div
                    class="absolute top-1/4 left-1/4 w-8 h-8 bg-pink-200 rounded-full opacity-50 animate-float"
                  ></div>
                  <div
                    class="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-200 rounded-full opacity-50 animate-float"
                    style="animation-delay: 0.5s"
                  ></div>
                  <div
                    class="absolute bottom-1/4 left-1/3 w-10 h-10 bg-pink-300 rounded-full opacity-40 animate-float"
                    style="animation-delay: 1s"
                  ></div>
                  <div
                    class="absolute bottom-1/3 right-1/3 w-7 h-7 bg-purple-300 rounded-full opacity-40 animate-float"
                    style="animation-delay: 1.5s"
                  ></div>
                </div>
              </div>

              <!-- 播放列表内容 -->
              <div v-else>
                <!-- 当前播放歌曲 -->
                <div
                  class="mb-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100"
                >
                  <div class="flex items-center justify-between mb-3">
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
                    <div class="text-sm mr-4">
                      <span
                        v-if="isLoading"
                        class="text-purple-400 flex items-center"
                      >
                        <span class="animate-bounce mr-1">💖</span>加载中...
                      </span>
                      <span v-if="error" class="text-red-400 flex items-center">
                        <span class="mr-1">😢</span>加载失败
                      </span>
                    </div>
                    <button
                      @click="deleteSong(mstore.playContainer[0].songmid)"
                      class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors"
                    >
                      <span class="mr-1">🗑️</span>删除
                    </button>
                  </div>
                  <div class="mt-2">
                    <SongLyric />
                  </div>
                </div>

                <!-- 其他歌曲列表 -->
                <div>
                  <h4
                    class="text-purple-500 font-medium mb-2 flex items-center"
                  >
                    <span class="mr-2 text-pink-300">📋</span>其他歌曲
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="(song, index) in mstore.playContainer.slice(1)"
                      :key="song.songmid"
                      class="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-pink-50"
                    >
                      <div class="flex items-center flex-1">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 text-purple-500"
                        >
                          {{ index + 2 }}
                        </div>
                        <div class="text-purple-700 truncate">
                          {{ song.songname }}
                        </div>
                      </div>
                      <button
                        @click="deleteSong(song.songmid)"
                        class="ml-2 px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-sm hover:bg-pink-200 transition-colors opacity-70 hover:opacity-100"
                      >
                        <span class="mr-1">🗑️</span>删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：歌单列表和歌曲列表 -->
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
import ChatRoom from "./components/ChatRoom.vue";
import GetMusicList from "./components/GetMusicList.vue";
import SearchSong from "./components/SearchSong.vue";
import SongLyric from "./components/SongLyric.vue";
import { useStore } from "./store/state";
import { musicStore } from "@/store/music";
import { howlStore } from "@/store/howl";
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const store = useStore();
const mstore = musicStore();
const howl = howlStore();
const isLoading = ref(false);
const error = ref(null);

// 删除歌曲逻辑
function deleteSong(songmid) {
  const isPlayingSong = mstore.playContainer[0]?.songmid === songmid;
  if (isPlayingSong) {
    howl.pauseMusic();
    howl.sound = null;
  }
  mstore.playContainer = mstore.playContainer.filter((song) => {
    return song.songmid !== songmid;
  });
  mstore.sendPlayContainer("删除");
}

// 播放第一首歌曲逻辑
async function handlePlayFirstSong() {
  if (mstore.playContainer.length === 0 || isLoading.value) {
    return;
  }
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
  () => mstore.playContainer[0]?.songmid,
  (newMid, oldMid) => {
    if (newMid && newMid !== oldMid) {
      handlePlayFirstSong();
    }
  }
);

onMounted(() => {
  if (mstore.playContainer.length > 0) {
    handlePlayFirstSong();
  }
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

/* 悬浮动画（纯CSS实现） */
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
