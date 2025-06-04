<template>
  <el-dialog :title="title" v-model="visible" width="50%" draggable>
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="岗位编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入岗位编码" />
      </el-form-item>
      <el-form-item label="岗位名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入岗位名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
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

const rules = {
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
}

// 同步 visible 双向绑定
const visible = ref(props.visible)
watch(
  () => props.visible,
  (val) => {
    visible.value = val
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
)

// 保存表单
const save = async () => {
  await formRef.value.validate()
  emit('save', formData.value)
}
</script>
