import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true' || false,
    username: sessionStorage.getItem('username') || '', // 新增 username
  }),
  actions: {
    login(username) {
      this.isLoggedIn = true
      this.username = username // 存储用户名
      sessionStorage.setItem('isLoggedIn', 'true')
      sessionStorage.setItem('username', username)
    },
    logout() {
      this.isLoggedIn = false
      this.username = ''
      sessionStorage.removeItem('isLoggedIn')
      sessionStorage.removeItem('username')
    },
  },
})
