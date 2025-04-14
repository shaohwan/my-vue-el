<template>
  <div class="common-layout">
    <el-container direction="vertical" class="full-height">
      <AppHeader />
      <el-container class="content-container">
        <AppAside />
        <el-container direction="vertical" class="main-footer-container">
          <AppMain />
          <AppFooter />
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #f0f2f5; /* 浅灰背景，匹配卡片hover */
}

.full-height {
  height: 100%;
}

.content-container {
  flex: 1;
  overflow: hidden;
}

.main-footer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff; /* 白色卡片背景 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 卡片阴影 */
  border-radius: 8px 0 0 8px; /* 左侧圆角 */
  margin: 0 8px 8px 0; /* 移除顶端margin，紧贴header */
}

:deep(.el-main) {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* 无padding，交给子组件 */
  background: transparent;
  color: #303133;
}

:deep(.el-main::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-main::-webkit-scrollbar-thumb) {
  background: #d3dce6;
  border-radius: 3px;
}

:deep(.el-main::-webkit-scrollbar-track) {
  background: transparent;
}
</style>

<script setup>
import AppHeader from './layout/Header.vue'
import AppAside from './layout/Aside.vue'
import AppMain from './layout/Main.vue'
import AppFooter from './layout/Footer.vue'
</script>
