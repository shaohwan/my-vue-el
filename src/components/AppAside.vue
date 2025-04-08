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
      <template v-for="menu in filteredMenuList" :key="menu.id">
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
          <el-menu-item
            v-for="child in menu.children"
            :key="child.id"
            :index="child.path"
            :route="{ path: child.path }"
            v-show="child.type === 'MENU'"
          >
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
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

const router = useRouter()
const menuList = ref([])
const activeIndex = ref('')

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// 计算属性：过滤出仅用于菜单的权限项
const filteredMenuList = computed(() => {
  const filterMenus = (menus) => {
    return menus
      .filter((menu) => menu.type === 'MENU') // 只显示 MENU 类型
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
      // 规范化数据
      const normalizeMenu = (menu) => {
        return {
          ...menu,
          children: menu.children && menu.children.length > 0 ? menu.children.map(normalizeMenu) : [],
        }
      }
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
