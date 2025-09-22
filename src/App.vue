<template>
  <div>
    <PlaySongList></PlaySongList>
    <ChatRoom></ChatRoom>
    <div v-if="store.isLoggedIn">
      <GetMusicList></GetMusicList>
    </div>
  </div>
</template>

<script setup>
import ChatRoom from './components/ChatRoom.vue';
import GetMusicList from './components/GetMusicList.vue';
import PlaySongList from './components/PlaySongList.vue';
import { useStore } from './store/state';

const store=useStore()
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
