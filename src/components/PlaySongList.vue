<template>
  <div v-for="(song, index) in mstore.playContainer" :key="song.songmid">
    <p>
      {{ index + 1 }}. {{ song.songname }}
      <template v-if="index == 0">
        <SongLyric></SongLyric>
      </template>
      <span v-if="index === 0 && isLoading">加载中...</span>
      <span v-if="index === 0 && error">加载失败</span>
    </p>
    <button @click="deleteSong(song.songmid)">删除</button>
  </div>
</template>
<script setup>
import { onMounted, watch, ref } from "vue";
import { musicStore } from "@/store/music";
import { howlStore } from "@/store/howl";
import SongLyric from "./SongLyric.vue";
import axios from "axios";

const mstore = musicStore();
const isLoading = ref(false);
const error = ref(null);
const howl = howlStore();

function deleteSong(songmid) {
  const isPlayingSong = mstore.playContainer[0]?.songmid === songmid;
  if (isPlayingSong) {
    howl.pauseMusic(); // 使用store的方法暂停
    howl.sound = null; // 清除实例
  }
  mstore.playContainer = mstore.playContainer.filter((song) => {
    return song.songmid !== songmid;
  });
  mstore.sendPlayContainer("删除");
}

async function handlePlayFirstSong() {
  if (mstore.playContainer.length === 0 || isLoading.value) {
    return;
  }

  const firstSongMid = mstore.playContainer[0].songmid;
  isLoading.value = true;
  error.value = null; // 改为null更合适
  try {
    const response = await axios.get("api/song/urls", {
      params: {
        id: firstSongMid,
      },
    });
    if (response.data.result == 100 && response.data.data) {
      const audioUrl = response.data.data[firstSongMid];
      // 停止并卸载当前音频
      howl.playMusic(audioUrl);
    }
  } catch (err) {
    console.error("请求播放链接失败:", err);
    error.value = true;
  } finally {
    isLoading.value = false;
  }
}

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
