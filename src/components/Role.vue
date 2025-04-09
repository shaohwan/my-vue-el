<template>
  <div>
    <el-button type="primary" @click="showAddDialog" v-auth="'role:add'">新增角色</el-button>
    <el-table :data="roles" style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="text" @click="showEditDialog(row)" v-auth="'role:edit'">编辑</el-button>
          <el-button type="text" @click="confirmDelete(row.id)" v-auth="'role:delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="权限选择">
          <el-tree
            ref="tree"
            :data="permissionTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="form.permissionIds"
            :default-expand-all="true"
          />
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
    if (response.data.success) {
      roles.value = response.data.data
    }
  } catch (error) {
    console.error('获取角色失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`)
    if (response.data.success) {
      permissionTree.value = response.data.data
    }
  } catch (error) {
    console.error('获取权限树失败:', error)
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
    if (response.data.success) {
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
    console.log('保存时的权限ID:', form.value.permissionIds)

    loading.value = true
    const response = await axios.post(`${apiBaseUrl}/api/role`, {
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      permissionIds: form.value.permissionIds,
    })
    if (response.data.success) {
      dialogVisible.value = false
      fetchRoles()
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败: ' + response.data.message)
    }
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
      // 用户取消删除
    })
}

const deleteRole = async (id) => {
  try {
    loading.value = true
    const response = await axios.delete(`${apiBaseUrl}/api/role/${id}`)
    if (response.data.success) {
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
.el-table {
  margin-top: 20px;
}
</style>
