import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import ConversationList from '../../components/chat/ConversationList';
import ChatBox from '../../components/chat/ChatBox';

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveConversation, conversations, loadConversations } = useChat();

  // Load lại conversations khi vào trang
  useEffect(() => {
    console.log('📄 ChatPage mounted, loading conversations...');
    loadConversations();
  }, []);

  // Nếu có conversationId từ navigation state, tự động chọn conversation đó
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conversation = conversations.find(
        c => c._id === location.state.conversationId
      );
      if (conversation) {
        setActiveConversation(conversation);
      }
    } else if (conversations.length > 0 && !location.state?.conversationId) {
      setActiveConversation(conversations[0]);
    }
  }, [location.state, conversations, setActiveConversation]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--lux-gray-50)' }}>

      {/* ── Hero Header — mirrors Wallet.jsx ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--lux-primary-900)',
          flexShrink: 0,
        }}
      >
        {/* Ambient gold glow — top right */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            opacity: 0.1,
            background: 'radial-gradient(circle, var(--lux-gold) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Ambient emerald glow — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '260px',
            height: '120px',
            opacity: 0.15,
            background: 'radial-gradient(ellipse, var(--lux-primary-500) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ padding: '20px 28px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Left: back + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Back button */}
              <button
                onClick={() => navigate(-1)}
                title="Quay lại"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Title block */}
              <div>
                {/* Eyebrow label */}
                <span style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  color: 'var(--lux-gold)',
                  fontFamily: 'Poppins, sans-serif',
                  marginBottom: '4px',
                }}>
                  Trung tâm tin nhắn
                </span>
                <h1 style={{
                  margin: 0,
                  fontFamily: "'Noto Serif', Georgia, serif",
                  fontWeight: 700,
                  fontSize: '26px',
                  letterSpacing: '0.01em',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  lineHeight: 1.2,
                }}>
                  {/* Chat icon */}
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(198,167,94,0.18)',
                    border: '1px solid rgba(198,167,94,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="var(--lux-gold)" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                  Tin nhắn
                </h1>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Poppins, sans-serif',
                }}>
                  Quản lý cuộc trò chuyện của bạn
                </p>
              </div>
            </div>

            {/* Right: Home button */}
            <button
              onClick={() => navigate('/')}
              title="Về trang chủ"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Trang chủ
            </button>
          </div>
        </div>

        {/* Bottom gold edge line */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(198,167,94,0.4), transparent)',
        }} />
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar — Conversation List ── */}
        <div style={{
          width: '300px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRight: '1px solid var(--lux-gray-200)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        }}>
          {/* Search bar */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--lux-gray-100)',
            background: 'linear-gradient(135deg, rgba(4,120,87,0.04) 0%, rgba(198,167,94,0.03) 100%)',
            flexShrink: 0,
          }}>
            <div style={{ position: 'relative' }}>
              <svg
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--lux-gray-400)',
                  pointerEvents: 'none',
                }}
                width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '14px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: '1.5px solid var(--lux-gray-200)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  color: 'var(--lux-charcoal)',
                  background: 'white',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--lux-primary-600)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(4,120,87,0.1)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--lux-gray-200)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Conversation count label */}
          <div style={{
            padding: '10px 16px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '3px',
              height: '14px',
              borderRadius: '2px',
              backgroundColor: 'var(--lux-gold)',
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--lux-gray-400)',
              fontFamily: 'Poppins, sans-serif',
            }}>
              Cuộc trò chuyện
            </span>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ConversationList />
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--lux-gray-50)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
