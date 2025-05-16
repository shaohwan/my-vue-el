<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="文件名">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入文件名"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="存储平台">
          <el-input
            v-model="queryForm.platform"
            placeholder="请输入存储平台"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item>
          <el-upload
            :http-request="customUpload"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            v-auth="'file:upload'"
          >
            <el-button type="primary" v-auth="'file:upload'">上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'file:search'">搜索</el-button>
          <el-button @click="resetForm" v-auth="'file:reset'">重置</el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
            v-auth="'file:delete'"
          >
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table :data="files" style="width: 100%" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="文件名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="platform" label="存储平台" width="120" />
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="180" />
        <el-table-column prop="url" label="文件地址" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleDownload(row)"
              v-auth="'file:download'"
            >
              下载
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="confirmDelete(row)"
              v-auth="'file:delete'"
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
  margin-left: 8px;
}
:deep(.search-input) {
  width: 200px;
}
:deep(.el-pagination .el-input) {
  width: 80px;
}
</style>

<script setup>
import { ref } from 'vue'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const files = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  name: '',
  platform: '',
})
const selectedRows = ref([])

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const fetchFiles = async () => {
  const response = await service.get('/api/file', {
    params: {
      page: currentPage.value - 1,
      size: pageSize.value,
      name: queryForm.value.name || null,
      platform: queryForm.value.platform || null,
    },
  })
  files.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1
  selectedRows.value = []
  fetchFiles()
}

const resetForm = () => {
  queryForm.value = { name: '', platform: '' }
  currentPage.value = 1
  selectedRows.value = []
  fetchFiles()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  selectedRows.value = []
  fetchFiles()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  selectedRows.value = []
  fetchFiles()
}

const handleUploadSuccess = (response) => {
  ElMessage.success('文件上传成功')
  fetchFiles()
}

const handleUploadError = (error) => {
  ElMessage.error(error.message || '文件上传失败，请重试')
}

const beforeUpload = (file) => {
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const customUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  await service.post('/api/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

const handleDownload = async (row) => {
  const response = await service.get(`/api/file/download/${row.id}`, {
    responseType: 'blob',
  })
  const contentDisposition = response.headers['content-disposition']
  let filename = row.name
  if (contentDisposition) {
    const filenameMatch =
      contentDisposition.match(/filename\*=UTF-8''(.+)/) ||
      contentDisposition.match(/filename="(.+)"/)
    if (filenameMatch) {
      filename = decodeURIComponent(filenameMatch[1])
    }
  }
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  ElMessage.success('文件下载成功')
}

const confirmDelete = (row) =>
  ElMessageBox.confirm(`确定要删除此文件吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => deleteFile(row.id))

const deleteFile = async (id) => {
  await service.delete('/api/file', { data: [id] })
  selectedRows.value = []
  await fetchFiles()
  ElMessage.success('删除成功')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的文件')
    return
  }
  const filenames = selectedRows.value.map((row) => row.name).join(', ')
  ElMessageBox.confirm(`确定删除以下文件吗？${filenames}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row) => row.id)
      await service.delete('/api/file', { data: ids })
      ElMessage.success('删除成功')
    } finally {
      selectedRows.value = []
      currentPage.value = 1
      await fetchFiles()
    }
  })
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let formattedSize = size
  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024
    index++
  }
  return `${formattedSize.toFixed(2)} ${units[index]}`
}

fetchFiles()
</script>
