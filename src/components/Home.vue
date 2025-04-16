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
  inset: 0;
  background: #fff;
}
.full-height {
  height: 100%;
}
.content-container {
  flex: 1;
}
.main-footer-container {
  flex: 1;
  margin: 8px;
}
:deep(.el-main) {
  flex: 1;
  overflow: auto;
}
</style>

<script setup>
import AppHeader from './layout/Header.vue'
import AppAside from './layout/Aside.vue'
import AppMain from './layout/Main.vue'
import AppFooter from './layout/Footer.vue'
</script>
