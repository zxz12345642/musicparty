<template>
  <div class="lyric-container">
    <!-- 播放状态指示 -->
    <div class="play-status">
      {{ hstore.isPlaying ? "正在播放" : "已暂停" }}
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="status-text">加载歌词中...</div>

    <!-- 错误状态 -->
    <div v-if="error" class="status-text error">{{ error }}</div>

    <!-- 歌词显示区域 -->
    <div v-else-if="lyricLines.length > 0" class="lyric-scroll">
      <p
        v-for="(line, index) in lyricLines"
        :key="index"
        :class="{ 'current-line': index === currentLineIndex }"
      >
        {{ line.content }}
      </p>
    </div>

    <!-- 无歌词状态 -->
    <div v-else-if="!isLoading && !error" class="status-text">暂无歌词</div>
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
const lyricLines = ref([]); // 解析后的歌词数组
const currentLineIndex = ref(-1); // 当前歌词索引
const isLoading = ref(false);
const error = ref(null);
let syncTimer = null;

// 解析歌词
function parseLyric(lyricString) {
  const lines = lyricString.split("\n");
  const result = [];
  // 匹配时间标签的正则 [mm:ss.ms]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach((line) => {
    const matches = line.match(timeRegex);
    if (matches) {
      // 转换时间为秒
      const minutes = parseInt(matches[1], 10);
      const seconds = parseInt(matches[2], 10);
      const milliseconds = parseInt(matches[3], 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;

      // 提取歌词内容
      const content = line.replace(timeRegex, "").trim();

      if (content) {
        result.push({ time, content });
      }
    }
  });

  // 按时间排序
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
        // 解析歌词并存储
        lyricLines.value = parseLyric(response.data.data.lyric);
      } else {
        error.value = "未获取到歌词数据";
      }
    })
    .catch((error) => {
      console.error("获取歌词失败:", error);
      this.error = "获取歌词失败，请稍后再试";
    })
    .finally(() => {
      isLoading.value = false;
    });
}

// 同步歌词与播放进度
function syncLyric() {
  if (!hstore.isPlaying || lyricLines.value.length === 0) return;

  const currentTime = hstore.progress; // 当前播放时间（秒）

  // 查找当前应该显示的歌词行
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

// 滚动到当前歌词
function scrollToCurrentLine() {
  const container = document.querySelector(".lyric-scroll");
  const currentLine = container?.querySelector(".current-line");

  if (container && currentLine) {
    // 使当前歌词居中显示
    const scrollPos =
      currentLine.offsetTop -
      container.clientHeight / 2 +
      currentLine.offsetHeight / 2;
    container.scrollTo({
      top: scrollPos,
      behavior: "smooth",
    });
  }
}

// 开始同步歌词
function startSync() {
  // 清除之前的定时器
  if (syncTimer) clearInterval(syncTimer);
  // 每100ms检查一次进度
  syncTimer = setInterval(syncLyric, 100);
}

// 停止同步歌词
function stopSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

// 监听播放状态变化
watch(
  () => hstore.isPlaying,
  (newVal) => {
    if (newVal) {
      getLyric(); // 播放时获取歌词
      startSync(); // 开始同步
    } else {
      stopSync(); // 暂停时停止同步
    }
  }
);

// 监听当前播放歌曲变化
watch(
  () => mstore.playContainer[0]?.songmid,
  () => {
    if (hstore.isPlaying) {
      getLyric(); // 切换歌曲时重新获取歌词
    }
  }
);

// 组件卸载时清理定时器
onUnmounted(() => {
  stopSync();
});
</script>

<style scoped>
.lyric-container {
  width: 100%;
  height: 300px;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.play-status {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.lyric-scroll {
  height: calc(100% - 2rem);
  overflow-y: auto;
  text-align: center;
  padding: 1rem 0;
}

/* 隐藏滚动条但保留功能 */
.lyric-scroll::-webkit-scrollbar {
  display: none;
}

.lyric-scroll p {
  margin: 0.75rem 0;
  color: #555;
  transition: all 0.2s ease;
  font-size: 1rem;
  line-height: 1.5;
}

/* 当前歌词样式 */
.current-line {
  color: #2563eb;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.status-text.error {
  color: #dc2626;
}
</style>
