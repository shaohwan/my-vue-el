<template>
  <div class="profile-container">
    <div class="avatar-section">
      <el-upload
        v-if="!user.avatar"
        class="avatar-uploader"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload"
        :http-request="uploadAvatar"
      >
        <div class="avatar-placeholder">{{ getFirstLetter(user.username) }}</div>
      </el-upload>
      <div v-else class="avatar-preview">
        <img :src="user.avatar" alt="头像" class="avatar" />
        <el-button type="danger" size="small" class="remove-avatar" @click="removeAvatar">
          删除
        </el-button>
      </div>
    </div>
    <el-descriptions title="个人信息" :column="1" border class="user-descriptions">
      <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
      <el-descriptions-item label="真实姓名">
        <el-input
          v-model="user.realName"
          placeholder="请输入真实姓名"
          clearable
          class="editable-input"
        />
      </el-descriptions-item>
      <el-descriptions-item label="邮箱">
        <el-input v-model="user.email" placeholder="请输入邮箱" clearable class="editable-input" />
      </el-descriptions-item>
      <el-descriptions-item label="电话">
        <el-input v-model="user.phone" placeholder="请输入电话" clearable class="editable-input" />
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="user.enabled ? 'success' : 'danger'">
          {{ user.enabled ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ user.createTime || '未知' }}</el-descriptions-item>
      <el-descriptions-item label="角色">
        <el-tag v-if="user.superAdmin" type="warning">超级管理员</el-tag>
        <template v-else>
          <el-tag v-for="role in user.roles" :key="role.id" type="info" style="margin-right: 12px">
            {{ role.name || '未知角色' }}
          </el-tag>
          <span v-if="!user.roles.length">无角色</span>
        </template>
      </el-descriptions-item>
    </el-descriptions>
    <div class="button-section">
      <el-button type="primary" @click="updateUserProfile">确定</el-button>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
  width: 100%;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-uploader,
.avatar-preview {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.remove-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
}

.user-descriptions {
  max-width: 1200px; /* 放宽宽度 */
  margin: 0 auto;
}

/* 调整标签列宽度 */
:deep(.el-descriptions__label) {
  width: 333px;
  text-align: right;
  padding-right: 12px;
  background-color: #f5f7fa; /* 浅灰背景，区分标签 */
}

/* 确保值列充满剩余空间 */
:deep(.el-descriptions__content) {
  width: calc(100% - 120px);
  padding: 8px;
  min-height: 32px;
  display: flex;
  align-items: center;
}

/* 可编辑输入框 */
.editable-input {
  width: 100%; /* 充满值列 */
}

/* 覆盖 el-input 默认样式 */
:deep(.editable-input .el-input__wrapper) {
  width: 100%; /* 充满父容器 */
  padding: 1px 11px;
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

.button-section {
  margin-top: 20px;
  text-align: center;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const user = ref({
  id: null,
  username: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  enabled: true,
  superAdmin: false,
  createTime: '',
  roles: [],
})

// 获取用户名首字母
const getFirstLetter = (username) => {
  return username ? username.charAt(0).toUpperCase() : ''
}

// 验证邮箱格式
const isValidEmail = (email) => {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 验证电话格式
const isValidPhone = (phone) => {
  return !phone || /^\d{10,11}$/.test(phone)
}

// 验证头像上传
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('请上传图片文件！')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
  }
  return isImage && isLt2M
}

// 上传头像
const uploadAvatar = async ({ file }) => {
  const formData = new FormData()
  formData.append('avatar', file)
  const response = await service.put('/api/user/avatar', formData)
  user.value.avatar = response.url
  ElMessage.success('头像上传成功')
}

// 删除头像
const removeAvatar = () => {
  user.value.avatar = ''
}

// 获取用户信息
const fetchUserProfile = async () => {
  const response = await service.get('/api/user/profile', {
    params: { username: authStore.username },
  })
  user.value = response
}

// 更新用户信息
const updateUserProfile = async () => {
  if (!user.value.realName) {
    ElMessage.error('真实姓名不能为空')
    return
  }
  if (!isValidEmail(user.value.email)) {
    ElMessage.error('邮箱格式不正确')
    return
  }
  if (!isValidPhone(user.value.phone)) {
    ElMessage.error('电话格式不正确（10-11位数字）')
    return
  }

  const updateData = {
    username: user.value.username,
    realName: user.value.realName,
    email: user.value.email,
    phone: user.value.phone,
    // avatar: user.value.avatar,
  }
  await service.put('/api/user/profile', updateData)
  ElMessage.success('个人信息更新成功')
}

// 页面加载时获取数据
onMounted(() => {
  fetchUserProfile()
})
</script>
