<template>
    <div v-show="isVisibleStatus" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <button class="close-button" @click="closeModal">
            <el-icon class="hover-box"><Close /></el-icon>
        </button>
        <!-- 插槽，用来传入元素 -->
        <slot></slot>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
  
// 接收图片URL作为prop
const props = defineProps({
    isVisible: Boolean
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
    padding:30px 20px;
    border-radius: 5px;
  }

  .hover-box:hover {
    background-color: aliceblue
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    display: block;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
  }
</style>