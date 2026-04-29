<template>
  <div class="chat-container">
    <!-- 左侧：会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <el-button type="primary" size="small" @click="createNewSession">
          + 新建会话
        </el-button>
      </div>
      <div class="session-list">
        <div v-for="s in sessions" :key="s.id" :class="['session-item', { active: s.id === currentSessionId }]"
          @click="switchSession(s.id)">
          <div class="session-title">
            {{ s.title || '新会话' }}
          </div>
          <div class="session-preview">
            {{ s.lastMessage || '暂无消息' }}
          </div>
          <div class="session-time">
            {{ formatTime(s.timestamp) }}
          </div>
          <el-icon class="delete-icon" @click.stop="deleteSession(s.id)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 右侧：聊天窗口 -->
    <div class="chat-main">
      <div class="chat-header">
        <h3>{{ currentSessionTitle }}</h3>
      </div>

      <div class="chat-messages" ref="messagesRef">
        <!-- 历史消息 -->
        <div v-for="msg in messages" :key="msg.id" :class="['message', msg.role]">
          <div class="bubble">
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>

        <!-- AI 正在输入指示器 -->
        <div v-if="streaming && !hasAiResponse" class="message ai">
          <div class="bubble">
            <div class="typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input v-model="inputMessage" type="textarea" :rows="3" placeholder="输入消息，按 Enter 发送 (Shift+Enter 换行)"
          @keydown.enter.exact.prevent="sendMessage" @keydown.enter.shift.prevent :disabled="streaming" />
        <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim() || streaming"
          style="margin-top: 8px">
          {{ streaming ? '生成中...' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

// 响应式数据
const messages = ref([])
const inputMessage = ref('')
const streaming = ref(false)
const currentSessionId = ref('')
const sessions = ref([])
const messagesRef = ref(null)

let closeStream = null
let currentAiMessage = null

// 计算属性
const currentSessionTitle = computed(() => {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  return session?.title || '新会话'
})

const hasAiResponse = computed(() => {
  return currentAiMessage?.content && currentAiMessage.content.length > 0
})

// 工具函数
function generateSessionId() {
  return Date.now().toString()
}

function formatTime(timestamp) {
  try {
    const date = new Date(parseInt(timestamp))
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString()
  } catch {
    return '未知时间'
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// 生命周期
onMounted(() => {
  loadSessions()

  let id = localStorage.getItem('chat_session_id')
  if (!id || !sessions.value.some(s => s.id === id)) {
    id = createNewSessionId()
  }
  currentSessionId.value = id
  loadMessages()
})

// 会话管理
function loadSessions() {
  try {
    const list = localStorage.getItem('chat_sessions')
    if (list) {
      sessions.value = JSON.parse(list)
    } else {
      createNewSession()
    }
  } catch (error) {
    console.error('加载会话失败:', error)
    sessions.value = []
  }
}

function loadMessages() {
  messages.value = []
}

function createNewSessionId() {
  const newId = generateSessionId()
  localStorage.setItem('chat_session_id', newId)
  return newId
}

function createNewSession() {
  const newId = createNewSessionId()
  currentSessionId.value = newId
  messages.value = []

  const newSession = {
    id: newId,
    title: '新会话',
    lastMessage: '',
    timestamp: newId,
  }

  sessions.value.unshift(newSession)
  saveSessions()
}

function switchSession(id) {
  if (closeStream) {
    closeStream()
    closeStream = null
  }
  streaming.value = false
  currentSessionId.value = id
  localStorage.setItem('chat_session_id', id)
  messages.value = []
  currentAiMessage = null
}

function deleteSession(id) {
  ElMessageBox.confirm('确定删除此会话？', '提示', {
    type: 'warning',
  }).then(() => {
    sessions.value = sessions.value.filter(s => s.id !== id)
    saveSessions()
    if (currentSessionId.value === id) {
      const newId = sessions.value[0]?.id || createNewSessionId()
      currentSessionId.value = newId
      localStorage.setItem('chat_session_id', newId)
      messages.value = []
    }
    ElMessage.success('删除成功')
  })
}

function saveSessions() {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
}

function updateSessionPreview(content) {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (session) {
    session.lastMessage = content.slice(0, 50) + (content.length > 50 ? '...' : '')
    session.timestamp = Date.now().toString()
    if (!session.title || session.title === '新会话') {
      session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }
    saveSessions()
  }
}

// 发送消息 - 简化版本，直接实时显示
async function sendMessage() {
  const messageText = inputMessage.value.trim()
  if (!messageText || streaming.value) return

  console.log('发送消息:', messageText)

  // 添加用户消息
  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: messageText,
  }
  messages.value.push(userMsg)

  // 添加AI消息占位符 - 初始为空
  currentAiMessage = {
    id: Date.now() + 1,
    role: 'ai',
    content: '',
  }
  messages.value.push(currentAiMessage)

  streaming.value = true
  inputMessage.value = ''
  scrollToBottom()

  const request = {
    userId: 'user123',
    sessionId: currentSessionId.value,
    message: messageText,
  }

  console.log('请求数据:', request)

  // 停止之前的请求
  if (closeStream) {
    closeStream()
  }

  closeStream = service.stream('/api/ai/stream', request, {
    onMessage: (text) => {
      console.log('收到流式数据:', text)

      // 关键：直接实时追加显示
      if (currentAiMessage) {
        currentAiMessage.content += text
        console.log('当前AI消息内容:', currentAiMessage.content)
        scrollToBottom()
      }
    },
    onError: (err) => {
      console.error('流式请求错误:', err)
      if (currentAiMessage) {
        currentAiMessage.content = `抱歉，出现了错误: ${err.message || err}`
      }
      streaming.value = false
      closeStream = null
      currentAiMessage = null
      scrollToBottom()
    },
    onDone: () => {
      console.log('流式传输完成')
      if (currentAiMessage && currentAiMessage.content) {
        updateSessionPreview(currentAiMessage.content)
        console.log('最终AI消息内容:', currentAiMessage.content)
      }
      streaming.value = false
      closeStream = null
      currentAiMessage = null
      scrollToBottom()
    },
  })
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fff;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.session-item:hover {
  background: #e9ecef;
}

.session-item.active {
  background: #e3f2fd;
  border-right: 3px solid #2196f3;
}

.session-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.session-preview {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.delete-icon {
  position: absolute;
  right: 12px;
  top: 12px;
  font-size: 14px;
  color: #f44336;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .delete-icon {
  opacity: 1;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.chat-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.message {
  margin-bottom: 16px;
  display: flex;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.user .bubble {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .bubble {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-content {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.5;
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing span:nth-child(1) {
  animation-delay: 0s;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input {
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
}
</style>
