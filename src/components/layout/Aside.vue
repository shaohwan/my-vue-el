<template>
  <el-aside width="220px" class="custom-aside">
    <el-menu
      :default-active="activeIndex"
      class="custom-menu"
      background-color="transparent"
      text-color="#fff"
      active-text-color="#fff"
      @select="handleSelect"
      router
    >
      <menu-item v-for="menu in filteredMenuList" :key="menu.id" :menu="menu" :level="0" />
    </el-menu>
  </el-aside>
</template>

<style scoped>
.custom-aside {
  background: #2c3e50;
  color: #fff;
  height: 100%;
  overflow: auto;
}
.custom-menu {
  border-right: none;
}
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  font-size: 14px;
}
:deep(.el-menu-item.is-active),
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background: transparent !important;
}
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: #fff;
  margin-right: 8px;
}
:deep(.el-sub-menu .el-menu-item) {
  font-size: 13px;
  padding-left: calc(var(--level) * 20px + 20px) !important;
}
:deep(.el-sub-menu .el-menu) {
  padding-left: 0 !important;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'
import MenuItem from './MenuItem.vue'
import { basePath as routerBasePath } from '@/router'

const router = useRouter()
const menuList = ref([])
const activeIndex = ref(router.currentRoute.value.path || routerBasePath)

const filteredMenuList = computed(() => {
  const filterMenus = (menus) => {
    if (!Array.isArray(menus)) return []
    return menus
      .filter((menu) => menu.type === 0)
      .map((menu) => ({
        ...menu,
        icon: menu.icon || null,
        children: menu.children?.length ? filterMenus(menu.children) : [],
      }))
  }
  return filterMenus(menuList.value)
})

const handleSelect = (index) => {
  activeIndex.value = index
  router.push(index)
}

onMounted(async () => {
  try {
    const { menu } = (await import('@/router').then((m) => m.loadMenuAndRoutes())) || {
      menu: [],
    }
    menuList.value = Array.isArray(menu) ? menu : []
  } catch (error) {
    menuList.value = []
  }
})
</script>
