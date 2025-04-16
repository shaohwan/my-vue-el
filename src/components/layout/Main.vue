<template>
  <el-main class="custom-main">
    <router-view />
  </el-main>
</template>

<style scoped>
.custom-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
:deep(.router-view) {
  flex: 1;
}
</style>

<script setup></script>
