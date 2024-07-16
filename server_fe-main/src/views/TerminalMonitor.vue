<template>
    <div id="terminal">
      <div v-for="(line, index) in lines" :key="index">{{ line }}</div>
    </div>
  </template>
  
  <script>
  import { io } from "socket.io-client";
  
  export default {
    data() {
      return {
        socket: null,
        lines: []
      };
    },
    mounted() {
      // 创建 WebSocket 连接
      this.socket = io();
  
      // 监听 'terminal_output' 事件，并更新终端输出
      this.socket.on('terminal_output', (msg) => {
        this.lines.push(msg.data);
        this.$nextTick(() => {
          const terminal = this.$el;
          terminal.scrollTop = terminal.scrollHeight; // 自动滚动到底部
        });
      });
    },
    beforeUnmount() {
      // 组件销毁前断开 WebSocket 连接
      if (this.socket) {
        this.socket.disconnect();
      }
    }
  };
  </script>
  
  <style scoped>
  #terminal {
    width: 80%;
    height: 80%;
    background: black;
    color: green;
    padding: 10px;
    overflow-y: scroll;
  }
  </style>
  