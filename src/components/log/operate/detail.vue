<template>
  <el-dialog
    title="日志详情"
    v-model="dialogVisible"
    width="600px"
    :before-close="handleClose"
    @closed="handleClosed"
  >
    <el-descriptions v-if="log" :column="2" border>
      <el-descriptions-item label="日志ID">{{ log.id }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ log.username }}</el-descriptions-item>
      <el-descriptions-item label="IP">{{ log.ip }}</el-descriptions-item>
      <el-descriptions-item label="操作名">{{ log.name }}</el-descriptions-item>
      <el-descriptions-item label="模块名">{{ log.module }}</el-descriptions-item>
      <el-descriptions-item label="请求URI">{{ log.requestUri }}</el-descriptions-item>
      <el-descriptions-item label="请求方法">{{ log.requestMethod }}</el-descriptions-item>
      <el-descriptions-item label="登录地点">{{ log.address }}</el-descriptions-item>
      <el-descriptions-item label="操作类型">
        <el-tag
          :type="
            log.type === 1
              ? 'success'
              : log.type === 2
                ? 'info'
                : log.type === 3
                  ? 'warning'
                  : 'danger'
          "
        >
          {{ log.type === 1 ? '新增' : log.type === 2 ? '修改' : log.type === 3 ? '删除' : '其它' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="执行时长">{{ log.duration }}ms</el-descriptions-item>
      <el-descriptions-item label="操作状态">
        <el-tag :type="log.status === 1 ? 'success' : 'danger'">
          {{ log.status === 1 ? '成功' : '失败' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ log.createTime }}</el-descriptions-item>
      <el-descriptions-item label="请求参数" :span="2">
        <el-input
          type="textarea"
          :value="log.requestParameters"
          :rows="4"
          readonly
          placeholder="无请求参数"
          class="params-textarea"
        />
      </el-descriptions-item>
      <el-descriptions-item label="用户代理" :span="2">
        <el-input
          type="textarea"
          :value="log.userAgent"
          :rows="4"
          readonly
          placeholder="无用户代理"
          class="params-textarea"
        />
      </el-descriptions-item>
    </el-descriptions>
    <div v-else class="loading">加载中...</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}
.params-textarea {
  width: 100%;
}
:deep(.params-textarea .el-textarea__inner) {
  background-color: #f5f7fa;
  color: #606266;
  cursor: default;
}
:deep(.el-descriptions__cell) {
  vertical-align: top;
}
</style>

<script setup>
import { ref, watch } from 'vue'
import service from '@/utils/request'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  logId: {
    type: [Number, String],
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const dialogVisible = ref(props.visible)
const log = ref(null)

watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal
    if (newVal) {
      fetchLogDetail()
    }
  },
)

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

const fetchLogDetail = async () => {
  log.value = null // 清空数据，显示加载中
  const response = await service.get(`/api/log/operate/${props.logId}`)
  log.value = response
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleClosed = () => {
  log.value = null // 清空数据
}
</script>
