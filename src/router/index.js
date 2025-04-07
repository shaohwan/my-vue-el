import { createRouter, createWebHistory } from 'vue-router'

const staticRoutes = [{ path: '/', redirect: '/home' }]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

const addDynamicRoutes = (menuList) => {
  const routes = generateRoutes(menuList)
  routes.forEach((route) => {
    try {
      router.addRoute(route)
    } catch (error) {
      console.error(`添加路由 ${route.path} 失败:`, error)
    }
  })
}

const generateRoutes = (menuList) => {
  const routes = []
  menuList.forEach((menu) => {
    if (menu.type === 'MENU' && menu.path && menu.component) {
      // 只处理 MENU 类型
      routes.push({
        path: menu.path,
        name: menu.name || menu.code, // 使用 name 或 code 作为路由名称
        component: () => import(`../${menu.component}`), // 动态导入组件
        meta: { icon: menu.icon, title: menu.name }, // 附加元信息用于侧边栏
      })
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children))
    }
  })
  return routes
}

export { router, addDynamicRoutes }
