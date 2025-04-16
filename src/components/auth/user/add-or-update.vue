<template>
  <el-dialog :title="title" v-model="visible" width="50%" draggable>
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!formData.id">
        <el-input
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入电话" />
      </el-form-item>
      <el-form-item label="启用状态" prop="enabled">
        <el-switch v-model="formData.enabled" />
      </el-form-item>
      <el-form-item label="角色分配" prop="roleIds">
        <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
        </el-select>
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
  roles: { type: Array, required: true },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({ ...props.form })
const formRef = ref(null)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }],
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
