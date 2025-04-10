<template>
  <el-aside width="200px">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      background-color="#d3dce6"
      text-color="#333"
      @select="handleSelect"
      router
    >
      <el-menu-item index="/home">首页</el-menu-item>
      <menu-item v-for="menu in filteredMenuList" :key="menu.id" :menu="menu" />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import MenuItem from './MenuItem.vue'

const router = useRouter()
const authStore = useAuthStore()
const menuList = ref([])
const activeIndex = ref('')

// 计算属性：过滤出仅用于菜单的权限项
const filteredMenuList = computed(() => {
  const filterMenus = (menus) => {
    return menus
      .filter((menu) => menu.type === 'MENU')
      .map((menu) => ({
        ...menu,
        icon: getIconComponent(menu.icon),
        children: menu.children && menu.children.length > 0 ? filterMenus(menu.children) : [],
      }))
  }
  return filterMenus(menuList.value)
})

const getIconComponent = (iconName) => {
  return iconName && ElementPlusIconsVue[iconName] ? ElementPlusIconsVue[iconName] : null
}

const handleSelect = (index) => {
  activeIndex.value = index
  router.push(index)
}

onMounted(async () => {
  if (!menuList.value.length) {
    const loadedMenu = await import('../router').then((m) => m.loadMenuAndRoutes())
    if (loadedMenu) {
      menuList.value = loadedMenu
    }
  }
  activeIndex.value = router.currentRoute.value.path || '/home'
})
</script>
