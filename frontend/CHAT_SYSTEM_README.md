# 📱 Hệ Thống Chat Real-time

Hệ thống chat real-time sử dụng Socket.IO đã được tích hợp hoàn tất!

## ✅ Đã Hoàn Thành

### 1. **API Services**
- [chatApi.jsx](src/api/chatApi.jsx) - REST API endpoints
- [socketService.js](src/services/socketService.js) - Socket.IO service

### 2. **State Management**
- [ChatContext.jsx](src/contexts/ChatContext.jsx) - Quản lý state toàn cục

### 3. **Components**
- [ConversationList.jsx](src/components/chat/ConversationList.jsx) - Danh sách cuộc trò chuyện
- [ChatBox.jsx](src/components/chat/ChatBox.jsx) - Giao diện chat

### 4. **Pages**
- [ChatPage.jsx](src/pages/buyer/ChatPage.jsx) - Trang chat chính

## 🚀 Cách Sử Dụng

### 1. Thêm Environment Variables

Tạo/cập nhật file `.env` trong folder `frontend`:

```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 2. Thêm Route

Cập nhật file routing để thêm route cho chat page:

```jsx
import ChatPage from '../pages/buyer/ChatPage';

// Thêm vào routes
{
  path: '/chat',
  element: <ChatPage />
}
```

### 3. Wrap App với ChatProvider (Optional)

Nếu muốn sử dụng chat context ở nhiều nơi:

```jsx
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        {/* Your app */}
      </ChatProvider>
    </AuthProvider>
  );
}
```

## 🎯 Features

### ✨ Real-time Features
- ✅ Gửi/nhận tin nhắn real-time
- ✅ Typing indicator (đang gõ...)
- ✅ Online/Offline status
- ✅ Đánh dấu đã đọc
- ✅ Auto scroll to latest message
- ✅ Unread count badge

### 🎨 UI Features
- ✅ Responsive design với Tailwind CSS
- ✅ Avatar với online indicator
- ✅ Message bubbles (khác màu cho người gửi/nhận)
- ✅ Time stamps
- ✅ Loading states
- ✅ Empty states

## 📡 Socket.IO Events

### Client → Server:
- `join-conversation` - Join vào room chat
- `send-message` - Gửi tin nhắn
- `typing` - Bắt đầu gõ
- `stop-typing` - Dừng gõ
- `mark-read` - Đánh dấu đã đọc

### Server → Client:
- `new-message` - Tin nhắn mới
- `user-online` - User online
- `user-offline` - User offline
- `user-typing` - User đang gõ
- `user-stop-typing` - User dừng gõ
- `messages-read` - Tin đã được đọc

## 🔧 Customization

### Thay đổi màu sắc
Chỉnh sửa trong các component:
- `bg-blue-500` → màu cho message bubble của mình
- `bg-white` → màu cho message bubble người khác

### Thêm tính năng
- Gửi ảnh/file: Thêm vào `sendMessage()` trong ChatContext
- Emoji picker: Thêm component emoji vào ChatBox
- Voice message: Tích hợp recording API

## 📝 Notes

1. **Socket URL**: Đảm bảo backend đang chạy ở port 3000 hoặc cập nhật `VITE_SOCKET_URL`
2. **Authentication**: Socket service tự động gửi `userId` khi connect
3. **Auto-reconnect**: Socket.IO tự động reconnect khi mất kết nối
4. **Typing timeout**: Typing indicator tự động tắt sau 2 giây không gõ

## 🐛 Troubleshooting

### Socket không kết nối?
- Kiểm tra backend có chạy không
- Kiểm tra CORS settings ở backend
- Xem console log để debug

### Messages không hiển thị?
- Kiểm tra activeConversation đã được set chưa
- Xem network tab để check API calls
- Kiểm tra Socket events trong console

## 🎉 Next Steps

1. **Thêm vào routing** - Cập nhật routes config
2. **Test chức năng** - Mở 2 tabs khác nhau để test real-time
3. **Customize UI** - Điều chỉnh màu sắc, spacing theo design
4. **Thêm features** - Gửi ảnh, emoji, voice message, etc.

Happy Coding! 🚀
