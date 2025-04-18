<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-content">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <div class="login-header">
          <h2 class="title">欢迎登录</h2>
          <p class="subtitle">请输入您的账号和密码</p>
        </div>

        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            class="login-button"
            size="large"
          >
            登 录
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码?</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-bg-color: #f5f7fa;
  --gradient-start: #6a11cb;
  --gradient-end: #2575fc;
  --text-primary: #303133;
  --text-secondary: #909399;
  --spacing-sm: 15px;
  --spacing-md: 20px;
  --border-radius: 8px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary-bg-color);
}

.login-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  opacity: 0.8;
}

.login-content {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-md);
}

.login-form {
  width: 100%;
  padding: 30px;
  background-color: #fff;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
}

.login-header .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-header .subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-button {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  letter-spacing: 2px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  padding: 0 var(--spacing-sm);
  height: 48px;
  border-radius: var(--border-radius);
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

@media (max-height: 600px) {
  .login-form {
    padding: var(--spacing-md);
    max-height: calc(100vh - 40px);
  }
  .login-header,
  .login-footer {
    margin: var(--spacing-sm) 0;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Lock } from '@element-plus/icons-vue'
import { loadMenuAndRoutes } from '@/router'
import service from '@/utils/request'

const loginFormRef = ref(null)
const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: '',
})

const rememberMe = ref(false)

const handleLogin = async () => {
    await service.get('/api/login', {
      params: { name: loginForm.value.username, password: loginForm.value.password },
    })
    authStore.login(loginForm.value.username)
    await loadMenuAndRoutes()
    router.push('/home')
}
</script>
