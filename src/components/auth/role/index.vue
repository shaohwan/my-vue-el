<template>
  <div>
    <div class="control">
      <el-button type="primary" @click="showAddDialog" v-auth="'role:add'">新增角色</el-button>
    </div>
    <div class="table">
      <el-table :data="roles" style="width: 100%" v-loading="loading">
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
const loading = ref(false)

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
  loading.value = true
  try {
    const role = await service.get(`/api/role/${row.id}`)
    showDialog('编辑角色', role)
  } finally {
    loading.value = false
  }
}

const saveRole = async (formData) => {
  loading.value = true
  try {
    const data = { ...formData }
    if (data.id) {
      await service.put('/api/role', data)
    } else {
      await service.post('/api/role', data)
    }
    dialogVisible.value = false
    roles.value = await service.get('/api/role')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id) =>
  ElMessageBox.confirm('确定要删除此角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deleteRole(id))

const deleteRole = async (id) => {
  loading.value = true
  try {
    await service.delete(`/api/role/${id}`)
    roles.value = await service.get('/api/role')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    roles.value = await service.get('/api/role')
    permissionTree.value = await service.get('/api/menu/tree')
  } finally {
    loading.value = false
  }
})
</script>
