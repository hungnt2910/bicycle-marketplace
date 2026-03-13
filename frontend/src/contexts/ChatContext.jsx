import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import chatApi from '../api/chatApi';
import userApi from '../api/userApi';
import socketService from '../services/socketService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Kết nối Socket.IO khi user đăng nhập
  useEffect(() => {
    const userId = user?._id || user?.id || user?.userId;
    
    if (userId) {
      socketService.connect(userId);

      // Lắng nghe events
      socketService.on('new-message', handleNewMessage);
      socketService.on('user-online', handleUserOnline);
      socketService.on('user-offline', handleUserOffline);
      socketService.on('user-typing', handleUserTyping);
      socketService.on('user-stop-typing', handleUserStopTyping);
      socketService.on('messages-read', handleMessagesRead);

      return () => {
        socketService.removeAllListeners('new-message');
        socketService.removeAllListeners('user-online');
        socketService.removeAllListeners('user-offline');
        socketService.removeAllListeners('user-typing');
        socketService.removeAllListeners('user-stop-typing');
        socketService.removeAllListeners('messages-read');
        socketService.disconnect();
      };
    } else {
      console.log('⚠️ No user found, cannot connect socket. User object:', user);
    }
  }, [user]);

  // Load conversations khi mount
  useEffect(() => {
    const userId = user?._id || user?.id || user?.userId;
    
    if (userId) {
      console.log('🔄 Loading conversations for user:', userId);
      loadConversations();
    }
  }, [user]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching conversations...');
      const data = await chatApi.getConversations();
      console.log('Conversations loaded:', data);
      setConversations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages của một conversation
  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const data = await chatApi.getMessages(conversationId);
      setMessages(data.reverse()); // Reverse để hiển thị từ cũ đến mới
      
      // Join conversation room
      socketService.joinConversation(conversationId);
      
      // Đánh dấu đã đọc
      await chatApi.markAsRead(conversationId);
    } catch (err) {
      setError(err.message);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tạo conversation mới
  const createConversation = async (otherUserId) => {
    try {
      console.log('🆕 Creating new conversation with user:', otherUserId);
      const data = await chatApi.createConversation(otherUserId);
      
      // Fetch thông tin đầy đủ của otherUser ngay sau khi tạo
      if (data && data.participants) {
        const currentUserId = (user._id || user.id || user.userId)?.toString();
        
        // Tìm userId của người còn lại (không phải mình)
        let otherUserIdToFetch = null;
        
        // Xử lý khi participants là array of strings
        if (Array.isArray(data.participants)) {
          otherUserIdToFetch = data.participants.find(pId => {
            const participantId = (typeof pId === 'string' ? pId : pId._id || pId.id)?.toString();
            return participantId !== currentUserId;
          });
          
          // Nếu participants là string, giữ nguyên
          if (typeof otherUserIdToFetch === 'string') {
            // OK, đây là userId string
          } else if (otherUserIdToFetch?._id) {
            otherUserIdToFetch = otherUserIdToFetch._id;
          }
        }
        
        if (otherUserIdToFetch) {
          try {
            const userResponse = await userApi.getUserById(otherUserIdToFetch);
            
            if (userResponse.data) {
              console.log('✅ User info fetched:', userResponse.data);
              
              // Cập nhật participants: chuyển từ array strings sang array objects
              data.participants = data.participants.map(p => {
                const pId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
                if (pId === otherUserIdToFetch) {
                  return userResponse.data;
                }
                return typeof p === 'string' ? { _id: p } : p;
              });
              
              console.log('✅ Updated participants with full user info:', data.participants);
            }
          } catch (error) {
            console.error('❌ Error fetching user info:', error);
            // Tiếp tục dù không fetch được user info
            // Chuyển string thành object tối thiểu
            data.participants = data.participants.map(p => 
              typeof p === 'string' ? { _id: p } : p
            );
          }
        }
      }
      
      setConversations(prev => [data, ...prev]);
      setActiveConversation(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  // Gửi tin nhắn (Socket.IO real-time)
  const sendMessage = useCallback((text, attachments = []) => {
    if (!activeConversation || !user) {
      console.error('❌ Cannot send message: missing conversation or user');
      return;
    }

    const userId = user._id || user.id || user.userId;

    socketService.sendMessage(
      activeConversation._id,
      userId,
      text,
      attachments
    );
  }, [activeConversation, user]);

  // Typing indicator
  const startTyping = useCallback(() => {
    if (!activeConversation || !user) return;
    
    socketService.startTyping(
      activeConversation._id,
      user._id,
      user.firstName + ' ' + user.lastName
    );
  }, [activeConversation, user]);

  const stopTyping = useCallback(() => {
    if (!activeConversation || !user) return;
    
    socketService.stopTyping(activeConversation._id, user._id);
  }, [activeConversation, user]);

  // Handle Socket events
  const handleNewMessage = useCallback((data) => {
    console.log('📨 Received new message event:', data);
    const { message, conversationId } = data;

    if (!message) {
      console.error('❌ Message is undefined in event data');
      return;
    }

    console.log('📝 Message details:', {
      conversationId,
      messageId: message._id,
      text: message.content?.text,
      senderId: message.senderId,
      activeConversationId: activeConversation?._id
    });

    // Thêm message vào danh sách nếu đang xem conversation đó
    if (activeConversation?._id === conversationId) {
      setMessages(prev => {
        // Check xem message đã tồn tại chưa (tránh duplicate)
        const exists = prev.some(m => m._id === message._id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        return [...prev, message];
      });
      
      // Tự động đánh dấu đã đọc nếu đang xem conversation
      const userId = user._id || user.id || user.userId;
      const messageSenderId = typeof message.senderId === 'object' 
        ? message.senderId._id || message.senderId.id 
        : message.senderId;
      
      if (messageSenderId !== userId) {
        chatApi.markAsRead(conversationId);
      }
    } else {
      console.log('⚠️ Message for different conversation:', conversationId);
    }

    // Cập nhật lastMessage trong conversations
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? { 
              ...conv, 
              lastMessage: {
                text: message.content.text,
                senderId: message.senderId,
                timestamp: message.createdAt
              },
              updatedAt: message.createdAt
            }
          : conv
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, [activeConversation, user]);

  const handleUserOnline = useCallback((data) => {
    setOnlineUsers(prev => new Set(prev).add(data.userId));
  }, []);

  const handleUserOffline = useCallback((data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  }, []);

  const handleUserTyping = useCallback((data) => {
    const { userId, userName, conversationId } = data;
    
    if (activeConversation?._id === conversationId) {
      setTypingUsers(prev => new Map(prev).set(userId, userName));
    }
  }, [activeConversation]);

  const handleUserStopTyping = useCallback((data) => {
    const { userId, conversationId } = data;
    
    if (activeConversation?._id === conversationId) {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  }, [activeConversation]);

  const handleMessagesRead = useCallback((data) => {
    // Có thể cập nhật UI để hiển thị tin nhắn đã được đọc
    console.log('Messages read:', data);
  }, []);

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    error,
    loadConversations,
    loadMessages,
    createConversation,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
