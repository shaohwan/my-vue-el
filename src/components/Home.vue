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
}

:deep(.el-main) {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #e9eef3;
  color: #333;
}

:deep(.el-footer) {
  flex-shrink: 0;
  height: 60px;
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}
</style>

<script setup>
import AppHeader from './AppHeader.vue'
import AppAside from './AppAside.vue'
import AppMain from './AppMain.vue'
import AppFooter from './AppFooter.vue'
</script>
