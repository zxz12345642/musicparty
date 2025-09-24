<template>
  <div
    class="lyric-container relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-pink-50 to-purple-50 shadow-[0_4px_20px_rgba(236,72,153,0.1)] border-2 border-pink-100"
    style="height: 320px"
  >
    <!-- 美乐蒂风格蝴蝶结装饰（左上角） -->
    <div class="absolute -top-5 -left-5 w-12 h-12">
      <div
        class="absolute top-0 left-4 w-6 h-3 bg-pink-300 rounded-t-full"
      ></div>
      <div
        class="absolute top-2 left-0 w-4 h-8 bg-pink-300 rounded-l-full"
      ></div>
      <div
        class="absolute top-2 right-0 w-4 h-8 bg-pink-300 rounded-r-full"
      ></div>
    </div>

    <!-- 库洛米风格恶魔角装饰（右上角） -->
    <div class="absolute -top-3 -right-3 w-10 h-10 flex gap-1">
      <div
        class="w-3 h-6 bg-purple-300 rounded-t-full transform rotate-[-30deg]"
      ></div>
      <div
        class="w-3 h-6 bg-purple-300 rounded-t-full transform rotate-[30deg]"
      ></div>
    </div>

    <!-- 播放状态（呼吸动画） -->
    <div
      class="play-status text-center mb-4 text-pink-600 font-medium text-sm animate-pulse"
    >
      {{ hstore.isPlaying ? "正在播放～" : "已暂停啦～" }}
    </div>

    <!-- 加载状态（跳动爱心） -->
    <div v-if="isLoading" class="status-text text-purple-500 h-[220px]">
      <span class="animate-bounce inline-block mr-2">💖</span>加载歌词中～
    </div>

    <!-- 错误状态（委屈表情） -->
    <div v-if="error" class="status-text text-red-400 h-[220px]">
      <span class="mr-2">😣</span>{{ error }}
    </div>

    <!-- 歌词显示区域（带渐变遮罩和有限显示） -->
    <div
      v-else-if="lyricLines.length > 0"
      class="lyric-scroll relative h-[220px] overflow-y-auto pr-2 text-center"
    >
      <!-- 顶部渐变遮罩 -->
      <div
        class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-pink-50/80 to-transparent pointer-events-none z-10"
      ></div>

      <!-- 歌词内容 -->
      <div class="pt-16 pb-16">
        <p
          v-for="(line, index) in lyricLines"
          :key="index"
          :class="[
            'my-3 transition-all duration-500 text-base leading-relaxed',
            // 根据与当前行的距离设置不同样式
            index === currentLineIndex
              ? 'text-pink-500 font-bold text-lg scale-105 shadow-sm drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]'
              : index > currentLineIndex - 3 && index < currentLineIndex + 3
              ? 'text-purple-700 opacity-90'
              : 'text-purple-400 opacity-30',
          ]"
          :style="{
            // 距离当前行越远透明度越低
            opacity: calculateOpacity(index),
          }"
        >
          {{ line.content }}
        </p>
      </div>

      <!-- 底部渐变遮罩 -->
      <div
        class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-pink-50/80 to-transparent pointer-events-none z-10"
      ></div>
    </div>

    <!-- 无歌词状态（可爱表情） -->
    <div
      v-else-if="!isLoading && !error"
      class="status-text text-purple-400 h-[220px]"
    >
      <span class="mr-2">🥺</span>暂无歌词哦～
    </div>
  </div>
</template>

<script setup>
import { howlStore } from "@/store/howl";
import { musicStore } from "@/store/music";
import axios from "axios";
import { watch, ref, onUnmounted } from "vue";

// 获取store实例
const hstore = howlStore();
const mstore = musicStore();

// 组件状态
const lyricLines = ref([]);
const currentLineIndex = ref(-1);
const isLoading = ref(false);
const error = ref(null);
let syncTimer = null;

// 计算歌词行的透明度 - 距离当前行越远越透明
const calculateOpacity = (index) => {
  if (lyricLines.value.length === 0) return 0;

  const distance = Math.abs(index - currentLineIndex.value);
  // 只显示当前行前后各3行，之外的行透明度极低
  if (distance > 3) return 0.1;

  // 距离当前行越近透明度越高
  return 1 - distance * 0.2;
};

// 解析歌词
function parseLyric(lyricString) {
  const lines = lyricString.split("\n");
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach((line) => {
    const matches = line.match(timeRegex);
    if (matches) {
      const minutes = parseInt(matches[1], 10);
      const seconds = parseInt(matches[2], 10);
      const milliseconds = parseInt(matches[3], 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const content = line.replace(timeRegex, "").trim();

      if (content) {
        result.push({ time, content });
      }
    }
  });

  return result.sort((a, b) => a.time - b.time);
}

// 获取歌词
function getLyric() {
  const songmid = mstore.playContainer[0]?.songmid;
  if (!songmid) {
    error.value = "没有找到歌曲ID";
    return;
  }

  isLoading.value = true;
  error.value = null;
  lyricLines.value = [];

  axios
    .get("api/lyric", {
      params: { songmid: songmid },
    })
    .then((response) => {
      if (response.data.result === 100 && response.data.data?.lyric) {
        hstore.lyric = response.data;
        lyricLines.value = parseLyric(response.data.data.lyric);
      } else {
        error.value = "未获取到歌词数据";
      }
    })
    .catch((err) => {
      console.error("获取歌词失败:", err);
      error.value = "获取歌词失败，请稍后再试";
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// 同步歌词与播放进度
function syncLyric() {
  if (!hstore.isPlaying || lyricLines.value.length === 0) return;

  const currentTime = hstore.progress;
  for (let i = 0; i < lyricLines.value.length; i++) {
    const isLastLine = i === lyricLines.value.length - 1;
    const nextTime = isLastLine ? Infinity : lyricLines.value[i + 1].time;

    if (currentTime >= lyricLines.value[i].time && currentTime < nextTime) {
      if (currentLineIndex.value !== i) {
        currentLineIndex.value = i;
        scrollToCurrentLine();
      }
      break;
    }
  }
}

// 滚动到当前歌词（平滑滚动）
function scrollToCurrentLine() {
  const container = document.querySelector(".lyric-scroll");
  const currentLine = container?.querySelector(".scale-105");

  if (container && currentLine) {
    // 计算滚动位置，使当前行居中
    const scrollPos =
      currentLine.offsetTop -
      container.clientHeight / 2 +
      currentLine.offsetHeight / 2 -
      32; // 调整偏移量适配遮罩

    // 平滑滚动
    container.scrollTo({
      top: scrollPos,
      behavior: "smooth",
    });
  }
}

// 开始/停止同步
function startSync() {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = setInterval(syncLyric, 100);
}
function stopSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

// 监听播放状态和歌曲变化
watch(
  () => hstore.isPlaying,
  (newVal) => {
    newVal ? (getLyric(), startSync()) : stopSync();
  }
);
watch(
  () => mstore.playContainer[0]?.songmid,
  () => {
    hstore.isPlaying && getLyric();
  }
);

// 组件卸载清理
onUnmounted(() => {
  stopSync();
});
</script>

<style scoped>
/* 自定义滚动条样式 */
.lyric-scroll::-webkit-scrollbar {
  width: 6px;
}
.lyric-scroll::-webkit-scrollbar-thumb {
  background-color: #f472b6; /* 粉色滚动条（美乐蒂色） */
  border-radius: 3px;
}
.lyric-scroll::-webkit-scrollbar-track {
  background-color: #f3e8ff; /* 淡紫色轨道（库洛米色） */
  border-radius: 3px;
}

/* 歌词容器样式 */
.status-text {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
