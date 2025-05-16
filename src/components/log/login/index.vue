<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" @clear="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'log:login:search'"
            >搜索</el-button
          >
          <el-button @click="resetForm" v-auth="'log:login:reset'">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table :data="logs" style="width: 100%" border>
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="ip" label="IP地址" />
        <el-table-column prop="address" label="登录地点" />
        <el-table-column prop="userAgent" label="User Agent" show-overflow-tooltip />
        <el-table-column label="登录状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="110">
          <template #default="{ row }">
            <el-tag
              :type="row.operation === 0 ? 'success' : row.operation === 1 ? 'info' : 'danger'"
            >
              {{ row.operation === 0 ? '登录成功' : row.operation === 1 ? '退出成功' : '账号错误' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
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
  margin-left: 8px; /* 按钮间距 */
}
</style>

<script setup>
import { ref } from 'vue'
import service from '@/utils/request'

const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  username: '',
})

const fetchLogs = async () => {
  const response = await service.get('/api/log/login', {
    params: {
      page: currentPage.value - 1, // 0-based page for backend
      size: pageSize.value,
      username: queryForm.value.username || null,
    },
  })
  logs.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchLogs()
}

const resetForm = () => {
  queryForm.value = { username: '' }
  currentPage.value = 1
  fetchLogs()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchLogs()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLogs()
}

fetchLogs()
</script>
