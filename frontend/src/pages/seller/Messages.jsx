import React, { useState } from 'react';
import { Card, Avatar, Badge, Button } from '../../components/ui';

const Messages = () => {
    const [selectedChat, setSelectedChat] = useState(1);

    const conversations = [
        {
            id: 1,
            user: 'Nguyễn Văn A',
            lastMessage: 'Xe còn không anh?',
            time: '10 phút trước',
            unread: 2,
            online: true,
        },
        {
            id: 2,
            user: 'Trần Thị B',
            lastMessage: 'Em muốn xem xe trực tiếp được không?',
            time: '1 giờ trước',
            unread: 0,
            online: false,
        },
        {
            id: 3,
            user: 'Lê Văn C',
            lastMessage: 'Cảm ơn anh nhiều!',
            time: '2 giờ trước',
            unread: 0,
            online: false,
        },
    ];

    const messages = [
        {
            id: 1,
            sender: 'buyer',
            text: 'Chào anh, xe Giant Talon 3 còn không ạ?',
            time: '14:30',
        },
        {
            id: 2,
            sender: 'seller',
            text: 'Chào bạn, xe vẫn còn nhé. Bạn quan tâm đến xe này à?',
            time: '14:32',
        },
        {
            id: 3,
            sender: 'buyer',
            text: 'Vâng, em thấy xe đẹp quá. Anh cho em hỏi xe đã đi được bao lâu rồi ạ?',
            time: '14:35',
        },
        {
            id: 4,
            sender: 'seller',
            text: 'Xe mới mua 3 tháng thôi em. Anh chỉ đi cuối tuần nên xe còn rất mới.',
            time: '14:36',
        },
        {
            id: 5,
            sender: 'buyer',
            text: 'Xe còn không anh?',
            time: '15:20',
        },
    ];

    const selectedConversation = conversations.find(c => c.id === selectedChat);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-primary-900">Tin nhắn</h2>
                <p className="text-warmgray-600 mt-1">Trò chuyện với người mua</p>
            </div>

            {/* Messages Container */}
            <Card className="overflow-hidden">
                <div className="grid lg:grid-cols-3 h-[600px]">
                    {/* Conversations List */}
                    <div className="lg:col-span-1 border-r border-warmgray-200 overflow-y-auto">
                        <div className="p-4 border-b border-warmgray-200">
                            <input
                                type="text"
                                placeholder="Tìm kiếm cuộc trò chuyện..."
                                className="w-full px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedChat(conv.id)}
                                    className={`p-4 border-b border-warmgray-100 cursor-pointer hover:bg-neutral-offwhite transition-colors ${selectedChat === conv.id ? 'bg-primary-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <Avatar name={conv.user} size="md" />
                                            {conv.online && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="font-medium text-sm truncate">{conv.user}</h4>
                                                {conv.unread > 0 && (
                                                    <Badge variant="danger" className="ml-2">{conv.unread}</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-warmgray-600 truncate">{conv.lastMessage}</p>
                                            <p className="text-xs text-warmgray-500 mt-1">{conv.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-2 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-warmgray-200 bg-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar name={selectedConversation?.user} size="md" />
                                    <div>
                                        <h3 className="font-medium">{selectedConversation?.user}</h3>
                                        <p className="text-sm text-warmgray-600">
                                            {selectedConversation?.online ? 'Đang hoạt động' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Xem hồ sơ</Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-neutral-offwhite">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-[16px] p-3 ${message.sender === 'seller'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-white border border-warmgray-200'
                                                }`}
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p
                                                className={`text-xs mt-1 ${message.sender === 'seller' ? 'text-primary-100' : 'text-warmgray-500'
                                                    }`}
                                            >
                                                {message.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-warmgray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2 border border-warmgray-300 rounded-[16px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <Button variant="primary">Gửi</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Messages;
