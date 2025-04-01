<!-- components/AppMain.vue -->
<template>
    <el-main>{{ message }}</el-main>
  </template>
  
  <style scoped>
  .el-main {
    background-color: #e9eef3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }
  </style>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const message = ref('Main')
  
  onMounted(async () => {
    try {
      const response = await axios.get('http://localhost:8889/demo/hello')
      message.value = response.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  })
  </script>
  