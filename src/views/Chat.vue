<template>
  <div class="chat-page">
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h2>Messages</h2>
        <button class="new-chat-btn" @click="openNewChatModal" title="New Conversation">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
      </div>

      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search conversations..."
          @input="handleSearch"
        />
      </div>

      <div class="conversations-list">
        <div v-if="chatStore.loading" class="loading-state">
          <div class="spinner"></div>
        </div>
        <div v-else-if="chatStore.conversations.length === 0" class="empty-conversations">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p>No conversations yet</p>
          <button class="start-chat-btn" @click="openNewChatModal">Start a conversation</button>
        </div>
        <TransitionGroup name="conv" v-else>
          <div 
            v-for="conv in filteredConversations" 
            :key="conv.id"
            class="conversation-item"
            :class="{ active: selectedConversation?.id === conv.id }"
            @click="selectConversation(conv)"
          >
            <div class="conv-avatar" :style="{ background: getAvatarGradient(conv.participants[0]) }">
              {{ getParticipantInitials(conv.participants) }}
            </div>
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ getParticipantName(conv.participants) }}</span>
                <span class="conv-time">{{ formatTime(conv.lastMessage?.createdAt) }}</span>
              </div>
              <p class="conv-preview">{{ conv.lastMessage?.content || 'No messages yet' }}</p>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <div class="chat-main">
      <div v-if="!selectedConversation" class="no-chat-selected">
        <div class="no-chat-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        </div>
        <h3>Select a conversation</h3>
        <p>Choose a conversation from the sidebar or start a new one</p>
        <button class="start-chat-btn-large" @click="openNewChatModal">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          New Conversation
        </button>
      </div>

      <template v-else>
        <div class="chat-header">
          <div class="chat-user">
            <div class="chat-avatar" :style="{ background: getAvatarGradient(selectedConversation.participants[0]) }">
              {{ getParticipantInitials(selectedConversation.participants) }}
            </div>
            <div class="chat-user-info">
              <span class="chat-user-name">{{ getParticipantName(selectedConversation.participants) }}</span>
              <span class="chat-user-status">
                <span class="status-dot"></span>
                {{ selectedConversation.participants[0]?.role || 'User' }}
              </span>
            </div>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="chatStore.messagesLoading" class="loading-messages">
            <div class="spinner"></div>
          </div>
          <div v-else-if="chatStore.messages.length === 0" class="empty-messages">
            <p>No messages yet. Say hello! 👋</p>
          </div>
          <div v-else class="messages-list" ref="messagesList">
            <TransitionGroup name="message">
              <div 
                v-for="(message, index) in chatStore.messages" 
                :key="message.id"
                class="message"
                :class="{ 
                  sent: message.sender.id === authStore.user?.id, 
                  received: message.sender.id !== authStore.user?.id,
                  first: isFirstInGroup(index),
                  last: isLastInGroup(index)
                }"
              >
                <div class="message-avatar" v-if="message.sender.id !== authStore.user?.id">
                  {{ getInitials(message.sender.firstName, message.sender.lastName) }}
                </div>
                <div class="message-bubble">
                  <p>{{ message.content }}</p>
                  <span class="message-time">{{ formatMessageTime(message.createdAt) }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <div class="message-input">
          <input 
            v-model="messageText"
            type="text"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
            :disabled="chatStore.sending"
          />
          <button 
            class="send-btn" 
            @click="sendMessage" 
            :disabled="!messageText.trim() || chatStore.sending"
            :class="{ sending: chatStore.sending }"
          >
            <span v-if="chatStore.sending" class="btn-spinner"></span>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </template>
    </div>

    <Transition name="modal">
      <div v-if="showNewChatModal" class="modal-overlay" @click.self="showNewChatModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>New Conversation</h2>
            <button class="close-btn" @click="showNewChatModal = false">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="search-users-box">
              <input 
                v-model="userSearch"
                type="text"
                placeholder="Search for users..."
                @input="searchUsers"
                ref="userSearchInput"
              />
            </div>
            <div class="users-list">
              <TransitionGroup name="user">
                <div 
                  v-for="user in chatStore.users" 
                  :key="user.id"
                  class="user-item"
                  @click="startConversation(user.id)"
                >
                  <div class="user-avatar" :style="{ background: getAvatarGradient(user) }">
                    {{ getInitials(user.firstName, user.lastName) }}
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                  <span class="user-role-badge" :class="user.role">{{ user.role }}</span>
                </div>
              </TransitionGroup>
              <div v-if="chatStore.users.length === 0 && userSearch" class="no-users">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p>No users found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()

const selectedConversation = ref(null)
const messageText = ref('')
const messagesContainer = ref(null)
const messagesList = ref(null)
const showNewChatModal = ref(false)
const searchQuery = ref('')
const userSearch = ref('')
const userSearchInput = ref(null)

const avatarGradients = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a8edea, #fed6e3)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
]

const filteredConversations = computed(() => {
  if (!searchQuery.value) return chatStore.conversations
  const query = searchQuery.value.toLowerCase()
  return chatStore.conversations.filter(conv => 
    getParticipantName(conv.participants).toLowerCase().includes(query)
  )
})

const getAvatarGradient = (user) => {
  if (!user?.firstName) return avatarGradients[0]
  const index = user.firstName.charCodeAt(0) % avatarGradients.length
  return avatarGradients[index]
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const getParticipantInitials = (participants) => {
  if (!participants || participants.length === 0) return '?'
  const p = participants[0]
  return getInitials(p.firstName, p.lastName)
}

const getParticipantName = (participants) => {
  if (!participants || participants.length === 0) return 'Unknown'
  const p = participants[0]
  return `${p.firstName} ${p.lastName}`
}

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / 86400000)

  if (days === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const formatMessageTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const isFirstInGroup = (index) => {
  if (index === 0) return true
  const current = chatStore.messages[index]
  const prev = chatStore.messages[index - 1]
  return current.sender.id !== prev.sender.id
}

const isLastInGroup = (index) => {
  if (index === chatStore.messages.length - 1) return true
  const current = chatStore.messages[index]
  const next = chatStore.messages[index + 1]
  return current.sender.id !== next.sender.id
}

const selectConversation = async (conv) => {
  selectedConversation.value = conv
  
  try {
    await chatStore.fetchMessages(conv.id)
    await chatStore.markAsRead(conv.id)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
  }
}

const sendMessage = async () => {
  if (!messageText.value.trim() || !selectedConversation.value || chatStore.sending) return

  const content = messageText.value.trim()
  messageText.value = ''

  try {
    await chatStore.sendMessage(selectedConversation.value.id, content)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    messageText.value = content
  }
}

const scrollToBottom = () => {
  if (messagesList.value) {
    messagesList.value.scrollTop = messagesList.value.scrollHeight
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const searchUsers = async () => {
  if (userSearch.value.length >= 1) {
    await chatStore.fetchUsers(userSearch.value)
  }
}

const openNewChatModal = async () => {
  showNewChatModal.value = true
  userSearch.value = ''
  await chatStore.fetchUsers('')
  await nextTick()
  userSearchInput.value?.focus()
}

const startConversation = async (userId) => {
  try {
    const conv = await chatStore.createConversation(userId)
    showNewChatModal.value = false
    userSearch.value = ''
    await chatStore.fetchConversations()
    
    const newConv = chatStore.conversations.find(c => c.id === conv.id)
    if (newConv) {
      await selectConversation(newConv)
    }
  } catch (error) {
    console.error('Failed to start conversation:', error)
  }
}

onMounted(async () => {
  await chatStore.fetchConversations()
  await chatStore.fetchUnreadCount()
})
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - 65px);
  background: #0f172a;
}

.chat-sidebar {
  width: 320px;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
}

.sidebar-header h2 {
  color: #f1f5f9;
  font-size: 1.25rem;
  font-weight: 600;
}

.new-chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: #006e5b;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: #005a4a;
  transform: scale(1.05);
}

.new-chat-btn svg {
  width: 20px;
  height: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin: 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.search-box:focus-within {
  border-color: #006e5b;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.search-box input::placeholder {
  color: #64748b;
}

.search-box input:focus {
  outline: none;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.conversation-item:hover {
  background: rgba(0, 110, 91, 0.05);
}

.conversation-item.active {
  background: rgba(0, 110, 91, 0.1);
  border-left-color: #006e5b;
}

.conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conv-name {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 0.9375rem;
}

.conv-time {
  color: #64748b;
  font-size: 0.75rem;
}

.conv-preview {
  color: #94a3b8;
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-conversations, .loading-state, .no-users, .empty-messages {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-conversations svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.start-chat-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #006e5b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.start-chat-btn:hover {
  background: #005a4a;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #334155;
  border-top-color: #006e5b;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.no-chat-icon {
  width: 80px;
  height: 80px;
  background: rgba(0, 110, 91, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.no-chat-icon svg {
  width: 40px;
  height: 40px;
  color: #006e5b;
}

.no-chat-selected h3 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.start-chat-btn-large {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #006e5b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.start-chat-btn-large:hover {
  background: #005a4a;
  transform: translateY(-2px);
}

.start-chat-btn-large svg {
  width: 20px;
  height: 20px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.chat-user-info {
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  color: #f1f5f9;
  font-weight: 600;
}

.chat-user-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #64748b;
  font-size: 0.8125rem;
  text-transform: capitalize;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #006e5b;
  border-radius: 50%;
}

.messages-container {
  flex: 1;
  overflow: hidden;
}

.loading-messages {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.messages-list {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  display: flex;
  gap: 0.5rem;
  max-width: 70%;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.sent {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message.received {
  margin-right: auto;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.625rem;
  font-weight: 600;
  flex-shrink: 0;
  align-self: flex-end;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  transition: all 0.2s;
}

.message.sent .message-bubble {
  background: #006e5b;
  border-bottom-right-radius: 0.25rem;
}

.message.received .message-bubble {
  background: #334155;
  border-bottom-left-radius: 0.25rem;
}

.message-bubble p {
  color: #f1f5f9;
  font-size: 0.9375rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  display: block;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.message.received .message-time {
  color: #64748b;
}

.message-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #1e293b;
  border-top: 1px solid #334155;
}

.message-input input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 9999px;
  color: #e2e8f0;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.message-input input::placeholder {
  color: #64748b;
}

.message-input input:focus {
  outline: none;
  border-color: #006e5b;
}

.message-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #006e5b;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #005a4a;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #334155;
  cursor: not-allowed;
}

.send-btn.sending {
  pointer-events: none;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #334155;
}

.modal-header h2 {
  color: #f1f5f9;
  font-size: 1.125rem;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #0f172a;
  color: #94a3b8;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.search-users-box {
  margin-bottom: 1rem;
}

.search-users-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-users-box input:focus {
  outline: none;
  border-color: #006e5b;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #0f172a;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.user-item:hover {
  background: #1e293b;
  transform: translateX(4px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  color: #f1f5f9;
  font-weight: 500;
}

.user-email {
  display: block;
  color: #64748b;
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: capitalize;
  font-weight: 500;
}

.user-role-badge.admin { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.user-role-badge.hr { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.user-role-badge.manager { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
.user-role-badge.employee { background: rgba(0, 110, 91, 0.2); color: #86efac; }

.no-users svg {
  width: 32px;
  height: 32px;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9);
}

.conv-enter-active,
.conv-leave-active {
  transition: all 0.3s ease;
}

.conv-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.conv-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.user-enter-active,
.user-leave-active {
  transition: all 0.2s ease;
}

.user-enter-from,
.user-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
