import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./output.css";
import Toast from "vue-toastification";
// 直接引入主包中的默认样式
import "vue-toastification/dist/index.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(Toast, {
  position: "top-center", // 提示框位置（top-right/top-center/bottom-left 等）
  timeout: 3000, // 自动关闭时间（毫秒）
  closeOnClick: true, // 点击提示框时关闭
  pauseOnHover: true, // 鼠标悬停时暂停计时
  draggable: true, // 允许拖拽提示框
  showCloseButtonOnHover: false, // 鼠标悬停时显示关闭按钮
});
app.mount("#app");
