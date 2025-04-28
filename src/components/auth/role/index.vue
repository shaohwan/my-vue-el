<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="角色名称">
          <el-input v-model="queryForm.name" placeholder="请输入角色名称" @clear="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'role:search'">搜索</el-button>
          <el-button @click="resetForm" v-auth="'role:reset'">重置</el-button>
          <el-button type="primary" @click="showAddDialog" v-auth="'role:add'">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table :data="roles" style="width: 100%">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
              v-auth="'role:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row.id)"
              v-auth="'role:delete'"
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
      :permission-tree="permissionTree"
      :tree-props="treeProps"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @save="saveRole"
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
</style>

<script setup>
import { ref, onMounted } from 'vue'
import service from '@/utils/request'
import { ElMessageBox } from 'element-plus'
import AddOrUpdate from './add-or-update.vue'

const roles = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  id: null,
  name: '',
  description: '',
  permissionIds: [],
})
const permissionTree = ref([])
const treeProps = { label: 'name', children: 'children' }
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  name: '',
})

const showDialog = (title, role = null) => {
  dialogTitle.value = title
  form.value = role
    ? {
        id: role.id,
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissionIds || [],
      }
    : {
        id: null,
        name: '',
        description: '',
        permissionIds: [],
      }
  dialogVisible.value = true
}

const showAddDialog = () => showDialog('新增角色')

const showEditDialog = async (row) => {
  const role = await service.get(`/api/role/${row.id}`)
  showDialog('编辑角色', role)
}

const saveRole = async (formData) => {
  const data = { ...formData }
  if (data.id) {
    await service.put('/api/role', data)
  } else {
    await service.post('/api/role', data)
  }
  dialogVisible.value = false
  currentPage.value = 1 // 重置到第一页以显示最新数据
  await fetchRoles()
}

const confirmDelete = (id) =>
  ElMessageBox.confirm('确定要删除此角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deleteRole(id))

const deleteRole = async (id) => {
  await service.delete(`/api/role/${id}`)
  fetchRoles()
}

const fetchRoles = async () => {
  const response = await service.get('/api/role', {
    params: {
      page: currentPage.value - 1, // 0-based page for backend
      size: pageSize.value,
      name: queryForm.value.name || null,
    },
  })
  roles.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchRoles()
}

const resetForm = () => {
  queryForm.value = { name: '' }
  currentPage.value = 1
  fetchRoles()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchRoles()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRoles()
}

onMounted(async () => {
  await fetchRoles()
  permissionTree.value = await service.get('/api/menu/tree')
})
</script>
