<template>
    <div v-for="(song, index) in store.playcontainer" :key="song.songmid">
        <p>
            {{ index + 1 }}. {{ song.songname }}
            <span v-if="index === 0 && isLoading">加载中...</span>
            <span v-if="index === 0 && error">加载失败</span>
        </p>
        <button @click="deletesong(song.songmid)">删除</button>
    </div>
</template>
<script setup>
import { useStore } from '@/store/state';
import { onMounted, watch, ref } from 'vue';
import { Howl } from 'howler';
import axios from 'axios';

const store = useStore();
const isLoading = ref(false);
const error = ref(null);
let sound = null;

function deletesong(songmid) {
    const isPlayingSong = store.playcontainer[0]?.songmid === songmid;
    if (isPlayingSong && sound) {
        sound.stop();
        sound.unload();
        sound = null;
    }
    store.playcontainer = store.playcontainer.filter(song => {
        return song.songmid !== songmid;
    });
}

async function handlePlayFirstSong() {
    if (store.playcontainer.length === 0 || isLoading.value) {
        return;
    }

    const firstSongMid = store.playcontainer[0].songmid;
    isLoading.value = true;
    error.value = null; // 改为null更合适
    try {
        const response = await axios.get("api/song/urls", {
            params: {
                "id": firstSongMid
            }
        });
        if (response.data.result == 100 && response.data.data) {
            const audiourl = response.data.data[firstSongMid];
            console.log(audiourl);
            
            // 停止并卸载当前音频
            if (sound) {
                sound.stop();
                sound.unload();
            }
            
            // 创建Howl实例时直接配置事件处理（关键修改）
            sound = new Howl({
                src: [audiourl],
                autoplay: true,
                format: ['m4a'],
                // 将错误事件监听直接配置在这里，而不是用sound.on()
                onerror: (err) => {
                    console.error('播放错误:', err);
                    error.value = true;
                }
            });
        }
    } catch (err) {
        console.error('请求播放链接失败:', err);
        error.value = true;
    } finally {
        isLoading.value = false;
    }
}

watch(
    () => store.playcontainer[0]?.songmid,
    (newMid, oldMid) => {
        if (newMid && newMid !== oldMid) {
            handlePlayFirstSong();
        }
    }
);

onMounted(() => {
    if (store.playcontainer.length > 0) {
        handlePlayFirstSong();
    }
});
</script>
    