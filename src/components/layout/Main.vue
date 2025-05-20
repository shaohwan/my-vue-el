<template>
  <el-main class="custom-main">
    <Breadcrumb />
    <el-divider border-style="double" />
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

<script setup>
import Breadcrumb from './Breadcrumb.vue'
</script>
