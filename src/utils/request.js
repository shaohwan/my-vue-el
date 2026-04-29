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
    // 检查是否为文件流响应
    if (
      response.config.responseType === 'blob' ||
      response.headers['content-type']?.includes('application/octet-stream')
    ) {
      return response // 返回完整 response，包含 headers 和 data
    }
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

// 流式请求方法 - 清理双重 data: 前缀
service.stream = function (url, data, { onMessage, onError, onDone } = {}) {
  const authStore = useAuthStore()
  if (!authStore.accessToken) {
    onError?.('请先登录')
    return () => { }
  }

  const controller = new AbortController()
  const signal = controller.signal

  console.log('开始流式请求:', { url, data })

  fetch(`${service.defaults.baseURL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.accessToken}`,
    },
    body: JSON.stringify(data),
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('流式读取完成')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // 按 SSE 消息分割
          const messages = buffer.split('\n\n')
          buffer = messages.pop() || ''

          for (const message of messages) {
            const trimmedMessage = message.trim()
            if (!trimmedMessage) continue

            // 清理所有 data: 前缀
            let content = trimmedMessage.replace(/data:\s*/g, '')

            if (content === '[DONE]') {
              console.log('收到结束标记 [DONE]')
              onDone?.()
              return
            }

            if (content) {
              onMessage?.(content)
            }
          }
        }

        // 处理缓冲区剩余内容
        if (buffer.trim()) {
          const trimmedBuffer = buffer.trim()
          let content = trimmedBuffer.replace(/data:\s*/g, '')
          if (content && content !== '[DONE]') {
            onMessage?.(content)
          }
        }
      } finally {
        reader.releaseLock()
        onDone?.()
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        console.error('流式请求错误:', error)
        onError?.(error.message)
      }
    })

  return () => {
    console.log('中止流式请求')
    controller.abort()
  }
}

export default service
