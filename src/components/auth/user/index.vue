<template>
  <div>
    <div class="control">
      <el-button type="primary" @click="showAddDialog" v-auth="'user:add'">新增用户</el-button>
    </div>
    <div class="table">
      <el-table :data="users" style="width: 100%" v-loading="loading">
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
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row.id)"
              v-auth="'user:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <add-or-update
      :title="dialogTitle"
      :form="form"
      :roles="roles"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @save="saveUser"
    />
  </div>
</template>

<style scoped>
.control {
  padding: 8px;
}
.table {
  padding: 8px;
}
:deep(.el-table__cell) {
  padding: 8px;
  font-size: 14px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import service from '@/utils/request'
import { ElMessageBox } from 'element-plus'
import AddOrUpdate from './add-or-update.vue'

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
const loading = ref(false)

const showDialog = (title, user = null) => {
  dialogTitle.value = title
  form.value = user
    ? {
        id: user.id,
        username: user.username,
        password: '',
        realName: user.realName,
        email: user.email || '',
        phone: user.phone || '',
        enabled: user.enabled,
        roleIds: user.roles.map((role) => role.id),
      }
    : {
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

const showAddDialog = () => showDialog('新增用户')

const showEditDialog = async (row) => {
  loading.value = true
  try {
    const user = await service.get(`/api/user/${row.id}`)
    showDialog('编辑用户', user)
  } finally {
    loading.value = false
  }
}

const saveUser = async (formData) => {
  loading.value = true
  try {
    if (!formData.id) {
      const userData = { ...formData }
      delete userData.id
      await service.post('/api/user', userData)
    } else {
      const userData = { ...formData }
      delete userData.password
      await service.put('/api/user', userData)
    }
    dialogVisible.value = false
    users.value = await service.get('/api/user')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id) =>
  ElMessageBox.confirm('确定要删除此用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deleteUser(id))

const deleteUser = async (id) => {
  loading.value = true
  try {
    await service.delete(`/api/user/${id}`)
    users.value = await service.get('/api/user')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    users.value = await service.get('/api/user')
    roles.value = await service.get('/api/role')
  } finally {
    loading.value = false
  }
})
</script>
