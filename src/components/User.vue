<template>
  <div>
    <el-button type="primary" @click="showAddDialog" v-auth="'user:add'">新增用户</el-button>
    <el-table :data="users" style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="启用状态">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'danger'">
            {{ row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="showEditDialog(row)" v-auth="'user:edit'">编辑</el-button>
          <el-button type="text" @click="confirmDelete(row.id)" v-auth="'user:delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="角色分配" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const users = ref([])
const roles = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  id: null,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  enabled: true,
  roleIds: [],
})
const formRef = ref(null)
const loading = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }],
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/api/user`)
    if (response.data.success) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('获取用户失败:', error)
    ElMessage.error('获取用户失败')
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/role`)
    if (response.data.success) {
      roles.value = response.data.data
    }
  } catch (error) {
    console.error('获取角色失败:', error)
    ElMessage.error('获取角色失败')
  }
}

const showAddDialog = () => {
  dialogTitle.value = '新增用户'
  form.value = {
    id: null,
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    enabled: true,
    roleIds: [],
  }
  dialogVisible.value = true
}

const showEditDialog = async (user) => {
  dialogTitle.value = '编辑用户'
  try {
    const response = await axios.get(`${apiBaseUrl}/api/user/${user.id}`)
    if (response.data.success) {
      const userData = response.data.data
      form.value = {
        id: userData.id,
        username: userData.username,
        password: '', // 编辑时不显示密码
        realName: userData.realName,
        email: userData.email || '',
        phone: userData.phone || '',
        enabled: userData.enabled,
        roleIds: userData.roles.map((role) => role.id),
      }
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

const saveUser = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    const userData = { ...form.value }
    if (!userData.id) {
      // 新增时包含密码
      delete userData.id
    } else {
      // 编辑时不更新密码（除非有专门的修改密码功能）
      delete userData.password
    }
    const response = await axios.post(`${apiBaseUrl}/api/user`, userData)
    if (response.data.success) {
      dialogVisible.value = false
      fetchUsers()
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(response.data.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除此用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteUser(id))
    .catch(() => {})
}

const deleteUser = async (id) => {
  try {
    loading.value = true
    const response = await axios.delete(`${apiBaseUrl}/api/user/${id}`)
    if (response.data.success) {
      fetchUsers()
      ElMessage.success(response.data.message || '删除成功')
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '删除失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<style scoped>
.el-table {
  margin-top: 20px;
}
</style>
