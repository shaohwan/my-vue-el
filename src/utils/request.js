import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 常量
const SUCCESS_CODE = 200
const ERROR_MESSAGE = '请求失败，请稍后重试'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    console.log(
      'Sending Authorization:',
      authStore.accessToken ? `Bearer ${authStore.accessToken}` : 'No token',
    )
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === SUCCESS_CODE) {
      return data.data
    }
    ElMessage.error(data.message || ERROR_MESSAGE)
    return Promise.reject(new Error(data.message || ERROR_MESSAGE))
  },
  async (error) => {
    const authStore = useAuthStore()
    const errorMessage =
      error.response?.data?.message || error.response?.data?.error || ERROR_MESSAGE
    if (error.response?.status === 401) {
      try {
        await authStore.refresh()
        error.config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
        return service(error.config)
      } catch (refreshError) {
        ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          type: 'warning',
          showCancelButton: false,
          closeOnClickModal: false,
          showClose: false,
        })
          .then(() => {
            authStore.logout()
            window.location.href = '/login'
          })
          .catch(() => {
            // 用户取消，不做任何操作
          })
        return Promise.reject('登录超时，请重新登录')
      }
    }
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  },
)

export default service
