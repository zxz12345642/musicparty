<template>
  <div class="search-container">
    <!-- 搜索框区域 -->
    <div class="flex gap-3 mb-6">
      <input
        type="text"
        v-model="message"
        placeholder="搜索歌曲吧～"
        class="flex-1 px-4 py-3 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 text-purple-700 placeholder-pink-300 transition-all"
      />
      <button
        @click="search"
        class="px-6 py-3 bg-gradient-to-r from-pink-300 to-purple-300 text-white rounded-full font-medium hover:from-pink-400 hover:to-purple-400 transform hover:scale-105 transition-all shadow-sm flex items-center"
      >
        <span class="mr-2">🔍</span>搜索
      </button>
    </div>

    <!-- 搜索结果 -->
    <template v-if="searchResult">
      <div
        class="search-results bg-white rounded-2xl p-4 shadow-md border border-purple-100"
      >
        <div
          class="result-header text-purple-600 font-medium mb-3 flex items-center"
        >
          <span class="mr-2 text-pink-400">🎀</span>
          搜索结果
        </div>
        <div class="space-y-2">
          <div
            v-for="song in songList"
            :key="song.songmid"
            class="flex items-center justify-between p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <div class="text-purple-700 flex items-center">
              <span
                class="inline-block w-2 h-2 rounded-full bg-purple-300 mr-2"
              ></span>
              {{ song.songname }}
            </div>
            <button
              @click="addToPlaylist(song)"
              class="px-3 py-1 bg-pink-200 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-300 transform hover:scale-105 transition-all"
            >
              点歌
            </button>
          </div>
        </div>
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
