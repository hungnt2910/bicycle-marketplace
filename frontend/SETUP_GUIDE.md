# 🚀 ROUTIN Frontend - Hướng Dẫn Thiết Lập & Sử Dụng

## 📋 Cấu Trúc Dự Án

```
frontend/
├── src/
│   ├── App.jsx                          # Entry point chính
│   ├── main.jsx                         # Bootstrap
│   ├── contexts/
│   │   └── AuthContext.jsx              # Quản lý authentication
│   ├── layouts/
│   │   ├── BuyerLayout.jsx              # Layout cho người mua
│   │   ├── DashboardLayoutEnhanced.jsx  # Layout cho seller/inspector/admin
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx                # Trang đăng nhập
│   │   ├── buyer/
│   │   │   ├── BuyerDashboard.jsx       # Tài khoản, lịch sử giao dịch
│   │   │   ├── Marketplace.jsx          # Trang chủ, danh sách xe
│   │   │   ├── AdvancedSearch.jsx       # Tìm kiếm & lọc nâng cao
│   │   │   ├── ProductDetail.jsx        # (cũ)
│   │   │   └── ProductDetailEnhanced.jsx # Chi tiết sản phẩm, đặt cọc
│   │   ├── seller/
│   │   │   ├── SellerDashboard.jsx      # Dashboard bán hàng
│   │   │   ├── CreateListing.jsx        # (cũ)
│   │   │   ├── CreateListingEnhanced.jsx # Đăng tin 4 bước
│   │   │   └── OrderManagement.jsx      # (cũ)
│   │   ├── inspector/
│   │   │   ├── InspectorWorkspace.jsx   # (cũ)
│   │   │   └── InspectorDashboard.jsx   # Dashboard kiểm định
│   │   └── admin/
│   │       ├── AdminDashboard.jsx       # (cũ)
│   │       ├── AdminDashboardEnhanced.jsx # Dashboard quản trị
│   │       └── DisputeResolution.jsx    # (cũ)
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatWidget.jsx           # Chat widget tích hợp
│   │   ├── common/
│   │   │   └── Icons.jsx                # Biểu tượng
│   │   └── product/
│   ├── hooks/
│   ├── api/
│   ├── configs/
│   ├── assets/
│   └── routes/
├── package.json
├── vite.config.js
├── FEATURES.md                          # Tài liệu tính năng
└── README.md

```

## ✨ Các Tệp Mới Được Tạo

### Authentication & Context

- ✅ `contexts/AuthContext.jsx` - Quản lý trạng thái đăng nhập

### Buyer Pages

- ✅ `pages/buyer/BuyerDashboard.jsx` - Quản lý tài khoản & lịch sử
- ✅ `pages/buyer/AdvancedSearch.jsx` - Tìm kiếm & lọc nâng cao
- ✅ `pages/buyer/ProductDetailEnhanced.jsx` - Chi tiết sản phẩm, đặt cọc, báo cáo kiểm định

### Seller Pages

- ✅ `pages/seller/SellerDashboard.jsx` - Dashboard quản lý bán hàng
- ✅ `pages/seller/CreateListingEnhanced.jsx` - Đăng tin bán xe (4 bước)

### Inspector Pages

- ✅ `pages/inspector/InspectorDashboard.jsx` - Dashboard kiểm định & tranh chấp

### Admin Pages

- ✅ `pages/admin/AdminDashboardEnhanced.jsx` - Quản lý toàn bộ hệ thống

### Layouts

- ✅ `layouts/BuyerLayout.jsx` - Header + Footer cho người mua
- ✅ `layouts/DashboardLayoutEnhanced.jsx` - Sidebar + Header cho dashboard

### Components

- ✅ `components/chat/ChatWidget.jsx` - Cải thiện Chat widget

### App & Main

- ✅ `App.jsx` - Routing cho 4 vai trò
- ✅ `FEATURES.md` - Tài liệu chi tiết tính năng

## 🚀 Cài Đặt & Chạy

### 1. Cài đặt Dependencies

```bash
cd frontend
npm install
```

### 2. Chạy Dev Server

```bash
npm run dev
```

Mở browser: `http://localhost:5173`

### 3. Build Production

```bash
npm run build
```

## 🧪 Tài Khoản Demo

Sử dụng các tài khoản sau để test:

| Vai Trò      | Email              | Mật Khẩu |
| ------------ | ------------------ | -------- |
| 👤 Buyer     | buyer@test.com     | password |
| 🏪 Seller    | seller@test.com    | password |
| ✔️ Inspector | inspector@test.com | password |
| 👨‍💼 Admin     | admin@test.com     | password |

## 📱 Hướng Dẫn Nhanh

### Người Mua

1. Đăng nhập với `buyer@test.com`
2. Xem danh sách xe ở Marketplace
3. Sử dụng Advanced Search để tìm kiếm chi tiết
4. Click vào sản phẩm để xem chi tiết, báo cáo kiểm định
5. Đặt cọc (20-100% linh hoạt)
6. Chat với người bán
7. Xem lịch sử giao dịch & để lại đánh giá ở Dashboard

### Người Bán

1. Đăng nhập với `seller@test.com`
2. Tổng quan Dashboard (doanh thu, tin đăng, đơn hàng)
3. Đăng tin bán (4 bước: Info → Specs → Images → Giá)
4. Yêu cầu kiểm định
5. Quản lý tin đăng (chỉnh sửa, ẩn, xóa)
6. Xem đơn hàng & tiền cọc
7. Chat & cập nhật trạng thái giao hàng
8. Nhận tiền khi người mua xác nhận

### Người Kiểm Định

1. Đăng nhập với `inspector@test.com`
2. Xem danh sách xe chờ kiểm định
3. Bắt đầu kiểm định (Chọn tại chỗ/Online)
4. Kiểm tra: Khung, Phanh, Bộ truyền động
5. Cấp điểm (0-10) & viết báo cáo
6. Xem lịch sử kiểm định đã hoàn tất
7. Hỗ trợ tranh chấp khi cần

### Quản Trị Viên

1. Đăng nhập với `admin@test.com`
2. Dashboard: Xem thống kê chung
3. Xử lý tranh chấp: Phán quyết hoàn tiền
4. Kiểm duyệt tin: Phê duyệt/từ chối/cảnh báo
5. Quản lý người dùng: Xem thông tin, cảnh báo, khóa tài khoản
6. Phân tích: Xem doanh thu, tỷ lệ hoàn tiền, v.v.

## 🎨 Giao Diện & Công Nghệ

### Công Nghệ Sử Dụng

- **React 19** - UI Framework
- **Tailwind CSS** - Styling (đã cấu hình)
- **Vite** - Build tool
- **Axios** - HTTP Client (cho API call)

### Thiết Kế

- **Color Scheme**: Blue (#2563EB), Gray, Green, Red, Yellow
- **Typography**: Inter, sans-serif
- **Component Library**: Custom components (không dùng UI library ngoài)

## 🔗 API Integration

Các tệp cần cập nhật để kết nối API backend:

1. **`contexts/AuthContext.jsx`** - Thay thế mock login bằng API call
2. **`pages/buyer/Marketplace.jsx`** - Fetch danh sách xe từ API
3. **`pages/buyer/AdvancedSearch.jsx`** - Tìm kiếm, lọc từ API
4. **`pages/seller/CreateListingEnhanced.jsx`** - Upload listing
5. **`pages/seller/SellerDashboard.jsx`** - Fetch seller data
6. **Tất cả pages** - Thay thế mock data bằng API calls

### Ví dụ API Call

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Lấy danh sách xe
const getListings = async (filters) => {
  const response = await axios.get(`${API_BASE}/listings`, {
    params: filters,
  });
  return response.data;
};

// Tạo listing mới
const createListing = async (data) => {
  const response = await axios.post(`${API_BASE}/listings`, data);
  return response.data;
};
```

## 🐛 Development Mode Features

- **Dev Panel** (góc phải dưới) - Chuyển role để test từng vai trò
- **Tất cả dữ liệu là mock** - Sẵn sàng để kết nối API

## 📋 Checklist Tính Năng

### Buyer ✅

- [x] Đăng nhập
- [x] Trang chủ & Marketplace
- [x] Tìm kiếm & lọc nâng cao
- [x] Chi tiết sản phẩm
- [x] Xem báo cáo kiểm định
- [x] Đặt cọc (Escrow)
- [x] Chat với seller
- [x] Dashboard tài khoản
- [x] Lịch sử giao dịch
- [x] Đánh giá sản phẩm
- [x] Wishlist (giao diện)
- [x] So sánh sản phẩm (giao diện)

### Seller ✅

- [x] Đăng nhập
- [x] Dashboard bán hàng
- [x] Đăng tin (4 bước)
- [x] Quản lý tin đăng
- [x] Yêu cầu kiểm định
- [x] Quản lý đơn hàng & tiền cọc
- [x] Chat với buyer
- [x] Cập nhật trạng thái giao hàng
- [x] Xem đánh giá & uy tín

### Inspector ✅

- [x] Đăng nhập
- [x] Dashboard kiểm định
- [x] Danh sách chờ kiểm định
- [x] Form kiểm tra chi tiết
- [x] Cấp điểm & báo cáo
- [x] Lịch sử kiểm định
- [x] Hỗ trợ tranh chấp

### Admin ✅

- [x] Đăng nhập
- [x] Dashboard tổng quan
- [x] Xử lý tranh chấp
- [x] Kiểm duyệt tin đăng
- [x] Quản lý người dùng
- [x] Thống kê & báo cáo

## 🔐 Tính Năng Bảo Mật (Mock)

- Escrow System (tiền được giữ an toàn)
- Inspection Report (xác thực chất lượng)
- Dispute Resolution (tranh chấp)
- User Rating (uy tín)
- Chat Logs (lưu tin nhắn)

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra console browser (F12)
2. Kiểm tra tab Network
3. Verify tài khoản demo đúng
4. Clear cache & reload

---

**Happy coding! 🚀**
