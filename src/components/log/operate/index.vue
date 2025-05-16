<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="用户名">
          <el-input
            v-model="queryForm.username"
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="模块名">
          <el-input
            v-model="queryForm.module"
            placeholder="请输入模块名"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="请求URI">
          <el-input
            v-model="queryForm.requestUri"
            placeholder="请输入请求URI"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择操作状态"
            clearable
            @clear="handleSearch"
            class="search-select"
          >
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'log:operate:search'"
            >搜索</el-button
          >
          <el-button @click="resetForm" v-auth="'log:operate:reset'">重置</el-button>
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
        <el-table-column prop="module" label="模块名" />
        <el-table-column prop="requestUri" label="请求URI" show-overflow-tooltip />
        <el-table-column prop="requestMethod" label="请求方法" width="100" />
        <el-table-column prop="address" label="登录地点" show-overflow-tooltip />
        <el-table-column label="操作类型" width="110">
          <template #default="{ row }">
            <el-tag
              :type="
                row.type === 1
                  ? 'success'
                  : row.type === 2
                    ? 'info'
                    : row.type === 3
                      ? 'warning'
                      : 'danger'
              "
            >
              {{
                row.type === 1 ? '新增' : row.type === 2 ? '修改' : row.type === 3 ? '删除' : '其它'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="执行时长" width="120">
          <template #default="{ row }"> {{ row.duration }}ms </template>
        </el-table-column>
        <el-table-column label="操作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showDetail(row)"
              v-auth="'log:operate:view'"
            >
              详情
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

    <detail
      :visible="detailVisible"
      :log-id="selectedLogId"
      @update:visible="detailVisible = $event"
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
  margin-left: 8px;
}
:deep(.search-input) {
  width: 200px;
}
:deep(.search-select) {
  width: 200px;
}
:deep(.el-pagination .el-input) {
  width: 80px;
}
</style>

<script setup>
import { ref } from 'vue'
import service from '@/utils/request'
import Detail from './detail.vue'

const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  username: '',
  module: '',
  requestUri: '',
  status: null,
})
const detailVisible = ref(false)
const selectedLogId = ref(null)

const fetchLogs = async () => {
  const response = await service.get('/api/log/operate', {
    params: {
      page: currentPage.value - 1, // 后端分页从0开始
      size: pageSize.value,
      username: queryForm.value.username || null,
      module: queryForm.value.module || null,
      requestUri: queryForm.value.requestUri || null,
      status: queryForm.value.status !== null ? queryForm.value.status : null,
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
  queryForm.value = { username: '', module: '', requestUri: '', status: null }
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

const showDetail = (row) => {
  selectedLogId.value = row.id
  detailVisible.value = true
}

fetchLogs()
</script>
