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
      <template v-for="menu in menuList" :key="menu.id">
        <el-menu-item
          v-if="!menu.children || menu.children.length === 0"
          :index="menu.path"
          :route="{ path: menu.path }"
        >
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="menu.id.toString()">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { addDynamicRoutes } from '../router'

const router = useRouter()
const menuList = ref([])
const activeIndex = ref('')

const getIconComponent = (iconName) => {
  return iconName && ElementPlusIconsVue[iconName] ? ElementPlusIconsVue[iconName] : null
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const fetchMenuData = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`)
    if (response.data.code === 200 && response.data.success) {
      menuList.value = response.data.data.map((menu) => ({
        ...menu,
        icon: getIconComponent(menu.icon),
        children: menu.children.map((child) => ({
          ...child,
          icon: getIconComponent(child.icon),
        })),
      }))
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
