<template>
  <el-menu-item
    v-if="
      menu.type === 'MENU' &&
      (!menu.children || menu.children.length === 0) &&
      menu.url &&
      menu.url.trim()
    "
    :index="getMenuPath(menu.url)"
  >
    <el-icon v-if="menu.icon">
      <component :is="menu.icon" />
    </el-icon>
    <span>{{ menu.name }}</span>
  </el-menu-item>
  <el-sub-menu
    v-else-if="menu.type === 'MENU' && menu.children && menu.children.length > 0"
    :index="getMenuIndex(menu)"
  >
    <template #title>
      <el-icon v-if="menu.icon">
        <component :is="menu.icon" />
      </el-icon>
      <span>{{ menu.name }}</span>
    </template>
    <menu-item v-for="child in menu.children" :key="child.id" :menu="child" :base-path="basePath" />
  </el-sub-menu>
</template>

<script setup>
const props = defineProps({
  menu: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: '/home',
  },
})

const getMenuPath = (url) => {
  if (!url || !url.trim()) return props.basePath
  if (url.startsWith('/')) return url
  return `/${url}`
}

const getMenuIndex = (menu) => {
  if (!menu.url || !menu.url.trim()) {
    return `group-${menu.id || menu.name || 'unknown'}`
  }
  return getMenuPath(menu.url)
}
</script>

<style scoped>
/* No styles needed here, as styling is handled in Aside.vue */
</style>
