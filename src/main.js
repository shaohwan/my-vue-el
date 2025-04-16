import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

// 注册 v-auth 指令
app.directive('auth', {
  mounted(el, binding) {
    const requiredPermission = binding.value
    const routePermissions = router.currentRoute.value.meta.permissions || []
    if (!routePermissions.includes(requiredPermission)) {
      el.style.display = 'none'
    }
  },
  updated(el, binding) {
    const requiredPermission = binding.value
    const routePermissions = router.currentRoute.value.meta.permissions || []
    el.style.display = routePermissions.includes(requiredPermission) ? '' : 'none'
  },
})

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
