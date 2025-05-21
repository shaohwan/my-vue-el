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
  { path: '/login', name: 'Login', component: () => import('@/components/login/Login.vue') },
  { path: '/', redirect: basePath },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    children: [
      {
        path: 'profile', // 改为相对路径，实际路由为 /home/profile
        name: 'Profile',
        component: () => import('@/components/profile/index.vue'),
        meta: {
          title: '个人中心',
          breadcrumb: [{ title: '个人中心', path: '/home/profile' }],
        },
      },
    ],
  },
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
    const { basePath: newBasePath, defaultRoute } = await loadMenuAndRoutes()
    currentBasePath = newBasePath
    isRoutesLoaded = true
    if (to.path === '/home' && defaultRoute) {
      next(defaultRoute)
    } else {
      next(to.path)
    }
  } else {
    next()
  }
})

// 重置路由状态
const resetRoutes = () => {
  isRoutesLoaded = false
  const homeRoute = router.getRoutes().find((route) => route.name === 'Home')
  if (homeRoute) {
    homeRoute.children = []
    router.getRoutes().forEach((route) => {
      if (route.name !== 'Home' && route.name !== 'Login' && route.path !== '/') {
        router.removeRoute(route.name)
      }
    })
    router.addRoute(staticRoutes.find((route) => route.name === 'Home'))
  }
}

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
const generateRoutes = (menuList, parentPath, parentBreadcrumb = []) =>
  menuList.flatMap((menu) => {
    const permissions = collectPermissions(menu)
    const routes = []
    if (menu.type === 0 && menu.url?.trim()) {
      const url = menu.url.replace(/^\/+|\/+$/g, '')
      const fullPath = `/${url}`
      const component = getDynamicComponent(url)
      if (component) {
        // 构建面包屑，包含父级和当前菜单
        const breadcrumb = [...parentBreadcrumb, { title: menu.name, path: fullPath }]
        routes.push({
          path: fullPath,
          name: url.replace(/\//g, ''),
          component,
          meta: { icon: menu.icon, title: menu.name, permissions, breadcrumb },
        })
      }
    }
    if (menu.children?.length) {
      // 始终将当前菜单加入面包屑，即使没有 URL，path 设为 ''（不可点击）
      const newParentBreadcrumb = [
        ...parentBreadcrumb,
        {
          title: menu.name,
          path: menu.url?.trim() ? `/${menu.url.replace(/^\/+|\/+$/g, '')}` : '',
        },
      ]
      routes.push(...generateRoutes(menu.children, parentPath, newParentBreadcrumb))
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

// 查找第一个有效菜单
const findFirstValidMenu = (menuList) => {
  for (const menu of menuList) {
    if (menu.type === 0 && menu.url?.trim()) {
      const url = menu.url.replace(/^\/+|\/+$/g, '')
      return `/${url}`
    }
    if (menu.children?.length) {
      const childRoute = findFirstValidMenu(menu.children)
      if (childRoute) return childRoute
    }
  }
  return null
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
    const defaultRoute = findFirstValidMenu(menuList)
    return { menu: menuList, basePath: inferredBasePath, defaultRoute }
  } catch {
    return { menu: [], basePath, defaultRoute: null }
  }
}

export { router, addDynamicRoutes, loadMenuAndRoutes, basePath, resetRoutes }
