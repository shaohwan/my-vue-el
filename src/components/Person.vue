<template>
  <div>
    <!-- 查询表单 -->
    <el-card class="query-card">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="姓名">
          <el-input v-model="queryForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="queryForm.phone" placeholder="请输入电话" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格和分页 -->
    <el-card class="table-card">
      <el-table :data="persons" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="phone" label="Phone" />
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px"
      />
    </el-card>
  </div>
</template>

<style scoped>
.query-card {
  margin-bottom: 20px;
}

.table-card {
  /* 可选样式 */
}

.query-form {
  margin-bottom: 0;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const persons = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const queryForm = ref({
  name: '',
  email: '',
  phone: '',
})

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const fetchPersons = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/api/person`, {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value,
        name: queryForm.value.name || null,
        email: queryForm.value.email || null,
        phone: queryForm.value.phone || null,
      },
    })
    if (response.data.success) {
      persons.value = response.data.data.content
      total.value = response.data.data.page.totalElements
    } else {
      console.error('Failed to fetch persons:', response.data.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  currentPage.value = 1
  fetchPersons()
}

const handleReset = () => {
  queryForm.value = { name: '', email: '', phone: '' }
  currentPage.value = 1
  fetchPersons()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchPersons()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPersons()
}

onMounted(() => {
  fetchPersons()
})
</script>
