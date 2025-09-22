<template>
    <div>
        <div class="playlist-container">
            <h3>歌单列表（名称）</h3>
            <ul>
                <li v-for="(item, index) in playListData" :key="index">
                    <button @click="selectPlaylist(item.tid)">{{ item.diss_name }}</button>
                </li>
            </ul>
        </div>

         <div v-if="selectedTid" class="songlist-container">
            <h3>当前歌单歌曲</h3>
            <SongList :tid="selectedTid" />
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref ,onMounted} from 'vue';
import SongList from './SongList.vue';

const playListData = ref([]);
const selectedTid=ref(null);

// 2. 封装请求函数（建议放在 onMounted 中，组件挂载后自动请求）
const playlist = async () => {
  try {
    const response = await axios.get("api/user/songlist", {
      params: {
        id: "3520450550"
      }
    });
    if (response.data.result === 100) {
      const songList = response.data.data.list;
      playListData.value = songList.filter(playlist => playlist.tid !== 0)
      .map(playlist => ({
        diss_name: playlist.diss_name, // 歌单名称
        tid: playlist.tid              // 对应的 tid
      }));

    } else {
      console.error("请求失败，错误码：", response.data.result);
    }
  } catch (error) {
    console.error("请求出错：", error);
  }
};


const selectPlaylist=(tid)=>{
    selectedTid.value=tid;
    const songListContainer = document.querySelector('.songlist-container');
    if (songListContainer) {
        songListContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// 5. 组件挂载后执行请求
onMounted(() => {
  playlist();
})

</script>

<style>

</style>