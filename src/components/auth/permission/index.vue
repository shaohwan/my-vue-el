<template>
  <div>
    <div class="control">
      <el-button type="success" @click="handleAdd" v-auth="'permission:add'">新增</el-button>
      <el-button type="primary" @click="toggleExpand">
        {{ isAllExpanded ? '全部收起' : '全部展开' }}
        <el-icon class="icon">
          <ArrowUp v-if="isAllExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </div>
    <div class="table">
      <el-table
        ref="tableRef"
        :data="permissionTree"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="custom-table"
        border
      >
        <el-table-column label="名称">
          <template #default="{ row }">
            <span :style="{ 'padding-left': `${row.level * 20}px` }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'MENU' ? 'success' : 'primary'" size="small">
              {{ row.type === 'MENU' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标识" align="center">
          <template #default="{ row }">
            {{ row.code || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="路径" align="center">
          <template #default="{ row }">
            {{ row.url || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-auth="'permission:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-auth="'permission:delete'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <add-or-update
      :title="dialogTitle"
      :form="permissionForm"
      :menu-tree="menuTree"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.control {
  padding: 8px;
}
.table {
  padding: 8px;
  width: 100%;
  overflow: auto;
}
.custom-table {
  width: 100%;
}
.custom-table :deep(.el-table__header th) {
  font-size: 14px;
  padding: 8px 0;
}
.custom-table :deep(.el-table__cell) {
  padding: 8px 0;
  font-size: 14px;
}
.custom-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
:deep(.el-button + .el-button) {
  margin-left: 8px; /* 按钮间距 */
}
.icon {
  margin-left: 4px; /* 图标与文本间距 */
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import service from '@/utils/request'
import { ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import AddOrUpdate from './add-or-update.vue'

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
const tableRef = ref(null)
const isAllExpanded = ref(true)

const showDialog = async (title, permission = null) => {
  dialogTitle.value = title
  permissionForm.value = permission
    ? {
        id: permission.id,
        name: permission.name,
        code: permission.code || '',
        type: permission.type,
        url: permission.url || '',
        icon: permission.icon || '',
        parentId: permission.parentId || (permission.parent ? permission.parent.id : null),
        orderNum: permission.orderNum,
      }
    : {
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

const handleAdd = () => showDialog('新增权限')

const handleEdit = async (data) => {
  const permission = await service.get(`/api/menu/${data.id}`)
  showDialog('编辑权限', permission)
}

const handleSave = async (formData) => {
  const data = { ...formData }
  if (data.type === 'MENU') {
    delete data.code
  }
  if (data.id) {
    await service.put('/api/menu', data)
  } else {
    await service.post('/api/menu', data)
  }
  dialogVisible.value = false
  fetchPermissionTree()
}

const handleDelete = (data) =>
  ElMessageBox.confirm(
    `确定删除权限 "${data.name}" 吗？${data.children && data.children.length > 0 ? '此操作将同时删除其子权限' : ''}`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => deletePermission(data.id))

const deletePermission = async (id) => {
  await service.delete(`/api/menu/${id}`)
  fetchPermissionTree()
}

const fetchPermissionTree = async () => {
  const response = await service.get('/api/menu/tree')
  permissionTree.value = response
  menuTree.value = filterMenuTree(response)
}

const filterMenuTree = (tree) => {
  return tree
    .filter((node) => node.type === 'MENU')
    .map((node) => ({
      ...node,
      children: node.children ? filterMenuTree(node.children) : [],
    }))
}

const toggleExpand = () => {
  isAllExpanded.value = !isAllExpanded.value
  permissionTree.value.forEach((row) => {
    tableRef.value.toggleRowExpansion(row, isAllExpanded.value)
  })
}

onMounted(() => {
  fetchPermissionTree()
})
</script>
