import React, { useState } from 'react';

const ChatWidget = ({ otherUser = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'other',
      text: 'Chiếc xe này còn tốt không ạ?',
      time: '10:30',
    },
    {
      id: 2,
      sender: 'self',
      text: 'Vâng, xe rất tốt! Mới sử dụng 120 giờ thôi ạ',
      time: '10:32',
    },
    {
      id: 3,
      sender: 'other',
      text: 'Giá có thể thương lượng được không?',
      time: '10:35',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'self',
          text: inputMessage,
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Floating trigger button ── */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Mở chat"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '60px',
          height: '60px',
          borderRadius: '18px',
          border: 'none',
          background: 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(6,78,59,0.35)',
          zIndex: 40,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(6,78,59,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(6,78,59,0.35)';
        }}
      >
        <svg width="26" height="26" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {/* Unread badge */}
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--lux-gold), var(--lux-gold-light))',
          color: 'var(--lux-primary-900)',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(198,167,94,0.4)',
        }}>
          3
        </span>
      </button>
    );
  }

  /* ── Chat panel ── */
  return (
    <>
      <style>{`
        @keyframes widgetSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes widgetMsgIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '360px',
        maxHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden',
        zIndex: 50,
        boxShadow: '0 32px 72px rgba(5,46,43,0.2), 0 4px 20px rgba(0,0,0,0.08)',
        animation: 'widgetSlideUp 0.35s cubic-bezier(0.4,0,0.2,1)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--lux-primary-900) 0%, var(--lux-primary-700) 100%)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--lux-gold), var(--lux-gold-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--lux-primary-900)',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: '0 4px 12px rgba(198,167,94,0.3)',
            }}>
              {otherUser?.name?.[0]?.toUpperCase() || 'P'}
            </div>

            <div>
              <h3 style={{
                margin: 0,
                fontFamily: 'Noto Serif, Georgia, serif',
                fontWeight: 700,
                fontSize: '15px',
                color: 'white',
                letterSpacing: '0.02em',
              }}>
                {otherUser?.name || 'Pro Cycle Store'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#4ade80',
                  boxShadow: '0 0 6px rgba(74,222,128,0.6)',
                  display: 'inline-block',
                }} />
                <span style={{
                  fontSize: '12px',
                  color: 'var(--lux-gold-light)',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                }}>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'var(--lux-gray-50)',
        }}>
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'self' ? 'flex-end' : 'flex-start',
                animation: 'widgetMsgIn 0.25s ease-out',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: msg.sender === 'self' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.sender === 'self'
                  ? 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))'
                  : 'white',
                color: msg.sender === 'self' ? 'white' : 'var(--lux-charcoal)',
                border: msg.sender === 'self' ? 'none' : '1px solid var(--lux-gray-200)',
                boxShadow: msg.sender === 'self'
                  ? '0 6px 16px rgba(6,78,59,0.2)'
                  : '0 4px 12px rgba(0,0,0,0.06)',
              }}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </p>
                <p style={{
                  fontSize: '11px',
                  margin: '4px 0 0',
                  color: msg.sender === 'self' ? 'rgba(255,255,255,0.6)' : 'var(--lux-gray-400)',
                  fontFamily: 'Poppins, sans-serif',
                  textAlign: 'right',
                  letterSpacing: '0.01em',
                }}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid var(--lux-gray-200)',
          padding: '14px 16px',
          background: 'white',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--lux-gray-200)',
                outline: 'none',
                fontSize: '13px',
                fontFamily: 'Poppins, sans-serif',
                color: 'var(--lux-charcoal)',
                background: 'var(--lux-gray-50)',
                transition: 'all 0.2s',
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
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                border: 'none',
                background: inputMessage.trim()
                  ? 'linear-gradient(135deg, var(--lux-primary-800), var(--lux-primary-600))'
                  : 'var(--lux-gray-200)',
                color: inputMessage.trim() ? 'white' : 'var(--lux-gray-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                flexShrink: 0,
                boxShadow: inputMessage.trim() ? '0 4px 12px rgba(4,120,87,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (inputMessage.trim()) e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { icon: '📎', label: 'Tệp' },
              { icon: '📸', label: 'Ảnh' },
              { icon: '😊', label: 'Emoji' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                style={{
                  fontSize: '12px',
                  fontFamily: 'Poppins, sans-serif',
                  color: 'var(--lux-gray-500)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500,
                  padding: '4px 6px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--lux-primary-700)';
                  e.currentTarget.style.background = 'var(--lux-gray-100)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--lux-gray-500)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
