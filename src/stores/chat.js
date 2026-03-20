import { defineStore } from 'pinia';
import api from '../api/axios';

const showToast = (message, type = 'error') => {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  document.body.appendChild(toast);
  
  toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
  
  setTimeout(() => toast.remove(), 4000);
};

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    users: [],
    loading: false,
    messagesLoading: false,
    sending: false,
    error: null,
    unreadCount: 0,
  }),

  actions: {
    async fetchConversations() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/chat/conversations');
        this.conversations = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch conversations';
        console.error('Fetch conversations error:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers(search = '') {
      try {
        const response = await api.get('/chat/users', { params: { search } });
        this.users = response.data;
        return response.data;
      } catch (error) {
        console.error('Fetch users error:', error);
        return [];
      }
    },

    async createConversation(userId) {
      try {
        const response = await api.post('/chat/conversations', { userId });
        const exists = this.conversations.findIndex((c) => c.id === response.data.id);
        if (exists === -1) {
          await this.fetchConversations();
        }
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to start conversation';
        console.error('Create conversation error:', error);
        showToast(message);
        throw error;
      }
    },

    async getConversation(conversationId) {
      try {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        this.currentConversation = response.data;
        return response.data;
      } catch (error) {
        console.error('Get conversation error:', error);
        throw error;
      }
    },

    async fetchMessages(conversationId, limit = 50, before = null) {
      this.messagesLoading = true;
      try {
        const params = { limit };
        if (before) params.before = before;
        const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
        this.messages = response.data;
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to load messages';
        console.error('Fetch messages error:', error);
        showToast(message);
        throw error;
      } finally {
        this.messagesLoading = false;
      }
    },

    async sendMessage(conversationId, content) {
      if (!content?.trim()) return null;
      
      this.sending = true;
      try {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content: content.trim() });
        this.messages.push(response.data);
        
        const convIndex = this.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          this.conversations[convIndex].lastMessage = {
            content: content.trim(),
            createdAt: new Date().toISOString()
          };
        }
        
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to send message';
        console.error('Send message error:', error);
        showToast(message);
        throw error;
      } finally {
        this.sending = false;
      }
    },

    async markAsRead(conversationId) {
      try {
        await api.post(`/chat/conversations/${conversationId}/read`);
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    },

    async fetchUnreadCount() {
      try {
        const response = await api.get('/chat/unread');
        this.unreadCount = response.data.count;
        return response.data.count;
      } catch (error) {
        console.error('Fetch unread count error:', error);
        return 0;
      }
    },
  },
});
