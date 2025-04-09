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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { addDynamicRoutes } from '../router'
import MenuItem from './MenuItem.vue' // 引入递归组件

const router = useRouter()
const menuList = ref([])
const activeIndex = ref('')

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

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

const fetchMenuData = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`, {
      params: { name: 'daniel' },
    })
    if (response.data.code === 200 && response.data.success) {
      const normalizeMenu = (menu) => ({
        ...menu,
        children: menu.children && menu.children.length > 0 ? menu.children.map(normalizeMenu) : [],
      })
      menuList.value = response.data.data.map(normalizeMenu)
      addDynamicRoutes(menuList.value)
      activeIndex.value = router.currentRoute.value.path || '/home'
    } else {
      console.error('菜单加载失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
}

const handleSelect = (index) => {
  activeIndex.value = index
  router.push(index)
}

onMounted(() => {
  fetchMenuData()
})
</script>
