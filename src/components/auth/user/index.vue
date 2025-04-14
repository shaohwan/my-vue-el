<template>
  <div>
    <el-card class="control-card">
      <el-button type="primary" @click="showAddDialog" v-auth="'user:add'">新增用户</el-button>
    </el-card>

    <el-card class="table-card">
      <el-table :data="users" style="width: 100%" v-loading="loading" class="custom-table">
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
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
              v-auth="'user:edit'"
              class="action-button"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row.id)"
              v-auth="'user:delete'"
              class="action-button"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" class="custom-dialog">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.id">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
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
import { ref, onMounted } from 'vue'
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
    if (response.data.code == 200) {
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
    if (response.data.code == 200) {
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
    if (response.data.code == 200) {
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
      await axios.post(`${apiBaseUrl}/api/user`, userData)
      ElMessage.success('保存成功')
    } else {
      // 编辑时不更新密码（除非有专门的修改密码功能）
      delete userData.password
      await axios.put(`${apiBaseUrl}/api/user`, userData)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchUsers()
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
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const deleteUser = async (id) => {
  try {
    loading.value = true
    const response = await axios.delete(`${apiBaseUrl}/api/user/${id}`)
    if (response.data.code == 200) {
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
/* Control Card */
.control-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.control-card:hover {
  transform: translateY(-2px);
}

/* Table Card */
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Custom Table */
.custom-table {
  padding: 10px 0;
  width: 100%;
}

:deep(.el-table__row) {
  transition: background-color 0.2s;
  border-bottom: 1px solid #e8ecef; /* 行分割线 */
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.el-table__cell) {
  padding: 12px 16px;
  font-size: 14px;
  color: #303133;
}

/* Action Buttons */
.action-button {
  transition: all 0.2s;
}

.action-button:hover {
  transform: scale(1.05);
}

/* Dialog */
.custom-dialog {
  border-radius: 8px;
}

.custom-dialog :deep(.el-dialog__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e8ecef;
  padding: 16px 20px;
  margin-bottom: 0;
}

.custom-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.custom-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

.custom-dialog :deep(.el-button) {
  border-radius: 6px;
  padding: 10px 20px;
}
</style>
