<template>
  <div>
    <h3>歌曲列表</h3>

    <!-- 歌曲列表和播放列表区域 -->
    <div style="display: flex; gap: 20px; margin-top: 10px">
      <!-- 歌曲列表 -->
      <div style="flex: 3">
        <!-- 表头 -->
        <div style="display: flex; font-weight: bold; margin-bottom: 5px">
          <div style="width: 60px">序号</div>
          <div style="flex: 2">歌曲名称</div>
          <div style="flex: 1">歌曲ID</div>
          <div style="width: 100px">操作</div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading">加载中...</div>

        <!-- 空状态 -->
        <div v-else-if="currentPageSongs.length === 0">没有找到歌曲数据</div>

        <!-- 歌曲列表内容 -->
        <div v-else>
          <div
            style="display: flex; padding: 5px 0; border-bottom: 1px solid #eee"
            v-for="(song, index) in currentPageSongs"
            :key="song.songmid"
          >
            <div style="width: 60px">
              {{ (currentPage - 1) * pageSize + index + 1 }}
            </div>
            <div style="flex: 2">{{ song.songname }}</div>
            <div style="flex: 1">{{ song.songmid }}</div>
            <div style="width: 100px">
              <button @click="addToPlaylist(song)">添加</button>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" style="margin-top: 10px">
          <button @click="changePage(1)" :disabled="currentPage === 1">
            首页
          </button>
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            上一页
          </button>
          <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
          <button
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
          >
            末页
          </button>
        </div>
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
