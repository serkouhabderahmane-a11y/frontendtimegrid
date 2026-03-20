<template>
  <div class="feed-page">
    <header class="page-header">
      <div>
        <h1>Social Feed</h1>
        <p>Stay connected with your team</p>
      </div>
    </header>

    <div class="feed-container">
      <div class="feed-main">
        <div v-if="isAdmin" class="create-post-card">
          <div class="create-post-header">
            <div class="avatar">
              {{ userInitials }}
            </div>
            <button class="create-post-btn" @click="showPostModal = true">
              What's on your mind?
            </button>
          </div>
        </div>

        <div v-if="feedStore.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading posts...</p>
        </div>

        <div v-else-if="feedStore.posts.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </div>
          <h3>No posts yet</h3>
          <p>Be the first to share something with your team!</p>
        </div>

        <div v-else class="posts-list">
          <TransitionGroup name="post">
            <div 
              v-for="post in feedStore.posts" 
              :key="post.id" 
              class="post-card" 
              :class="{ pinned: post.isPinned }"
            >
              <div v-if="post.isPinned" class="pinned-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                </svg>
                Pinned
              </div>
              
              <div class="post-header">
                <div class="post-author">
                  <div class="author-avatar" :style="{ background: getAvatarGradient(post.author) }">
                    {{ getInitials(post.author.firstName, post.author.lastName) }}
                  </div>
                  <div class="author-info">
                    <span class="author-name">{{ post.author.firstName }} {{ post.author.lastName }}</span>
                    <span class="post-meta">
                      <span class="role-badge" :class="post.author.role">{{ post.author.role }}</span>
                      {{ formatDate(post.createdAt) }}
                    </span>
                  </div>
                </div>
                <div v-if="canManagePost(post)" class="post-actions">
                  <button class="action-btn" @click="editPost(post)" title="Edit">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button class="action-btn danger" @click="deletePost(post.id)" title="Delete">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="post-content">
                <p>{{ post.content }}</p>
                <img v-if="post.imageUrl" :src="post.imageUrl" alt="Post image" class="post-image" @error="handleImageError" />
              </div>

              <div class="reactions-bar">
                <div class="reaction-summary" v-if="post.reactions?.length > 0">
                  <span class="reaction-icons">
                    <span v-for="type in getUniqueReactionTypes(post.reactions)" :key="type" class="reaction-emoji">
                      {{ getReactionEmoji(type) }}
                    </span>
                  </span>
                  <span class="reaction-count">{{ post.reactions.length }}</span>
                </div>
                <div class="reaction-buttons">
                  <button 
                    v-for="type in reactionTypes" 
                    :key="type"
                    class="reaction-btn"
                    :class="{ active: hasUserReaction(post, type) }"
                    @click="toggleReaction(post, type)"
                    :title="type"
                  >
                    {{ getReactionEmoji(type) }}
                  </button>
                </div>
              </div>

              <div class="comments-section">
                <div v-if="post.comments?.length > 0" class="comments-list">
                  <TransitionGroup name="comment">
                    <div v-for="comment in post.comments" :key="comment.id" class="comment">
                      <div class="comment-avatar">
                        {{ getInitials(comment.user.firstName, comment.user.lastName) }}
                      </div>
                      <div class="comment-body">
                        <div class="comment-header">
                          <span class="comment-author">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
                          <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                          <button v-if="canManageComment(comment)" class="delete-comment-btn" @click="deleteComment(comment.id, post.id)">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <p class="comment-text">{{ comment.content }}</p>
                      </div>
                    </div>
                  </TransitionGroup>
                </div>

                <div class="add-comment">
                  <div class="comment-input-avatar">
                    {{ userInitials }}
                  </div>
                  <input 
                    v-model="commentInputs[post.id]"
                    type="text" 
                    placeholder="Write a comment..."
                    @keyup.enter="addComment(post.id)"
                  />
                  <button 
                    class="send-comment-btn" 
                    @click="addComment(post.id)" 
                    :disabled="!commentInputs[post.id]?.trim()"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showPostModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingPost ? 'Edit Post' : 'Create Post' }}</h2>
            <button class="close-btn" @click="closeModal">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <textarea 
              v-model="postContent"
              placeholder="What's on your mind?"
              rows="5"
              ref="postTextarea"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn-primary" @click="submitPost" :disabled="!postContent.trim() || feedStore.posting">
              <span v-if="feedStore.posting" class="btn-spinner"></span>
              {{ feedStore.posting ? 'Posting...' : (editingPost ? 'Update' : 'Post') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useSocialFeedStore } from '../../stores/socialFeed'

const authStore = useAuthStore()
const feedStore = useSocialFeedStore()

const showPostModal = ref(false)
const postContent = ref('')
const editingPost = ref(null)
const commentInputs = reactive({})
const postTextarea = ref(null)

const isAdmin = computed(() => ['admin', 'hr'].includes(authStore.user?.role))
const userInitials = computed(() => getInitials(authStore.user?.firstName, authStore.user?.lastName))

const reactionTypes = ['like', 'love', 'celebrate', 'insightful']

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

const getAvatarGradient = (author) => {
  const index = (author?.firstName?.charCodeAt(0) || 0) % avatarGradients.length
  return avatarGradients[index]
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

const getReactionEmoji = (type) => {
  const emojis = { like: '👍', love: '❤️', celebrate: '🎉', insightful: '💡' }
  return emojis[type] || '👍'
}

const getUniqueReactionTypes = (reactions) => {
  if (!reactions || !Array.isArray(reactions)) return []
  return [...new Set(reactions.map(r => r.type))]
}

const hasUserReaction = (post, type) => {
  if (!post.reactions || !authStore.user) return false
  return post.reactions.some(r => r.userId === authStore.user?.id && r.type === type)
}

const canManagePost = (post) => {
  return post.authorId === authStore.user?.id || ['admin', 'hr'].includes(authStore.user?.role)
}

const canManageComment = (comment) => {
  return comment.userId === authStore.user?.id || ['admin', 'hr'].includes(authStore.user?.role)
}

const toggleReaction = async (post, type) => {
  try {
    if (hasUserReaction(post, type)) {
      await feedStore.removeReaction(post.id, type)
    } else {
      await feedStore.addReaction(post.id, type)
    }
    await feedStore.fetchPosts()
  } catch (error) {
    console.error('Failed to toggle reaction:', error)
  }
}

const editPost = (post) => {
  editingPost.value = post
  postContent.value = post.content
  showPostModal.value = true
}

const deletePost = async (postId) => {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      await feedStore.deletePost(postId)
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }
}

const addComment = async (postId) => {
  const content = commentInputs[postId]?.trim()
  if (!content) return

  try {
    await feedStore.addComment(postId, content)
    commentInputs[postId] = ''
  } catch (error) {
    console.error('Failed to add comment:', error)
  }
}

const deleteComment = async (commentId, postId) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      await feedStore.deleteComment(commentId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }
}

const closeModal = () => {
  showPostModal.value = false
  postContent.value = ''
  editingPost.value = null
}

const submitPost = async () => {
  if (!postContent.value.trim() || feedStore.posting) return

  try {
    if (editingPost.value) {
      await feedStore.updatePost(editingPost.value.id, { content: postContent.value })
    } else {
      await feedStore.createPost(postContent.value)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to submit post:', error)
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

watch(showPostModal, (val) => {
  if (val) {
    nextTick(() => {
      postTextarea.value?.focus()
    })
  }
})

onMounted(() => {
  feedStore.fetchPosts()
})
</script>

<style scoped>
.feed-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: #94a3b8;
}

.feed-container {
  display: flex;
  gap: 1.5rem;
}

.feed-main {
  flex: 1;
  min-width: 0;
}

.create-post-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.create-post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883, #3498db);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.create-post-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 9999px;
  color: #64748b;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.create-post-btn:hover {
  border-color: #42b883;
  color: #94a3b8;
}

.post-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.post-card.pinned {
  border-color: #42b883;
  background: linear-gradient(135deg, #1e293b 0%, #1a2f25 100%);
}

.pinned-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #42b883;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.pinned-badge svg {
  width: 14px;
  height: 14px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.post-author {
  display: flex;
  gap: 0.75rem;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 0.9375rem;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.role-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: capitalize;
  font-weight: 500;
}

.role-badge.admin { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.role-badge.hr { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.role-badge.manager { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
.role-badge.employee { background: rgba(66, 184, 131, 0.2); color: #86efac; }

.post-meta span:last-child {
  color: #64748b;
  font-size: 0.8125rem;
}

.post-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
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

.action-btn:hover {
  background: #0f172a;
  color: #94a3b8;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.post-content {
  margin-bottom: 1rem;
}

.post-content p {
  color: #e2e8f0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-top: 0.75rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.reactions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid #334155;
  border-bottom: 1px solid #334155;
}

.reaction-summary {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.reaction-icons {
  display: flex;
}

.reaction-emoji {
  font-size: 1rem;
  margin-left: -4px;
  animation: popIn 0.3s ease;
}

.reaction-emoji:first-child {
  margin-left: 0;
}

@keyframes popIn {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.reaction-count {
  color: #64748b;
  font-size: 0.8125rem;
}

.reaction-buttons {
  display: flex;
  gap: 0.25rem;
}

.reaction-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reaction-btn:hover {
  background: #0f172a;
  transform: scale(1.1);
}

.reaction-btn.active {
  background: #0f172a;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.comments-section {
  margin-top: 0.5rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.comment {
  display: flex;
  gap: 0.625rem;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.625rem;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  background: #0f172a;
  border-radius: 0.75rem;
  padding: 0.625rem 0.875rem;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.8125rem;
}

.comment-time {
  color: #64748b;
  font-size: 0.6875rem;
}

.delete-comment-btn {
  margin-left: auto;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.comment-body:hover .delete-comment-btn {
  opacity: 1;
}

.delete-comment-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.delete-comment-btn svg {
  width: 12px;
  height: 12px;
}

.comment-text {
  color: #cbd5e1;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.add-comment {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.comment-input-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883, #3498db);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  flex-shrink: 0;
}

.add-comment input {
  flex: 1;
  padding: 0.625rem 1rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 9999px;
  color: #e2e8f0;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.add-comment input::placeholder {
  color: #64748b;
}

.add-comment input:focus {
  outline: none;
  border-color: #42b883;
}

.send-comment-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #42b883;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-comment-btn:hover:not(:disabled) {
  background: #359268;
  transform: scale(1.05);
}

.send-comment-btn:disabled {
  background: #334155;
  cursor: not-allowed;
}

.send-comment-btn svg {
  width: 16px;
  height: 16px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  animation: fadeIn 0.5s ease;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon svg {
  width: 32px;
  height: 32px;
  color: #42b883;
}

.empty-state h3 {
  color: #f1f5f9;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #42b883;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
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
  max-width: 500px;
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
  padding: 1.25rem;
}

.modal-body textarea {
  width: 100%;
  padding: 0.875rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  color: #e2e8f0;
  font-size: 0.9375rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #42b883;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem;
  border-top: 1px solid #334155;
}

.btn-primary, .btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #42b883;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #359268;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #334155;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
}

.btn-secondary:hover {
  background: #0f172a;
  color: #e2e8f0;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

.post-enter-active {
  transition: all 0.4s ease;
}

.post-leave-active {
  transition: all 0.3s ease;
}

.post-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.post-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}

.comment-enter-from,
.comment-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
