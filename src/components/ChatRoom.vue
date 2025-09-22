<template>
    <div>
        <div v-if="!store.isLoggedIn">
            <button @click="connect">登录</button>
            <input type="text" v-model="account" placeholder="请输入账号">
        </div>
        <br>
        <button @click="send">发送</button>
        <input type="text" v-model="message">
        <div>在线人数：{{ onlinepeople }}</div>
        <br>
        <div>
            <p v-for="(msg, index) in messagelist" :key="index">
                {{ msg }}
            </p>
        </div>
        <hr>
        <div>
            <p>在线用户：</p>
            <p v-for="(user, index) in userlist" :key="index">
                {{ user }}
            </p>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import config from "../assets/config.json";
const { cookie } = config;
import { ref } from "vue";
import { useStore } from '../store/state';

    const store=useStore();
    const onlinepeople=ref("0"); //记录在线人数
    const messagelist=ref([]);  //记录消息列表
    const userlist=ref([]); //用户列表
    const account=ref("");  //双向绑定账户
    const message=ref("");  //双向绑定发送的消息
    const ws=ref(null); //websocket实例
    //登录函数
    function connect(){
        if(!account.value.trim()){
            alert("请输入账号");
            return;
        }
        var wsurl=`ws://localhost:8081/chat/${account.value.trim()}`;
        ws.value = new WebSocket(wsurl)

        ws.value.onopen = () => {
            // 连接成功后设置登录状态为true
            store.isLoggedIn = true;
            messagelist.value.push("登录成功！");


            axios.post("/api/user/setcookie",cookie)
            .then(response => {
                console.log("请求成功", response.data);
            }).catch(error => {
                console.error("请求失败", error);
            });


            axios.get("/api/user/getcookie",{params:{
                id:"3520450550"
            }}).then(response => {
                console.log("请求成功", response.data);
            }).catch(error => {
                console.error("请求失败", error);
            });
        };

        ws.value.onmessage=(Event)=>{
            const data = JSON.parse(Event.data);
            console.log(data)
            if(data.type==="user"){
                onlinepeople.value=data.message;
            }
            else if (data.type==="userlist") {
                userlist.value = data.message ? data.message.split("，") : [];
            } 
            else if (data.type === "message") {
            messagelist.value.push(data.message);
        }
    }

        ws.value.onclose = () => {
            store.isLoggedIn = false;
            messagelist.value.push("连接已断开，请重新登录");
            onlinepeople.value = "";
        };
        
        // 监听错误事件
        ws.value.onerror = (error) => {
            store.isLoggedIn = false;
            messagelist.value.push("连接出错，请重新登录");
            console.error("WebSocket错误:", error);
        };
    }
    
    //发送消息函数
    function send(){
        if(ws.value==null){
            return;
        }
        ws.value.send(message.value);
        message.value="";
    }   
</script>

<style>
</style>