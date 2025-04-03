import { createRouter, createWebHistory } from 'vue-router'

const staticRoutes = [{ path: '/', redirect: '/home' }]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
})

const addDynamicRoutes = (menuList) => {
  const routes = generateRoutes(menuList)
  routes.forEach((route) => router.addRoute(route))
}

const generateRoutes = (menuList) => {
  const routes = []
  menuList.forEach((menu) => {
    if (menu.path && menu.component) {
      routes.push({
        path: menu.path,
        name: menu.name,
        component: () => import(`../${menu.component}`), // 动态导入
      })
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children))
    }
  })
  return routes
}

export { router, addDynamicRoutes }
