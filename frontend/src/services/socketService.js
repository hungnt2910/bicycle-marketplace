import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Kết nối Socket.IO
  connect(userId) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected:', this.socket.id);
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    console.log('🔌 Connecting to Socket.IO...');
    console.log('📡 Socket URL:', SOCKET_URL);
    console.log('👤 User ID:', userId);

    this.socket = io(SOCKET_URL, {
      auth: {
        userId: userId,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully!', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      console.error('🔴 Error details:', error.message);
    });
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join vào conversation room
  joinConversation(conversationId) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join-conversation', { conversationId });
  }

  // Gửi tin nhắn
  sendMessage(conversationId, senderId, text, attachments = []) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send-message', {
      conversationId,
      senderId,
      text,
      attachments,
    });
  }

  // Typing indicator
  startTyping(conversationId, userId, userName) {
    if (!this.socket) return;

    this.socket.emit('typing', {
      conversationId,
      userId,
      userName,
    });
  }

  stopTyping(conversationId, userId) {
    if (!this.socket) return;

    this.socket.emit('stop-typing', {
      conversationId,
      userId,
    });
  }

  // Đánh dấu đã đọc
  markAsRead(conversationId, userId) {
    if (!this.socket) return;

    this.socket.emit('mark-read', {
      conversationId,
      userId,
    });
  }

  // Kiểm tra user online
  checkOnline(userId) {
    if (!this.socket) return;

    this.socket.emit('check-online', { userId });
  }

  // Lắng nghe events
  on(event, callback) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    // Lưu callback để có thể remove sau
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
  }

  // Xóa listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove từ listeners map
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Xóa tất cả listeners của một event
  removeAllListeners(event) {
    if (!this.socket) return;

    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  // Kiểm tra socket có connected không
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
