import { defineStore } from "pinia";
import { useStore } from "./state";
export const musicStore = defineStore("music", {
  state: () => ({
    playContainer: [],
    state: "",
    nextState: 0,
  }),
  actions: {
    sendPlayContainer(action) {
      const store = useStore();
      if (!store.isLoggedIn) {
        return;
      }
      const message = { action: action, data: this.playContainer };
      store.wsMusic.send(JSON.stringify(message));
    },
    nextSong() {
      if (this.playContainer.length === 0) {
        console.log("播放列表为空，没有歌曲可切");
        return;
      }
      if (this.playContainer.length === 1) {
        console.log("已到最后一首，没有下一首");
        return;
      }
      this.state = 1;
      this.playContainer = this.playContainer.slice(1);
      this.sendPlayContainer("下一首");
    },
  },
});
