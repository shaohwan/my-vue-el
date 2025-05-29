<template>
  <div>
    <div class="search">
      <el-form :inline="true" :model="queryForm" @submit.prevent="handleSearch">
        <el-form-item label="任务名称">
          <el-input
            v-model="queryForm.jobName"
            placeholder="请输入任务名称"
            clearable
            @clear="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="任务组名">
          <el-select
            v-model="queryForm.jobGroup"
            placeholder="请选择任务组名"
            clearable
            @clear="handleSearch"
            class="search-select"
          >
            <el-option label="默认" value="DEFAULT" />
            <el-option label="系统" value="SYSTEM" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择任务状态"
            clearable
            @clear="handleSearch"
            class="search-select"
          >
            <el-option label="正常" :value="1" />
            <el-option label="暂停" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" v-auth="'job:search'">搜索</el-button>
          <el-button @click="resetForm" v-auth="'job:reset'">重置</el-button>
          <el-button type="success" @click="showAddDialog" v-auth="'job:add'">新增</el-button>
          <el-button type="info" @click="showLogDrawer" v-auth="'job:log:search'"
            >任务日志</el-button
          >
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="batchDeleteJobs"
            v-auth="'job:delete'"
          >
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table :data="jobs" style="width: 100%" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="jobName" label="任务名称" />
        <el-table-column label="任务组名">
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
        <el-table-column prop="cronExpression" label="Cron表达式" show-overflow-tooltip />
        <el-table-column label="任务状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '暂停' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" type="info" @click="showEditDialog(row)" v-auth="'job:edit'"
              >修改</el-button
            >
            <el-button
              size="small"
              :type="row.status === 0 ? 'warning' : 'success'"
              @click="toggleStatus(row)"
              v-auth="'job:change-status'"
            >
              {{ row.status === 1 ? '暂停' : '恢复' }}
            </el-button>
            <el-button size="small" type="primary" @click="runJob(row)" v-auth="'job:run'"
              >执行</el-button
            >
            <el-button size="small" type="danger" @click="deleteJob(row)" v-auth="'job:delete'"
              >删除</el-button
            >
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

    <!-- Add/Edit Dialog -->
    <add-or-update
      :title="dialogTitle"
      :form="formData"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      @save="submitForm"
    />

    <!-- Job Log Drawer -->
    <el-drawer
      v-model="logDrawerVisible"
      title="任务日志"
      direction="rtl"
      :size="1100"
      header-class="drawer-header"
    >
      <el-divider />
      <job-log :visible="logDrawerVisible" @update:visible="logDrawerVisible = $event" />
    </el-drawer>
  </div>
</template>

<style scoped>
.search {
  padding: 8px;
}
.table {
  padding: 8px;
}
:deep(.el-drawer__header) {
  margin-bottom: 0px;
  margin-top: 0px;
}
:deep(.el-divider) {
  margin-bottom: 22px;
  margin-top: 0px;
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
import { ElMessage, ElMessageBox } from 'element-plus'
import AddOrUpdate from './add-or-update.vue'
import JobLog from './log/index.vue'

const jobs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const queryForm = ref({
  jobName: '',
  jobGroup: '',
  status: null,
})
const dialogVisible = ref(false)
const dialogTitle = ref('新增任务')
const formData = ref({
  id: null,
  jobName: '',
  jobGroup: '',
  beanName: '',
  method: '',
  params: '',
  cronExpression: '',
  remark: '',
})
const selectedRows = ref([])
const logDrawerVisible = ref(false)

const fetchJobs = async () => {
  const response = await service.get('/api/schedule', {
    params: {
      page: currentPage.value - 1,
      size: pageSize.value,
      jobName: queryForm.value.jobName || null,
      jobGroup: queryForm.value.jobGroup || null,
      status: queryForm.value.status !== null ? queryForm.value.status : null,
    },
  })
  jobs.value = response.content
  total.value = response.page.totalElements
}

const handleSearch = () => {
  currentPage.value = 1
  selectedRows.value = []
  fetchJobs()
}

const resetForm = () => {
  queryForm.value = { jobName: '', jobGroup: '', status: null }
  currentPage.value = 1
  selectedRows.value = []
  fetchJobs()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  selectedRows.value = []
  fetchJobs()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  selectedRows.value = []
  fetchJobs()
}

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const showAddDialog = () => {
  dialogTitle.value = '新增任务'
  formData.value = {
    id: null,
    jobName: '',
    jobGroup: '',
    beanName: '',
    method: '',
    params: '',
    cronExpression: '',
    remark: '',
  }
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  dialogTitle.value = '修改任务'
  formData.value = { ...row }
  dialogVisible.value = true
}

const submitForm = async (formData) => {
  const url = formData.id ? '/api/schedule' : '/api/schedule'
  const method = formData.id ? 'put' : 'post'
  await service[method](url, formData)
  ElMessage.success(`${dialogTitle.value}成功`)
  dialogVisible.value = false
  fetchJobs()
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 0 ? 1 : 0
  await service.put('/api/schedule/change-status', { id: row.id, status: newStatus })
  ElMessage.success(`任务${newStatus === 1 ? '恢复' : '暂停'}成功`)
  fetchJobs()
}

const runJob = async (row) => {
  await service.put('/api/schedule/run', row)
  ElMessage.success('任务执行成功')
}

const deleteJob = async (row) => {
  await ElMessageBox.confirm('确定删除该任务?', '警告', { type: 'warning' })
  await service.delete('/api/schedule', { data: [row.id] })
  ElMessage.success('删除成功')
  fetchJobs()
}

const batchDeleteJobs = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的任务')
    return
  }
  const jobNames = selectedRows.value.map((row) => row.jobName).join(', ')
  await ElMessageBox.confirm(`确定删除以下任务吗？${jobNames}`, '警告', { type: 'warning' })
  await service.delete('/api/schedule', { data: selectedRows.value.map((row) => row.id) })
  ElMessage.success('删除成功')
  selectedRows.value = []
  currentPage.value = 1
  fetchJobs()
}

const showLogDrawer = () => {
  logDrawerVisible.value = true
}

fetchJobs()
</script>
