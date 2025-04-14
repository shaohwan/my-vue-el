import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// 路径转驼峰命名
const pathToCamel = (path) => {
  return path.replace(/\/(\w)/g, (all, letter) => letter.toUpperCase())
}

// 动态组件加载工具函数
const layoutModules = () => {
  return import.meta.glob('/src/components/**/*.vue')
}

const getDynamicComponent = (url) => {
  const modules = layoutModules()
  const normalizedUrl = url ? url.replace(/^\/+|\/+$/g, '') : ''
  const modulePath = `/src/components/${normalizedUrl}.vue`
  if (modules[modulePath]) {
    return modules[modulePath]
  }
  console.warn(`Component not found for URL: ${modulePath}`)
  return null
}

// 默认基路径（从环境变量获取，或兜底为 /home）
const defaultBasePath = import.meta.env.VITE_BASE_PATH || '/home'

const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/login/Login.vue'),
  },
  {
    path: '/',
    redirect: defaultBasePath,
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
let basePath = defaultBasePath

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn && to.name !== 'Login') {
    next('/login')
  } else if (authStore.isLoggedIn && to.name === 'Login') {
    next(basePath)
  } else if (authStore.isLoggedIn && !isRoutesLoaded) {
    const menuData = await loadMenuAndRoutes()
    if (menuData && menuData.basePath) {
      basePath = menuData.basePath
    }
    isRoutesLoaded = true
    next(to.path)
  } else {
    next()
  }
})

const addDynamicRoutes = (menuList, parentPath = basePath) => {
  const routes = generateRoutes(menuList, parentPath)
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

const generateRoutes = (menuList, parentPath) => {
  const routes = []
  menuList.forEach((menu) => {
    const permissions = collectPermissions(menu)
    if (menu.type === 'MENU' && menu.url && menu.url.trim()) {
      const url = menu.url.startsWith('/') ? menu.url.slice(1) : menu.url
      const fullPath = `/${url}`
      const component = getDynamicComponent(url)
      if (component) {
        routes.push({
          path: fullPath,
          name: pathToCamel(url),
          component,
          meta: {
            icon: menu.icon,
            title: menu.name,
            permissions,
          },
        })
      } else {
        console.warn(`Skipping route for ${url}: component not found`)
      }
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children, parentPath))
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
    if (response.data.code === 200) {
      const data = Array.isArray(response.data.data) ? response.data.data : []
      const normalizeMenu = (menu) => ({
        ...menu,
        url: menu.url ? menu.url.replace(/^\/+|\/+$/g, '') : '',
        children: menu.children && menu.children.length > 0 ? menu.children.map(normalizeMenu) : [],
      })
      const menuList = data.map(normalizeMenu)
      const inferredBasePath =
        response.data.basePath ||
        menuList.find((menu) => menu.url && menu.url.trim())?.url ||
        defaultBasePath
      addDynamicRoutes(menuList, inferredBasePath)
      return { menu: menuList, basePath: inferredBasePath }
    }
    console.warn('API 响应无效，返回空菜单')
    return { menu: [], basePath: defaultBasePath }
  } catch (error) {
    console.error('加载菜单和路由失败:', error)
    return { menu: [], basePath: defaultBasePath }
  }
}

export { router, addDynamicRoutes, loadMenuAndRoutes, basePath, pathToCamel }
