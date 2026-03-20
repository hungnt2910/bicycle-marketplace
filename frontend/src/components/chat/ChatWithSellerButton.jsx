import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import chatApi from '../../api/chatApi';
import { toast } from 'react-toastify';

const ChatWithSellerButton = ({ sellerId, productId, sellerName }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleChatClick = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để chat với người bán');
      navigate('/login');
      return;
    }

    // Debug logging
    console.log('Current User:', user);
    console.log('Current User ID:', user?._id || user?.id);
    console.log('Seller ID:', sellerId);
    console.log('Product ID:', productId);

    // Kiểm tra sellerId có tồn tại không
    if (!sellerId) {
      toast.error('Không tìm thấy thông tin người bán');
      console.error('sellerId is missing or undefined');
      return;
    }

    // Kiểm tra không thể chat với chính mình
    const currentUserId = user?._id || user?.id || user?.userId;
    const sellerIdStr = typeof sellerId === 'object' ? sellerId._id || sellerId.id : sellerId;
    const currentUserIdStr = typeof currentUserId === 'object' ? currentUserId._id || currentUserId.id : currentUserId;

    if (currentUserIdStr && sellerIdStr && currentUserIdStr.toString() === sellerIdStr.toString()) {
      toast.warning('Bạn không thể chat với chính mình');
      return;
    }

    try {
      setLoading(true);

      // Tạo hoặc lấy conversation với seller
      const conversation = await chatApi.createConversation(sellerIdStr);

      // Chuyển đến trang chat
      navigate('/chat', {
        state: {
          conversationId: conversation._id,
          productId: productId,
        },
      });
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleChatClick}
      disabled={loading || !sellerId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '13px 20px',
        background: hovered && !loading && sellerId
          ? 'linear-gradient(135deg, var(--lux-primary-900), var(--lux-primary-700))'
          : 'transparent',
        border: '2px solid var(--lux-primary-800)',
        borderRadius: '14px',
        color: hovered && !loading && sellerId ? 'white' : 'var(--lux-primary-800)',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '0.01em',
        cursor: loading || !sellerId ? 'not-allowed' : 'pointer',
        opacity: loading || !sellerId ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: hovered && !loading && sellerId
          ? '0 8px 24px rgba(4,120,87,0.2)'
          : 'none',
        transform: hovered && !loading && sellerId ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {/* Chat icon */}
      <svg
        width="19"
        height="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={{ flexShrink: 0, transition: 'transform 0.2s', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Loading spinner or label */}
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            style={{ animation: 'spin 1s linear infinite' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Đang tạo...
        </span>
      ) : (
        `Chat với ${sellerName || 'người bán'}`
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default ChatWithSellerButton;
