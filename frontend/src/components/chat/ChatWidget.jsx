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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-primary text-white p-5 rounded-full shadow-elevated hover:shadow-glow transition-all hover:scale-110 z-40 animate-float"
        title="Mở chat"
      >
        <span className="text-3xl">💬</span>
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-danger/50 text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          3
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 glass-card rounded-[20px] shadow-elevated w-96 max-h-[32rem] flex flex-col z-50 animate-scaleIn overflow-hidden">
      {/* Header with Gradient */}
      <div className="bg-gradient-primary text-white p-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{otherUser?.name || 'Pro Cycle Store'}</h3>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Đang hoạt động
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 p-2 rounded-[16px] transition-colors"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`max-w-[75%] p-3 rounded-[20px] shadow-soft ${msg.sender === 'self'
                ? 'bg-gradient-primary text-white rounded-br-sm'
                : 'bg-white text-primary-900 rounded-bl-sm border border-warmgray-200'
                }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${msg.sender === 'self' ? 'text-white/70' : 'text-warmgray-500'
                  }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-warmgray-200 p-4 bg-white space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 input text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="btn btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
        <div className="flex gap-3 text-xs">
          <button className="text-warmgray-600 hover:text-primary-600 transition-colors font-medium">
            📎 Tệp
          </button>
          <button className="text-warmgray-600 hover:text-primary-600 transition-colors font-medium">
            📸 Ảnh
          </button>
          <button className="text-warmgray-600 hover:text-primary-600 transition-colors font-medium">
            😊 Emoji
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;

