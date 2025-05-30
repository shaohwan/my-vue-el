<template>
  <div class="monitor-cache">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="Redis版本">{{
          cache.info.redis_version
        }}</el-descriptions-item>
        <el-descriptions-item label="运行模式">{{
          cache.info.redis_mode === 'standalone' ? '单机' : '集群'
        }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ cache.info.tcp_port }}</el-descriptions-item>
        <el-descriptions-item label="客户端">{{
          cache.info.connected_clients
        }}</el-descriptions-item>
        <el-descriptions-item label="运行时间（天）">{{
          cache.info.uptime_in_days
        }}</el-descriptions-item>
        <el-descriptions-item label="Key数量">{{ cache.keyCount }}</el-descriptions-item>
        <el-descriptions-item label="最大内存配置">{{
          cache.info.maxmemory_human
        }}</el-descriptions-item>
        <el-descriptions-item label="使用CPU"
          >{{ cache.info.used_cpu_user_children }}%</el-descriptions-item
        >
        <el-descriptions-item label="已用内存">{{
          cache.info.used_memory_human
        }}</el-descriptions-item>
        <el-descriptions-item label="AOF是否开启">{{
          cache.info.aof_enabled === '0' ? '否' : '是'
        }}</el-descriptions-item>
        <el-descriptions-item label="RDB是否成功">{{
          cache.info.rdb_last_bgsave_status
        }}</el-descriptions-item>
        <el-descriptions-item label="网络入口/出口">
          {{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>命令统计</span>
        </div>
      </template>
      <el-table :data="cache.commandStats" header-align="center" style="width: 100%">
        <el-table-column align="center" prop="name" label="属性" />
        <el-table-column align="center" prop="value" label="值" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.monitor-cache {
  padding: 8px;
}
.monitor-cache .box-card {
  margin-bottom: 18px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header span {
  font-size: 16px;
  font-weight: bold;
}
:deep(.el-descriptions__label) {
  width: 120px !important;
  font-size: 14px;
}
:deep(.el-descriptions__content) {
  width: 380px !important;
  font-size: 14px;
}
:deep(.el-table__cell) {
  padding: 8px;
  font-size: 14px;
}
:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import service from '@/utils/request'

const cache = ref({
  info: {
    redis_version: '',
    redis_mode: 'standalone',
    tcp_port: '6379',
    connected_clients: '1',
    uptime_in_days: '0',
    used_memory_human: '0',
    used_cpu_user_children: '0.00',
    maxmemory_human: '0',
    aof_enabled: '0',
    rdb_last_bgsave_status: 'ok',
    instantaneous_input_kbps: '0.00',
    instantaneous_output_kbps: '0.00',
  },
  keyCount: 0,
  commandStats: [],
})

const getCacheInfo = async () => {
  const res = await service.get('/api/monitor/cache/info')
  cache.value = res
}

onMounted(() => {
  getCacheInfo()
})
</script>
