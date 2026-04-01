# Flow chi tiết (Bicycle Marketplace)

## 1) Xác thực & vai trò

- Đăng ký (email, password, role) → tạo user, hash mật khẩu, status `active`, trả JWT + refresh. Đăng nhập/refresh/logout dùng JWT; Google login có sẵn. Guard: `JwtAuthGuard` + `RolesGuard` cho các route bảo vệ.
- Vai trò chính: `buyer`, `seller`, `inspector`, `admin`. Các route giao dịch/fee yêu cầu JWT; nhiều route còn yêu cầu đúng role (ví dụ cập nhật shipping: seller; xác nhận giao hàng: buyer; thống kê: admin).

## 2) Đăng tin xe (seller)

- UI đa tab ([frontend/src/pages/...]
  - Tab 1 Thông tin chung: title, type, brand, condition, description.
  - Tab 2 Thông số: size, material, year, brake, suspension, màu, cân nặng, mileage.
  - Tab 3 Media: tối đa 10 ảnh, chọn ảnh chính, video YouTube, preview/xoá.
  - Tab 4 Giá & địa điểm: price, city/district/address, tuỳ chọn inspection (isInspected), phí đăng bài/kiểm định được tính.
- Submit:
  - Lưu nháp → status `draft`, không validate.
  - Đăng chính thức → validate, status `pending_review` chờ duyệt.
- Backend entity `Bicycle` có các trường specifications/condition/media/location/inspection/status (`draft|pending_review|active|sold|reserved|hidden|rejected`).

## 3) Duyệt & hiển thị tin

- Sau `pending_review`, admin duyệt để chuyển `active`. Buyer duyệt/browse list từ FE, xem chi tiết, hình, review.
- Seller có thể ẩn/sửa tin nháp; khi giao dịch tạo thành công, status chuyển `reserved`/`sold` theo tiến trình giao dịch.

## 4) Đặt cọc / mua xe (giao dịch & escrow)

- Tạo giao dịch chuẩn (full payment): `POST /api/v1/transactions` (role buyer/seller, thường buyer gửi) với `bicycleId, amount, type, paymentMethod`. Backend:
  - Kiểm tra xe `active`, không trùng giao dịch đang giữ.
  - Đặt status xe `reserved`, tạo transaction status `pending_payment`, tạo escrow, hold tiền ví, chuyển status `held_in_escrow`.
- Tạo giao dịch đặt cọc: `POST /api/v1/transactions/deposit` (buyer) đặt % mặc định, giữ xe 3 ngày. Sau đó `POST /api/v1/transactions/:id/pay-balance` để trả phần còn lại.
- Phí đăng tin/kiểm định: `POST /api/v1/transactions/fee` (type `fee` hoặc `inspection_fee`), debit ví buyer, credit ví platform, status `completed` (không qua escrow).
- Vận chuyển: seller `PATCH /api/v1/transactions/:id/shipping` cập nhật provider + tracking, auto set shipped+delivered và set deadline auto-confirm.
- Buyer xác nhận giao hàng: `POST /api/v1/transactions/:id/confirm` → status `delivered` → `completed`, bicycle status `sold`, escrow release cho seller.
- Admin công cụ: thống kê, danh sách escrow, `forfeit/auto-forfeit/auto-refund/auto-confirm` cho giao dịch.

## 5) Thanh toán & ví

- Ví: `GET /wallet`, `GET /wallet/summary`, `GET /wallet/totals?role=buyer|seller`, `GET /wallet/transactions` (filter), `POST /wallet/withdraw` (amount, bank info).
- ZaloPay top-up ví: `POST /payment/zalopay/create { amount }` trả `order_url`; callback `/payment/zalopay/callback` ghi nhận; tra cứu `/payment/zalopay/status/:transactionId`.
- Transaction types/statuses: `deposit|full_payment|fee|refund|dispute_refund|commission|penalty|inspection_fee`; statuses `pending_payment|payment_received|held_in_escrow|awaiting_delivery|delivered|completed|refunded|disputed|cancelled|deposit_paid|deposit_forfeited|buyer_confirmed`.

## 6) Tranh chấp (buyer/admin, có return flow)

- Buyer mở tranh chấp: `POST /api/v1/disputes` (FE gọi `/disputes/create-dispute`) với `transactionId, reason, description, evidence.photos/videos`. Side effect: transaction status `disputed`, escrow đông băng.
- Lấy danh sách & chi tiết: `/disputes/my-disputes`, `/disputes/:id`.
- Return flow: buyer `PATCH /disputes/:id/mark-return-sent` (tracking/info); seller `PATCH /disputes/:id/seller-confirm`.
- Admin: `/disputes/admin/all`, nhận xử lý `PATCH /disputes/:id/assign` (status `under_review`), giải quyết `POST /disputes/:id/resolve` với decision `buyer_favor|seller_favor|partial_refund`, refundAmount/penalty/notes, tùy chọn yêu cầu trả hàng. Kết nối escrow qua `/escrow/:transactionId/release|refund`.
- Trạng thái chính: `open → under_review → (awaiting_evidence/return_requested/awaiting_seller_confirmation/return_received) → resolved_* → closed`.

## 7) Chat real-time (buyer ↔ seller)

- API REST: `/api/v1/messages/conversations` (GET list, POST create with `otherUserId`), `/api/v1/messages/conversations/:id/messages` (GET list, POST send), `/api/v1/messages/conversations/:id/read`.
- Socket events: join-conversation, send-message, typing/stop-typing, mark-read; server emits new-message, user-online/offline, typing indicators, messages-read.
- FE context `ChatContext` quản lý conversations/messages, online/typing; UI: ConversationList, ChatBox, ChatWidget; điều hướng từ sản phẩm bằng ChatWithSellerButton.

## 8) Đánh giá & uy tín

- Sau giao dịch hoàn tất: buyer gửi review cho seller: `POST /reviews/create-review` (rating, comment, media, sellerId, transactionId, reviewerId). Cập nhật: `POST /reviews/update-review/:id`; xoá: `DELETE /reviews/delete-review/:id`; xem tổng hợp: `GET /reviews/seller-reviews/:sellerId`, `GET /reviews/ratings`.
- FE: ReviewForm/ReviewList/ReviewsSection; chặn review khi transaction chưa `completed/buyer_confirmed` (mặc định requireCompleted=true); cho phép sửa duy nhất 1 review/transaction/buyer.

## 9) Admin dashboard (tranh chấp & giao dịch)

- Quản trị tranh chấp: list/filter/assign/resolve; thao tác escrow release/refund qua `escrowApi`.
- Giao dịch: xem thống kê `/transactions/admin/statistics`, escrow list `/transactions/admin/escrow`, thống kê escrow `/transactions/admin/escrow/statistics`, xử lý forfeit/refund/auto-confirm.

## 10) Kiểm định & kiểm soát chất lượng

- Bicycle có `inspection` { isInspected, inspectionType, inspectionFee, expiryDate }. FE cho phép chọn yêu cầu kiểm định khi đăng tin; phí kiểm định thu qua `/transactions/fee` với type `inspection_fee`.
- Trong giao dịch `createTransaction` kiểm tra báo cáo inspection hết hạn → yêu cầu kiểm định lại.

## 11) Luồng người mua (tóm tắt end-to-end)

1. Đăng ký/đăng nhập → chọn xe → xem chi tiết/review.
2. Chat với seller nếu cần thương lượng.
3. Tạo giao dịch (full payment hoặc deposit) → thanh toán (ZaloPay top-up ví) → tiền vào escrow.
4. Seller cập nhật shipping; buyer nhận hàng.
5. Buyer xác nhận giao hàng (`confirm`) → escrow release cho seller; hoặc mở tranh chấp.
6. Sau hoàn tất → viết review cho seller.

## 12) Luồng người bán (tóm tắt)

1. Đăng tin (có thể trả phí listing/inspection) → chờ duyệt → tin `active`.
2. Nhận chat/đơn; khi đơn tạo, xe `reserved`.
3. Cập nhật vận chuyển (tracking) → hệ thống đánh dấu delivered.
4. Chờ buyer confirm hoặc admin/auto-release → nhận tiền (escrow release).
5. Xử lý tranh chấp nếu có (seller-confirm khi return) và nhận review.
