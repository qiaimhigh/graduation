<template>
    <div v-show="isVisibleStatus" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <button class="close-button" @click="closeModal">
          <el-icon class="hover-box"><Close /></el-icon>
        </button>
        <div class="image-container">
            <img :src="imageInfo.imageUrl" alt="Modal Image" class="responsive-image" />
        </div>
        <div class="download-box">
            <a :href="imageInfo.imageUrl" :download="`${imageInfo.deviceName}-${imageInfo.deviceID}`">
                <button class="download-btn">下载图片</button>
            </a>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
  
// 接收图片URL作为prop
const props = defineProps({
    imageInfo: {
      type: Object,
      default: {
        imageUrl: '',
        deviceName: '',
        deviceID: ''
      }
    },
    // imageUrl: String,
    isVisible: Boolean,
    // deviceName: String,
    // deviceID: String
});

const emit = defineEmits(['changShow'])
// 控制Modal显示隐藏的状态
const isVisibleStatus = ref<Boolean>(props.isVisible);

// 当props.isVisible变化时，更新isVisibleStatus的值
watchEffect(() => {
  isVisibleStatus.value  = props.isVisible;
});

// 关闭Modal的方法
const closeModal = () => {
  emit('changShow', false);
};
</script>
  
<style scoped lang="scss">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-container {
    position: relative;
    background-color: white;
    padding: 20px;
    border-radius: 5px;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .image-container {
    width: 300px;
    height: 300px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hover-box:hover {
    background-color: rgb(173, 173, 174)
  }
  
  .responsive-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block; /* Remove extra space below the image */
  }

  .download-box {
     width: 100%;
     display: flex;
     justify-content: flex-end
  }

  .download-btn {
    border: none;
    border-bottom: 1px solid #0909fa;
    background-color: transparent;
    color: #0000FF;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
  }
</style>