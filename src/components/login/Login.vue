<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-content">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
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
            :loading="loading"
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
/* 重置全局样式，确保全屏 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 禁止页面滚动 */
}

* {
  box-sizing: border-box; /* 确保 padding 不增加尺寸 */
}

.login-container {
  height: 100vh; /* 明确使用视口高度 */
  width: 100vw; /* 明确使用视口宽度 */
  position: fixed; /* 固定位置，避免受父级影响 */
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  overflow: hidden; /* 防止容器溢出 */
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  opacity: 0.8;
  z-index: 0;
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 500px; /* 限制内容区域宽度 */
  padding: 20px; /* 外边距 */
}

.login-form {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-height: calc(100vh - 60px); /* 留出外边距空间 */
  overflow-y: auto; /* 表单内部滚动 */
}

.login-form:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 25px;
}

.login-header .title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-header .subtitle {
  font-size: 14px;
  color: #909399;
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
  margin-top: 20px;
  font-size: 14px;
}

/* Element Plus 样式调整 */
.login-container:deep(.el-input__wrapper) {
  padding: 0 15px;
  height: 48px;
  border-radius: 8px;
}

.login-container:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

/* 响应式调整 */
@media (max-height: 600px) {
  .login-form {
    padding: 20px;
    max-height: calc(100vh - 40px);
  }

  .login-header {
    margin-bottom: 15px;
  }

  .login-footer {
    margin-top: 15px;
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
import { ElMessage } from 'element-plus'

const loginFormRef = ref(null)
const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: '',
})

const rememberMe = ref(false)
const loading = ref(false)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    await login(loginForm.value.username, loginForm.value.password)
    authStore.login(loginForm.value.username)
    await loadMenuAndRoutes()
    router.push('/home')
    ElMessage.success('登录成功')
  } catch (error) {
  } finally {
    loading.value = false
  }
}

const login = async (username, password) => {
  try {
    const response = await service.get('/api/login', {
      params: {
        name: username,
        password: password,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}
</script>
