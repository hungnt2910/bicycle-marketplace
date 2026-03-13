import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import chatApi from '../../api/chatApi';
import { toast } from 'react-toastify';

const ChatWithSellerButton = ({ sellerId, productId, sellerName }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
          productId: productId 
        } 
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
      className="w-full px-6 py-4 bg-white border-2 border-primary-800 text-primary-800 font-bold rounded-[16px] hover:bg-primary-800/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
    >
      <svg 
        className="w-5 h-5" 
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
      {loading ? 'Đang tạo...' : `Chat với ${sellerName || 'người bán'}`}
    </button>
  );
};

export default ChatWithSellerButton;
