<template>
  <el-dialog :title="title" v-model="visible" width="500px" draggable>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="formData.jobName" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="formData.jobGroup" placeholder="请选择任务组名" style="width: 100%">
          <el-option label="默认" value="DEFAULT" />
          <el-option label="系统" value="SYSTEM" />
        </el-select>
      </el-form-item>
      <el-form-item label="Bean名称" prop="beanName">
        <el-input v-model="formData.beanName" placeholder="请输入Bean名称" />
      </el-form-item>
      <el-form-item label="方法名" prop="method">
        <el-input v-model="formData.method" placeholder="请输入方法名" />
      </el-form-item>
      <el-form-item label="参数" prop="params">
        <el-input v-model="formData.params" placeholder="请输入参数" />
      </el-form-item>
      <el-form-item label="Cron表达式" prop="cronExpression">
        <el-input v-model="formData.cronExpression" placeholder="请输入Cron表达式" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  form: { type: Object, required: true },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({ ...props.form })
const formRef = ref(null)
const loading = ref(false)

const rules = {
  jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  jobGroup: [{ required: true, message: '请输入任务组名', trigger: 'blur' }],
  beanName: [{ required: true, message: '请输入Bean名称', trigger: 'blur' }],
  method: [{ required: true, message: '请输入方法名', trigger: 'blur' }],
  cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }],
}

// 同步 visible 双向绑定
const visible = ref(props.visible)
watch(
  () => props.visible,
  (val) => {
    visible.value = val
    if (!val) {
      formRef.value?.resetFields()
    }
  },
)
watch(visible, (val) => {
  emit('update:visible', val)
})

// 同步 form 数据
watch(
  () => props.form,
  (val) => {
    formData.value = { ...val }
  },
  { deep: true },
)

// 保存表单
const save = async () => {
  await formRef.value.validate()
  emit('save', formData.value)
}
</script>

<style scoped>
:deep(.el-form-item) {
  margin-right: 16px;
}
:deep(.el-button + .el-button) {
  margin-left: 8px;
}
</style>
