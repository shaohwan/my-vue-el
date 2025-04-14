<template>
  <el-header class="custom-header">
    <div class="header-content">
      <span class="logo">管理系统</span>
      <div class="user-menu" v-if="authStore.isLoggedIn">
        <span class="welcome-message">你好，{{ authStore.username }}</span>
        <el-button @click="handleLogout" size="small" class="logout-btn">退出登录</el-button>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.custom-header {
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%); /* 匹配sidebar */
  color: #ffffffcc;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 底部阴影 */
  height: 56px; /* 紧凑高度 */
  line-height: 56px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffffff;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px; /* 紧凑间距 */
}

.welcome-message {
  font-size: 13px; /* 紧凑字体 */
  color: #ffffffcc;
}

.logout-btn {
  background: #409eff; /* Element Plus主色 */
  border: none;
  color: #ffffff;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #66b1ff;
  transform: scale(1.05); /* 匹配其他组件动画 */
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
