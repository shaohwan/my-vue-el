<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleQuery">
        <el-form-item label="任务ID">
          <el-input
            v-model.number="queryForm.jobId"
            placeholder="请输入任务ID"
            clearable
            @clear="handleQuery"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input
            v-model="queryForm.jobName"
            placeholder="请输入任务名称"
            clearable
            @clear="handleQuery"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="任务组名">
          <el-select
            v-model="queryForm.jobGroup"
            placeholder="请选择任务组名"
            clearable
            @clear="handleQuery"
            class="search-select"
          >
            <el-option label="默认" value="default" />
            <el-option label="系统" value="systeM" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table :data="logs" style="width: 100%" border>
        <el-table-column prop="jobId" label="任务ID" width="100" />
        <el-table-column prop="jobName" label="任务名称" width="150" />
        <el-table-column label="任务组名" width="100">
          <template #default="{ row }">
            {{
              row.jobGroup.toLowerCase() === 'default'
                ? '默认'
                : row.jobGroup.toLowerCase() === 'system'
                  ? '系统'
                  : row.jobGroup
            }}
          </template>
        </el-table-column>
        <el-table-column label="执行方法" width="200">
          <template #default="{ row }">
            {{ row.beanName + '.' + row.method + '()' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="times" label="时长(ms)" width="120" />
        <el-table-column prop="createTime" label="执行时间" width="180" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button
              size="small"
              type="info"
              @click="showDetailDialog(row)"
              v-auth="'job:log:view'"
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

    <!-- Detail Dialog -->
    <el-dialog title="日志详情" v-model="detailDialogVisible" width="600px">
      <detail
        :visible="detailDialogVisible"
        :log-id="selectedLogId"
        @update:visible="detailDialogVisible = $event"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import service from '@/utils/request'
import Detail from './detail.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible'])

const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  jobId: null,
  jobName: '',
  jobGroup: '',
})
const detailDialogVisible = ref(false)
const selectedLogId = ref(null)

const fetchLogs = async () => {
  const response = await service.get('/api/schedule/log', {
    params: {
      page: currentPage.value - 1,
      size: pageSize.value,
      jobId: queryForm.value.jobId || null,
      jobName: queryForm.value.jobName || null,
      jobGroup: queryForm.value.jobGroup || null,
    },
  })
  logs.value = response.content
  total.value = response.page.totalElements
}

const handleQuery = () => {
  currentPage.value = 1
  fetchLogs()
}

const resetQuery = () => {
  queryForm.value = { jobId: null, jobName: '', jobGroup: '' }
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

const showDetailDialog = (row) => {
  selectedLogId.value = row.id
  detailDialogVisible.value = true
}

// Initial fetch when component is mounted
fetchLogs()
</script>

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
