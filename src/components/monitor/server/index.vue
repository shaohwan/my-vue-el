<template>
  <div class="monitor-server">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>CPU</span>
          <el-button
            :icon="Refresh"
            size="small"
            circle
            @click="refreshCpuInfo"
            v-auth="'monitor:server:all'"
          />
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="CPU 型号">{{ server.cpu.cpuModel }}</el-descriptions-item>
        <el-descriptions-item label="核心数">{{ server.cpu.cpuNum }}</el-descriptions-item>
        <el-descriptions-item label="用户使用率">{{ server.cpu.used }}%</el-descriptions-item>
        <el-descriptions-item label="系统使用率">{{ server.cpu.sys }}%</el-descriptions-item>
        <el-descriptions-item label="当前空闲率">{{ server.cpu.free }}%</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统内存</span>
          <el-button
            :icon="Refresh"
            size="small"
            circle
            @click="refreshMemInfo"
            v-auth="'monitor:server:all'"
          />
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="内存总量">{{ server.mem.total }} GB</el-descriptions-item>
        <el-descriptions-item label="已用内存">{{ server.mem.used }} GB</el-descriptions-item>
        <el-descriptions-item label="剩余内存">{{ server.mem.free }} GB</el-descriptions-item>
        <el-descriptions-item label="内存使用率">{{ server.mem.usage }}%</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>JVM信息</span>
          <el-button
            :icon="Refresh"
            size="small"
            circle
            @click="refreshJvmInfo"
            v-auth="'monitor:server:all'"
          />
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="名称">{{ server.jvm.name }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ server.jvm.version }}</el-descriptions-item>
        <el-descriptions-item label="厂商">{{ server.jvm.vendor }}</el-descriptions-item>
        <el-descriptions-item label="最大可用内存">{{ server.jvm.max }} GB</el-descriptions-item>
        <el-descriptions-item label="总内存">{{ server.jvm.total }} GB</el-descriptions-item>
        <el-descriptions-item label="已用内存">{{ server.jvm.used }} GB</el-descriptions-item>
        <el-descriptions-item label="空闲内存">{{ server.jvm.free }} GB</el-descriptions-item>
        <el-descriptions-item label="内存使用率">{{ server.jvm.usage }}%</el-descriptions-item>
        <el-descriptions-item label="JVM 路径">{{ server.jvm.home }}</el-descriptions-item>
        <el-descriptions-item label="Jar 路径">{{ server.jvm.userDir }}</el-descriptions-item>
        <el-descriptions-item label="启动时间">{{ server.jvm.startTime }}</el-descriptions-item>
        <el-descriptions-item label="运行时间">{{ server.jvm.runTime }}</el-descriptions-item>
        <el-descriptions-item label="运行参数">{{
          server.jvm.inputArguments.join(', ')
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统信息</span>
          <el-button
            :icon="Refresh"
            size="small"
            circle
            @click="refreshSysInfo"
            v-auth="'monitor:server:all'"
          />
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作系统">{{ server.sys.osName }}</el-descriptions-item>
        <el-descriptions-item label="系统架构">{{ server.sys.osArch }}</el-descriptions-item>
        <el-descriptions-item label="系统版本">{{ server.sys.osVersion }}</el-descriptions-item>
        <el-descriptions-item label="系统名称">{{ server.sys.computerName }}</el-descriptions-item>
        <el-descriptions-item label="系统IP">{{ server.sys.computerIp }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>磁盘信息</span>
          <el-button
            :icon="Refresh"
            size="small"
            circle
            @click="refreshDiskInfo"
            v-auth="'monitor:server:all'"
          />
        </div>
      </template>
      <el-table :data="server.disks" header-align="center" style="width: 100%">
        <el-table-column align="center" prop="diskName" label="磁盘名称" />
        <el-table-column align="center" prop="diskType" label="磁盘类型" />
        <el-table-column align="center" prop="dirName" label="磁盘路径" />
        <el-table-column align="center" prop="total" label="总内存" />
        <el-table-column align="center" prop="used" label="已用内存" />
        <el-table-column align="center" prop="free" label="空闲内存" />
        <el-table-column align="center" prop="usage" label="空间使用率">
          <template #default="scope"> {{ scope.row.usage }}% </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.monitor-server {
  padding: 8px;
}
.monitor-server .box-card {
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
import { reactive, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import service from '@/utils/request'

const server = reactive({
  cpu: {
    cpuModel: '',
    cpuNum: 0,
    used: 0,
    sys: 0,
    free: 0,
  },
  mem: {
    total: 0,
    used: 0,
    free: 0,
    usage: 0,
  },
  jvm: {
    name: '',
    version: '',
    vendor: '',
    max: 0,
    total: 0,
    used: 0,
    free: 0,
    usage: 0,
    home: '',
    userDir: '',
    startTime: '',
    runTime: '',
    inputArguments: [],
  },
  sys: {
    osName: '',
    osArch: '',
    osVersion: '',
    computerName: '',
    computerIp: '',
  },
  disks: [],
})

const getServerInfo = async () => {
  const res = await service.get('/api/monitor/server/info')
  Object.assign(server, res)
}

const refreshCpuInfo = async () => {
  const res = await service.get('/api/monitor/server/cpu')
  server.cpu = res
}

const refreshMemInfo = async () => {
  const res = await service.get('/api/monitor/server/mem')
  server.mem = res
}

const refreshJvmInfo = async () => {
  const res = await service.get('/api/monitor/server/jvm')
  server.jvm = res
}

const refreshSysInfo = async () => {
  const res = await service.get('/api/monitor/server/sys')
  server.sys = res
}

const refreshDiskInfo = async () => {
  const res = await service.get('/api/monitor/server/disk')
  server.disks = res
}

onMounted(() => {
  getServerInfo()
})
</script>
