<template>
  <el-header height="60px">
    <div class="header-content">
      <div class="welcome-message" v-if="authStore.isLoggedIn">你好，{{ authStore.username }}</div>
      <el-button v-if="authStore.isLoggedIn" @click="handleLogout" size="small" class="logout-btn">
        退出登录
      </el-button>
    </div>
  </el-header>
</template>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: flex-end; /* 让内容靠右 */
  align-items: center;
  height: 100%;
  gap: 16px; /* 按钮和欢迎消息之间的间距 */
}

.welcome-message {
  font-size: 16px;
  color: #333;
}

.logout-btn {
  margin-left: 10px; /* 防止按钮贴边 */
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
