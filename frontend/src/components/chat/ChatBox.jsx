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
    loadMessages,
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
      const otherUser = activeConversation.participants?.find((p) => {
        const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
        return participantId !== currentUserId;
      });

      // Lấy userId để fetch
      const otherUserId =
        typeof otherUser === 'string' ? otherUser : otherUser?._id || otherUser?.id;

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
    return activeConversation.participants?.find((p) => {
      const participantId = (typeof p === 'string' ? p : p._id || p.id)?.toString();
      return participantId !== currentUserId;
    });
  };

  // Ưu tiên dùng otherUserInfo (đã fetch đầy đủ), nếu không có thì dùng từ participants
  const displayUser = otherUserInfo || getOtherUser();
  const displayUserId =
    typeof displayUser === 'string' ? displayUser : displayUser?._id || displayUser?.id;
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        color: 'var(--lux-gray-500)',
        fontSize: '13px',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--lux-gold)',
                animation: 'chatBounce 1.2s ease-in-out infinite',
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>
        <span>{typingUserNames[0]} đang gõ...</span>
      </div>
    );
  };

  // Empty state - no conversation selected
  if (!activeConversation) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'linear-gradient(145deg, var(--lux-gray-50) 0%, rgba(4,120,87,0.04) 100%)',
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px',
          boxShadow: '0 20px 40px rgba(6,78,59,0.2)',
        }}>
          <svg width="44" height="44" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 style={{
          fontFamily: 'Noto Serif, Georgia, serif',
          fontWeight: 700,
          fontSize: '22px',
          color: 'var(--lux-primary-900)',
          marginBottom: '10px',
          letterSpacing: '0.01em',
        }}>
          Chọn một cuộc trò chuyện
        </h3>
        <p style={{
          color: 'var(--lux-gray-500)',
          textAlign: 'center',
          maxWidth: '280px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Poppins, sans-serif',
        }}>
          Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
        </p>
        {/* Decorative gold line */}
        <div style={{
          marginTop: '24px',
          width: '48px',
          height: '2px',
          background: 'linear-gradient(90deg, var(--lux-gold), var(--lux-gold-light))',
          borderRadius: '2px',
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-700) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(5,46,43,0.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--lux-gold), var(--lux-gold-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--lux-primary-900)',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 12px rgba(198,167,94,0.3)',
              flexShrink: 0,
            }}>
              {displayUser?.firstName?.[0]?.toUpperCase() ||
                displayUser?.name?.[0]?.toUpperCase() ||
                'U'}
            </div>
          </div>

          {/* Name & status */}
          <div>
            <h3 style={{
              fontFamily: 'Noto Serif, Georgia, serif',
              fontWeight: 700,
              fontSize: '16px',
              color: 'white',
              margin: 0,
              letterSpacing: '0.02em',
            }}>
              {loadingUserInfo ? (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontFamily: 'Poppins, sans-serif' }}>
                  Đang tải...
                </span>
              ) : displayUser?.firstName && displayUser?.lastName ? (
                `${displayUser.firstName} ${displayUser.lastName}`
              ) : (
                displayUser?.name || 'Người dùng'
              )}
            </h3>
            <p style={{
              margin: '3px 0 0',
              fontSize: '12px',
              color: 'var(--lux-gold-light)',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>

            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            // Search icon
            <path key="s" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
            // More icon
            <path key="m" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />,
          ].map((path, i) => (
            <button key={i} style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'white',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,167,94,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {path}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'linear-gradient(180deg, var(--lux-gray-50) 0%, white 100%)',
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(4,120,87,0.12), rgba(198,167,94,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1.5px solid rgba(4,120,87,0.15)',
              }}>
                <svg width="32" height="32" fill="none" stroke="var(--lux-primary-600)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p style={{
                fontWeight: 600,
                color: 'var(--lux-primary-900)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '15px',
                margin: '0 0 6px',
              }}>
                Chưa có tin nhắn
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--lux-gray-400)',
                fontFamily: 'Poppins, sans-serif',
                margin: 0,
              }}>
                Hãy bắt đầu trò chuyện!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const messageSenderId =
              typeof message.senderId === 'object'
                ? message.senderId._id || message.senderId.userId || message.senderId.id
                : message.senderId;
            const currentUserId = user._id || user.userId || user.id;

            const isOwnMessage = messageSenderId === currentUserId;
            console.log('💬 Message display:', {
              messageId: message._id,
              messageSenderId,
              currentUserId,
              isOwnMessage,
              position: isOwnMessage ? 'PHẢI (mình gửi)' : 'TRÁI (người khác gửi)',
            });

            const showAvatar =
              index === 0 || messages[index - 1]?.senderId._id !== message.senderId._id;

            return (
              <div
                key={message._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '10px',
                  flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                  animation: 'chatFadeIn 0.3s ease-out',
                }}
              >
                {/* Avatar */}
                <div style={{ width: '34px', flexShrink: 0 }}>
                  {showAvatar ? (
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: isOwnMessage
                        ? 'linear-gradient(135deg, var(--lux-primary-700), var(--lux-primary-500))'
                        : 'linear-gradient(135deg, var(--lux-gold), var(--lux-gold-light))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOwnMessage ? 'white' : 'var(--lux-primary-900)',
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: 'Poppins, sans-serif',
                      boxShadow: isOwnMessage
                        ? '0 4px 10px rgba(4,120,87,0.25)'
                        : '0 4px 10px rgba(198,167,94,0.25)',
                    }}>
                      {isOwnMessage
                        ? user.firstName?.[0]?.toUpperCase() || 'T'
                        : displayUser?.firstName?.[0]?.toUpperCase() ||
                        displayUser?.name?.[0]?.toUpperCase() ||
                        'U'}
                    </div>
                  ) : null}
                </div>

                {/* Bubble */}
                <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isOwnMessage
                      ? 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))'
                      : 'white',
                    color: isOwnMessage ? 'white' : 'var(--lux-charcoal)',
                    border: isOwnMessage ? 'none' : '1px solid var(--lux-gray-200)',
                    boxShadow: isOwnMessage
                      ? '0 8px 20px rgba(6,78,59,0.2)'
                      : '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'Poppins, sans-serif',
                    wordBreak: 'break-word',
                  }}>
                    {message.content.text}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--lux-gray-400)',
                    marginTop: '4px',
                    fontFamily: 'Poppins, sans-serif',
                    letterSpacing: '0.01em',
                  }}>
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

      {/* ── Input area ── */}
      <div style={{
        padding: '16px 20px',
        background: 'white',
        borderTop: '1px solid var(--lux-gray-200)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
        flexShrink: 0,
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Attachment button */}
          <button
            type="button"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1.5px solid var(--lux-gray-200)',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--lux-gray-400)',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--lux-primary-600)';
              e.currentTarget.style.color = 'var(--lux-primary-600)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
              e.currentTarget.style.color = 'var(--lux-gray-400)';
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn..."
            style={{
              flex: 1,
              padding: '11px 18px',
              border: '1.5px solid var(--lux-gray-200)',
              borderRadius: '14px',
              outline: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              color: 'var(--lux-charcoal)',
              background: 'var(--lux-gray-50)',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--lux-primary-600)';
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
              e.currentTarget.style.background = 'var(--lux-gray-50)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              border: 'none',
              background: inputText.trim()
                ? 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))'
                : 'var(--lux-gray-200)',
              color: inputText.trim() ? 'white' : 'var(--lux-gray-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: inputText.trim() ? '0 6px 16px rgba(4,120,87,0.3)' : 'none',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (inputText.trim()) {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(4,120,87,0.4)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = inputText.trim() ? '0 6px 16px rgba(4,120,87,0.3)' : 'none';
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes chatBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
