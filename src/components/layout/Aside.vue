<template>
  <el-aside width="200px" class="custom-aside">
    <el-menu
      :default-active="activeIndex"
      class="custom-menu"
      background-color="transparent"
      text-color="#ffffffcc"
      active-text-color="#ffffff"
      @select="handleSelect"
      router
    >
      <el-menu-item index="/home" class="custom-menu-item">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <menu-item
        v-for="menu in filteredMenuList"
        :key="menu.id"
        :menu="menu"
        :base-path="basePath"
      />
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House } from '@element-plus/icons-vue'
import MenuItem from './MenuItem.vue'
import { basePath as routerBasePath } from '../../router'

const router = useRouter()
const menuList = ref([])
const activeIndex = ref('')
const basePath = ref(routerBasePath)

const filteredMenuList = computed(() => {
  const filterMenus = (menus) => {
    if (!Array.isArray(menus)) {
      console.warn('menus 不是数组:', menus)
      return []
    }
    return menus
      .filter((menu) => menu.type === 'MENU')
      .map((menu) => ({
        ...menu,
        icon: menu.icon || null,
        children: menu.children && menu.children.length > 0 ? filterMenus(menu.children) : [],
      }))
  }
  return filterMenus(menuList.value)
})

const handleSelect = (index) => {
  activeIndex.value = index
  router.push(index)
}

onMounted(async () => {
  if (!menuList.value.length) {
    const loadedMenu = await import('../../router').then((m) => m.loadMenuAndRoutes())
    if (loadedMenu) {
      menuList.value = Array.isArray(loadedMenu.menu) ? loadedMenu.menu : []
      basePath.value = loadedMenu.basePath || routerBasePath
    } else {
      menuList.value = []
    }
  }
  activeIndex.value = router.currentRoute.value.path || basePath.value
})
</script>

<style scoped>
/* Aside */
.custom-aside {
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%); /* 深色渐变 */
  color: #ffffffcc;
  text-align: left;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2); /* 右侧阴影 */
  height: 100vh;
  overflow-y: auto;
}

/* Menu */
.custom-menu {
  height: 100%;
  border-right: none;
  background: transparent;
}

/* Menu Item */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 13px; /* 紧凑字体，匹配角色树 */
  line-height: 36px; /* 紧凑行高 */
  color: #ffffffcc;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transform: translateX(4px); /* 微移动画 */
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff; /* Element Plus主色 */
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Icon and Text */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: inherit;
  font-size: 16px;
  margin-right: 8px;
}

:deep(.el-menu-item span),
:deep(.el-sub-menu__title span) {
  font-weight: 500;
}

/* Submenu */
:deep(.el-sub-menu .el-menu) {
  background: transparent;
  margin-left: 12px;
}

:deep(.el-sub-menu .el-menu-item) {
  margin: 2px 8px;
  padding-left: 24px !important; /* 子菜单缩进 */
  font-size: 12px; /* 更紧凑 */
  line-height: 32px;
}

/* Scrollbar */
.custom-aside::-webkit-scrollbar {
  width: 6px;
}

.custom-aside::-webkit-scrollbar-thumb {
  background: #ffffff33;
  border-radius: 3px;
}

.custom-aside::-webkit-scrollbar-track {
  background: transparent;
}
</style>
