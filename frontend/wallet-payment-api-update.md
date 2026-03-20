# Wallet / Payment / Transaction API — Frontend ↔ Backend Synchronization

> **Generated**: 2026-03-12  
> **Backend prefix**: `api/v1` (set in `main.ts`)  
> **Frontend base**: `axiosClient` already prepends the base URL; every path below starts with `/api/v1/…`

---

## 1️⃣ Backend API Summary

### 1.1 Wallet Module — `@Controller('wallet')` — _Auth required (JWT)_

| #   | Method | Endpoint                      | Query / Body                                                  | Response                                                                                                                    |
| --- | ------ | ----------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| W1  | `GET`  | `/api/v1/wallet`              | —                                                             | Wallet document (`balance`, `pendingBalance`, `totalDeposited`, `totalWithdrawn`, `totalEarned`, `totalSpent`, `status`, …) |
| W2  | `GET`  | `/api/v1/wallet/summary`      | —                                                             | Summary including recent transactions & 30-day stats                                                                        |
| W3  | `GET`  | `/api/v1/wallet/totals`       | `?role=buyer\|seller` (required)                              | `{ walletBalance, pendingBalance, availableBalance, escrowHeld, role }`                                                     |
| W4  | `GET`  | `/api/v1/wallet/transactions` | `?type=…&startDate=…&endDate=…&page=…&limit=…` (all optional) | Paginated wallet transactions (WalletTransaction[])                                                                         |
| W5  | `POST` | `/api/v1/wallet/withdraw`     | `{ amount, bankName, accountNumber, accountHolder }`          | 201 — Withdrawal request created                                                                                            |

### 1.2 Payment Module — `@Controller('payment')`

| #   | Method | Endpoint                                        | Auth   | Body                            | Response                                                                                             |
| --- | ------ | ----------------------------------------------- | ------ | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P1  | `POST` | `/api/v1/payment/zalopay/create`                | JWT    | `{ amount: number }` (TopUpDto) | `{ message, data: { order_url, app_trans_id } }`                                                     |
| P2  | `POST` | `/api/v1/payment/zalopay/callback`              | Public | `{ data: string, mac: string }` | `{ return_code, return_message }`                                                                    |
| P3  | `GET`  | `/api/v1/payment/zalopay/status/:transactionId` | Public | —                               | `{ message, data: { success, status, transactionId, amount, timestamp, buyerEmail, bicycleTitle } }` |

### 1.3 Transactions Module — `@Controller('transactions')` — _Auth + Roles_

| #   | Method  | Endpoint                                       | Roles         | Body / Params                                                     | Response                           |
| --- | ------- | ---------------------------------------------- | ------------- | ----------------------------------------------------------------- | ---------------------------------- |
| T1  | `POST`  | `/api/v1/transactions`                         | BUYER, SELLER | `CreateTransactionDto { bicycleId, amount, type, paymentMethod }` | `{ message, data }`                |
| T2  | `POST`  | `/api/v1/transactions/fee`                     | JWT           | `CreateTransactionDto` — type must be `fee` or `inspection_fee`   | `{ message, data }`                |
| T3  | `POST`  | `/api/v1/transactions/deposit`                 | BUYER         | `CreateDepositDto { bicycleId, depositRate?, paymentMethod }`     | `{ message, data }`                |
| T4  | `POST`  | `/api/v1/transactions/:id/pay-balance`         | BUYER         | — (no body)                                                       | `{ message, data }`                |
| T5  | `POST`  | `/api/v1/transactions/:id/confirm`             | BUYER         | `ConfirmDeliveryDto { matchesReport: boolean, notes?: string }`   | `{ message, data }`                |
| T6  | `PATCH` | `/api/v1/transactions/:id/shipping`            | SELLER        | `UpdateShippingDto { provider, trackingNumber }`                  | `{ message, data }`                |
| T7  | `GET`   | `/api/v1/transactions/my-transactions`         | JWT           | `?role=buyer\|seller&status=…` (optional)                         | `{ message, data: Transaction[] }` |
| T8  | `GET`   | `/api/v1/transactions/:id`                     | JWT           | —                                                                 | `{ message, data: Transaction }`   |
| T9  | `GET`   | `/api/v1/transactions/admin/statistics`        | ADMIN         | —                                                                 | `{ message, data }`                |
| T10 | `GET`   | `/api/v1/transactions/admin/escrow`            | ADMIN         | —                                                                 | `{ message, data }`                |
| T11 | `GET`   | `/api/v1/transactions/admin/escrow/statistics` | ADMIN         | —                                                                 | `{ message, data }`                |
| T12 | `POST`  | `/api/v1/transactions/admin/forfeit/:id`       | ADMIN         | —                                                                 | `{ message, data }`                |
| T13 | `POST`  | `/api/v1/transactions/admin/auto-forfeit`      | ADMIN         | —                                                                 | `{ message }`                      |
| T14 | `POST`  | `/api/v1/transactions/admin/auto-refund/:id`   | ADMIN         | —                                                                 | `{ message, data }`                |
| T15 | `POST`  | `/api/v1/transactions/admin/auto-confirm/:id`  | ADMIN         | —                                                                 | `{ message, data }`                |

**⚠️ Commented-out / removed endpoints (NO LONGER EXIST on backend):**

- ~~`POST /transactions/:id/confirm-payment`~~ — removed
- ~~`POST /transactions/:id/confirm-deposit-payment`~~ — removed
- ~~`PATCH /transactions/:id/cancel`~~ — removed
- ~~`POST /transactions/:id/confirm-full-payment`~~ — removed
- ~~`PATCH /transactions/:id/delivered`~~ — removed

### 1.4 Escrow Module — `@Controller('escrow')` — _ADMIN only_

| #   | Method | Endpoint                                | Body                 | Response                           |
| --- | ------ | --------------------------------------- | -------------------- | ---------------------------------- |
| E1  | `POST` | `/api/v1/escrow/:transactionId/release` | `{ reason: string }` | `{ message, data }`                |
| E2  | `POST` | `/api/v1/escrow/:transactionId/refund`  | `{ reason: string }` | `{ message, data }`                |
| E3  | `GET`  | `/api/v1/escrow/held`                   | —                    | `{ message, data: Transaction[] }` |
| E4  | `GET`  | `/api/v1/escrow/statistics`             | —                    | `{ message, data }`                |

### 1.5 Key Enums

**TransactionType**: `deposit`, `full_payment`, `fee`, `refund`, `dispute_refund`, `commission`, `penalty`, `inspection_fee`

**PaymentMethod**: `bank_transfer`, `e_wallet`, `credit_card`, `cash`

**TransactionStatus**: `pending_payment`, `payment_received`, `held_in_escrow`, `awaiting_delivery`, `delivered`, `completed`, `refunded`, `disputed`, `cancelled`, `deposit_paid`, `deposit_forfeited`, `buyer_confirmed`

**WalletTransactionType**: `deposit`, `refund`, `sale_payment`, `dispute_refund`, `purchase`, `withdrawal`, `commission`, `penalty`, `escrow_hold`, `escrow_release`, `fee`, `inspection_fee`

---

## 2️⃣ Current Frontend Problems

### 🔴 CRITICAL — Calling non-existent backend endpoints

| #      | File                        | Frontend Call                                          | Problem                                                                                                                                                                                                                                      |
| ------ | --------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** | `paymentApi.jsx`            | `POST /api/v1/payment/zalopay/create/${transactionId}` | **Wrong URL**. Backend expects `POST /api/v1/payment/zalopay/create` (no path param). Backend expects `{ amount }` in body (TopUpDto). Frontend sends NO body and appends a `transactionId` path segment that the backend doesn't recognize. |
| **C2** | `TransactionDetail.jsx:111` | `transactionApi.confirmPayment(id, {...})`             | **Method does not exist** in `transactionApi.jsx`. The backend endpoint `POST /transactions/:id/confirm-payment` is **commented out** — it no longer exists.                                                                                 |
| **C3** | `ProductDetail.jsx:147`     | `transactionApi.confirmDepositPayment(txId, {...})`    | **Method does not exist** in `transactionApi.jsx`. The backend endpoint `POST /transactions/:id/confirm-deposit-payment` is **commented out**.                                                                                               |
| **C4** | `ProductDetail.jsx:149`     | `transactionApi.confirmPayment(txId, {...})`           | Same as C2 — method doesn't exist.                                                                                                                                                                                                           |
| **C5** | `TransactionDetail.jsx:269` | `transactionApi.cancel(id, reason)`                    | **Method does not exist** in `transactionApi.jsx`. The backend endpoint `PATCH /transactions/:id/cancel` is **commented out**.                                                                                                               |

### 🟠 IMPORTANT — Incorrect request body / wrong endpoint for fee payments

| #      | File                         | Frontend Call                                                                                                  | Problem                                                                                                                                                                                                                            |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I1** | `CreateListing.jsx:352`      | `transactionApi.create({..., type: 'fee'})`                                                                    | Uses the general `POST /transactions` endpoint. Backend has a **dedicated** `POST /transactions/fee` endpoint for fee/inspection_fee transactions. The general endpoint doesn't validate for fee types and may behave differently. |
| **I2** | `InspectionRequests.jsx:150` | `transactionApi.create({..., type: 'inspection_fee'})`                                                         | Same issue as I1 — should use `POST /transactions/fee` instead.                                                                                                                                                                    |
| **I3** | `paymentApi.jsx:5-6`         | `createZaloPayOrder: (transactionId) => axiosClient.post(\`/api/v1/payment/zalopay/create/${transactionId}\`)` | Signature mismatch — FE passes `transactionId` as URL param; BE expects `{ amount }` body. The `createZaloPayOrder` function purpose is "wallet top-up via ZaloPay" on the backend, not "pay for a transaction".                   |

### 🟡 MINOR — Missing frontend API methods

| #      | Problem                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------- |
| **M1** | `transactionApi.jsx` is missing a `payFee()` method for `POST /transactions/fee`.                       |
| **M2** | Frontend has no concept of `POST /transactions/fee` — it uses `transactionApi.create()` for everything. |
| **M3** | `payRemainingBalance` sends a payload `(transactionId, payload = {})` but backend expects no body.      |

---

## 3️⃣ Required Frontend Fixes

### Fix 1: `paymentApi.jsx` — Fix `createZaloPayOrder` signature (C1, I3)

**Current:**

```javascript
createZaloPayOrder: (transactionId) =>
  axiosClient.post(`/api/v1/payment/zalopay/create/${transactionId}`),
```

**Should be:**

```javascript
// Wallet top-up: creates a ZaloPay order and credits wallet on callback
createZaloPayOrder: (amount) =>
  axiosClient.post('/api/v1/payment/zalopay/create', { amount }),
```

> **Note:** The backend `POST /payment/zalopay/create` endpoint is designed for **wallet top-up**, not for paying for a specific transaction. It accepts `{ amount: number }` and creates a ZaloPay order that credits the user's wallet upon callback. All consumer pages must be updated accordingly.

---

### Fix 2: `transactionApi.jsx` — Add `payFee` method, remove dead methods (M1, I1, I2)

**Add:**

```javascript
// Pay listing or inspection fee (type must be 'fee' or 'inspection_fee')
payFee: (payload) => axiosClient.post('/api/v1/transactions/fee', payload),
```

**Remove or mark as deprecated** (if UI needs cancel and confirm-payment, those flows need redesign since backend removed them):

- `confirmPayment` — endpoint doesn't exist
- `confirmDepositPayment` — endpoint doesn't exist
- `cancel` — endpoint doesn't exist

---

### Fix 3: `TransactionDetail.jsx` — Remove calls to non-existent APIs (C2, C5)

**Line 111** — Auto-confirm payment logic (`transactionApi.confirmPayment`):

- The backend no longer has a `confirm-payment` endpoint. Payment confirmation is now handled automatically via the **ZaloPay callback** (`POST /payment/zalopay/callback`).
- **Fix:** Remove the entire `useEffect` block (lines 98–121) that calls `transactionApi.confirmPayment`. The ZaloPay callback handles this automatically.

**Line 269** — Cancel transaction (`transactionApi.cancel`):

- The backend no longer has a cancel endpoint.
- **Fix:** Remove the Cancel button and `handleCancel` function, or implement a dispute flow instead.

---

### Fix 4: `ProductDetail.jsx` — Remove calls to non-existent APIs (C3, C4)

**Lines 146-150** — After polling payment status:

```javascript
// REMOVE these lines:
if (isDeposit) {
  await transactionApi.confirmDepositPayment(txId, { transactionId: txId });
} else {
  await transactionApi.confirmPayment(txId, { transactionId: txId });
}
```

**Why:** Payment confirmation is handled by the ZaloPay callback on the backend. The frontend doesn't need to manually confirm payments.

**Lines 133** — `paymentApi.createZaloPayOrder(txId)`:

- This should be updated to match Fix 1. If the intent is to create a ZaloPay order for top-up, pass `amount` instead of `txId`.
- If the intent is to redirect to payment for a transaction, the `order_url` should already be returned from `transactionApi.create()` or `transactionApi.createDeposit()`.

---

### Fix 5: `CreateListing.jsx` — Use `payFee` instead of `create` (I1)

**Line 352:**

```javascript
// CURRENT:
const transactionRes = await transactionApi.create(transactionPayload);

// FIX:
const transactionRes = await transactionApi.payFee(transactionPayload);
```

---

### Fix 6: `InspectionRequests.jsx` — Use `payFee` instead of `create` (I2)

**Line 150:**

```javascript
// CURRENT:
const transactionRes = await transactionApi.create(transactionPayload);

// FIX:
const transactionRes = await transactionApi.payFee(transactionPayload);
```

---

### Fix 7: `BuyerDashboard.jsx` — Fix `createZaloPayOrder` call (C1)

**Line 148:**

```javascript
// CURRENT:
const zaloRes = await paymentApi.createZaloPayOrder(txId);

// FIX — The order_url should come from transactionApi.create() response.
// If it doesn't, use the wallet top-up approach:
const zaloRes = await paymentApi.createZaloPayOrder(amount);
```

---

### Fix 8: `payRemainingBalance` call cleanup (M3)

**In `transactionApi.jsx` line 11-12:**

```javascript
// CURRENT:
payRemainingBalance: (transactionId, payload = {}) =>
  axiosClient.post(`/api/v1/transactions/${transactionId}/pay-balance`, payload),

// FIX (backend takes no body):
payRemainingBalance: (transactionId) =>
  axiosClient.post(`/api/v1/transactions/${transactionId}/pay-balance`),
```

---

## Summary of All Required File Changes

| File                                               | Change Type                                                              | Priority     |
| -------------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| `frontend/src/api/paymentApi.jsx`                  | Fix `createZaloPayOrder` signature                                       | 🔴 Critical  |
| `frontend/src/api/transactionApi.jsx`              | Add `payFee`, remove dead methods, fix `payRemainingBalance`             | 🔴 Critical  |
| `frontend/src/pages/buyer/TransactionDetail.jsx`   | Remove `confirmPayment`, `cancel` calls                                  | 🔴 Critical  |
| `frontend/src/pages/buyer/ProductDetail.jsx`       | Remove `confirmPayment`, `confirmDepositPayment` calls, fix payment flow | 🔴 Critical  |
| `frontend/src/pages/buyer/BuyerDashboard.jsx`      | Fix `createZaloPayOrder` call                                            | 🟠 Important |
| `frontend/src/pages/seller/CreateListing.jsx`      | Use `payFee` instead of `create` for fee transactions                    | 🟠 Important |
| `frontend/src/pages/seller/InspectionRequests.jsx` | Use `payFee` instead of `create` for inspection_fee                      | 🟠 Important |
| `frontend/src/pages/buyer/Wallet.jsx`              | ✅ Correct — all calls match backend                                     | ✅ OK        |
| `frontend/src/api/walletApi.jsx`                   | ✅ Correct — all calls match backend                                     | ✅ OK        |
| `frontend/src/api/escrowApi.jsx`                   | ✅ Correct — all calls match backend                                     | ✅ OK        |

---

## 5️⃣ Backend Issue to Escalate (cannot fix on FE)

- **Endpoint:** `GET /api/v1/wallet/transactions` (parameters: `page=1`, `limit=10`; no body)
- **Observed:** Returns `500 Internal Server Error` immediately after wallet top-up and navigating back to Wallet page; other wallet endpoints (`/wallet`, `/wallet/summary`, `/wallet/totals`) return 304/200.
- **Frontend call location:** `walletApi.getTransactions` → [frontend/src/pages/buyer/Wallet.jsx](frontend/src/pages/buyer/Wallet.jsx#L89-L134) (no custom logic, just GET with query params).
- **Network preview:** `{ statusCode: 500, message: "Internal server error" }`; no additional payload.
- **Repro steps:**
  1. Top-up via ZaloPay.
  2. Navigate back to dashboard, then open Wallet page.
  3. The history request to `/api/v1/wallet/transactions?page=1&limit=10` fails with 500; wallet balances still load.
- **Hypothesis:** Backend crashes when reading wallet transactions created by top-up callback (possibly missing fields or null user linkage). Needs backend logs/stack trace to fix.

---

## 4️⃣ Detailed Flow: Wallet-Centric Payment Architecture

### Core Principle

> **Mọi giao dịch mua bán đều thực hiện qua Ví (Wallet), KHÔNG gọi trực tiếp Payment API.**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                 │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Transaction  │    │  Payment API │    │  Wallet API  │   │
│  │    API       │    │  (Nạp tiền)  │    │  (Ví)        │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
└─────────┼───────────────────┼───────────────────┼───────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                  │
│                                                             │
│  Transaction Service ──────► Wallet Service ◄── Payment Svc │
│  (mua/bán/phí)               (debit/credit)    (ZaloPay)    │
│                                    │                        │
│                                    ▼                        │
│                              ┌──────────┐                   │
│                              │ MongoDB  │                   │
│                              │ Wallet   │                   │
│                              └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**Tóm tắt:**

- **Transaction API** → xử lý logic mua/bán → gọi nội bộ `WalletService.debit()` để trừ tiền từ ví buyer,seller
- **Payment API** → CHỈ dùng để **nạp tiền vào ví** qua ZaloPay → gọi `WalletService.credit()` khi ZaloPay callback thành công
- **Wallet API** → xem thông tin ví, lịch sử giao dịch ví, rút tiền

---

### Flow 1: Buyer mua xe (Full Payment) — Thanh toán từ Ví

```
Buyer                     Frontend                    Backend                    Seller
  │                          │                           │                          │
  │  Click "Mua ngay"       │                           │                          │
  │─────────────────────────►│                           │                          │
  │                          │  POST /transactions       │                          │
  │                          │  { bicycleId, amount,     │                          │
  │                          │    type: 'full_payment',  │                          │
  │                          │    paymentMethod }        │                          │
  │                          │──────────────────────────►│                          │
  │                          │                           │ TransactionService       │
  │                          │                           │  .createTransaction()    │
  │                          │                           │   ├── walletService.debit │
  │                          │                           │   │   (buyerId, amount)   │
  │                          │                           │   │   ← TRỪ TIỀN TỪ VÍ   │
  │                          │                           │   │   BUYER               │
  │                          │                           │   ├── walletService       │
  │                          │                           │   │   .holdInEscrow()     │
  │                          │                           │   │   ← GIỮ TIỀN ESCROW  │
  │                          │                           │   └── status =           │
  │                          │                           │       'held_in_escrow'    │
  │                          │  ◄── { data: Transaction }│                          │
  │  ✅ Thanh toán thành công │                           │                          │
  │◄─────────────────────────│                           │                          │
  │                          │                           │                          │
  ║ ...sau khi buyer xác nhận nhận hàng + hết thời gian dispute window...          ║
  │                          │                           │                          │
  │                          │                           │ releaseToSeller()        │
  │                          │                           │   ├── walletService      │
  │                          │                           │   │   .releaseFromEscrow │
  │                          │                           │   │   (sellerId, amount) │
  │                          │                           │   │   ← CỘNG TIỀN VÀO   │
  │                          │                           │   │   VÍ SELLER          │
  │                          │                           │   └── status =           │
  │                          │                           │       'completed'        │
  │                          │                           │                          │
  │                          │                           │                   ✅ Seller│
  │                          │                           │                   nhận   │
  │                          │                           │                   tiền   │
  │                          │                           │                   vào ví │
```

> **Lưu ý:** Frontend **KHÔNG** gọi `paymentApi.createZaloPayOrder()` khi mua xe. Backend tự trừ tiền từ ví buyer khi gọi `POST /transactions`. Nếu ví không đủ tiền → Backend trả lỗi `"Insufficient balance"`.
>
> **Seller:** Sau khi buyer xác nhận nhận hàng và hết thời hạn dispute (3 ngày), backend tự động gọi `walletService.releaseFromEscrow(sellerId, amount)` → tiền được **cộng vào ví seller**.

---

### Flow 2: Buyer đặt cọc (Deposit) — Thanh toán từ Ví

```
Buyer                     Frontend                    Backend
  │                          │                           │
  │  Click "Đặt cọc"        │                           │
  │─────────────────────────►│                           │
  │                          │  POST /transactions/deposit│
  │                          │  { bicycleId,             │
  │                          │    depositRate: 0.3,      │
  │                          │    paymentMethod }        │
  │                          │──────────────────────────►│
  │                          │                           │ TransactionService.createDeposit()
  │                          │                           │   ├── walletService.debit(buyerId, depositAmount) ← TRỪ TIỀN
  │                          │                           │   ├── walletService.holdInEscrow(...)              ← GIỮ ESCROW
  │                          │                           │   └── transaction.status = 'deposit_paid'
  │                          │  ◄── { data: Transaction }│
  │  ✅ Đặt cọc thành công   │                           │
  │◄─────────────────────────│                           │
```

> Khi buyer trả nốt số tiền còn lại → gọi `POST /transactions/:id/pay-balance` → backend tiếp tục `walletService.debit()` phần còn lại.

---

### Flow 3: Seller thanh toán phí đăng tin / phí kiểm định — Trừ từ Ví Seller

```
Seller                    Frontend                    Backend
  │                          │                           │
  │  Đăng tin / Yêu cầu     │                           │
  │  kiểm định               │                           │
  │─────────────────────────►│                           │
  │                          │  POST /transactions/fee   │
  │                          │  { bicycleId, amount,     │
  │                          │    type: 'fee' |          │
  │                          │    'inspection_fee',      │
  │                          │    paymentMethod }        │
  │                          │──────────────────────────►│
  │                          │                           │ TransactionService.payFee()
  │                          │                           │   ├── walletService.debit(sellerId, amount)  ← TRỪ TIỀN TỪ VÍ SELLER
  │                          │                           │   │   (không qua escrow)
  │                          │                           │   └── transaction.status = 'completed'
  │                          │  ◄── { data: Transaction }│
  │  ✅ Thanh toán phí xong   │                           │
  │◄─────────────────────────│                           │
```

> **Khác biệt:** Phí đăng tin/kiểm định trừ thẳng từ **ví seller**, **không qua escrow**, hoàn tất ngay. Seller cần có đủ tiền trong ví trước khi đăng tin/yêu cầu kiểm định.

---

### Flow 4: Nạp tiền vào Ví — GỌI Payment API (ZaloPay)

> **ĐÂY LÀ FLOW DUY NHẤT GỌI PAYMENT API**

```
User                      Frontend                    Backend                    ZaloPay
  │                          │                           │                          │
  │  Click "Nạp tiền"       │                           │                          │
  │  Nhập số tiền: 500,000  │                           │                          │
  │─────────────────────────►│                           │                          │
  │                          │  POST /payment/zalopay/   │                          │
  │                          │       create              │                          │
  │                          │  { amount: 500000 }       │                          │
  │                          │──────────────────────────►│                          │
  │                          │                           │  Tạo ZaloPay order      │
  │                          │                           │────────────────────────►│
  │                          │                           │  ◄── { order_url,       │
  │                          │                           │       app_trans_id }     │
  │                          │  ◄── { order_url }        │                          │
  │                          │                           │                          │
  │  Redirect → ZaloPay     │                           │                          │
  │  Thanh toán              │                           │                          │
  │─────────────────────────────────────────────────────────────────────────────►│
  │                          │                           │                          │
  │                          │                           │  POST /payment/zalopay/  │
  │                          │                           │       callback           │
  │                          │                           │◄─────────────────────────│
  │                          │                           │  PaymentService          │
  │                          │                           │   .handleCallback()      │
  │                          │                           │   └── walletService      │
  │                          │                           │       .credit(userId,    │
  │                          │                           │        500000,           │
  │                          │                           │        'deposit')   ← CỘNG TIỀN VÀO VÍ
  │                          │                           │                          │
  │  Redirect lại app       │                           │                          │
  │◄─────────────────────────│                           │                          │
  │                          │  GET /payment/zalopay/    │                          │
  │                          │      status/:appTransId   │                          │
  │                          │──────────────────────────►│                          │
  │                          │  ◄── { status: 'success' }│                          │
  │  ✅ Nạp tiền thành công   │                           │                          │
  │◄─────────────────────────│                           │                          │
```

**Frontend cần gọi đúng:**

1. `paymentApi.createZaloPayOrder(amount)` — tạo order ZaloPay (truyền `amount`, **KHÔNG truyền `transactionId`**)
2. Redirect user đến `order_url`
3. ZaloPay callback → backend tự `walletService.credit()` cộng tiền vào ví
4. `paymentApi.getPaymentStatus(appTransId)` — kiểm tra trạng thái

---

### Flow 5: Rút tiền từ Ví (Buyer hoặc Seller) — GỌI Wallet API

```
User (Buyer/Seller)       Frontend                    Backend
  │                          │                           │
  │  Click "Rút tiền"       │                           │
  │  Nhập thông tin bank    │                           │
  │─────────────────────────►│                           │
  │                          │  POST /wallet/withdraw    │
  │                          │  { amount: 1000000,       │
  │                          │    bankName: "...",        │
  │                          │    accountNumber: "...",   │
  │                          │    accountHolder: "..." }  │
  │                          │──────────────────────────►│
  │                          │                           │ WalletService.requestWithdrawal()
  │                          │                           │   ├── Kiểm tra số dư khả dụng
  │                          │                           │   ├── walletService.debit(userId, amount)  ← TRỪ TIỀN
  │                          │                           │   └── Tạo withdrawal request (PENDING)
  │                          │  ◄── { data: withdrawal } │
  │  ✅ Tạo yêu cầu rút tiền │                           │
  │◄─────────────────────────│                           │
```

> **Cả Buyer và Seller** đều có thể rút tiền từ ví về tài khoản ngân hàng. Số tiền tối thiểu: 100,000 VND.

---

### Flow 6: Seller nhận tiền sau khi giao hàng — Tự động qua Escrow

```
Buyer                     Frontend                    Backend                    Seller
  │                          │                           │                          │
  │  Click "Xác nhận        │                           │                          │
  │  nhận hàng"              │                           │                          │
  │─────────────────────────►│                           │                          │
  │                          │  POST /transactions/      │                          │
  │                          │       :id/confirm         │                          │
  │                          │  { matchesReport: true }  │                          │
  │                          │──────────────────────────►│                          │
  │                          │                           │ confirmDelivery()        │
  │                          │                           │   └── status =           │
  │                          │                           │       'buyer_confirmed'   │
  │                          │                           │       (3 ngày dispute     │
  │                          │                           │        window bắt đầu)   │
  │                          │  ◄── { data: Transaction }│                          │
  │                          │                           │                          │
  ║ ...sau 3 ngày dispute window, không có tranh chấp...                           ║
  │                          │                           │                          │
  │                          │                           │ [CRON/Scheduler]         │
  │                          │                           │ autoReleaseAfter         │
  │                          │                           │  DisputeWindow()         │
  │                          │                           │   ├── releaseToSeller()  │
  │                          │                           │   │   ├── escrowService  │
  │                          │                           │   │   │   .releaseFunds()│
  │                          │                           │   │   ├── walletService  │
  │                          │                           │   │   │   .releaseFrom   │
  │                          │                           │   │   │   Escrow(seller, │
  │                          │                           │   │   │   sellerAmount)  │
  │                          │                           │   │   │   ← CỘNG TIỀN   │
  │                          │                           │   │   │   VÀO VÍ SELLER │
  │                          │                           │   │   └── status =       │
  │                          │                           │   │       'completed'    │
  │                          │                           │   └── bicycle.status =   │
  │                          │                           │       'sold'             │
  │                          │                           │                   ✅ Seller│
  │                          │                           │                   nhận   │
  │                          │                           │                   tiền = │
  │                          │                           │                   amount │
  │                          │                           │                    - fee │
```

> **Seller không cần làm gì** để nhận tiền. Sau khi buyer xác nhận + hết dispute window, backend scheduler tự động chuyển tiền từ escrow vào ví seller (trừ hoa hồng platform nếu có).

---

### Bảng tổng hợp: Frontend gọi API nào cho từng hành động?

| Hành động                    | Role           | API cần gọi                             | KHÔNG gọi                                   |
| ---------------------------- | -------------- | --------------------------------------- | ------------------------------------------- |
| **Mua xe (full payment)**    | Buyer          | `transactionApi.create()`               | ~~paymentApi~~                              |
| **Đặt cọc**                  | Buyer          | `transactionApi.createDeposit()`        | ~~paymentApi~~                              |
| **Trả nốt tiền sau cọc**     | Buyer          | `transactionApi.payRemainingBalance()`  | ~~paymentApi~~                              |
| **Xác nhận nhận hàng**       | Buyer          | `transactionApi.buyerConfirmDelivery()` | —                                           |
| **Thanh toán phí đăng tin**  | Seller         | `transactionApi.payFee()`               | ~~paymentApi~~, ~~transactionApi.create()~~ |
| **Thanh toán phí kiểm định** | Seller         | `transactionApi.payFee()`               | ~~paymentApi~~, ~~transactionApi.create()~~ |
| **Cập nhật vận chuyển**      | Seller         | `transactionApi.updateShipping()`       | —                                           |
| **Nhận tiền sau giao hàng**  | Seller         | _(Tự động — backend scheduler)_         | Không cần gọi API                           |
| **Nạp tiền vào ví**          | Buyer / Seller | `paymentApi.createZaloPayOrder(amount)` | ~~transactionApi~~                          |
| **Rút tiền**                 | Buyer / Seller | `walletApi.requestWithdrawal()`         | ~~paymentApi~~, ~~transactionApi~~          |
| **Xem thông tin ví**         | Buyer / Seller | `walletApi.getWallet()`                 | —                                           |
| **Xem lịch sử ví**           | Buyer / Seller | `walletApi.getTransactions()`           | —                                           |

### ⚠️ Quy tắc quan trọng

1. **Trước khi mua xe**, buyer phải có đủ tiền trong ví → nếu không đủ, frontend cần hướng dẫn **nạp tiền trước** qua ZaloPay
2. **Payment API (`paymentApi`)** chỉ phục vụ 1 mục đích duy nhất: **nạp tiền vào ví qua ZaloPay**
3. **Transaction API** khi được gọi sẽ **tự trừ tiền từ ví** bên backend → frontend **KHÔNG** cần gọi thêm bất kỳ API thanh toán nào
4. Khi ví không đủ tiền, backend trả lỗi `400 - "Insufficient balance"` → frontend hiển thị thông báo và đề xuất nạp tiền
