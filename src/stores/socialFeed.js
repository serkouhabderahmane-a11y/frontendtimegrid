import { defineStore } from 'pinia';
import api from '../api/axios';

let toastTimeout = null;

const showToast = (message, type = 'error') => {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  clearTimeout(toastTimeout);
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  document.body.appendChild(toast);
  
  toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
  
  toastTimeout = setTimeout(() => toast.remove(), 4000);
};

export const useSocialFeedStore = defineStore('socialFeed', {
  state: () => ({
    posts: [],
    loading: false,
    posting: false,
    error: null,
  }),

  actions: {
    async fetchPosts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/social-feed/posts');
        this.posts = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch posts';
        console.error('Fetch posts error:', error);
        showToast(this.error);
      } finally {
        this.loading = false;
      }
    },

    async createPost(content, imageUrl = null) {
      if (!content?.trim()) {
        showToast('Please enter some content');
        return null;
      }
      
      this.posting = true;
      try {
        const response = await api.post('/social-feed/posts', { content: content.trim(), imageUrl });
        this.posts.unshift(response.data);
        showToast('Post created successfully!', 'success');
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to create post';
        console.error('Create post error:', error);
        showToast(message);
        throw error;
      } finally {
        this.posting = false;
      }
    },

    async updatePost(postId, data) {
      try {
        const response = await api.put(`/social-feed/posts/${postId}`, data);
        const index = this.posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          this.posts[index] = { ...this.posts[index], ...response.data };
        }
        showToast('Post updated!', 'success');
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update post';
        console.error('Update post error:', error);
        showToast(message);
        throw error;
      }
    },

    async deletePost(postId) {
      try {
        await api.delete(`/social-feed/posts/${postId}`);
        this.posts = this.posts.filter((p) => p.id !== postId);
        showToast('Post deleted', 'success');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete post';
        console.error('Delete post error:', error);
        showToast(message);
        throw error;
      }
    },

    async addReaction(postId, type) {
      try {
        const response = await api.post(`/social-feed/posts/${postId}/reactions`, { type });
        const index = this.posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          const existingIdx = this.posts[index].reactions.findIndex(
            (r) => r.userId === response.data.userId && r.type === response.data.type
          );
          if (existingIdx === -1) {
            this.posts[index].reactions.push(response.data);
          }
        }
        return response.data;
      } catch (error) {
        console.error('Add reaction error:', error);
      }
    },

    async removeReaction(postId, type) {
      try {
        await api.delete(`/social-feed/posts/${postId}/reactions`, { data: { type } });
        const index = this.posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          this.posts[index].reactions = this.posts[index].reactions.filter(
            (r) => !(r.userId === this.getCurrentUserId && r.type === type)
          );
        }
      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    },

    async addComment(postId, content) {
      if (!content?.trim()) return null;
      
      try {
        const response = await api.post(`/social-feed/posts/${postId}/comments`, { content: content.trim() });
        const index = this.posts.findIndex((p) => p.id === postId);
        if (index !== -1) {
          if (!this.posts[index].comments) {
            this.posts[index].comments = [];
          }
          this.posts[index].comments.push(response.data);
        }
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to add comment';
        console.error('Add comment error:', error);
        showToast(message);
        throw error;
      }
    },

    async deleteComment(commentId) {
      try {
        await api.delete(`/social-feed/comments/${commentId}`);
        for (const post of this.posts) {
          const index = post.comments?.findIndex((c) => c.id === commentId);
          if (index !== -1 && index !== undefined) {
            post.comments.splice(index, 1);
            break;
          }
        }
        showToast('Comment deleted', 'success');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete comment';
        console.error('Delete comment error:', error);
        showToast(message);
        throw error;
      }
    },
    
    getCurrentUserId() {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.sub || payload.userId;
        }
      } catch (e) {
        console.error('Error getting user ID:', e);
      }
      return null;
    }
  },
});
