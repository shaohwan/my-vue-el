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
      // 防止路由重复添加
      if (!router.hasRoute(route.name)) {
        router.addRoute(route)
      }
    } catch (error) {
      console.error(`添加路由 ${route.path} 失败:`, error)
    }
  })
  // 调试：打印当前路由表
  console.log('当前路由表:', router.getRoutes())
}

const generateRoutes = (menuList) => {
  const routes = []
  menuList.forEach((menu) => {
    // 收集当前菜单及其子菜单的所有权限 code
    const permissions = collectPermissions(menu)

    if (menu.type === 'MENU' && menu.path && menu.component) {
      routes.push({
        path: menu.path,
        name: menu.name || menu.code, // 确保路由名称唯一
        component: () =>
          import(
            `../${menu.component.endsWith('.vue') ? menu.component : menu.component + '.vue'}` /* @vite-ignore */
          ), // 动态导入组件
        meta: {
          icon: menu.icon,
          title: menu.name,
          permissions: permissions, // 添加权限列表
        },
      })
    }
    if (menu.children && menu.children.length > 0) {
      routes.push(...generateRoutes(menu.children))
    }
  })
  return routes
}

// 递归收集所有权限 code（包括 MENU 和 BUTTON）
const collectPermissions = (menu) => {
  const permissions = []
  if (menu.code) {
    permissions.push(menu.code) // 添加当前菜单的 code
  }
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((child) => {
      permissions.push(...collectPermissions(child)) // 递归收集子菜单的 code
    })
  }
  return [...new Set(permissions)] // 去重
}

export { router, addDynamicRoutes }
