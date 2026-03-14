import React, { useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ConversationList from '../../components/chat/ConversationList';
import ChatBox from '../../components/chat/ChatBox';

const Messages = () => {
    const { loadConversations, conversations, setActiveConversation } = useChat();

    // Load conversations khi vào trang
    useEffect(() => {
        console.log('📄 Seller Messages mounted, loading conversations...');
        loadConversations();
    }, []);

    // Auto-select first conversation nếu có
    useEffect(() => {
        console.log('📋 Conversations updated:', conversations);
        console.log('📊 Conversations count:', conversations?.length || 0);
        if (conversations.length > 0) {
            setActiveConversation(conversations[0]);
        }
    }, [conversations]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-primary-900">Tin nhắn</h2>
                <p className="text-warmgray-600 mt-1">Trò chuyện với người mua</p>
            </div>

            {/* Messages Container */}
            <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 h-[calc(100vh-250px)] min-h-[600px]">
                    {/* Conversations List */}
                    <div className="col-span-1 border-r border-warmgray-200 flex flex-col h-full min-h-0">
                        <div className="p-4 border-b border-warmgray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm cuộc trò chuyện..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-warmgray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                                <svg
                                    className="absolute left-3 top-3 w-5 h-5 text-warmgray-400"
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
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {/* Debug Info */}
                            {conversations?.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    <p className="text-sm">Chưa có cuộc trò chuyện nào</p>
                                    <p className="text-xs mt-1">Khi có người mua nhắn tin, cuộc trò chuyện sẽ hiển thị ở đây</p>
                                </div>
                            )}
                            <ConversationList />
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-2 bg-gray-50 h-full flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <ChatBox />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;

