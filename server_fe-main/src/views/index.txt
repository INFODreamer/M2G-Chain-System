<template>
  <h1>云边协同大模型多模态生成系统</h1>
  <div class="server_container">
    <div class="container">
      <div class="servers">
        <div class="server" v-for="server in servers" :key="server.id" :id="'server-' + server.id">
          <img :src="server.status === 'on' ? serverOnImage : serverOffImage" :alt="`服务器${server.status}状态`">
          服务器 {{ server.id }}
          <button class="toggle-btn" @click="toggleServer(server.id)">
            {{ server.status === 'on' ? '关闭' : '开启' }}
          </button>
        </div>
      </div>
    </div>
    <svg class="connections" xmlns="http://www.w3.org/2000/svg">
      <line v-for="server in servers" :key="'line-' + server.id" :x1="mainServerPosition.x" :y1="mainServerPosition.y" :x2="getServerPosition(server.id).x" :y2="getServerPosition(server.id).y" stroke="grey" />
    </svg>
    <br><br><br><br><br>
    <div class="container">
      <div class="main_server" id="main-server">
        <img :src="main_server.status === 'on' ? serverOnImage : serverOffImage" :alt="`服务器${main_server.status}状态`">
      </div>
    </div>
  </div>
  <br>
  <div class="content">
    <div class="input-section">
      <textarea v-model="textInput" placeholder="请输入你的要求或上传文件"></textarea>
      <div class="file-upload">
        <label class="custom-file-upload" @click="handleTextSubmit">提交</label>
        <label for="file-upload" class="custom-file-upload">
          选择文件
        </label>
        <input id="file-upload" type="file" @change="handleFileUpload" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch  } from 'vue';
import serverOnImage from '@/assets/server_on.png'; // 确保图片在 assets 目录下
import serverOffImage from '@/assets/server_off.png'; // 确保图片在 assets 目录下

export default {
  name: 'HomePage',
  setup() {
    const textInput = ref('')
    const servers = ref([
      { id: 1, status: 'on' },
      { id: 2, status: 'on' },
      { id: 3, status: 'on' },
      { id: 4, status: 'on' },
      { id: 5, status: 'on' }
    ]);

    const main_server = ref({
      id: 0, status: 'on'
    });

    const mainServerPosition = ref({ x: 0, y: 0 });

    const toggleServer = (serverId) => {
      const server = servers.value.find(s => s.id === serverId);
      if (server) {
        server.status = server.status === 'on' ? 'off' : 'on';
      }
    };

    const getServerPosition = (id) => {
      const element = document.getElementById(`server-${id}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      return { x: 0, y: 0 };
    };

    const updatePositions = () => {
      const mainServerElement = document.getElementById('main-server');
      if (mainServerElement) {
        const rect = mainServerElement.getBoundingClientRect();
        mainServerPosition.value = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };

    onMounted(() => {
      // nextTick(updatePositions);
      // window.addEventListener('resize', updatePositions);
      nextTick(() => {
        updatePositions();
        window.addEventListener('resize', updatePositions);
      });
      const socket = new WebSocket('ws://localhost:3000');

      socket.onmessage = (event) => {
        const updatedStates = JSON.parse(event.data);
        servers.value = Object.keys(updatedStates).map((key) => ({
          id: key,
          ...updatedStates[key]
        }));
      };
    });

    watch(servers, () => {
      nextTick(updatePositions);
    });

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log('上传的文件:', file.name);
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch('http://your-backend-endpoint/upload', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            console.log('文件上传成功');
          } else {
            console.error('文件上传失败');
          }
        } catch (error) {
          console.error('上传过程中出现错误:', error);
        }
      }
    }

    const handleTextSubmit = async () => {
      const formData = new FormData();

      // 将文本内容保存为 Blob 并添加到 FormData
      const textBlob = new Blob([textInput.value], { type: 'text/plain' });
      formData.append('textFile', textBlob, 'input.txt');

      alert(textInput.value);
      // console.


      try {
        const response = await fetch('http://your-backend-endpoint/upload', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          alert('文件上传成功');
        } else {
          alert('文件上传失败');
        }
      } catch (error) {
        alert('上传过程中出现错误:', error);
      }
    };

    return {
      textInput,
      servers,
      main_server,
      mainServerPosition,
      serverOffImage,
      serverOnImage,
      toggleServer,
      getServerPosition,
      updatePositions,
      handleFileUpload,
      handleTextSubmit
    };
  }
};
</script>

<style>
.server_container {
  position: relative;
  background-color: #ffffff;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.servers {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 40px;
}

.server {
  text-align: center;
  position: relative;
}

.server img {
  width: 80px; /* 调整图片宽度 */
  height: auto;
}

.main_server img {
  width: 120px; /* 调整图片宽度 */
  height: auto;
}

.toggle-btn {
  margin-top: 15px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #143252;
  color: white;
  border: none;
  border-radius: 4px;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.input-section {
  margin-bottom: 20px;
  text-align: center;
}

textarea {
  width: 300px;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
}

.file-upload {
  /* margin-top: 10px; */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #aeb3b8;
  color: white;
  border: none;
  border-radius: 5px;
}

.file-upload input[type="file"] {
  display: none;
}
</style>
