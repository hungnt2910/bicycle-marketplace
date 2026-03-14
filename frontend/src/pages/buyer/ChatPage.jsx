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
      // Nếu không có conversationId từ state, tự động chọn conversation đầu tiên
      setActiveConversation(conversations[0]);
    }
  }, [location.state, conversations, setActiveConversation]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                title="Quay lại"
              >
                <svg 
                  className="w-6 h-6 text-gray-600 group-hover:text-gray-900" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg 
                    className="w-7 h-7 text-blue-600 mr-2" 
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
                  Tin nhắn
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Quản lý cuộc trò chuyện của bạn
                </p>
              </div>
            </div>
            
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              title="Về trang chủ"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              <span className="font-medium">Trang chủ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversations List */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationList />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-gray-50">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
