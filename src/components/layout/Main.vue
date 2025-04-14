<template>
  <el-main class="custom-main">
    <router-view />
  </el-main>
</template>

<style scoped>
.custom-main {
  flex: 1; /* 填充父容器 */
  display: flex; /* 使router-view可伸展 */
  flex-direction: column; /* 垂直布局 */
  background: transparent; /* 继承layout的白色卡片 */
  color: #303133; /* 一致文本颜色 */
  padding: 0; /* 无内边距，交给子组件 */
  min-height: 0; /* 防止flex溢出 */
}

/* Ensure router-view content stretches */
:deep(.router-view) {
  flex: 1; /* 填充整个main */
  display: flex;
  flex-direction: column;
  margin-top: 0; /* 防止子组件顶端间距 */
}
</style>

<script setup>
// 无需额外逻辑，路由视图会自动渲染
</script>
