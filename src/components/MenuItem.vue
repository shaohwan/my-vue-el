<template>
  <!-- 叶子节点 -->
  <el-menu-item
    v-if="menu.type === 'MENU' && (!menu.children || menu.children.length === 0)"
    :index="menu.path"
    :route="{ path: menu.path }"
  >
    <el-icon v-if="menu.icon">
      <component :is="menu.icon" />
    </el-icon>
    <span>{{ menu.name }}</span>
  </el-menu-item>
  <!-- 有子节点的菜单 -->
  <el-sub-menu
    v-else-if="menu.type === 'MENU' && menu.children && menu.children.length > 0"
    :index="menu.id.toString()"
  >
    <template #title>
      <el-icon v-if="menu.icon">
        <component :is="menu.icon" />
      </el-icon>
      <span>{{ menu.name }}</span>
    </template>
    <!-- 递归渲染子节点 -->
    <menu-item v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>
</template>

<script setup>
defineProps({
  menu: {
    type: Object,
    required: true,
  },
})
</script>
