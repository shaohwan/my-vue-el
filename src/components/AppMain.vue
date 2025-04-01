<!-- components/AppMain.vue -->
<template>
  <el-main>
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
  </el-main>
</template>

<style scoped>
.el-main {
  background-color: #e9eef3;
  color: #333;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const persons = ref([])
const currentPage = ref(1) // Element Plus 从 1 开始计数
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const fetchPersons = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${apiBaseUrl}/api/person`, {
      params: {
        page: currentPage.value - 1, // Spring Boot 从 0 开始计数
        size: pageSize.value,
      },
    })
    if (response.data.success) {
      persons.value = response.data.data.content
      total.value = response.data.data.totalElements
    } else {
      console.error('Failed to fetch persons:', response.data.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
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
