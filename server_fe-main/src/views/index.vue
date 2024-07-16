<template>
  <!-- eslint-disable -->
  <div class="main-container">
    <div class="header">
      <div class="avatar"><div class="tju"></div></div>
      <span class="cloud-edge">云边协同大模型多模态生成系统</span>
    </div>
    <div class="flex-row-f">
      <div class="two-columns">
        <div class="input">
          <span class="user-input">用户输入</span>
          <textarea class="field" v-model="textarea" placeholder="请输入您的需求或上传文件"></textarea>
          <!-- <el-input
              class="field"
              style="height: auto; width: auto;"
              v-model="textarea"
              type="textarea"
              placeholder="请输入您的需求或上传文件 input"
          /> -->
        </div>
        <div class="frame">
          <button class="submit-button" @click="handleTextSubmit"><span class="submit">提交</span></button>
          <button class="button" @click="triggerFileSelect">
            <span class="select-file">选择文件</span>
          </button>
          <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
          <!-- <span class="user-input">{{ uploadStatus }}</span> -->
        </div>
        <div class="output">
          <span class="output-text">输出</span>
          <div class="field-1"><div class="output-content">{{output_content}}</div></div>
        </div>
      </div>
      <div class="server">
        <div class="flex-row-dc">
          <div class="server-div"></div>
          <div class="server-div-2"></div>
          <div class="server-div-3"></div> 
          <div class="server-div-4"></div>
        </div>
        <div class="flex-row-c">
          <!-- <div class="arrow-div"></div> -->
          <div v-if="arrows.arrow_to_server_2" class="arrow-2"></div>
          <div v-if="arrows.arrow_to_server_1" class="arrow-3"></div>
          <div v-if="arrows.arrow_to_server_4" class="arrow-4"></div>
          <div v-if="arrows.arrow_to_server_3" class="arrow-5"></div>
          <span class="server-span">服务器1</span>
          <span class="server-2">服务器2</span>
          <span class="server-3">服务器3</span>
          <span class="server-4">服务器4</span>
          <div class="server-5"></div>
        </div>
        <span class="main-server">主服务器</span>
      </div>
    </div>
  </div>
</template>

<script>
// import { ref } from 'vue';
import { ref, onMounted, onUnmounted } from 'vue';
// import io from 'socket.io-client';

export default {
  name: 'HomePage',
  setup() {
    const textarea = ref('');
    const uploadStatus = ref('');
    const output_content = ref(uploadStatus);
    const fileInput = ref(null);
    const arrows = ref({
      arrow_to_server_1: true,
      arrow_to_server_2: true,
      arrow_to_server_3: true,
      arrow_to_server_4: true,
    });

    let socket;
    

    //
    const triggerFileSelect = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const handleTextSubmit = async () => {
      const formData = new FormData();

      // 将文本内容保存为 Blob 并添加到 FormData
      const textBlob = new Blob([textarea.value], { type: 'text/plain' });
      formData.append('file', textBlob, 'input.txt');

      alert(textarea.value);
      // console.


      try {
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          alert('文件上传成功');
          // document.getElementById('uploadStatus').innerText = 'input.txt 已上传';
          uploadStatus.value = 'input.txt 已上传'
        } else {
          alert('文件上传失败');
        }
      } catch (error) {
        alert('上传过程中出现错误: '+error);
      }
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log('上传的文件:', file.name);
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            alert('文件上传成功');
            // document.getElementById('uploadStatus').innerText = `${file.name} 已上传`;
            uploadStatus.value = `${file.name} 已上传`
          } else {
            alert('文件上传失败');
          }
        } catch (error) {
          alert('上传过程中出现错误:'+error);
        }
      }
    }

    const initializeWebSocket = () => {
      socket = new WebSocket('ws://localhost:8000/ws'); // 替换为你的后端 WebSocket 服务器地址

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("received data: ", data);
        arrows.value = data;
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    };

    onMounted(() => {
      initializeWebSocket();
    });

    onUnmounted(() => {
      if (socket) {
        socket.disconnect();
      }
    });

    // 
    return { 
      textarea,
      fileInput,
      arrows,
      uploadStatus,
      output_content,
      handleFileUpload,
      handleTextSubmit,
      triggerFileSelect
    };
  }
};
</script>

<style src="./index.css"></style>
