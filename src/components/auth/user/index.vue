<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入邮箱" @clear="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'user:search'">搜索</el-button>
          <el-button @click="resetForm" v-auth="'user:reset'">重置</el-button>
          <el-button type="primary" @click="showAddDialog" v-auth="'user:add'">新增</el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
            v-auth="'user:delete'"
          >
            批量删除
          </el-button>
          <el-button type="success" @click="exportToExcel" v-auth="'user:export'">导出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        :data="users"
        style="width: 100%"
        row-key="id"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="display: flex; justify-content: flex-end; margin-top: 20px"
      />
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
.search {
  padding: 8px;
}
.table {
  padding: 8px;
}
:deep(.el-table__cell) {
  padding: 8px;
  font-size: 14px;
}
:deep(.el-form-item) {
  margin-right: 16px;
}
:deep(.el-button + .el-button) {
  margin-left: 8px; /* 按钮间距 */
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
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
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  username: '',
  email: '',
})
const selectedRows = ref([])

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
        roleIds: user.roles ? user.roles.map((role) => role.id) : [],
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
  const user = await service.get(`/api/user/${row.id}`)
  showDialog('编辑用户', user)
}

const saveUser = async (formData) => {
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
  currentPage.value = 1 // 重置到第一页以显示最新数据
  selectedRows.value = [] // 清空选中状态
  await fetchUsers()
}

const confirmDelete = (id) =>
  ElMessageBox.confirm('确定要删除此用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deleteUser(id))

const deleteUser = async (id) => {
  await service.delete('/api/user', { data: [id] })
  selectedRows.value = [] // 清空选中状态
  await fetchUsers()
  ElMessage.success('删除成功')
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  const usernames = selectedRows.value.map((row) => row.username).join(', ')
  ElMessageBox.confirm(`确定删除以下用户吗？${usernames}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row) => row.id)
      await service.delete('/api/user', { data: ids })
      ElMessage.success('删除成功')
    } finally {
      // 不论成功或失败，都刷新界面
      selectedRows.value = []
      currentPage.value = 1 // 重置到第一页
      await fetchUsers()
    }
  })
}

const fetchUsers = async () => {
  const response = await service.get('/api/user', {
    params: {
      page: currentPage.value - 1, // 0-based page for backend
      size: pageSize.value,
      username: queryForm.value.username || null,
      email: queryForm.value.email || null,
    },
  })
  users.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  selectedRows.value = [] // 清空选中状态
  fetchUsers()
}

const resetForm = () => {
  queryForm.value = { username: '', email: '' }
  currentPage.value = 1
  selectedRows.value = [] // 清空选中状态
  fetchUsers()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  selectedRows.value = [] // 清空选中状态
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  selectedRows.value = [] // 清空选中状态
  fetchUsers()
}

const exportToExcel = async () => {
  const response = await service.get('/api/user/export', {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  // Extract filename from Content-Disposition, fallback to default
  let fileName = response.headers['content-disposition'].split('=')[1]
  const contentDisposition = response.headers['content-disposition']
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/)
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = decodeURIComponent(fileNameMatch[1])
    }
  }
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

onMounted(async () => {
  await fetchUsers()
  const response = await service.get('/api/role')
  roles.value = response.content
})
</script>
