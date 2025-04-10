import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue'),
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    children: [],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

let isRoutesLoaded = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn && to.name !== 'Login') {
    next('/login')
  } else if (authStore.isLoggedIn && to.name === 'Login') {
    next('/home')
  } else if (authStore.isLoggedIn && !isRoutesLoaded) {
    await loadMenuAndRoutes()
    isRoutesLoaded = true
    next(to.path)
  } else {
    next()
  }
})

const addDynamicRoutes = (menuList) => {
  const routes = generateRoutes(menuList)
  routes.forEach((route) => {
    try {
      if (!router.hasRoute(route.name)) {
        router.addRoute('Home', route)
      }
    } catch (error) {
      console.error(`添加路由 ${route.path} 失败:`, error)
    }
  })
  console.log('当前路由表:', router.getRoutes())
}

const generateRoutes = (menuList) => {
  const routes = []
  menuList.forEach((menu) => {
    const permissions = collectPermissions(menu)
    if (menu.type === 'MENU' && menu.path && menu.component) {
      const path = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path
      routes.push({
        path: path,
        name: `Home_${menu.code || path}`,
        component: () =>
          import(
            /* @vite-ignore */ `../${menu.component.endsWith('.vue') ? menu.component : menu.component + '.vue'}`
          ),
        meta: {
          icon: menu.icon,
          title: menu.name,
          permissions: permissions,
        },
      })
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children))
    }
  })
  return routes
}

const collectPermissions = (menu) => {
  const permissions = []
  if (menu.code) {
    permissions.push(menu.code)
  }
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((child) => {
      permissions.push(...collectPermissions(child))
    })
  }
  return [...new Set(permissions)]
}

const loadMenuAndRoutes = async () => {
  try {
    const authStore = useAuthStore()
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`, {
      params: { name: authStore.username || 'default' },
    })
    if (response.data.code === 200 && response.data.success) {
      const normalizeMenu = (menu) => ({
        ...menu,
        children: menu.children && menu.children.length > 0 ? menu.children.map(normalizeMenu) : [],
      })
      const menuList = response.data.data.map(normalizeMenu)
      addDynamicRoutes(menuList)
      return menuList
    }
  } catch (error) {
    console.error('加载菜单和路由失败:', error)
  }
}

export { router, addDynamicRoutes, loadMenuAndRoutes } // 显式导出 loadMenuAndRoutes
