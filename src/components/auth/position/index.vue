<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="岗位编码">
          <el-input v-model="queryForm.code" placeholder="请输入岗位编码" @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="queryForm.name" placeholder="请输入岗位名称" @clear="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'post:search'">搜索</el-button>
          <el-button @click="resetForm" v-auth="'post:reset'">重置</el-button>
          <el-button type="primary" @click="showAddDialog" v-auth="'post:add'">新增</el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
            v-auth="'post:delete'"
          >
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        :data="positions"
        style="width: 100%"
        row-key="id"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="code" label="岗位编码" />
        <el-table-column prop="name" label="岗位名称" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showEditDialog(row)"
              v-auth="'post:edit'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row.id)"
              v-auth="'post:delete'"
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
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @save="savePosition"
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
import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddOrUpdate from './add-or-update.vue'

const positions = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({
  id: null,
  code: '',
  name: '',
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  code: '',
  name: '',
})
const selectedRows = ref([])

const showDialog = (title, position = null) => {
  dialogTitle.value = title
  form.value = position
    ? {
        id: position.id,
        code: position.code,
        name: position.name,
      }
    : {
        id: null,
        code: '',
        name: '',
      }
  dialogVisible.value = true
}

const showAddDialog = () => showDialog('新增岗位')

const showEditDialog = async (row) => {
  const position = await service.get(`/api/post/${row.id}`)
  showDialog('编辑岗位', position)
}

const savePosition = async (formData) => {
  if (!formData.id) {
    const positionData = { ...formData }
    delete positionData.id
    await service.post('/api/post', positionData)
  } else {
    const positionData = { ...formData }
    await service.put('/api/post', positionData)
  }
  dialogVisible.value = false
  currentPage.value = 1 // 重置到第一页以显示最新数据
  selectedRows.value = [] // 清空选中状态
  await fetchPositions()
}

const confirmDelete = (id) =>
  ElMessageBox.confirm('确定要删除此岗位吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deletePosition(id))

const deletePosition = async (id) => {
  await service.delete('/api/post', { data: [id] })
  selectedRows.value = [] // 清空选中状态
  await fetchPositions()
  ElMessage.success('删除成功')
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的岗位')
    return
  }
  const names = selectedRows.value.map((row) => row.name).join(', ')
  ElMessageBox.confirm(`确定删除以下岗位吗？${names}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row) => row.id)
      await service.delete('/api/post', { data: ids })
      ElMessage.success('删除成功')
    } finally {
      // 不论成功或失败，都刷新界面
      selectedRows.value = []
      currentPage.value = 1 // 重置到第一页
      await fetchPositions()
    }
  })
}

const fetchPositions = async () => {
  const response = await service.get('/api/post', {
    params: {
      page: currentPage.value - 1, // 0-based page for backend
      size: pageSize.value,
      code: queryForm.value.code || null,
      name: queryForm.value.name || null,
    },
  })
  positions.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  selectedRows.value = [] // 清空选中状态
  fetchPositions()
}

const resetForm = () => {
  queryForm.value = { code: '', name: '' }
  currentPage.value = 1
  selectedRows.value = [] // 清空选中状态
  fetchPositions()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  selectedRows.value = [] // 清空选中状态
  fetchPositions()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  selectedRows.value = [] // 清空选中状态
  fetchPositions()
}

fetchPositions()
</script>
