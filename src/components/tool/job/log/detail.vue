<template>
  <el-dialog title="任务日志详情" v-model="dialogVisible" width="600px" :before-close="handleClose">
    <el-descriptions v-if="log" :column="2" border>
      <el-descriptions-item label="日志ID">{{ log.id }}</el-descriptions-item>
      <el-descriptions-item label="任务ID">{{ log.jobId }}</el-descriptions-item>
      <el-descriptions-item label="任务名称">{{ log.jobName }}</el-descriptions-item>
      <el-descriptions-item label="任务组名">
        {{
          log.jobGroup.toLowerCase() === 'default'
            ? '默认'
            : log.jobGroup.toLowerCase() === 'system'
              ? '系统'
              : log.jobGroup
        }}
      </el-descriptions-item>
      <el-descriptions-item label="Bean名称">{{ log.beanName }}</el-descriptions-item>
      <el-descriptions-item label="方法名称">{{ log.method }}</el-descriptions-item>
      <el-descriptions-item label="执行时长">{{ log.times }}ms</el-descriptions-item>
      <el-descriptions-item label="执行时间">{{ log.createTime }}</el-descriptions-item>
      <el-descriptions-item label="任务状态">
        <el-tag :type="log.status === 1 ? 'success' : 'danger'">
          {{ log.status === 1 ? '成功' : '失败' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="方法参数" :span="2">
        <el-input
          type="textarea"
          :value="log.params"
          :rows="4"
          readonly
          placeholder="无参数"
          class="params-textarea"
        />
      </el-descriptions-item>
      <el-descriptions-item label="错误信息" :span="2">
        <el-input
          type="textarea"
          :value="log.error"
          :rows="4"
          readonly
          placeholder="无错误信息"
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
  const response = await service.get(`/api/schedule/log/${props.logId}`)
  log.value = response
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>
