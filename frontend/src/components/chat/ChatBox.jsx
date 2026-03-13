import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import userApi from '../../api/userApi';

const ChatBox = () => {
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    startTyping, 
    stopTyping, 
    typingUsers,
    onlineUsers,
    loadMessages 
  } = useChat();
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation._id);
    }
  }, [activeConversation]);

  // Fetch thông tin user khi có conversation mới
  useEffect(() => {
    const fetchOtherUserInfo = async () => {
      if (!activeConversation || !user) return;

      const currentUserId = (user._id || user.id || user.userId)?.toString();
      
      // Tìm người còn lại trong participants
      const otherUser = activeConversation.participants?.find(p => {
        const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
        return participantId !== currentUserId;
      });
      
      // Lấy userId để fetch
      const otherUserId = typeof otherUser === 'string' ? otherUser : otherUser?._id || otherUser?.id;
      
      if (otherUserId) {
        try {
          setLoadingUserInfo(true);
          console.log('🔍 Fetching user info for:', otherUserId);
          
          const response = await userApi.getUserById(otherUserId);
          
          if (response.data) {
            console.log('✅ User info loaded:', response.data);
            setOtherUserInfo(response.data);
          }
        } catch (error) {
          console.error('❌ Error fetching user info:', error);
          // Nếu API lỗi, dùng thông tin từ participants (nếu là object)
          if (typeof otherUser === 'object') {
            setOtherUserInfo(otherUser);
          } else {
            setOtherUserInfo({ _id: otherUserId });
          }
        } finally {
          setLoadingUserInfo(false);
        }
      } else {
        // Fallback
        setOtherUserInfo(typeof otherUser === 'object' ? otherUser : null);
      }
    };

    fetchOtherUserInfo();
  }, [activeConversation, user]);

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Lấy thông tin user còn lại (fallback từ participants)
  const getOtherUser = () => {
    if (!activeConversation) return null;
    const currentUserId = (user._id || user.id || user.userId)?.toString();
    return activeConversation.participants?.find(p => {
      const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
      return participantId !== currentUserId;
    });
  };

  // Ưu tiên dùng otherUserInfo (đã fetch đầy đủ), nếu không có thì dùng từ participants
  const displayUser = otherUserInfo || getOtherUser();
  const displayUserId = typeof displayUser === 'string' ? displayUser : displayUser?._id || displayUser?.id;
  const isOtherUserOnline = displayUserId && onlineUsers.has(displayUserId);

  // Handle typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);

    // Start typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      startTyping();
    }

    // Clear timeout cũ
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout mới - stop typing sau 2s không gõ
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping();
      }, 2000);
    } else {
      setIsTyping(false);
      stopTyping();
    }
  };

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText('');
    setIsTyping(false);
    stopTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Format thời gian
  const formatMessageTime = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'HH:mm', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  // Hiển thị typing indicator
  const renderTypingIndicator = () => {
    const typingUserNames = Array.from(typingUsers.values());
    
    if (typingUserNames.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span>{typingUserNames[0]} đang gõ...</span>
      </div>
    );
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <svg
            className="w-16 h-16 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Chọn một cuộc trò chuyện
        </h3>
        <p className="text-gray-600 text-center max-w-sm px-4">
          Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-blue-50 shadow-sm">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {displayUser?.firstName?.[0]?.toUpperCase() || displayUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {isOtherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-gray-900 text-lg">
              {loadingUserInfo ? (
                <span className="text-gray-400">Đang tải...</span>
              ) : (
                displayUser?.firstName && displayUser?.lastName 
                  ? `${displayUser.firstName} ${displayUser.lastName}`
                  : displayUser?.name || 'Người dùng'
              )}
            </h3>
            <p className="text-xs text-gray-600 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1.5 ${isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {isOtherUserOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button className="p-2.5 hover:bg-blue-100 rounded-full transition-colors group">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2.5 hover:bg-blue-100 rounded-full transition-colors group">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-700">Chưa có tin nhắn</p>
              <p className="text-sm mt-2">Hãy bắt đầu trò chuyện!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // So sánh senderId linh hoạt - có thể là object hoặc string
            const messageSenderId = typeof message.senderId === 'object' 
              ? message.senderId._id || message.senderId.userId || message.senderId.id 
              : message.senderId;
            const currentUserId = user._id || user.userId || user.id;
            
            const isOwnMessage = messageSenderId === currentUserId;
            console.log('💬 Message display:', { 
              messageId: message._id, 
              messageSenderId, 
              currentUserId, 
              isOwnMessage,
              position: isOwnMessage ? 'PHẢI (mình gửi)' : 'TRÁI (người khác gửi)'
            });
            
            const showAvatar = index === 0 || messages[index - 1]?.senderId._id !== message.senderId._id;

            return (
              <div
                key={message._id}
                className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-md">
                    {isOwnMessage 
                      ? user.firstName?.[0]?.toUpperCase() 
                      : displayUser?.firstName?.[0]?.toUpperCase() || displayUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="w-9"></div>
                )}

                {/* Message bubble */}
                <div className={`max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`
                      px-4 py-2.5 rounded-2xl shadow-sm
                      ${isOwnMessage 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }
                    `}
                  >
                    <p className="text-sm break-words leading-relaxed">{message.content.text}</p>
                  </div>
                  <span className={`text-xs text-gray-500 mt-1.5 block ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2.5 hover:bg-blue-50 rounded-full transition-colors group"
          >
            <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`
              p-3 rounded-full transition-all shadow-md
              ${inputText.trim() 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
