import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 常量
const SUCCESS_CODE = 200
const ERROR_MESSAGE = '请求失败，请稍后重试'
const LOGIN_PATH = '/login'
const UNAUTHORIZED_CODE = 401

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 显示错误消息（防止重复弹出）
const showErrorMessage = (message) => {
  ElMessage.error({
    message: message || ERROR_MESSAGE,
    duration: 3000,
    showClose: true,
  })
}

// 显示登录超时提示（异步函数）
const showLoginExpiredPrompt = async (authStore) => {
  try {
    await ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
      confirmButtonText: '重新登录',
      type: 'warning',
      showCancelButton: false,
      closeOnClickModal: false,
      showClose: false,
    })
    authStore.logout()
    window.location.href = LOGIN_PATH
  } catch {
    // 用户取消确认框，不执行任何操作
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === SUCCESS_CODE) {
      return data.data
    }
    if (data.code === UNAUTHORIZED_CODE) {
      // 抛出 401 错误，交给错误处理器
      const error = new Error(data.message || 'Unauthorized')
      error.response = { status: UNAUTHORIZED_CODE }
      return Promise.reject(error)
    }
    const errorMessage = data.message || ERROR_MESSAGE
    showErrorMessage(errorMessage)
    return Promise.reject(new Error(errorMessage))
  },
  async (error) => {
    const authStore = useAuthStore()
    const response = error.response
    const errorMessage =
      response?.data?.message || response?.data?.error || error.message || ERROR_MESSAGE

    if (response?.status === UNAUTHORIZED_CODE) {
      try {
        await authStore.refresh()
        error.config.headers['Authorization'] = `Bearer ${authStore.accessToken}`
        return service(error.config)
      } catch (refreshError) {
        await showLoginExpiredPrompt(authStore)
        return Promise.reject(new Error('登录超时，请重新登录'))
      }
    }

    showErrorMessage(errorMessage)
    return Promise.reject(error)
  },
)

export default service
