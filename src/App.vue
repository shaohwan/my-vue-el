<!-- App.vue -->
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
/* Ensure the layout fills the entire viewport */
html,
body,
#app,
.common-layout {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Outer container */
.common-layout {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Full height for the main container */
.full-height {
  height: 100%;
}

/* Middle container takes remaining space */
.content-container {
  flex: 1;
  overflow: hidden;
}

/* Stack main and footer vertically */
.main-footer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Main content grows and scrolls if needed */
:deep(.el-main) {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #e9eef3;
  color: #333;
}

/* Footer stays fixed at the bottom */
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
import AppHeader from './components/AppHeader.vue'
import AppAside from './components/AppAside.vue'
import AppMain from './components/AppMain.vue'
import AppFooter from './components/AppFooter.vue'
</script>
