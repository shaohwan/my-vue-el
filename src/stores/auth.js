import { defineStore } from 'pinia'
import service from '@/utils/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true' || false,
    username: localStorage.getItem('username') || '',
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  }),
  actions: {
    login(username, accessToken, refreshToken) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.isLoggedIn = true
      this.username = username // 存储用户名
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    },
    async refresh() {
      try {
        const response = await service.post('/api/auth/refresh', {
          refreshToken: this.refreshToken,
          username: this.username,
        })
        this.accessToken = response.accessToken
        this.refreshToken = response.refreshToken
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
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
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
})
