<template>
  <el-dialog :title="title" v-model="visible" width="30%" draggable>
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="权限名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入权限名称" />
      </el-form-item>
      <el-form-item label="权限编码" prop="code" v-if="formData.type === 'BUTTON'">
        <el-input v-model="formData.code" placeholder="请输入权限编码" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" @change="handleTypeChange">
          <el-option label="菜单" value="MENU" />
          <el-option label="按钮" value="BUTTON" />
        </el-select>
      </el-form-item>
      <el-form-item label="路径" v-if="formData.type === 'MENU'">
        <el-input v-model="formData.url" placeholder="请输入路径" />
      </el-form-item>
      <el-form-item label="图标" v-if="formData.type === 'MENU'">
        <el-input v-model="formData.icon" placeholder="请输入图标类名" />
      </el-form-item>
      <el-form-item label="父权限" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :props="{ label: 'name', children: 'children', value: 'id' }"
          placeholder="请选择父权限（仅菜单）"
          clearable
          check-strictly
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="formData.orderNum" :min="0" />
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
  menuTree: { type: Array, required: true },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({ ...props.form })
const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [
    {
      validator: (rule, value, callback) => {
        if (formData.value.type === 'BUTTON' && (!value || value.trim() === '')) {
          callback(new Error('按钮权限必须输入权限编码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
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

const handleTypeChange = (type) => {
  if (type === 'BUTTON') {
    formData.value.url = ''
    formData.value.icon = ''
  } else if (type === 'MENU') {
    formData.value.code = ''
  }
  formData.value.parentId = null
}

// 保存表单
const save = async () => {
  await formRef.value.validate()
  emit('save', formData.value)
}
</script>
