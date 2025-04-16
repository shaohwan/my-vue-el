<!-- MenuItem.vue -->
<template>
  <div :style="{ '--level': level }">
    <el-menu-item
      v-if="menu.type === 'MENU' && !menu.children?.length"
      :index="getMenuPath(menu.url)"
      :class="`level-${level}`"
    >
      <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
      <span>{{ menu.name }}</span>
    </el-menu-item>
    <el-sub-menu
      v-else-if="menu.type === 'MENU' && menu.children?.length"
      :index="getMenuIndex(menu)"
    >
      <template #title>
        <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
        <span>{{ menu.name }}</span>
      </template>
      <menu-item v-for="child in menu.children" :key="child.id" :menu="child" :level="level + 1" />
    </el-sub-menu>
  </div>
</template>

<script setup>
defineProps({
  menu: { type: Object, required: true },
  level: { type: Number, default: 0 },
})

const getMenuPath = (url) => (url?.trim() ? (url.startsWith('/') ? url : `/${url}`) : '/home')

const getMenuIndex = (menu) =>
  menu.url?.trim() ? getMenuPath(menu.url) : `group-${menu.id || menu.name || 'unknown'}`
</script>
