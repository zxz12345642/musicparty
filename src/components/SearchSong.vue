<template>
  <div>
    <input type="text" v-model="message" />
    <button @click="search">搜索</button>
    <template v-if="searchResult">
      <div v-for="song in songList" :key="song.songmid">
        {{ song.songname }}<button @click="addToPlaylist(song)">点歌</button>
      </div>
    </template>
  </div>
</template>
<script setup>
import axios from "axios";
import { ref } from "vue";
import { musicStore } from "@/store/music";

const searchResult = ref(false);
const message = ref("");
const songList = ref([]);
const mstore = musicStore();
function search() {
  axios
    .get("api/search", {
      params: {
        key: message.value,
        pageSize: 5,
      },
    })
    .then((Response) => {
      songList.value = Response.data.data.list.map((item) => ({
        songname: item.songname,
        songmid: item.songmid,
      }));
      searchResult.value = true;
    })
    .catch(() => {
      console.log("获取失败");
    });
}
function addToPlaylist(song) {
  console.log(song);
  // 检查是否已在播放列表中
  const exists = mstore.playContainer.some(
    (item) => item.songmid === song.songmid
  );
  if (!exists) {
    mstore.playContainer.push(song);
    mstore.sendPlayContainer("添加");
  }
}
</script>
