import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import userApi from '../../api/userApi';

const ConversationList = () => {
  const { conversations, activeConversation, setActiveConversation, onlineUsers, loading } =
    useChat();
  const { user } = useAuth();
  const [userInfoMap, setUserInfoMap] = useState(new Map());
  const [hoveredId, setHoveredId] = useState(null);

  // Lấy thông tin user còn lại trong conversation (không phải mình)
  const getOtherUser = (conversation) => {
    if (!conversation.participants) return null;

    const currentUserId = (user._id || user.id || user.userId)?.toString();

    return conversation.participants.find((p) => {
      const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
      return participantId !== currentUserId;
    });
  };

  // Fetch thông tin đầy đủ của tất cả users trong conversations
  useEffect(() => {
    const fetchAllUsersInfo = async () => {
      if (!conversations || conversations.length === 0) return;

      const userIds = new Set();
      conversations.forEach((conv) => {
        const otherUser = getOtherUser(conv);
        if (otherUser) {
          const userId = typeof otherUser === 'string' ? otherUser : otherUser._id || otherUser.id;
          if (userId) {
            userIds.add(userId);
          }
        }
      });

      const newUserInfoMap = new Map();

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {/* Skeleton shimmer */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            width: '100%',
            opacity: 1 - i * 0.25,
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--lux-gray-100)',
              animation: 'pulse 1.8s ease-in-out infinite',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                height: '14px',
                borderRadius: '8px',
                background: 'var(--lux-gray-100)',
                width: '60%',
                marginBottom: '8px',
                animation: 'pulse 1.8s ease-in-out infinite',
              }} />
              <div style={{
                height: '12px',
                borderRadius: '8px',
                background: 'var(--lux-gray-100)',
                width: '80%',
                animation: 'pulse 1.8s ease-in-out infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '32px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(4,120,87,0.12), rgba(198,167,94,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1.5px solid rgba(4,120,87,0.15)',
        }}>
          <svg width="32" height="32" fill="none" stroke="var(--lux-primary-600)" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p style={{
          fontWeight: 600,
          fontFamily: 'Poppins, sans-serif',
          color: 'var(--lux-primary-900)',
          fontSize: '15px',
          margin: '0 0 8px',
        }}>
          Chưa có cuộc trò chuyện
        </p>
        <p style={{
          fontSize: '13px',
          color: 'var(--lux-gray-400)',
          fontFamily: 'Poppins, sans-serif',
          maxWidth: '200px',
          lineHeight: '1.6',
          margin: 0,
        }}>
          Bắt đầu trò chuyện khi bạn quan tâm đến một chiếc xe
        </p>
        <div style={{
          marginTop: '20px',
          width: '40px',
          height: '2px',
          background: 'linear-gradient(90deg, var(--lux-gold), var(--lux-gold-light))',
          borderRadius: '2px',
        }} />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);

        const otherUserId =
          typeof otherUser === 'string' ? otherUser : otherUser?._id || otherUser?.id;

        const userInfo = otherUserId ? userInfoMap.get(otherUserId) || otherUser : otherUser;

        const isActive = activeConversation?._id === conversation._id;
        const isOnline = isUserOnline(otherUserId);
        const hasUnread = conversation.unreadCount?.[user._id] > 0;
        const isHovered = hoveredId === conversation._id;

        const displayName =
          userInfo?.firstName && userInfo?.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo?.name || 'Người dùng';

        const avatarInitial =
          userInfo?.firstName?.[0]?.toUpperCase() || userInfo?.name?.[0]?.toUpperCase() || 'U';

        return (
          <div
            key={conversation._id}
            onClick={() => setActiveConversation(conversation)}
            onMouseEnter={() => setHoveredId(conversation._id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--lux-gray-100)',
              borderLeft: isActive ? '3px solid var(--lux-primary-700)' : '3px solid transparent',
              background: isActive
                ? 'linear-gradient(90deg, rgba(4,120,87,0.08) 0%, rgba(4,120,87,0.03) 100%)'
                : isHovered
                  ? 'var(--lux-gray-50)'
                  : 'white',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              position: 'relative',
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: isActive
                  ? 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))'
                  : 'linear-gradient(135deg, var(--lux-gold), var(--lux-gold-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '17px',
                color: isActive ? 'white' : 'var(--lux-primary-900)',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: isActive
                  ? '0 4px 12px rgba(4,120,87,0.25)'
                  : '0 4px 10px rgba(198,167,94,0.2)',
                transition: 'all 0.2s',
              }}>
                {avatarInitial}
              </div>
            </div>

            {/* Content */}
            <div style={{ marginLeft: '12px', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: hasUnread ? 700 : 600,
                  fontSize: '14px',
                  color: hasUnread ? 'var(--lux-primary-900)' : 'var(--lux-gray-700)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '130px',
                  transition: 'color 0.2s',
                }}>
                  {displayName}
                </h3>
                {conversation.lastMessage?.timestamp && (
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--lux-gray-400)',
                    fontFamily: 'Poppins, sans-serif',
                    flexShrink: 0,
                    marginLeft: '8px',
                    letterSpacing: '0.01em',
                  }}>
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{
                  fontSize: '13px',
                  color: hasUnread ? 'var(--lux-gray-700)' : 'var(--lux-gray-400)',
                  fontWeight: hasUnread ? 600 : 400,
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {conversation.lastMessage?.text || 'Bắt đầu trò chuyện...'}
                </p>
                {hasUnread && (
                  <span style={{
                    marginLeft: '8px',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '20px',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 2px 8px rgba(4,120,87,0.3)',
                  }}>
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
