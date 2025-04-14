<template>
  <div>
    <el-card class="control-card">
      <el-button type="success" @click="handleAdd" v-auth="'permission:add'">新增权限</el-button>
    </el-card>

    <el-card class="tree-card">
      <!-- 列头 -->
      <div class="tree-header">
        <span class="header-label">名称</span>
        <span class="header-type">类型</span>
        <span class="header-code">标识</span>
        <span class="header-url">路径</span>
        <span class="header-actions">操作</span>
      </div>
      <!-- 树形结构 -->
      <el-tree
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        default-expand-all
        highlight-current
        class="custom-tree"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="node-label">{{ data.name }}</span>
            <span class="node-type">
              <el-tag :type="data.type === 'MENU' ? 'success' : 'primary'" size="small">
                {{ data.type === 'MENU' ? '菜单' : '按钮' }}
              </el-tag>
            </span>
            <span class="node-code">{{ data.code || '-' }}</span>
            <span class="node-url">{{ data.url || '-' }}</span>
            <span class="node-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="handleEdit(data)"
                v-auth="'permission:edit'"
                class="action-button"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click.stop="handleDelete(data)"
                v-auth="'permission:delete'"
                class="action-button"
              >
                删除
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>

    <!-- 添加/编辑权限对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%" class="custom-dialog">
      <el-form :model="permissionForm" :rules="rules" ref="permissionFormRef" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code" v-if="permissionForm.type === 'BUTTON'">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="permissionForm.type"
            placeholder="请选择类型"
            @change="handleTypeChange"
          >
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="url" v-if="permissionForm.type === 'MENU'">
          <el-input v-model="permissionForm.url" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="图标" v-if="permissionForm.type === 'MENU'">
          <el-input v-model="permissionForm.icon" placeholder="请输入图标类名" />
        </el-form-item>
        <el-form-item label="父权限" prop="parentId">
          <el-tree-select
            v-model="permissionForm.parentId"
            :data="menuTree"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            placeholder="请选择父权限（仅菜单）"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="permissionForm.orderNum" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

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

/* Tree Card */
.tree-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-tree {
  padding: 10px 0;
  width: 100%;
}

/* Tree Header */
.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e8ecef;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.header-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-type {
  width: 80px;
  text-align: center;
  flex-shrink: 0;
}

.header-code {
  width: 120px; /* 标识列宽度 */
  text-align: left;
  flex-shrink: 0;
}

.header-url {
  width: 200px; /* 路径列宽度 */
  text-align: left;
  flex-shrink: 0;
}

.header-actions {
  width: 140px;
  text-align: right;
  flex-shrink: 0;
}

/* Tree Node */
.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid #e8ecef;
  background-color: #fff;
  transition: background-color 0.2s;
}

.custom-tree-node:hover {
  background-color: #f5f7fa;
}

.node-label {
  font-size: 14px;
  color: #303133;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-type {
  width: 80px;
  text-align: center;
  flex-shrink: 0;
}

.node-code {
  font-size: 14px;
  color: #606266;
  width: 120px; /* 与列头标识列对齐 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.node-url {
  font-size: 14px;
  color: #606266;
  width: 200px; /* 与列头路径列对齐 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.node-actions {
  display: flex;
  gap: 8px;
  width: 140px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-button {
  transition: all 0.2s;
}

.action-button:hover {
  transform: scale(1.05);
}

/* Fix Element Plus Tree Indentation */
:deep(.el-tree-node__content) {
  height: auto;
  padding: 0;
  align-items: center;
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

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const permissionTree = ref([])
const menuTree = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const permissionForm = ref({
  id: null,
  name: '',
  code: '',
  type: 'MENU',
  url: '',
  icon: '',
  parentId: null,
  orderNum: 0,
})
const permissionFormRef = ref(null)

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [
    {
      validator: (rule, value, callback) => {
        if (permissionForm.value.type === 'BUTTON' && (!value || value.trim() === '')) {
          callback(new Error('按钮权限必须输入权限编码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  url: [
    {
      validator: (rule, value, callback) => {
        if (permissionForm.value.type === 'MENU' && !value) {
          callback(new Error('请输入路径'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// 获取权限树
const fetchPermissionTree = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/tree`)
    if (response.data.code == 200) {
      permissionTree.value = response.data.data
      menuTree.value = filterMenuTree(response.data.data)
    } else {
      ElMessage.error('获取权限树失败')
    }
  } catch (error) {
    ElMessage.error('请求失败')
    console.error(error)
  }
}

// 获取单个权限详情
const fetchPermissionDetail = async (id) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/api/menu/${id}`)
    if (response.data.code == 200) {
      return response.data.data
    } else {
      ElMessage.error('获取权限详情失败')
      return null
    }
  } catch (error) {
    ElMessage.error('请求权限详情失败')
    console.error(error)
    return null
  }
}

// 过滤出仅包含 MENU 类型的树
const filterMenuTree = (tree) => {
  return tree
    .filter((node) => node.type === 'MENU')
    .map((node) => ({
      ...node,
      children: node.children ? filterMenuTree(node.children) : [],
    }))
}

// 类型切换时重置相关字段
const handleTypeChange = (type) => {
  if (type === 'BUTTON') {
    permissionForm.value.url = ''
    permissionForm.value.icon = ''
  } else if (type === 'MENU') {
    permissionForm.value.code = ''
  }
  permissionForm.value.parentId = null
}

// 新增权限
const handleAdd = () => {
  dialogTitle.value = '新增权限'
  permissionForm.value = {
    id: null,
    name: '',
    code: '',
    type: 'MENU',
    url: '',
    icon: '',
    parentId: null,
    orderNum: 0,
  }
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = async (data) => {
  dialogTitle.value = '编辑权限'
  const permissionData = await fetchPermissionDetail(data.id)
  if (permissionData) {
    permissionForm.value = {
      id: permissionData.id,
      name: permissionData.name,
      code: permissionData.code || '',
      type: permissionData.type,
      url: permissionData.url || '',
      icon: permissionData.icon || '',
      parentId:
        permissionData.parentId || (permissionData.parent ? permissionData.parent.id : null),
      orderNum: permissionData.orderNum,
    }
    dialogVisible.value = true
  }
}

// 保存权限
const handleSave = () => {
  permissionFormRef.value.validate(async (valid) => {
    if (valid) {
      const data = { ...permissionForm.value }
      if (data.type === 'MENU') {
        delete data.code // 删除 code 字段
      }
      try {
        if (data.id) {
          await axios.put(`${apiBaseUrl}/api/menu`, data)
          ElMessage.success('更新成功')
        } else {
          await axios.post(`${apiBaseUrl}/api/menu`, data)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchPermissionTree()
      } catch (error) {
        ElMessage.error('保存失败')
        console.error(error)
      }
    }
  })
}

// 删除权限
const handleDelete = (data) => {
  ElMessageBox.confirm(
    `确定删除权限 "${data.name}" 吗？${data.children && data.children.length > 0 ? '此操作将同时删除其子权限' : ''}`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        const response = await axios.delete(`${apiBaseUrl}/api/menu/${id}`)
        ElMessage.success(response.data || '删除成功')
        fetchPermissionTree()
      } catch (error) {
        if (error.response && error.response.data) {
          ElMessage.error(error.response.data || '删除失败')
        } else {
          ElMessage.error('删除失败')
        }
        console.error(error)
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

onMounted(() => {
  fetchPermissionTree()
})
</script>
