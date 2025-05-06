import { defineStore } from 'pinia'
import service from '@/utils/request'
import { resetRoutes } from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn:
      localStorage.getItem('isLoggedIn') === 'true' ||
      sessionStorage.getItem('isLoggedIn') === 'true' ||
      false,
    username: localStorage.getItem('username') || sessionStorage.getItem('username') || '',
    accessToken: localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '',
    refreshToken:
      localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken') || '',
  }),
  actions: {
    login(username, accessToken, refreshToken, rememberMe) {
      this.isLoggedIn = true
      this.username = username
      this.accessToken = accessToken
      this.refreshToken = refreshToken

      // 根据 rememberMe 选择存储方式
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('isLoggedIn', 'true')
      storage.setItem('username', username)
      storage.setItem('accessToken', accessToken)
      storage.setItem('refreshToken', refreshToken)

      // 如果不记住我，清除 localStorage 中的旧数据
      if (!rememberMe) {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    },
    async refresh() {
      try {
        const response = await service.post('/api/auth/refresh', {
          refreshToken: this.refreshToken,
          username: this.username,
        })
        this.accessToken = response.accessToken
        this.refreshToken = response.refreshToken

        // 更新存储，根据当前存储位置
        const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
        storage.setItem('accessToken', response.accessToken)
        storage.setItem('refreshToken', response.refreshToken)
        return true
      } catch (error) {
        this.logout()
        throw error
      }
    },
    logout() {
      this.isLoggedIn = false
      this.username = ''
      this.accessToken = ''
      this.refreshToken = ''

      // 清除 localStorage 和 sessionStorage
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      sessionStorage.removeItem('isLoggedIn')
      sessionStorage.removeItem('username')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')
      resetRoutes()
    },
  },
})
