<template>
  <div>
    <el-card class="control-card">
      <el-button type="primary" @click="showAddDialog" v-auth="'role:add'">新增角色</el-button>
    </el-card>

    <el-card class="table-card">
      <el-table :data="roles" style="width: 100%" v-loading="loading" class="custom-table">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
              v-auth="'role:edit'"
              class="action-button"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row.id)"
              v-auth="'role:delete'"
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" :rows="4" />
        </el-form-item>
        <el-form-item label="权限选择">
          <el-tree
            ref="tree"
            :data="permissionTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="form.permissionIds"
            default-expand-all
            class="custom-tree"
          >
            <template #default="{ node, data }">
              <div class="custom-tree-node">
                <span class="node-label">{{ data.name }}</span>
              </div>
            </template>
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

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
const formRef = ref(null)
const tree = ref(null)
const rules = { name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }] }
const loading = ref(false)

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/api/role`)
    if (response.data.code == 200) {
      roles.value = response.data.data
    }
  } catch (error) {
    console.error('获取角色失败:', error)
    ElMessage.error('获取角色失败')
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`)
    if (response.data.code == 200) {
      permissionTree.value = response.data.data
    }
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  }
}

const showAddDialog = async () => {
  dialogTitle.value = '新增角色'
  form.value = { id: null, name: '', description: '', permissionIds: [] }
  dialogVisible.value = true
  await nextTick()
  if (tree.value) {
    tree.value.setCheckedKeys([]) // 清空权限树勾选状态
  }
}

const showEditDialog = async (role) => {
  dialogTitle.value = '编辑角色'
  try {
    const response = await axios.get(`${apiBaseUrl}/api/role/${role.id}`)
    if (response.data.code == 200) {
      const roleData = response.data.data
      form.value = {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description || '',
        permissionIds: roleData.permissionIds || [],
      }
      dialogVisible.value = true
      await nextTick()
      const leafIds = form.value.permissionIds.filter((id) => isLeafNode(id))
      tree.value.setCheckedKeys(leafIds)
    }
  } catch (error) {
    console.error('获取角色详情失败:', error)
    ElMessage.error('获取角色详情失败')
  }
}

const isLeafNode = (id) => {
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === id) {
        return !node.children || node.children.length === 0
      }
      if (node.children) {
        const found = findNode(node.children)
        if (found !== null) return found
      }
    }
    return null
  }
  return findNode(permissionTree.value)
}

const saveRole = async () => {
  try {
    await formRef.value.validate()
    const checkedNodes = tree.value.getCheckedNodes(false, true) // 包括父节点和叶子节点
    form.value.permissionIds = checkedNodes.map((node) => node.id)

    loading.value = true
    const data = { ...form.value }
    if (data.id) {
      await axios.put(`${apiBaseUrl}/api/role`, data)
      ElMessage.success('更新成功')
    } else {
      await axios.post(`${apiBaseUrl}/api/role`, data)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchRoles()
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除此角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => deleteRole(id))
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const deleteRole = async (id) => {
  try {
    loading.value = true
    const response = await axios.delete(`${apiBaseUrl}/api/role/${id}`)
    if (response.data.code == 200) {
      fetchRoles()
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败: ' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoles()
  fetchPermissionTree()
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

/* Tree */
.custom-tree {
  padding: 3px 0; /* 进一步减少整体padding */
  width: 100%;
}

/* Tree Node */
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 6px; /* 更紧凑的节点padding */
  box-sizing: border-box;
  background-color: #fff;
  transition: background-color 0.2s;
}

.custom-tree-node:hover {
  background-color: #f5f7fa;
}

.node-label {
  font-size: 13px; /* 减小字体以适应紧凑布局 */
  color: #303133;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fix Element Plus Tree Indentation */
:deep(.el-tree-node__content) {
  height: auto;
  padding: 0;
  align-items: center;
  line-height: 24px; /* 进一步减小行高 */
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
