import { defineStore } from "pinia";
import { Howl } from "howler";
import { musicStore } from "./music";
export const howlStore = defineStore("howl", {
  state: () => ({
    isPlaying: false,
    progress: 0,
    duration: 0,
    sound: null,
    lyric: "",
  }),
  actions: {
    getHowlInstance(options) {
      if (this.sound) {
        this.sound.unload();
      }
      // 创建新实例
      this.sound = new Howl(options);
      return this.sound;
    },
    // 播放音乐
    playMusic(url) {
      // 使用统一方法创建实例
      this.isPlaying = false;
      this.getHowlInstance({
        src: [url],
        html5: true,
        onplay: () => {
          this.isPlaying = true;
          this.duration = this.sound.duration();
          this.updateProgress();
        },
        onpause: () => {
          this.isPlaying = false;
        },
        onend: () => {
          const mstore = musicStore();
          mstore.nextSong();
          this.isPlaying = false;
          this.progress = 0;
        },
      });
      this.sound.play();
    },
    // 其他方法（暂停、更新进度等）
    pauseMusic() {
      if (this.sound) {
        this.sound.pause();
      }
    },
    updateProgress() {
      if (this.sound && this.isPlaying) {
        this.progress = this.sound.seek() || 0;
        requestAnimationFrame(() => this.updateProgress());
      }
    },
  },
});
