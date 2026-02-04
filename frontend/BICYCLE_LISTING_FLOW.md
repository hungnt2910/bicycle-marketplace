# Luồng Đăng Tin Xe Đạp (Bicycle Listing Flow)

## 📋 Tổng Quan

Hệ thống cho phép người bán đăng tin bán xe đạp với đầy đủ thông tin, hình ảnh và tùy chọn kiểm định.

## 🔄 Luồng Hoạt Động

### 1. **Khởi tạo Form**

- Component: `CreateListing.jsx`
- State quản lý toàn bộ thông tin xe đạp
- 4 tabs chính: Thông tin chung, Thông số kỹ thuật, Hình ảnh, Giá & Xác nhận

### 2. **Tab 1: Thông Tin Chung (General)**

**Dữ liệu thu thập:**

- `title` (bắt buộc): Tên sản phẩm
- `specifications.type` (bắt buộc): Loại xe (mountain, road, hybrid, electric, folding, bmx, cruiser)
- `specifications.brand` (bắt buộc): Thương hiệu
- `specifications.model`: Model/Dòng xe
- `condition.overall` (bắt buộc): Tình trạng (new, like-new, good, fair, poor)
- `description` (bắt buộc): Mô tả chi tiết

### 3. **Tab 2: Thông Số Kỹ Thuật (Specifications)**

**Dữ liệu thu thập:**

- `specifications.year`: Năm sản xuất
- `specifications.frameSize`: Kích cỡ khung
- `specifications.frameMaterial`: Chất liệu khung (carbon, aluminum, steel, titanium, alloy)
- `specifications.wheelSize`: Kích thước bánh
- `specifications.gears`: Số líp
- `specifications.brakeType`: Loại phanh (disc, rim, hydraulic, mechanical)
- `specifications.suspension`: Giảm xóc (none, front, full, rear)
- `specifications.color`: Màu sắc
- `specifications.weight`: Trọng lượng (kg)
- `condition.mileage`: Quãng đường đã đi (km)

### 4. **Tab 3: Hình Ảnh & Video (Media)**

**Dữ liệu thu thập:**

- `media.images` (bắt buộc): Mảng hình ảnh (base64)
  - Tối đa 10 ảnh
  - Mỗi ảnh không quá 5MB
  - Upload và preview real-time
  - Cho phép chọn ảnh chính
  - Cho phép xóa từng ảnh
- `media.mainImage`: Ảnh chính (tự động là ảnh đầu tiên nếu không chọn)
- `media.videos`: Link video YouTube (tùy chọn)

### 5. **Tab 4: Giá & Xác Nhận (Pricing)**

**Dữ liệu thu thập:**

- `price` (bắt buộc): Giá bán (VNĐ)
- `location.city`: Tỉnh/Thành phố
- `location.district`: Quận/Huyện
- `location.address`: Địa chỉ cụ thể
- `inspection.isInspected`: Yêu cầu kiểm định (boolean)
  - Không kiểm định
  - Kiểm định tận nơi (miễn phí lần đầu)

**Tính toán chi phí:**

- Phí đăng bài: 15,000 VNĐ (miễn phí 2 lần đầu)
- Phí kiểm định: 200,000 VNĐ (miễn phí lần đầu)

### 6. **Submit Form**

#### A. Lưu Nháp (Draft)

```javascript
handleSubmit((isDraft = true));
```

- Không validate form
- Status: `draft`
- Lưu vào database
- Người dùng có thể quay lại chỉnh sửa sau

#### B. Đăng Tin Chính Thức (Publish)

```javascript
handleSubmit((isDraft = false));
```

- Validate toàn bộ form
- Status: `pending_review`
- Gửi lên backend để admin duyệt
- Chuyển hướng đến trang danh sách tin của tôi

## 🔌 API Integration

### Endpoint

```
POST /api/v1/bicycles/create-bicycle
```

### Request Body Structure

```typescript
{
  sellerId: string,           // ID người bán (từ localStorage)
  title: string,              // Tên xe
  description: string,        // Mô tả
  price: number,              // Giá bán

  specifications: {
    type: BicycleType,        // Loại xe
    brand: string,            // Thương hiệu
    model?: string,           // Model
    frameSize?: string,       // Size khung
    frameMaterial?: string,   // Chất liệu
    year?: number,            // Năm sx
    color?: string,           // Màu
    weight?: number,          // Trọng lượng
    wheelSize?: string,       // Size bánh
    gears?: number,           // Số líp
    brakeType?: string,       // Loại phanh
    suspension?: string       // Giảm xóc
  },

  condition: {
    overall: string,          // Tình trạng tổng thể
    usageHistory?: string,    // Lịch sử sử dụng
    mileage?: number,         // Quãng đường
    lastServiceDate?: Date    // Ngày bảo dưỡng cuối
  },

  media: {
    images: string[],         // Mảng base64 images
    videos?: string[],        // Link videos
    mainImage: string         // Ảnh chính
  },

  location: {
    city?: string,            // Thành phố
    district?: string,        // Quận/Huyện
    address?: string          // Địa chỉ
  },

  inspection: {
    isInspected: boolean,     // Có kiểm định không
    label?: string            // Label kiểm định
  },

  status: string,             // 'draft' | 'pending_review'

  pricing: {
    listingFee: number,       // Phí đăng bài
    isPaid: boolean           // Đã thanh toán chưa
  }
}
```

### Response

```json
{
  "message": "Bicycle created successfully",
  "data": {
    "_id": "...",
    "sellerId": "...",
    "title": "...",
    ...
  }
}
```

## ✅ Validation Rules

### Bắt buộc:

- ✓ Tên sản phẩm (title)
- ✓ Giá bán > 0 (price)
- ✓ Loại xe (specifications.type)
- ✓ Thương hiệu (specifications.brand)
- ✓ Ít nhất 1 hình ảnh (media.images)

### Tùy chọn:

- Model, kích cỡ, màu sắc, etc.
- Video
- Địa chỉ chi tiết

## 🎯 User Flow

```
1. User vào trang "Đăng tin"
   ↓
2. Điền thông tin chung (Tab 1)
   ↓
3. Điền thông số kỹ thuật (Tab 2)
   ↓
4. Upload hình ảnh (Tab 3)
   ↓
5. Nhập giá và địa chỉ (Tab 4)
   ↓
6. Chọn: Lưu nháp hoặc Đăng tin
   ↓
7. Validate (nếu đăng tin)
   ↓
8. Gọi API create-bicycle
   ↓
9. Chuyển đến trang "Tin của tôi"
```

## 🔒 Authentication

- Lấy `sellerId` từ `localStorage.getItem('userInfo')`
- Nếu không có user info → redirect to `/login`

## 📦 Dependencies

```javascript
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bicycleApi from '../../api/postNewsApi';
```

## 🐛 Error Handling

```javascript
try {
  const response = await bicycleApi.createBicycle(submitData);
  toast.success('Đăng tin thành công!');
  navigate('/seller/my-listings');
} catch (error) {
  toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
}
```

## 📝 Notes

1. **Image Upload**: Sử dụng FileReader để convert ảnh sang base64
2. **Status Flow**:
   - `draft` → Chưa được duyệt, người dùng có thể edit
   - `pending_review` → Chờ admin duyệt
   - `active` → Đã được duyệt, hiển thị công khai
   - `sold` → Đã bán
3. **First Time Benefits**:
   - 2 lần đăng tin miễn phí
   - 1 lần kiểm định miễn phí

## 🚀 Next Steps

1. Implement payment flow
2. Implement admin approval workflow
3. Add edit listing functionality
4. Add draft management
5. Implement image upload to cloud storage (Cloudinary/S3)
