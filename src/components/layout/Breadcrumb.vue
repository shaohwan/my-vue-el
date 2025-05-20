<template>
  <el-breadcrumb separator=">">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbItems"
      :key="item.path"
      :to="index === breadcrumbItems.length - 1 ? null : item.path"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped></style>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// 获取当前路由
const router = useRouter()

// 从当前路由的 meta.breadcrumb 获取面包屑数据
const breadcrumbItems = computed(() => {
  return router.currentRoute.value.meta?.breadcrumb || []
})
</script>
