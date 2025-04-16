<template>
  <el-dialog :title="title" v-model="visible" width="50%">
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入描述"
          :rows="4"
        />
      </el-form-item>
      <el-form-item label="权限选择">
        <el-tree
          ref="tree"
          :data="permissionTree"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="formData.permissionIds"
          default-expand-all
          class="custom-tree"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span class="node-label">{{ data.name }}</span>
            </div>
          </template>
        </el-tree>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  form: { type: Object, required: true },
  permissionTree: { type: Array, required: true },
  treeProps: { type: Object, required: true },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const formData = ref({ ...props.form })
const formRef = ref(null)
const tree = ref(null)

const rules = { name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }] }

// 同步 visible 双向绑定
const visible = ref(props.visible)
watch(
  () => props.visible,
  async (val) => {
    visible.value = val
    if (val && tree.value) {
      await nextTick()
      const leafIds = formData.value.permissionIds.filter((id) => isLeafNode(id))
      tree.value.setCheckedKeys(leafIds)
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
)

const isLeafNode = (id) => {
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === id) return !node.children || node.children.length === 0
      if (node.children) {
        const found = findNode(node.children)
        if (found !== null) return found
      }
    }
    return null
  }
  return findNode(props.permissionTree)
}

// 保存表单
const save = async () => {
  await formRef.value.validate()
  const checkedNodes = tree.value.getCheckedNodes(false, true)
  formData.value.permissionIds = checkedNodes.map((node) => node.id)
  emit('save', formData.value)
}
</script>
