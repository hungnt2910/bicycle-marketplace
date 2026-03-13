import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import userApi from '../../api/userApi';

const ConversationList = () => {
  const { conversations, activeConversation, setActiveConversation, onlineUsers, loading } = useChat();
  const { user } = useAuth();
  const [userInfoMap, setUserInfoMap] = useState(new Map());

  // Lấy thông tin user còn lại trong conversation (không phải mình)
  const getOtherUser = (conversation) => {
    if (!conversation.participants) return null;
    
    const currentUserId = (user._id || user.id || user.userId)?.toString();
    
    return conversation.participants.find(p => {
      // Xử lý cả trường hợp p là string hoặc object
      const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
      return participantId !== currentUserId;
    });
  };

  // Fetch thông tin đầy đủ của tất cả users trong conversations
  useEffect(() => {
    const fetchAllUsersInfo = async () => {
      if (!conversations || conversations.length === 0) return;

      const userIds = new Set();
      conversations.forEach(conv => {
        const otherUser = getOtherUser(conv);
        if (otherUser) {
          // Lấy userId từ string hoặc object
          const userId = typeof otherUser === 'string' ? otherUser : otherUser._id || otherUser.id;
          if (userId) {
            userIds.add(userId);
          }
        }
      });

      const newUserInfoMap = new Map();
      
      // Fetch thông tin từng user
      for (const userId of userIds) {
        try {
          const response = await userApi.getUserById(userId);
          if (response.data) {
            newUserInfoMap.set(userId, response.data);
            console.log('✅ Loaded user info for conversation:', response.data);
          }
        } catch (error) {
          console.error('❌ Error fetching user info:', userId, error);
        }
      }

      setUserInfoMap(newUserInfoMap);
    };

    fetchAllUsersInfo();
  }, [conversations]);

  // Kiểm tra user có online không
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Format thời gian
  const formatTime = (date) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-blue-600"
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
        <p className="text-center font-semibold text-gray-700 mb-2">Chưa có cuộc trò chuyện</p>
        <p className="text-sm text-center text-gray-500 max-w-xs">
          Bắt đầu trò chuyện khi bạn quan tâm đến một chiếc xe
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        
        // Lấy userId để tìm trong userInfoMap
        const otherUserId = typeof otherUser === 'string' ? otherUser : otherUser?._id || otherUser?.id;
        
        // Ưu tiên dùng thông tin từ API, fallback về participants
        const userInfo = otherUserId ? (userInfoMap.get(otherUserId) || otherUser) : otherUser;
        
        const isActive = activeConversation?._id === conversation._id;
        const isOnline = isUserOnline(otherUserId);
        const hasUnread = conversation.unreadCount?.[user._id] > 0;

        // Lấy tên hiển thị
        const displayName = userInfo?.firstName && userInfo?.lastName 
          ? `${userInfo.firstName} ${userInfo.lastName}`
          : userInfo?.name || 'Người dùng';
        
        // Lấy ký tự đầu cho avatar
        const avatarInitial = userInfo?.firstName?.[0]?.toUpperCase() 
          || userInfo?.name?.[0]?.toUpperCase() 
          || 'U';

        return (
          <div
            key={conversation._id}
            onClick={() => setActiveConversation(conversation)}
            className={`
              flex items-center p-4 cursor-pointer border-b border-gray-100
              hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
              transition-all duration-200
              ${isActive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-600 shadow-sm' : ''}
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {avatarInitial}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              )}
            </div>

            {/* Content */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {displayName}
                </h3>
                {conversation.lastMessage?.timestamp && (
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0 font-medium">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {conversation.lastMessage?.text || 'Bắt đầu trò chuyện...'}
                </p>
                {hasUnread && (
                  <span className="ml-2 flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold shadow-sm">
                    {conversation.unreadCount[user._id]}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
