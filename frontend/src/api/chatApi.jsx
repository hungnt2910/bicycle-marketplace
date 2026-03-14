import axiosClient from '../services/axiosClient';

const chatApi = {
  // Lấy danh sách conversations
  getConversations: async () => {
    try {
      const response = await axiosClient.get('/api/v1/messages/conversations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo conversation mới
  createConversation: async (otherUserId) => {
    try {
      const response = await axiosClient.post('/api/v1/messages/conversations', {
        otherUserId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy messages của một conversation
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await axiosClient.get(
        `/api/v1/messages/conversations/${conversationId}/messages`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Gửi message (HTTP)
  sendMessage: async (conversationId, text, attachments = []) => {
    try {
      const response = await axiosClient.post(
        `/api/v1/messages/conversations/${conversationId}/messages`,
        {
          text,
          attachments,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (conversationId) => {
    try {
      const response = await axiosClient.post(
        `/api/v1/messages/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default chatApi;
