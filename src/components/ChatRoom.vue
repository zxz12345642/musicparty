<template>
    <div>
        <div v-if="!store.isLoggedIn">
            <LoginForm></LoginForm>
        </div>
        <br>
        <button @click="send">发送</button>
        <input type="text" v-model="message">
        <div>在线人数：{{ mstore.onlinepeople }}</div>
        <br>
        <div>
            <p v-for="(msg, index) in mstore.chatlist" :key="index">
                {{ msg }}
            </p>
        </div>
        <hr>
        <div>
            <p>在线用户：</p>
            <p v-for="(user, index) in mstore.userlist" :key="index">
                {{ user }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from '../store/state';
import LoginForm from "./LoginForm.vue";
import { messagestore } from "@/store/message";

    const store=useStore();
    const mstore=messagestore();
    const message=ref("");  //双向绑定发送的消息
    //登录函数
    
    //发送消息函数
    function send(){
        if(store.userid==""){
            return;
        }
        store.wsChat.send(message.value);
        message.value="";
    }   
</script>

<style>
</style>