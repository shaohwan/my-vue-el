<template>
  <el-header class="custom-header">
    <div class="header-content">
      <span class="logo">管理系统</span>
      <div class="user-menu" v-if="authStore.isLoggedIn">
        <el-dropdown trigger="click" @command="handleDropdownCommand">
          <span class="user-trigger">
            你好，{{ authStore.username }} <i class="el-icon-arrow-down"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>

  <!-- 修改密码对话框 -->
  <el-dialog title="修改密码" v-model="dialogVisible" width="30%" :before-close="handleDialogClose">
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="primary" @click="submitChangePassword">确定</el-button>
    </template>
  </el-dialog>
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
  align-items: center;
}
.user-trigger {
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 4px;
}
.user-trigger:hover {
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const authStore = useAuthStore()
const router = useRouter()

// 下拉菜单处理
const handleDropdownCommand = (command) => {
  if (command === 'changePassword') {
    showChangePasswordDialog()
  } else if (command === 'logout') {
    handleLogout(true) // 手动退出需要确认
  }
}

// 退出登录
const handleLogout = (withConfirm = false) => {
  if (withConfirm) {
    ElMessageBox.confirm(`是否确认退出当前用户 ${authStore.username}？`, '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        performLogout()
      })
      .catch(() => {
        // 用户取消退出
      })
  } else {
    performLogout()
  }
}

// 执行退出登录逻辑
const performLogout = () => {
  service.post('/api/auth/logout', { username: authStore.username })
  authStore.logout()
  router.push('/login')
}

// 修改密码对话框
const dialogVisible = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const showChangePasswordDialog = () => {
  dialogVisible.value = true
}

const handleDialogClose = () => {
  dialogVisible.value = false
  passwordFormRef.value.resetFields() // 重置表单
}

const submitChangePassword = () => {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      service
        .put('/api/user/password', {
          username: authStore.username,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        })
        .then(() => {
          ElMessage.success('密码修改成功，请重新登录')
          dialogVisible.value = false
          passwordFormRef.value.resetFields()
          // 强制退出登录，无需确认
          handleLogout(false)
        })
    }
  })
}
</script>
