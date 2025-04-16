import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import service from '@/utils/request'

// 默认基路径
const basePath = import.meta.env.VITE_BASE_PATH || '/home'

// 动态组件加载
const layoutModules = import.meta.glob('/src/components/**/*.vue')
const getDynamicComponent = (url) => {
  const normalizedUrl = url.replace(/^\/+|\/+$/g, '')
  const modulePath = `/src/components/${normalizedUrl}.vue`
  return layoutModules[modulePath] || null
}

// 静态路由
const staticRoutes = [
  { path: '/login', name: 'Login', component: () => import('../components/login/Login.vue') },
  { path: '/', redirect: basePath },
  { path: '/home', name: 'Home', component: () => import('../components/Home.vue'), children: [] },
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

let isRoutesLoaded = false
let currentBasePath = basePath

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn && to.name !== 'Login') {
    next('/login')
  } else if (authStore.isLoggedIn && to.name === 'Login') {
    next(currentBasePath)
  } else if (authStore.isLoggedIn && !isRoutesLoaded) {
    const { basePath: newBasePath } = await loadMenuAndRoutes()
    currentBasePath = newBasePath
    isRoutesLoaded = true
    next(to.path)
  } else {
    next()
  }
})

// 添加动态路由
const addDynamicRoutes = (menuList, parentPath = currentBasePath) => {
  const routes = generateRoutes(menuList, parentPath)
  routes.forEach((route) => {
    if (!router.hasRoute(route.name)) {
      router.addRoute('Home', route)
    }
  })
}

// 生成路由
const generateRoutes = (menuList, parentPath) =>
  menuList.flatMap((menu) => {
    const permissions = collectPermissions(menu)
    const routes = []
    if (menu.type === 'MENU' && menu.url?.trim()) {
      const url = menu.url.replace(/^\/+|\/+$/g, '')
      const fullPath = `/${url}`
      const component = getDynamicComponent(url)
      if (component) {
        routes.push({
          path: fullPath,
          name: url.replace(/\//g, ''),
          component,
          meta: { icon: menu.icon, title: menu.name, permissions },
        })
      }
    }
    if (menu.children?.length) {
      routes.push(...generateRoutes(menu.children, parentPath))
    }
    return routes
  })

// 收集权限
const collectPermissions = (menu) => {
  const permissions = menu.code ? [menu.code] : []
  if (menu.children?.length) {
    permissions.push(...menu.children.flatMap(collectPermissions))
  }
  return [...new Set(permissions)]
}

// 加载菜单和路由
const loadMenuAndRoutes = async () => {
  const authStore = useAuthStore()
  try {
    const response = await service.get('/api/menu/tree', {
      params: { name: authStore.username || 'default' },
    })
    const menuList = (Array.isArray(response) ? response : []).map((menu) => ({
      ...menu,
      url: menu.url?.trim() || '',
      children:
        menu.children?.map((child) => ({
          ...child,
          url: child.url?.trim() || '',
          children: child.children || [],
        })) || [],
    }))
    const inferredBasePath = response.basePath || menuList.find((menu) => menu.url)?.url || basePath
    addDynamicRoutes(menuList, inferredBasePath)
    return { menu: menuList, basePath: inferredBasePath }
  } catch {
    return { menu: [], basePath }
  }
}

export { router, addDynamicRoutes, loadMenuAndRoutes, basePath }
