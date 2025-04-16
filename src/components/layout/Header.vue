<template>
  <el-header class="custom-header">
    <div class="header-content">
      <span class="logo">管理系统</span>
      <div class="user-menu" v-if="authStore.isLoggedIn">
        <span class="welcome-message">你好，{{ authStore.username }}</span>
        <el-button @click="handleLogout" size="small">退出登录</el-button>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.custom-header {
  background: #2c3e50;
  color: #fff;
  padding: 0 16px;
  height: 48px;
  line-height: 48px;
}
.header-content {
  display: flex;
  justify-content: space-between;
}
.logo {
  font-size: 16px;
}
.user-menu {
  display: flex;
  gap: 8px;
}
.welcome-message {
  font-size: 14px;
}
.el-button {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 6px 12px;
}
</style>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
