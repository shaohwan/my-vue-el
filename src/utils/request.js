import axios from 'axios'
import { ElMessage } from 'element-plus'

// 常量
const SUCCESS_CODE = 200
const ERROR_MESSAGE = '请求失败，请稍后重试'

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

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
  (error) => {
    ElMessage.error(error.response?.data?.message || ERROR_MESSAGE)
    return Promise.reject(error)
  },
)

export default service
