<!-- components/AppAside.vue -->
<template>
  <el-aside width="200px">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      background-color="#d3dce6"
      text-color="#333"
      @select="handleSelect"
    >
      <el-menu-item index="1">
        <el-icon><House /></el-icon>
        <span>Home</span>
      </el-menu-item>
      <el-sub-menu index="2">
        <template #title>
          <el-icon><Menu /></el-icon>
          <span>Navigation</span>
        </template>
        <el-menu-item index="2-1">Item 1</el-menu-item>
        <el-menu-item index="2-2">Item 2</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="3">
        <el-icon><Setting /></el-icon>
        <span>Settings</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}
</style>

<script setup>
import { ref } from 'vue'
import { House, Menu, Setting } from '@element-plus/icons-vue'

const activeIndex = ref('1')

const handleSelect = (index) => {
  activeIndex.value = index
  console.log('Selected menu item:', index)
}
</script>
