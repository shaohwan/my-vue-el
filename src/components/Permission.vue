<template>
  <div>
    <el-card class="control-card">
      <el-button type="success" @click="handleAdd" v-auth="'permission:add'">新增权限</el-button>
    </el-card>

    <el-card class="tree-card">
      <el-tree
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        default-expand-all
        highlight-current
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span
              >{{ data.name }} {{ data.type === 'BUTTON' ? '(' + data.code + ')' : '' }} -
              {{ data.type }}</span
            >
            <span>
              <el-button
                type="primary"
                size="small"
                @click.stop="handleEdit(data)"
                v-auth="'permission:edit'"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click.stop="handleDelete(data)"
                v-auth="'permission:delete'"
              >
                删除
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <!-- 添加/编辑权限对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
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
        <el-form-item label="路径" prop="path" v-if="permissionForm.type === 'MENU'">
          <el-input v-model="permissionForm.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="组件" prop="component" v-if="permissionForm.type === 'MENU'">
          <el-input v-model="permissionForm.component" placeholder="请输入组件路径" />
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
.control-card {
  margin-bottom: 20px;
}

.tree-card {
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
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
  path: '',
  component: '',
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
  path: [
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
  component: [
    {
      validator: (rule, value, callback) => {
        if (permissionForm.value.type === 'MENU' && !value) {
          callback(new Error('请输入组件路径'))
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
    if (response.data.success) {
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
    if (response.data.success) {
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
    permissionForm.value.path = ''
    permissionForm.value.component = ''
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
    path: '',
    component: '',
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
      path: permissionData.path || '',
      component: permissionData.component || '',
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
        const response = await axios.delete(`${apiBaseUrl}/api/menu/${data.id}`)
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
