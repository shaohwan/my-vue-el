<template>
  <div>
    <el-button type="primary" @click="goToDruid">查看SQL监控</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    goToDruid() {
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/druid/`
    },
  },
}
</script>

<style scoped>
/* 自定义样式 */
</style>
