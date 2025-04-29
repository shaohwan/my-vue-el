<template>
  <el-dialog :title="title" v-model="visible" width="50%" draggable>
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
          class="custom-tree"
          accordion
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
import { ref, watch, nextTick, onMounted } from 'vue'

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
    if (val) {
      await nextTick()
      // 确保在树组件完全渲染后设置选中状态
      if (tree.value) {
        // 先重置选中状态
        tree.value.setCheckedKeys([])
        // 然后设置正确的选中状态
        const leafIds = getLeafNodeIds(props.permissionTree, formData.value.permissionIds)
        tree.value.setCheckedKeys(leafIds)
      }
    }
  },
  { immediate: true },
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
  { deep: true, immediate: true },
)

// 获取所有叶子节点ID
const getLeafNodeIds = (treeData, checkedIds) => {
  const leafIds = []

  const traverse = (nodes) => {
    nodes.forEach((node) => {
      // 如果当前节点在已选ID中且是叶子节点，或者它的子节点都不在已选ID中
      if (checkedIds.includes(node.id) && (!node.children || node.children.length === 0)) {
        leafIds.push(node.id)
      } else if (node.children) {
        // 检查子节点是否有被选中的
        const hasCheckedChild = node.children.some((child) => checkedIds.includes(child.id))
        if (hasCheckedChild) {
          traverse(node.children)
        } else if (checkedIds.includes(node.id)) {
          // 当前节点被选中但没有子节点被选中（可能是父节点被直接选中）
          leafIds.push(node.id)
        }
      } else if (checkedIds.includes(node.id)) {
        // 当前节点被选中但没有子节点
        leafIds.push(node.id)
      }
    })
  }

  traverse(treeData)
  return leafIds
}

// 保存表单
const save = async () => {
  await formRef.value.validate()
  const checkedNodes = tree.value.getCheckedNodes(false, true)
  formData.value.permissionIds = checkedNodes.map((node) => node.id)
  emit('save', formData.value)
}

// 初始化时设置一次
onMounted(() => {
  if (props.visible) {
    nextTick(() => {
      if (tree.value) {
        const leafIds = getLeafNodeIds(props.permissionTree, formData.value.permissionIds)
        tree.value.setCheckedKeys(leafIds)
      }
    })
  }
})
</script>
